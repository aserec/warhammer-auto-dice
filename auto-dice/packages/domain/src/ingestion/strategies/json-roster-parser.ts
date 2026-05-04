import type { WeaponProfile } from "../../game/game";
import type { ListDiagnostic, ListParseResult } from "../list-parse-result";
import type { ListParserPlugin } from "../list-parser-plugin";
import type { ParsedUnitDraft } from "../map-to-roster";
import { mapParsedUnitsToRoster } from "../map-to-roster";

type UnknownRec = Record<string, unknown>;

interface RawProfile {
  id?: string;
  name?: string;
  typeName?: string;
  characteristics?: Array<{ name?: string; $text?: string }>;
}

interface RawSelection {
  id?: string;
  name?: string;
  type?: string;
  number?: number;
  selections?: RawSelection[];
  profiles?: RawProfile[];
}

function isRecord(v: unknown): v is UnknownRec {
  return typeof v === "object" && v !== null;
}

function asSelections(v: unknown): RawSelection[] {
  if (!Array.isArray(v)) return [];
  return v as RawSelection[];
}

function charMap(profiles: RawProfile[] | undefined): Map<string, string> {
  const m = new Map<string, string>();
  for (const p of profiles ?? []) {
    for (const c of p.characteristics ?? []) {
      if (c.name) m.set(c.name, c.$text ?? "");
    }
  }
  return m;
}

function parseUnitDatasheet(profiles: RawProfile[] | undefined): { t?: string; sv?: string } {
  const unitProfile = (profiles ?? []).find((p) => p.typeName === "Unit");
  if (!unitProfile) return {};
  const m = charMap([unitProfile]);
  return {
    t: m.get("T"),
    sv: m.get("SV"),
  };
}

function mapWeaponProfile(p: RawProfile): WeaponProfile | null {
  if (!p.id || !p.name) return null;
  const m = charMap([p]);
  const rangeTxt = m.get("Range") ?? "";
  const type: WeaponProfile["type"] =
    p.typeName === "Melee Weapons" || rangeTxt === "Melee" ? "melee" : "ranged";
  const skill = (m.get("BS") ?? m.get("WS") ?? "4+").toString();
  return {
    id: p.id,
    name: p.name,
    type,
    attacks: (m.get("A") ?? "1").toString(),
    skill,
    strength: (m.get("S") ?? "4").toString(),
    ap: (m.get("AP") ?? "0").toString(),
    damage: (m.get("D") ?? "1").toString(),
    keywords: m.get("Keywords") ? [String(m.get("Keywords"))] : undefined,
  };
}

function collectWeapons(sel: RawSelection): WeaponProfile[] {
  const byId = new Map<string, WeaponProfile>();
  const walk = (node: RawSelection) => {
    for (const p of node.profiles ?? []) {
      if (p.typeName === "Ranged Weapons" || p.typeName === "Melee Weapons") {
        const w = mapWeaponProfile(p);
        if (w) byId.set(w.id, w);
      }
    }
    for (const c of node.selections ?? []) walk(c);
  };
  walk(sel);
  return [...byId.values()];
}

function countModels(sel: RawSelection): number {
  let n = 0;
  if (sel.type === "model") n += sel.number ?? 1;
  for (const c of sel.selections ?? []) n += countModels(c);
  return n;
}

function selectionToUnitDraft(sel: RawSelection): ParsedUnitDraft | null {
  const name = typeof sel.name === "string" ? sel.name : "Unnamed unit";
  const id = typeof sel.id === "string" ? sel.id : name;
  const { t, sv } = parseUnitDatasheet(sel.profiles);
  const weapons = collectWeapons(sel);
  const modelCount = countModels(sel);
  if (weapons.length === 0 && modelCount === 0) return null;
  return {
    id,
    name,
    toughness: t,
    save: sv,
    modelCount: modelCount > 0 ? modelCount : 1,
    weapons,
  };
}

function visitSelections(selections: RawSelection[] | undefined, out: ParsedUnitDraft[]) {
  if (!selections) return;
  for (const sel of selections) {
    if (sel.type === "unit") {
      const draft = selectionToUnitDraft(sel);
      if (draft) out.push(draft);
    }
    visitSelections(sel.selections, out);
  }
}

function extractUnits(root: UnknownRec): ParsedUnitDraft[] {
  const roster = root.roster as UnknownRec | undefined;
  if (!roster) return [];
  const forces = roster.forces;
  if (!Array.isArray(forces)) return [];
  const out: ParsedUnitDraft[] = [];
  for (const force of forces) {
    if (!isRecord(force)) continue;
    visitSelections(asSelections(force.selections), out);
  }
  return out;
}

export const BS_FORCES_JSON_V1 = "bs-forces-json-v1";

export const jsonRosterParser: ListParserPlugin = {
  id: BS_FORCES_JSON_V1,
  canParse(raw: string): boolean {
    const t = raw.trimStart();
    if (!t.startsWith("{")) return false;
    return t.includes('"roster"');
  },
  parse(raw: string): ListParseResult {
    const diagnostics: ListDiagnostic[] = [];
    let parsed: UnknownRec;
    try {
      parsed = JSON.parse(raw) as UnknownRec;
    } catch (e) {
      diagnostics.push({
        severity: "error",
        message: e instanceof Error ? e.message : "Invalid JSON",
      });
      return { success: false, roster: null, diagnostics, formatId: BS_FORCES_JSON_V1 };
    }
    if (!isRecord(parsed) || !isRecord(parsed.roster)) {
      diagnostics.push({ severity: "error", message: 'Missing root "roster" object' });
      return { success: false, roster: null, diagnostics, formatId: BS_FORCES_JSON_V1 };
    }
    const drafts = extractUnits(parsed);
    if (drafts.length === 0) {
      diagnostics.push({ severity: "error", message: "No units with models/weapons found in roster" });
      return { success: false, roster: null, diagnostics, formatId: BS_FORCES_JSON_V1 };
    }
    const roster = mapParsedUnitsToRoster(raw, BS_FORCES_JSON_V1, drafts);
    return { success: true, roster, diagnostics, formatId: BS_FORCES_JSON_V1 };
  },
};
