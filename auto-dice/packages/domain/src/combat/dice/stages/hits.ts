import type { RngPort } from "../../../rng/rng-port";
import type { DieResult } from "../stage-types";

export function rollHits(params: {
  count: number;
  skillThreshold: number;
  hitBonus: number;
  rng: RngPort;
}): DieResult[] {
  const need = Math.min(6, Math.max(2, params.skillThreshold - params.hitBonus));
  const out: DieResult[] = [];
  for (let i = 0; i < params.count; i++) {
    const roll = params.rng.nextInt(1, 6);
    const tags: string[] = [];
    if (roll === 1) {
      out.push({ face: roll, unmodified: roll, effective: roll, tags: ["auto_fail", "miss"] });
      continue;
    }
    if (roll === 6) tags.push("crit_hit");
    const hit = roll >= need;
    tags.push(hit ? "hit" : "miss");
    out.push({ face: roll, unmodified: roll, effective: roll, tags });
  }
  return out;
}
