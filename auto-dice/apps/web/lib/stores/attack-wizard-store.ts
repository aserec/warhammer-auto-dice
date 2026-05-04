"use client";

import type { AttackConfiguration, CombatPhase, Modifier } from "@whad/domain";
import { create } from "zustand";

export interface AttackWizardState {
  phase: CombatPhase;
  attackingUnitId: string | null;
  defendingUnitId: string | null;
  weaponProfileId: string | null;
  modifiers: Modifier[];
  setPhase: (p: CombatPhase) => void;
  setAttackingUnit: (id: string | null) => void;
  setDefendingUnit: (id: string | null) => void;
  setWeapon: (id: string | null) => void;
  toggleModifier: (m: Modifier) => void;
  toAttackConfiguration: (params: {
    attackerPlayerId: string;
    defenderPlayerId: string;
    attackCount: number;
    defenderSaveProfile: AttackConfiguration["defenderSaveProfile"];
  }) => AttackConfiguration | null;
}

export const useAttackWizardStore = create<AttackWizardState>((set, get) => ({
  phase: "shooting",
  attackingUnitId: null,
  defendingUnitId: null,
  weaponProfileId: null,
  modifiers: [],
  setPhase: (phase) => set({ phase }),
  setAttackingUnit: (attackingUnitId) => set({ attackingUnitId }),
  setDefendingUnit: (defendingUnitId) => set({ defendingUnitId }),
  setWeapon: (weaponProfileId) => set({ weaponProfileId }),
  toggleModifier: (m) =>
    set((s) => ({
      modifiers: s.modifiers.some((x) => x.kind === m.kind)
        ? s.modifiers.filter((x) => x.kind !== m.kind)
        : [...s.modifiers, m],
    })),
  toAttackConfiguration: ({ attackerPlayerId, defenderPlayerId, attackCount, defenderSaveProfile }) => {
    const { phase, attackingUnitId, defendingUnitId, weaponProfileId, modifiers } = get();
    if (!attackingUnitId || !defendingUnitId || !weaponProfileId) return null;
    return {
      phase,
      attackerPlayerId,
      defenderPlayerId,
      attackingUnitId,
      defendingUnitId,
      weaponProfileId,
      attackCount,
      modifiers,
      defenderSaveProfile,
    };
  },
}));
