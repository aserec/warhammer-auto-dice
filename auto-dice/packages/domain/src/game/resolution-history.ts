import type { Game, ResolutionRecord } from "./game";

export function appendResolutionRecord(game: Game, record: ResolutionRecord): Game {
  return {
    ...game,
    resolutionHistory: [...game.resolutionHistory, record],
    updatedAt: new Date().toISOString(),
  };
}
