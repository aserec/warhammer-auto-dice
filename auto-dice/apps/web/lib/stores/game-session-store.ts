"use client";

import { createGame, type Game } from "@whad/domain";
import { create } from "zustand";

export interface GameSessionState {
  currentGameId: string | null;
  game: Game | null;
  setGame: (game: Game | null) => void;
  createLocalGame: (playerOneName: string, playerTwoName: string) => Game;
}

export const useGameSessionStore = create<GameSessionState>((set) => ({
  currentGameId: null,
  game: null,
  setGame: (game) =>
    set({
      game,
      currentGameId: game?.id ?? null,
    }),
  createLocalGame: (playerOneName, playerTwoName) => {
    const game = createGame({ playerOneName, playerTwoName });
    set({ game, currentGameId: game.id });
    return game;
  },
}));
