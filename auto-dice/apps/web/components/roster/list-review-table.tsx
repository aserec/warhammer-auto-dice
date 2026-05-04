"use client";

import type { Roster } from "@whad/domain";

export function ListReviewTable({ roster }: { roster: Roster }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-3">Unit</th>
            <th className="p-3">Models</th>
            <th className="p-3">Weapons</th>
          </tr>
        </thead>
        <tbody>
          {roster.units.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-3 font-medium">{u.name}</td>
              <td className="p-3">
                {u.modelRows
                  .filter((r) => r.kind === "stack")
                  .reduce((a, r) => a + (r.kind === "stack" ? r.count : 0), 0)}
              </td>
              <td className="p-3 text-muted-foreground">
                {u.weapons.map((w) => w.name).join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
