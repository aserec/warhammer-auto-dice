"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  parsePlus,
  validateAttackConfiguration,
  type AttackConfiguration,
  type ResolveAttackOutput,
} from "@whad/domain";
import { AttackPhaseToggle } from "@/components/combat/attack-phase-toggle";
import { AttackSummaryCard } from "@/components/combat/attack-summary-card";
import { DiceStageBreakdown } from "@/components/combat/dice-stage-breakdown";
import { ModifierBar } from "@/components/combat/modifier-bar";
import { RollButton } from "@/components/combat/roll-button";
import { UnitPicker } from "@/components/combat/unit-picker";
import { WeaponPicker } from "@/components/combat/weapon-picker";
import { Button } from "@/components/ui/button";
import { useGameController } from "@/lib/game/use-game-controller";
import { IndexedDbGameRepository } from "@/lib/persistence/indexeddb-game-repository";
import { useAttackWizardStore } from "@/lib/stores/attack-wizard-store";

const repo = new IndexedDbGameRepository();

export default function AttackPage() {
  const params = useParams<{ gameId: string }>();
  const { game, load, persist } = useGameController(repo);
  const phase = useAttackWizardStore((s) => s.phase);
  const attackingUnitId = useAttackWizardStore((s) => s.attackingUnitId);
  const defendingUnitId = useAttackWizardStore((s) => s.defendingUnitId);
  const weaponProfileId = useAttackWizardStore((s) => s.weaponProfileId);
  const modifiers = useAttackWizardStore((s) => s.modifiers);
  const setPhase = useAttackWizardStore((s) => s.setPhase);
  const setAttackingUnit = useAttackWizardStore((s) => s.setAttackingUnit);
  const setDefendingUnit = useAttackWizardStore((s) => s.setDefendingUnit);
  const setWeapon = useAttackWizardStore((s) => s.setWeapon);
  const toggleModifier = useAttackWizardStore((s) => s.toggleModifier);
  const toAttackConfiguration = useAttackWizardStore((s) => s.toAttackConfiguration);
  const [last, setLast] = useState<ResolveAttackOutput | null>(null);

  useEffect(() => {
    void load(params.gameId);
  }, [params.gameId, load]);

  useEffect(() => {
    setLast(null);
  }, [params.gameId]);

  const attackerRoster = game ? game.rosters[game.playerOne.id] : undefined;
  const defenderRoster = game ? game.rosters[game.playerTwo.id] : undefined;
  const attackerUnits = attackerRoster?.units ?? [];
  const defenderUnits = defenderRoster?.units ?? [];
  const attackerUnit = attackerUnits.find((u) => u.id === attackingUnitId) ?? null;
  const defenderUnit = defenderUnits.find((u) => u.id === defendingUnitId) ?? null;
  const weapon = attackerUnit?.weapons.find((w) => w.id === weaponProfileId) ?? null;

  const cfg: AttackConfiguration | null =
    game && weapon && attackerUnit && defenderUnit
      ? toAttackConfiguration({
          attackerPlayerId: game.playerOne.id,
          defenderPlayerId: game.playerTwo.id,
          attackCount: parsePlus(weapon.attacks, 1),
          defenderSaveProfile: {
            armorSave: defenderUnit.save ?? "4+",
          },
        })
      : null;

  const errors = useMemo(() => {
    if (!game || !cfg) return ["Finish selections"];
    return validateAttackConfiguration(cfg, {
      getUnit: (pid, uid) => {
        const r = game.rosters[pid];
        return r?.units.find((u) => u.id === uid);
      },
    });
  }, [game, cfg]);

  if (!game) {
    return (
      <main className="px-4 py-10">
        <p>Loading…</p>
      </main>
    );
  }

  if (!attackerRoster || !defenderRoster) {
    return (
      <main className="space-y-4 px-4 py-10">
        <p>Both players need a roster before rolling attacks.</p>
        <Button asChild variant="outline">
          <Link href={`/games/${game.id}`}>Back to lists</Link>
        </Button>
      </main>
    );
  }

  const modifierSummary = modifiers.map((m) => m.kind).join(", ");

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Attack</h1>
        <Button asChild variant="outline">
          <Link href={`/games/${game.id}`}>Back</Link>
        </Button>
      </div>
      <AttackPhaseToggle value={phase} onChange={setPhase} />
      <UnitPicker label="Attacking unit" units={attackerUnits} value={attackingUnitId} onChange={setAttackingUnit} />
      <UnitPicker label="Defending unit" units={defenderUnits} value={defendingUnitId} onChange={setDefendingUnit} />
      <WeaponPicker unit={attackerUnit} phase={phase} value={weaponProfileId} onChange={setWeapon} />
      <div className="space-y-2">
        <p className="text-sm font-medium">Modifiers</p>
        <ModifierBar active={modifiers} onToggle={toggleModifier} />
      </div>
      <AttackSummaryCard
        attacker={attackerUnit}
        weapon={weapon}
        defender={defenderUnit}
        modifierSummary={modifierSummary}
      />
      {errors.length > 0 && <p className="text-sm text-destructive">{errors.join(" · ")}</p>}
      {cfg && weapon && defenderUnit && errors.length === 0 && (
        <RollButton
          game={game}
          cfg={cfg}
          weapon={weapon}
          defenderToughness={parsePlus(defenderUnit.toughness, 4)}
          onResolved={async (next, out) => {
            setLast(out);
            await persist(next);
          }}
        />
      )}
      {last && <DiceStageBreakdown stages={last.stages} />}
    </main>
  );
}
