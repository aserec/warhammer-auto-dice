import type { Modifier } from "./modifiers/modifier-types";
import type { Unit } from "../game/game";

export type CombatPhase = "shooting" | "melee";

export interface AttackConfiguration {
  phase: CombatPhase;
  attackerPlayerId: string;
  defenderPlayerId: string;
  attackingUnitId: string;
  defendingUnitId: string;
  weaponProfileId: string;
  attackCount: number;
  modifiers: Modifier[];
  defenderSaveProfile: {
    armorSave: string;
    invulnSave?: string;
    feelNoPain?: string;
  };
}

export interface AttackValidationContext {
  getUnit: (playerId: string, unitId: string) => Unit | undefined;
}

export function validateAttackConfiguration(
  cfg: AttackConfiguration,
  ctx: AttackValidationContext,
): string[] {
  const errors: string[] = [];
  const attacker = ctx.getUnit(cfg.attackerPlayerId, cfg.attackingUnitId);
  const defender = ctx.getUnit(cfg.defenderPlayerId, cfg.defendingUnitId);
  if (!attacker) errors.push("Attacking unit not found");
  if (!defender) errors.push("Defending unit not found");
  const weapon = attacker?.weapons.find((w) => w.id === cfg.weaponProfileId);
  if (attacker && !weapon) errors.push("Weapon not found on attacking unit");
  if (weapon && cfg.phase === "shooting" && weapon.type === "melee") {
    errors.push("Cannot select a melee weapon in the shooting phase");
  }
  if (weapon && cfg.phase === "melee" && weapon.type === "ranged") {
    errors.push("Cannot select a ranged weapon in the melee phase");
  }
  return errors;
}
