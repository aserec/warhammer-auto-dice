import type { ModelRow, Roster, RosterSourceJson, Unit, WeaponProfile } from "../game/game";

export interface ParsedUnitDraft {
  id: string;
  name: string;
  toughness?: string;
  save?: string;
  modelCount: number;
  weapons: WeaponProfile[];
}

function newUnitId(): string {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `unit-${Math.random().toString(16).slice(2)}`;
}

export function mapParsedUnitsToRoster(
  rawPayload: string,
  formatId: string,
  drafts: ParsedUnitDraft[],
): Roster {
  const importedAt = new Date().toISOString();
  const source: RosterSourceJson = { kind: "json", importedAt, formatId };
  const units: Unit[] = drafts.map((d) => {
    const weaponIds = d.weapons.map((w) => w.id);
    const row: ModelRow = {
      kind: "stack",
      profileId: d.id,
      equipmentSignature: "default",
      count: Math.max(0, d.modelCount),
      weaponLoadoutIds: weaponIds,
    };
    return {
      id: newUnitId(),
      name: d.name,
      modelRows: d.modelCount > 0 ? [row] : [],
      weapons: d.weapons,
      toughness: d.toughness,
      save: d.save,
    };
  });
  return {
    source,
    rawPayload,
    rawText: "",
    units,
  };
}
