import type { RngPort } from "./rng-port";

function hashSeed(seed: string): number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

/** Mulberry32 PRNG — deterministic from string seed (tests / golden dice). */
export class SeededRng implements RngPort {
  private state: number;

  constructor(seed: string) {
    this.state = hashSeed(seed) || 1;
  }

  nextInt(minInclusive: number, maxInclusive: number): number {
    if (minInclusive > maxInclusive) {
      throw new RangeError("minInclusive must be <= maxInclusive");
    }
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const u = (t ^ (t >>> 14)) >>> 0;
    const span = maxInclusive - minInclusive + 1;
    return minInclusive + (u % span);
  }
}
