import type { RngPort } from "../../../rng/rng-port";
import type { DieResult } from "../stage-types";

export function woundRollNeeded(strength: number, toughness: number): number {
  if (strength >= 2 * toughness) return 2;
  if (strength > toughness) return 3;
  if (strength === toughness) return 4;
  if (strength * 2 <= toughness) return 6;
  return 5;
}

export function rollWounds(params: {
  count: number;
  strength: number;
  toughness: number;
  woundBonus: number;
  rng: RngPort;
}): DieResult[] {
  const base = woundRollNeeded(params.strength, params.toughness);
  const need = Math.min(6, Math.max(2, base - params.woundBonus));
  const out: DieResult[] = [];
  for (let i = 0; i < params.count; i++) {
    const roll = params.rng.nextInt(1, 6);
    const tags: string[] = [];
    if (roll === 1) {
      out.push({ face: roll, unmodified: roll, effective: roll, tags: ["auto_fail", "fail"] });
      continue;
    }
    if (roll === 6) tags.push("crit_wound");
    const ok = roll >= need;
    tags.push(ok ? "wound" : "fail");
    out.push({ face: roll, unmodified: roll, effective: roll, tags });
  }
  return out;
}
