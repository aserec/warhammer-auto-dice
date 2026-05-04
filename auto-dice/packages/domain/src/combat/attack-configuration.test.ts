import { describe, expect, it } from "vitest";
import type { Unit } from "../game/game";
import type { AttackConfiguration } from "./attack-configuration";
import { validateAttackConfiguration } from "./attack-configuration";

const rifle: Unit["weapons"][number] = {
  id: "w1",
  name: "Test rifle",
  type: "ranged",
  attacks: "2",
  skill: "4+",
  strength: "4",
  ap: "0",
  damage: "1",
};

const sword: Unit["weapons"][number] = {
  id: "w2",
  name: "Test sword",
  type: "melee",
  attacks: "3",
  skill: "3+",
  strength: "5",
  ap: "-1",
  damage: "1",
};

const attacker: Unit = {
  id: "u1",
  name: "Attacker squad",
  modelRows: [],
  weapons: [rifle, sword],
};

const defender: Unit = {
  id: "u2",
  name: "Defender squad",
  modelRows: [],
  weapons: [],
  toughness: "4",
  save: "3+",
};

describe("validateAttackConfiguration", () => {
  const ctx = {
    getUnit: (pid: string, uid: string): Unit | undefined => {
      if (pid === "p1" && uid === "u1") return attacker;
      if (pid === "p2" && uid === "u2") return defender;
      return undefined;
    },
  };

  it("allows legal shooting configuration", () => {
    const cfg: AttackConfiguration = {
      phase: "shooting",
      attackerPlayerId: "p1",
      defenderPlayerId: "p2",
      attackingUnitId: "u1",
      defendingUnitId: "u2",
      weaponProfileId: "w1",
      attackCount: 2,
      modifiers: [],
      defenderSaveProfile: { armorSave: "3+" },
    };
    expect(validateAttackConfiguration(cfg, ctx)).toEqual([]);
  });

  it("blocks melee weapon in shooting", () => {
    const cfg: AttackConfiguration = {
      phase: "shooting",
      attackerPlayerId: "p1",
      defenderPlayerId: "p2",
      attackingUnitId: "u1",
      defendingUnitId: "u2",
      weaponProfileId: "w2",
      attackCount: 1,
      modifiers: [],
      defenderSaveProfile: { armorSave: "3+" },
    };
    expect(validateAttackConfiguration(cfg, ctx).join(" ")).toMatch(/melee/);
  });
});
