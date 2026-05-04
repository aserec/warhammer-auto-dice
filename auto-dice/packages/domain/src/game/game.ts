import type { Player, PlayerId } from "./player";

export type GameId = string;
export type UnitId = string;
export type WeaponProfileId = string;

export interface WeaponProfile {
  id: WeaponProfileId;
  name: string;
  type: "ranged" | "melee" | "both";
  attacks: string;
  skill: string;
  strength: string;
  ap: string;
  damage: string;
  keywords?: string[];
}

export type ModelRow =
  | {
      kind: "stack";
      profileId: string;
      equipmentSignature: string;
      count: number;
      weaponLoadoutIds: WeaponProfileId[];
    }
  | {
      kind: "individual";
      profileId: string;
      equipmentSignature: string;
      alive: boolean;
      weaponLoadoutIds: WeaponProfileId[];
    };

export interface Unit {
  id: UnitId;
  name: string;
  modelRows: ModelRow[];
  weapons: WeaponProfile[];
  /** Parsed from roster unit profile for wound rolls. */
  toughness?: string;
  /** e.g. "3+" */
  save?: string;
}

export interface RosterSourceJson {
  kind: "json";
  importedAt: string;
  formatId: string;
}

export interface Roster {
  source: RosterSourceJson;
  rawPayload: string;
  rawText: string;
  units: Unit[];
}

export interface ResolutionRecord {
  id: string;
  resolvedAt: string;
  diceResolutionId: string;
  /** Optional compact snapshot for UI history (domain stays JSON-serializable). */
  summary?: Record<string, number>;
}

export interface Game {
  id: GameId;
  playerOne: Player;
  playerTwo: Player;
  rosters: Record<PlayerId, Roster | null>;
  createdAt: string;
  updatedAt: string;
  resolutionHistory: ResolutionRecord[];
}

export function assertGameInvariants(game: Game): void {
  if (!game.playerOne?.id || !game.playerTwo?.id) {
    throw new Error("Game requires two players");
  }
  if (game.playerOne.id === game.playerTwo.id) {
    throw new Error("Players must have distinct ids");
  }
  const keys = Object.keys(game.rosters);
  if (!keys.includes(game.playerOne.id) || !keys.includes(game.playerTwo.id)) {
    throw new Error("Rosters map must include both player ids");
  }
}
