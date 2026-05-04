"use client";

import type { CombatPhase } from "@whad/domain";
import { Button } from "@/components/ui/button";

export function AttackPhaseToggle({ value, onChange }: { value: CombatPhase; onChange: (p: CombatPhase) => void }) {
  return (
    <div className="flex gap-2" role="group" aria-label="Attack phase">
      <Button type="button" variant={value === "shooting" ? "default" : "outline"} onClick={() => onChange("shooting")}>
        Shooting
      </Button>
      <Button type="button" variant={value === "melee" ? "default" : "outline"} onClick={() => onChange("melee")}>
        Melee
      </Button>
    </div>
  );
}
