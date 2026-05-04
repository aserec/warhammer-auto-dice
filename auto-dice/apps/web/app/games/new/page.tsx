"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BcpImportFlow } from "@/components/bcp/bcp-import-flow";
import { Button } from "@/components/ui/button";
import { useGameController } from "@/lib/game/use-game-controller";
import { IndexedDbGameRepository } from "@/lib/persistence/indexeddb-game-repository";

const repo = new IndexedDbGameRepository();

export default function NewGamePage() {
  const router = useRouter();
  const { createLocalGame, persist } = useGameController(repo);
  const [p1, setP1] = useState("Player 1");
  const [p2, setP2] = useState("Player 2");

  const handleCreate = async () => {
    const game = createLocalGame(p1, p2);
    await persist(game);
    router.push(`/games/${game.id}`);
  };

  const showBcp = process.env.NEXT_PUBLIC_FEATURE_BCP_IMPORT === "true";

  return (
    <main className="mx-auto max-w-md space-y-6 px-4 py-10">
      <h1 className="text-2xl font-semibold">New game</h1>
      {showBcp && (
        <section className="space-y-2 rounded-md border p-4">
          <h2 className="text-sm font-medium">Best Coast Pairings (preview)</h2>
          <BcpImportFlow eventId="demo-event" matchId="demo-match" />
        </section>
      )}
      <div className="space-y-1 text-sm">
        <label htmlFor="p1" className="block">
          Player one
        </label>
        <input
          id="p1"
          className="w-full rounded-md border bg-background px-3 py-2"
          value={p1}
          onChange={(e) => setP1(e.target.value)}
        />
      </div>
      <div className="space-y-1 text-sm">
        <label htmlFor="p2" className="block">
          Player two
        </label>
        <input
          id="p2"
          className="w-full rounded-md border bg-background px-3 py-2"
          value={p2}
          onChange={(e) => setP2(e.target.value)}
        />
      </div>
      <Button type="button" className="w-full" onClick={() => void handleCreate()}>
        Create & save
      </Button>
    </main>
  );
}
