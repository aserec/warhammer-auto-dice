import type { RngPort } from "../../../rng/rng-port";
import type { DieResult } from "../stage-types";

export function rollFeelNoPain(params: {
  count: number;
  fnpThreshold: number;
  rng: RngPort;
}): DieResult[] {
  const need = Math.min(6, Math.max(2, params.fnpThreshold));
  const out: DieResult[] = [];
  for (let i = 0; i < params.count; i++) {
    const roll = params.rng.nextInt(1, 6);
    const negated = roll >= need;
    const tags = [negated ? "fnp_negated" : "fnp_failed"];
    out.push({ face: roll, unmodified: roll, effective: roll, tags });
  }
  return out;
}
