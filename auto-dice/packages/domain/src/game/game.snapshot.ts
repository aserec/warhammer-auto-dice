import type { Game } from "./game";

export function serializeGame(game: Game): string {
  return JSON.stringify(game);
}

export function deserializeGame(json: string): Game {
  const parsed = JSON.parse(json) as Game;
  if (!parsed?.id || !parsed.playerOne || !parsed.playerTwo) {
    throw new Error("Invalid game snapshot");
  }
  return parsed;
}
