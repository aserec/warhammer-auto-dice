/** Parses values like `"4+"` or `"3"` into a number for dice math. */
export function parsePlus(stat: string | undefined, fallback: number): number {
  if (!stat) return fallback;
  const m = String(stat).match(/(\d+)\s*\+/);
  if (m) return Number(m[1]);
  const n = Number(stat);
  return Number.isFinite(n) ? n : fallback;
}

export function parseAp(stat: string | undefined): number {
  if (!stat) return 0;
  const t = String(stat).trim();
  const m = t.match(/^-?\d+/);
  if (!m) return 0;
  return Number(m[0]);
}

export function parseDamageEvents(damage: string | undefined): number {
  if (!damage) return 1;
  const m = String(damage).match(/^(\d+)/);
  if (m) return Math.max(1, Number(m[1]));
  return 1;
}
