import { adjustStackCount, type Game, type PlayerId } from "@whad/domain";

export function setModelStackCount(
  game: Game,
  playerId: PlayerId,
  unitId: string,
  rowIndex: number,
  nextCount: number,
): Game {
  const roster = game.rosters[playerId];
  if (!roster) return game;
  const units = roster.units.map((u) => {
    if (u.id !== unitId) return u;
    const modelRows = u.modelRows.map((row, i) => {
      if (i !== rowIndex || row.kind !== "stack") return row;
      return adjustStackCount(row, nextCount - row.count);
    });
    return { ...u, modelRows };
  });
  return {
    ...game,
    rosters: { ...game.rosters, [playerId]: { ...roster, units } },
    updatedAt: new Date().toISOString(),
  };
}
