/** Pluggable RNG for domain resolution (browser crypto or deterministic seeds). */
export interface RngPort {
  /** Uniform integer in `[min, max]` inclusive. */
  nextInt(minInclusive: number, maxInclusive: number): number;
}
