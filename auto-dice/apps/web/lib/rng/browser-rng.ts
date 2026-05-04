import type { RngPort } from "@whad/domain";

export class BrowserRng implements RngPort {
  nextInt(minInclusive: number, maxInclusive: number): number {
    const span = maxInclusive - minInclusive + 1;
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return minInclusive + (buf[0]! % span);
  }
}
