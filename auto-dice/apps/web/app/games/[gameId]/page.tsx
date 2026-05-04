"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ListReviewTable } from "@/components/roster/list-review-table";
import { ModelRowList } from "@/components/roster/model-row-list";
import { PasteImportDialog } from "@/components/roster/paste-import-dialog";
import { Button } from "@/components/ui/button";
import { attachRosterForPlayer } from "@/lib/game/attach-roster";
import { setModelStackCount } from "@/lib/game/model-stack-mutations";
import { useGameController } from "@/lib/game/use-game-controller";
import { IndexedDbGameRepository } from "@/lib/persistence/indexeddb-game-repository";
import { useGameSessionStore } from "@/lib/stores/game-session-store";
import type { Roster } from "@whad/domain";

const repo = new IndexedDbGameRepository();

export default function GameDetailPage() {
  const params = useParams<{ gameId: string }>();
  const gameId = params.gameId;
  const { game, load, persist } = useGameController(repo);
  const [pendingRoster, setPendingRoster] = useState<Roster | null>(null);
  const [pendingFor, setPendingFor] = useState<string | null>(null);

  useEffect(() => {
    void load(gameId);
  }, [gameId, load]);

  const title = useMemo(() => (game ? `Game ${game.id.slice(0, 8)}` : "Loading…"), [game]);

  if (!game) {
    return (
      <main className="px-4 py-10">
        <p>{title}</p>
      </main>
    );
  }

  const attachPending = async (playerId: string) => {
    if (!pendingRoster || pendingFor !== playerId) return;
    const next = attachRosterForPlayer(game, playerId, pendingRoster);
    await persist(next);
    setPendingRoster(null);
    setPendingFor(null);
  };

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <Button asChild>
          <Link href={`/games/${game.id}/attack`}>Attack wizard</Link>
        </Button>
      </div>
      <section className="grid gap-6 md:grid-cols-2">
        {[game.playerOne, game.playerTwo].map((p) => (
          <div key={p.id} className="space-y-3 rounded-lg border p-4">
            <h2 className="text-lg font-medium">{p.displayName}</h2>
            {game.rosters[p.id] ? (
              <div className="space-y-3">
                <ListReviewTable roster={game.rosters[p.id]!} />
                {game.rosters[p.id]!.units[0]?.modelRows.length ? (
                  <ModelRowList
                    rows={game.rosters[p.id]!.units[0]!.modelRows}
                    onStackChange={(idx, n) => {
                      void (async () => {
                        const g = useGameSessionStore.getState().game;
                        if (!g) return;
                        const u0 = g.rosters[p.id]?.units[0];
                        if (!u0) return;
                        const next = setModelStackCount(g, p.id, u0.id, idx, n);
                        await persist(next);
                      })();
                    }}
                  />
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No roster yet.</p>
            )}
            <div className="flex flex-wrap gap-2">
              <PasteImportDialog
                onImported={(roster) => {
                  setPendingRoster(roster);
                  setPendingFor(p.id);
                }}
              />
              {pendingFor === p.id && pendingRoster && (
                <Button type="button" onClick={() => void attachPending(p.id)}>
                  Confirm roster
                </Button>
              )}
            </div>
          </div>
        ))}
      </section>
      {game.resolutionHistory.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-medium">Recent rolls</h2>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {game.resolutionHistory.map((r) => (
              <li key={r.id}>
                {r.resolvedAt}: damage {r.summary?.damageAfterFnp ?? "—"}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
