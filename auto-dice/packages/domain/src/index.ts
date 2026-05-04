export { createGame, type CreateGameInput } from "./game/create-game";
export {
  assertGameInvariants,
  type Game,
  type Roster,
  type Unit,
  type WeaponProfile,
  type ModelRow,
} from "./game/game";
export type { Player, PlayerId } from "./game/player";
export { serializeGame, deserializeGame } from "./game/game.snapshot";
export { appendResolutionRecord } from "./game/resolution-history";
export { adjustStackCount, eliminateRowIfEmpty } from "./game/model-row";

export type { RngPort } from "./rng/rng-port";
export { SeededRng } from "./rng/seeded-rng";

export type { GameRepository } from "./persistence/game-repository.port";

export type { ListParseResult, ListDiagnostic } from "./ingestion/list-parse-result";
export type { ListParserPlugin } from "./ingestion/list-parser-plugin";
export { jsonRosterParser, BS_FORCES_JSON_V1 } from "./ingestion/strategies/json-roster-parser";

export {
  validateAttackConfiguration,
  type AttackConfiguration,
  type AttackValidationContext,
  type CombatPhase,
} from "./combat/attack-configuration";
export type { Modifier, ModifierKind, ModifierScope } from "./combat/modifiers/modifier-types";
export { normalizeModifierOrder, detectModifierConflicts } from "./combat/modifiers/modifier-engine";
export { resolveAttack, type ResolveAttackInput, type ResolveAttackOutput } from "./combat/dice/resolve-attack";
export type { DieResult, StageResult } from "./combat/dice/stage-types";
export { parsePlus, parseAp, parseDamageEvents } from "./combat/dice/parse";
