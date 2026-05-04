"use client";

import { Button } from "@/components/ui/button";

export function ModelStackControl({
  count,
  onChange,
  label,
}: {
  count: number;
  onChange: (next: number) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1" role="group" aria-label={label}>
        <Button type="button" size="icon" variant="outline" onClick={() => onChange(Math.max(0, count - 1))}>
          −
        </Button>
        <output className="min-w-8 text-center text-sm font-medium" aria-live="polite">
          {count}
        </output>
        <Button type="button" size="icon" variant="outline" onClick={() => onChange(count + 1)}>
          +
        </Button>
      </div>
    </div>
  );
}
