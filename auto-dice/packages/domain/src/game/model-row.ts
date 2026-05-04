import type { ModelRow } from "./game";

export function adjustStackCount(row: ModelRow, delta: number): ModelRow {
  if (row.kind !== "stack") return row;
  const next = Math.max(0, row.count + delta);
  return { ...row, count: next };
}

export function eliminateRowIfEmpty(row: ModelRow): ModelRow | null {
  if (row.kind === "stack" && row.count === 0) return null;
  if (row.kind === "individual" && !row.alive) return null;
  return row;
}
