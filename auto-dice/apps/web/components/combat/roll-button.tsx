"use client";

import {
  appendResolutionRecord,
  parsePlus,
  resolveAttack,
  type AttackConfiguration,
  type Game,
  type ResolveAttackOutput,
  type WeaponProfile,
} from "@whad/domain";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BrowserRng } from "@/lib/rng/browser-rng";

function randomId(): string {
  return crypto.randomUUID();
}

export function RollButton({
  game,
  cfg,
  weapon,
  defenderToughness,
  onResolved,
}: {
  game: Game;
  cfg: AttackConfiguration;
  weapon: WeaponProfile;
  defenderToughness: number;
  onResolved: (next: Game, out: ResolveAttackOutput) => void;
}) {
  const [busy, setBusy] = useState(false);
  const handleRoll = () => {
    setBusy(true);
    try {
      const rng = new BrowserRng();
      const out = resolveAttack({
        rulesProfileId: "wh40k-10e-v1",
        attackConfiguration: cfg,
        weapon,
        defenderToughness,
        rng,
      });
      if (out.blockingErrors.length) {
        window.alert(out.blockingErrors.join("\n"));
        return;
      }
      const record = {
        id: randomId(),
        resolvedAt: new Date().toISOString(),
        diceResolutionId: randomId(),
        summary: out.summary,
      };
      const next = appendResolutionRecord(game, record);
      onResolved(next, out);
    } finally {
      setBusy(false);
    }
  };

  const attacks = parsePlus(weapon.attacks, 1);
  const disabled = cfg.attackCount < 1;

  return (
    <Button type="button" className="min-h-12 w-full sm:w-auto" disabled={busy || disabled} onClick={handleRoll}>
      Roll {attacks} attacks
    </Button>
  );
}
