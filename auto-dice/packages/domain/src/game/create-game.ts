import type { Game } from "./game";
import type { Player } from "./player";
import { assertGameInvariants } from "./game";

function randomId(): string {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `game-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export interface CreateGameInput {
  playerOneName: string;
  playerTwoName: string;
}

export function createGame(input: CreateGameInput): Game {
  const p1: Player = { id: randomId(), displayName: input.playerOneName.trim() || "Player 1" };
  const p2: Player = { id: randomId(), displayName: input.playerTwoName.trim() || "Player 2" };
  const now = new Date().toISOString();
  const game: Game = {
    id: randomId(),
    playerOne: p1,
    playerTwo: p2,
    rosters: {
      [p1.id]: null,
      [p2.id]: null,
    },
    createdAt: now,
    updatedAt: now,
    resolutionHistory: [],
  };
  assertGameInvariants(game);
  return game;
}
