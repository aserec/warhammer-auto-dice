"use client";

import Link from "next/link";
import { useBcpMatch } from "@/lib/bcp/use-bcp-match";
import { Button } from "@/components/ui/button";

export function BcpImportFlow({ eventId, matchId }: { eventId: string; matchId: string }) {
  const q = useBcpMatch(eventId, matchId, true);
  const failed = q.data && q.data.status !== "ok";
  if (q.isError || failed) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
        <p className="mb-2">Could not load Best Coast Pairings lists.</p>
        <Button asChild variant="outline">
          <Link href="/games/new">Use manual JSON list import</Link>
        </Button>
      </div>
    );
  }
  if (q.data?.status === "ok") {
    return (
      <ul className="text-sm">
        {q.data.lists.map((l) => (
          <li key={l.id}>{l.name}</li>
        ))}
      </ul>
    );
  }
  return <p className="text-sm text-muted-foreground">Loading BCP…</p>;
}
