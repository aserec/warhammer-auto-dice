import { describe, expect, it } from "vitest";
import type { AttackConfiguration } from "../attack-configuration";
import type { WeaponProfile } from "../../game/game";
import { SeededRng } from "../../rng/seeded-rng";
import { resolveAttack } from "./resolve-attack";

describe("resolveAttack", () => {
  it("is deterministic for a fixed seed and configuration", () => {
    const rng = new SeededRng("golden-attack-1");
    const weapon: WeaponProfile = {
      id: "w",
      name: "Bolter",
      type: "ranged",
      attacks: "10",
      skill: "4+",
      strength: "4",
      ap: "0",
      damage: "1",
    };
    const cfg: AttackConfiguration = {
      phase: "shooting",
      attackerPlayerId: "a",
      defenderPlayerId: "d",
      attackingUnitId: "u1",
      defendingUnitId: "u2",
      weaponProfileId: "w",
      attackCount: 10,
      modifiers: [],
      defenderSaveProfile: { armorSave: "3+", feelNoPain: "6+++" },
    };
    const first = resolveAttack({
      rulesProfileId: "wh40k-10e-v1",
      attackConfiguration: cfg,
      weapon,
      defenderToughness: 4,
      rng,
    });
    const rng2 = new SeededRng("golden-attack-1");
    const second = resolveAttack({
      rulesProfileId: "wh40k-10e-v1",
      attackConfiguration: cfg,
      weapon,
      defenderToughness: 4,
      rng: rng2,
    });
    expect(first.summary).toEqual(second.summary);
    expect(first.stages.map((s) => s.dice.length)).toEqual(second.stages.map((s) => s.dice.length));
  });

  it("blocks conflicting modifiers", () => {
    const rng = new SeededRng("x");
    const weapon: WeaponProfile = {
      id: "w",
      name: "Bolter",
      type: "ranged",
      attacks: "1",
      skill: "4+",
      strength: "4",
      ap: "0",
      damage: "1",
    };
    const cfg: AttackConfiguration = {
      phase: "shooting",
      attackerPlayerId: "a",
      defenderPlayerId: "d",
      attackingUnitId: "u1",
      defendingUnitId: "u2",
      weaponProfileId: "w",
      attackCount: 1,
      modifiers: [
        { kind: "lethal_hits", scope: "wound" },
        { kind: "devastating_wounds", scope: "wound" },
      ],
      defenderSaveProfile: { armorSave: "3+" },
    };
    const out = resolveAttack({
      rulesProfileId: "wh40k-10e-v1",
      attackConfiguration: cfg,
      weapon,
      defenderToughness: 4,
      rng,
    });
    expect(out.blockingErrors.length).toBeGreaterThan(0);
    expect(out.stages).toHaveLength(0);
  });
});
