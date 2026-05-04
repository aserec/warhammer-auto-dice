"use client";

import type { ModelRow } from "@whad/domain";
import { ModelStackControl } from "./model-stack-control";

export function ModelRowList({
  rows,
  onStackChange,
}: {
  rows: ModelRow[];
  onStackChange: (index: number, nextCount: number) => void;
}) {
  return (
    <ul className="space-y-2">
      {rows.map((row, i) => (
        <li key={i} className="rounded-md border px-3 py-2">
          {row.kind === "stack" ? (
            <ModelStackControl
              label={`Stack (${row.profileId.slice(0, 6)}…)`}
              count={row.count}
              onChange={(n) => onStackChange(i, n)}
            />
          ) : (
            <span className="text-sm">{row.alive ? "Model alive" : "Model dead"}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
