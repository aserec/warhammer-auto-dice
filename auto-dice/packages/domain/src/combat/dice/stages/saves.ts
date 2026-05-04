import type { RngPort } from "../../../rng/rng-port";
import type { DieResult } from "../stage-types";

export function rollSaves(params: {
  count: number;
  saveThreshold: number;
  ap: number;
  saveBonus: number;
  rng: RngPort;
}): DieResult[] {
  const apPenalty = params.ap <= 0 ? Math.abs(params.ap) : 0;
  const need = Math.min(6, Math.max(2, params.saveThreshold + apPenalty - params.saveBonus));
  const out: DieResult[] = [];
  for (let i = 0; i < params.count; i++) {
    const roll = params.rng.nextInt(1, 6);
    const tags: string[] = [];
    const saved = roll >= need;
    tags.push(saved ? "saved" : "failed_save");
    out.push({ face: roll, unmodified: roll, effective: roll, tags });
  }
  return out;
}
