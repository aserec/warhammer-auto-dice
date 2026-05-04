import { describe, expect, it } from "vitest";
import type { ModelRow } from "./game";
import { adjustStackCount, eliminateRowIfEmpty } from "./model-row";

describe("model rows", () => {
  it("adjusts stack counts", () => {
    const row: ModelRow = {
      kind: "stack",
      profileId: "p",
      equipmentSignature: "x",
      count: 3,
      weaponLoadoutIds: [],
    };
    const a = adjustStackCount(row, -1);
    const b = adjustStackCount(row, -5);
    expect(a.kind === "stack" && a.count).toBe(2);
    expect(b.kind === "stack" && b.count).toBe(0);
  });

  it("eliminates empty stacks", () => {
    const row: ModelRow = {
      kind: "stack",
      profileId: "p",
      equipmentSignature: "x",
      count: 0,
      weaponLoadoutIds: [],
    };
    expect(eliminateRowIfEmpty(row)).toBeNull();
  });
});
