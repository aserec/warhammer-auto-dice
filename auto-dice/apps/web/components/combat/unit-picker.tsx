"use client";

import type { Unit } from "@whad/domain";
import { Button } from "@/components/ui/button";

export function UnitPicker({
  label,
  units,
  value,
  onChange,
}: {
  label: string;
  units: Unit[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  return (
    <div className="space-y-2" role="group" aria-label={label}>
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {units.map((u) => (
          <Button key={u.id} type="button" size="sm" variant={value === u.id ? "default" : "outline"} onClick={() => onChange(u.id)}>
            {u.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
