import { describe, expect, it } from "vitest";
import type { Modifier } from "./modifier-types";
import { detectModifierConflicts, normalizeModifierOrder } from "./modifier-engine";

describe("modifier-engine", () => {
  it("orders modifiers deterministically", () => {
    const input: Modifier[] = [
      { kind: "wound_bonus", value: 1, scope: "wound" },
      { kind: "hit_bonus", value: 1, scope: "hit" },
      { kind: "save_bonus", value: 1, scope: "save" },
    ];
    const ordered = normalizeModifierOrder(input);
    expect(ordered.map((m) => m.kind)).toEqual(["hit_bonus", "wound_bonus", "save_bonus"]);
  });

  it("flags lethal + devastating conflict", () => {
    const mods: Modifier[] = [
      { kind: "lethal_hits", scope: "wound" },
      { kind: "devastating_wounds", scope: "wound" },
    ];
    expect(detectModifierConflicts(mods).length).toBeGreaterThan(0);
  });
});
