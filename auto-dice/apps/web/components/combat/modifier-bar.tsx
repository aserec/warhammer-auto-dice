"use client";

import type { Modifier } from "@whad/domain";
import { Button } from "@/components/ui/button";

const PRESETS: Modifier[] = [
  { kind: "hit_bonus", value: 1, scope: "hit" },
  { kind: "wound_bonus", value: 1, scope: "wound" },
  { kind: "save_bonus", value: 1, scope: "save" },
  { kind: "lethal_hits", scope: "wound" },
];

export function ModifierBar({ active, onToggle }: { active: Modifier[]; onToggle: (m: Modifier) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((m) => {
        const on = active.some((x) => x.kind === m.kind);
        return (
          <Button key={m.kind} type="button" size="sm" variant={on ? "default" : "outline"} onClick={() => onToggle(m)}>
            {m.kind.replace(/_/g, " ")}
          </Button>
        );
      })}
    </div>
  );
}
