import type { AttackConfiguration } from "../attack-configuration";
import type { WeaponProfile } from "../../game/game";
import type { RngPort } from "../../rng/rng-port";
import { detectModifierConflicts, normalizeModifierOrder } from "../modifiers/modifier-engine";
import type { Modifier } from "../modifiers/modifier-types";
import { parseAp, parseDamageEvents, parsePlus } from "./parse";
import type { StageResult } from "./stage-types";
import { rollFeelNoPain } from "./stages/fnp";
import { rollHits } from "./stages/hits";
import { rollSaves } from "./stages/saves";
import { rollWounds } from "./stages/wounds";

export interface ResolveAttackInput {
  rulesProfileId: string;
  attackConfiguration: AttackConfiguration;
  weapon: WeaponProfile;
  defenderToughness: number;
  rng: RngPort;
}

export interface ResolveAttackOutput {
  stages: StageResult[];
  summary: {
    hits: number;
    wounds: number;
    failedSaves: number;
    damageAfterFnp: number;
  };
  blockingErrors: string[];
}

function sumHitBonus(mods: Modifier[]): number {
  return mods.filter((m) => m.kind === "hit_bonus").reduce((a, m) => a + (m.value ?? 0), 0);
}

function sumWoundBonus(mods: Modifier[]): number {
  return mods.filter((m) => m.kind === "wound_bonus").reduce((a, m) => a + (m.value ?? 0), 0);
}

function sumSaveBonus(mods: Modifier[]): number {
  return mods.filter((m) => m.kind === "save_bonus").reduce((a, m) => a + (m.value ?? 0), 0);
}

function parseFnpThreshold(raw?: string): number | null {
  if (!raw) return null;
  const m = String(raw).match(/(\d+)\++/);
  if (m) return Number(m[1]);
  return null;
}

export function resolveAttack(input: ResolveAttackInput): ResolveAttackOutput {
  const blocking = detectModifierConflicts(input.attackConfiguration.modifiers);
  if (blocking.length) {
    return {
      stages: [],
      summary: { hits: 0, wounds: 0, failedSaves: 0, damageAfterFnp: 0 },
      blockingErrors: blocking,
    };
  }

  const mods = normalizeModifierOrder(input.attackConfiguration.modifiers);
  const hitBonus = sumHitBonus(mods);
  const woundBonus = sumWoundBonus(mods);
  const saveBonus = sumSaveBonus(mods);

  const cfg = input.attackConfiguration;
  const skill = parsePlus(input.weapon.skill, 4);
  const str = parsePlus(input.weapon.strength, 4);
  const ap = parseAp(input.weapon.ap);
  const saveNum = parsePlus(cfg.defenderSaveProfile.armorSave, 4);

  const hitDice = rollHits({
    count: cfg.attackCount,
    skillThreshold: skill,
    hitBonus,
    rng: input.rng,
  });
  const hits = hitDice.filter((d) => d.tags.includes("hit")).length;

  const woundDice =
    hits > 0
      ? rollWounds({
          count: hits,
          strength: str,
          toughness: input.defenderToughness,
          woundBonus,
          rng: input.rng,
        })
      : [];
  const wounds = woundDice.filter((d) => d.tags.includes("wound")).length;

  const saveDice =
    wounds > 0
      ? rollSaves({
          count: wounds,
          saveThreshold: saveNum,
          ap,
          saveBonus,
          rng: input.rng,
        })
      : [];
  const failedSaves = saveDice.filter((d) => d.tags.includes("failed_save")).length;

  const dmgEach = parseDamageEvents(input.weapon.damage);
  const rawDamage = failedSaves * dmgEach;

  const fnpNeed = parseFnpThreshold(cfg.defenderSaveProfile.feelNoPain);
  let fnpDice: typeof saveDice = [];
  let damageAfterFnp = rawDamage;
  if (fnpNeed && rawDamage > 0) {
    fnpDice = rollFeelNoPain({ count: rawDamage, fnpThreshold: fnpNeed, rng: input.rng });
    const negated = fnpDice.filter((d) => d.tags.includes("fnp_negated")).length;
    damageAfterFnp = Math.max(0, rawDamage - negated);
  }

  const stages: StageResult[] = [
    {
      id: "hits",
      dice: hitDice,
      summary: { hits },
    },
    {
      id: "wounds",
      skipped: hits === 0,
      reason: hits === 0 ? "no hits" : undefined,
      dice: woundDice,
      summary: { wounds },
    },
    {
      id: "saves",
      skipped: wounds === 0,
      reason: wounds === 0 ? "no wounds" : undefined,
      dice: saveDice,
      summary: { failedSaves },
    },
    {
      id: "fnp",
      skipped: !fnpNeed || rawDamage === 0,
      reason: !fnpNeed ? "no fnp" : rawDamage === 0 ? "no damage" : undefined,
      dice: fnpNeed && rawDamage > 0 ? fnpDice : [],
      summary: { damageAfterFnp },
    },
  ];

  return {
    stages,
    summary: { hits, wounds, failedSaves, damageAfterFnp },
    blockingErrors: [],
  };
}
