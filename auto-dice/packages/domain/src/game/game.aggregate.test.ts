import { describe, expect, it } from "vitest";
import { createGame } from "./create-game";
import { assertGameInvariants } from "./game";
import { deserializeGame, serializeGame } from "./game.snapshot";

describe("Game aggregate", () => {
  it("createGame produces two players and empty roster slots", () => {
    const g = createGame({ playerOneName: "Ada", playerTwoName: "Bob" });
    expect(g.playerOne.displayName).toBe("Ada");
    expect(g.playerTwo.displayName).toBe("Bob");
    expect(g.rosters[g.playerOne.id]).toBeNull();
    expect(g.rosters[g.playerTwo.id]).toBeNull();
    assertGameInvariants(g);
  });

  it("rejects duplicate-looking invariants at type level via assertGameInvariants", () => {
    const g = createGame({ playerOneName: "A", playerTwoName: "B" });
    const bad = {
      ...g,
      playerTwo: { ...g.playerTwo, id: g.playerOne.id },
    };
    expect(() => assertGameInvariants(bad)).toThrow(/distinct/);
  });

  it("round-trips snapshot", () => {
    const g = createGame({ playerOneName: "X", playerTwoName: "Y" });
    const again = deserializeGame(serializeGame(g));
    expect(again.id).toBe(g.id);
    expect(again.playerOne.id).toBe(g.playerOne.id);
  });
});
