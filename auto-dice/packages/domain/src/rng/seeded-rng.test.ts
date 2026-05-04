import { describe, expect, it } from "vitest";
import { SeededRng } from "./seeded-rng";

describe("SeededRng", () => {
  it("reproduces the same sequence for the same seed", () => {
    const a = new SeededRng("battle-42");
    const b = new SeededRng("battle-42");
    for (let i = 0; i < 50; i++) {
      expect(a.nextInt(1, 6)).toBe(b.nextInt(1, 6));
    }
  });

  it("differs across seeds", () => {
    const a = new SeededRng("a");
    const b = new SeededRng("b");
    const seqA = Array.from({ length: 20 }, () => a.nextInt(1, 6));
    const seqB = Array.from({ length: 20 }, () => b.nextInt(1, 6));
    expect(seqA).not.toEqual(seqB);
  });
});
