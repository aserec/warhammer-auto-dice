"use client";

import type { Unit, WeaponProfile } from "@whad/domain";

export function AttackSummaryCard({
  attacker,
  weapon,
  defender,
  modifierSummary,
}: {
  attacker: Unit | null;
  weapon: WeaponProfile | null;
  defender: Unit | null;
  modifierSummary: string;
}) {
  if (!weapon) return null;
  return (
    <div className="rounded-lg border bg-card p-4 text-sm shadow-sm">
      <h3 className="mb-2 font-semibold">Attack summary</h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
        <dt className="text-muted-foreground">Attacker</dt>
        <dd>{attacker?.name ?? "—"}</dd>
        <dt className="text-muted-foreground">Weapon</dt>
        <dd>{weapon.name}</dd>
        <dt className="text-muted-foreground">Skill</dt>
        <dd>{weapon.skill}</dd>
        <dt className="text-muted-foreground">S / AP / D</dt>
        <dd>
          {weapon.strength} / {weapon.ap} / {weapon.damage}
        </dd>
        <dt className="text-muted-foreground">Defender</dt>
        <dd>{defender?.name ?? "—"}</dd>
        <dt className="text-muted-foreground">T / Sv</dt>
        <dd>
          {defender?.toughness ?? "—"} / {defender?.save ?? "—"}
        </dd>
        <dt className="text-muted-foreground">Modifiers</dt>
        <dd>{modifierSummary || "None"}</dd>
      </dl>
    </div>
  );
}
