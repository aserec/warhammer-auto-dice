"use client";

import type { Unit, WeaponProfile } from "@whad/domain";
import { Button } from "@/components/ui/button";

export function WeaponPicker({
  unit,
  phase,
  value,
  onChange,
}: {
  unit: Unit | null;
  phase: "shooting" | "melee";
  value: string | null;
  onChange: (weaponId: string) => void;
}) {
  if (!unit) return <p className="text-sm text-muted-foreground">Select a unit first.</p>;
  const weapons = unit.weapons.filter((w) => (phase === "shooting" ? w.type !== "melee" : w.type !== "ranged"));
  if (weapons.length === 0) {
    return <p className="text-sm text-muted-foreground">No legal weapons for this phase.</p>;
  }
  return (
    <div role="group" aria-label="Weapon selection" className="flex flex-wrap gap-2">
      {weapons.map((w: WeaponProfile) => (
        <Button key={w.id} type="button" size="sm" variant={value === w.id ? "default" : "outline"} onClick={() => onChange(w.id)}>
          {w.name}
        </Button>
      ))}
    </div>
  );
}
