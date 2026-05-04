import type { Game } from "../game/game";

export interface GameRepository {
  saveGame(game: Game): Promise<void>;
  loadGame(id: string): Promise<Game | null>;
  listGameIds(): Promise<string[]>;
}
