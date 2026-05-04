"use client";

import type { Game, GameRepository } from "@whad/domain";
import { useCallback } from "react";
import { useGameSessionStore } from "@/lib/stores/game-session-store";

export function useGameController(repo: GameRepository) {
  const { game, setGame, createLocalGame } = useGameSessionStore();

  const persist = useCallback(
    async (next: Game) => {
      await repo.saveGame(next);
      setGame(next);
    },
    [repo, setGame],
  );

  const load = useCallback(
    async (id: string) => {
      const g = await repo.loadGame(id);
      setGame(g);
      return g;
    },
    [repo, setGame],
  );

  return { game, setGame, createLocalGame, persist, load };
}
