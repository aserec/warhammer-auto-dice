import type { Game, PlayerId, Roster } from "@whad/domain";

export function attachRosterForPlayer(game: Game, playerId: PlayerId, roster: Roster): Game {
  return {
    ...game,
    rosters: { ...game.rosters, [playerId]: roster },
    updatedAt: new Date().toISOString(),
  };
}
