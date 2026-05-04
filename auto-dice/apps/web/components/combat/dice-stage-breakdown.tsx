"use client";

import type { StageResult } from "@whad/domain";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const STAGE_LABELS: Record<StageResult["id"], string> = {
  hits: "Hits",
  wounds: "Wounds",
  saves: "Saves",
  fnp: "Feel no pain",
};

export function DiceStageBreakdown({ stages }: { stages: StageResult[] }) {
  const reduced = usePrefersReducedMotion();
  return (
    <ol className="space-y-4" aria-label="Dice resolution by stage">
      {stages.map((s) => (
        <li key={s.id} className="rounded-md border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium">{STAGE_LABELS[s.id]}</span>
            {s.skipped && <span className="text-xs text-muted-foreground">{s.reason}</span>}
          </div>
          <ul className={`flex flex-wrap gap-1 ${reduced ? "" : "transition-opacity"}`}>
            {s.dice.map((d, i) => (
              <li
                key={`${s.id}-${i}`}
                className={`rounded px-2 py-1 text-xs ${
                  d.tags.includes("miss") || d.tags.includes("fail") || d.tags.includes("failed_save")
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary/15 text-foreground"
                }`}
              >
                {d.face}
                {d.tags.length ? ` (${d.tags.join(", ")})` : ""}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
