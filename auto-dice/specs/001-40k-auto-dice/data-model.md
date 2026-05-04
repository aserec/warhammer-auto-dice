# Data Model: Warhammer 40,000 Automated Dice Resolution

**Feature**: `001-40k-auto-dice` | **Date**: 2026-05-04

Bounded contexts: **Game & Roster**, **Ingestion**, **Combat Resolution**.

**List source of truth**: For MVP, **weapon profiles and model profiles** are **materialized only from imported list JSON** mapped into this model (see `auto-dice/test-data/example-votann-list.json` and `example-tzeentch-list.json` for representative document shape). The app does not maintain a parallel catalog of stats for those fields.

---

## Game & Roster

### Aggregate: `Game`

| Field / child | Description |
|----------------|-------------|
| `id` | Stable UUID per game instance. |
| `playerOne`, `playerTwo` | Embedded `Player` value objects. |
| `rosters` | Map `playerId → Roster` (exactly two entries in v1). |
| `createdAt`, `updatedAt` | ISO timestamps for ordering and sync future-proofing. |
| `resolutionHistory` | Ordered list of `ResolutionRecord` (summary refs, not full re-roll unless needed). |

**Invariants**: Exactly two players; each player has at most one `Roster` before play is allowed; game cannot roll without both rosters valid.

### `Player`

| Field | Description |
|-------|-------------|
| `id` | UUID. |
| `displayName` | User-visible name. |

### Aggregate: `Roster` (per player)

| Field / child | Description |
|----------------|-------------|
| `source` | `json \| paste \| bcp` + metadata (`importedAt`, optional `bcpMatchRef`, optional `formatId`). |
| `rawPayload` | Original **JSON document** as string (preferred for `json` source) or other raw import bytes/text for diagnostics and re-parse. |
| `rawText` | Legacy/plain-text capture when `source` is `paste` (optional; may be empty when only JSON is used). |
| `units` | Ordered list of `Unit`. |

**Invariants**: Weapon and profile references inside units are internally consistent with the **imported list document** (ingestion validation); domain does not invent weapons not present in the roster JSON mapping.

### `Unit`

| Field | Description |
|-------|-------------|
| `id` | UUID. |
| `name` | Display name from list. |
| `modelRows` | Non-empty list of `ModelRow`. |
| `weapons` | `WeaponProfile` catalog entries attachable to rows (may be shared references); each entry **originates from list JSON** via ingestion. |

### `ModelRow`

| Kind | Fields |
|------|--------|
| `stack` | `profileId`, `equipmentSignature`, `count` (≥ 0), `weaponLoadoutIds`. |
| `individual` | `profileId`, `equipmentSignature`, `alive` boolean, `weaponLoadoutIds`. |

**Invariants**: `count` is integer; weapons on row must exist in unit catalog; destroying last model marks unit as **eliminated** for attack selection.

### `WeaponProfile` (value object)

| Field | Description |
|-------|-------------|
| `id`, `name` | Identity. |
| `type` | `ranged \| melee` (or `both` with phase gate at use site). |
| `attacks` | Numeric or dice expression + user override field for variable counts. |
| `skill`, `strength`, `ap`, `damage` | As per rules profile (types allow `"D3"` etc.). |
| `keywords` | Optional strings for special interactions (future). |

---

## Ingestion

### `ListParseResult` (output of ingestion context)

| Field | Description |
|-------|-------------|
| `success` | Whether parse completed without blocking errors. |
| `roster` | Partial or full `Roster` candidate (see `contracts/list-parser-plugin.md`). |
| `diagnostics` | Errors/warnings with line hints. |
| `formatId` | Strategy id (e.g. `bs-forces-json-v1` for MVP JSON roster shape aligned to `test-data/` examples). |

**State transition**: `raw` → `parsed` → `userConfirmed` → merged into `Game`.

### `BcpMatchRef` (value object)

| Field | Description |
|-------|-------------|
| `eventId`, `matchId` | Opaque strings from BCP UX (exact semantics from adapter research). |
| `fetchedAt` | Timestamp. |

---

## Combat Resolution

### `AttackConfiguration` (value object / session entity)

| Field | Description |
|-------|-------------|
| `phase` | `shooting \| melee`. |
| `attackerPlayerId`, `defenderPlayerId` | Players. |
| `attackingUnitId`, `defendingUnitId` | Units. |
| `attackingModelRows` | Subset participating (for split fire / eligibility future). |
| `weaponProfileId` | Weapon chosen. |
| `attackCount` | Resolved number of attacks for this roll. |
| `hitModifiers`, `woundModifiers`, … | Normalized list of `Modifier` ids + parameters. |
| `defenderSaveProfile` | Save characteristic + invuln optional + FNP optional. |

### `Modifier` (value object)

| Field | Description |
|-------|-------------|
| `kind` | Enum: `hit_bonus`, `wound_bonus`, `reroll_hits_one`, `reroll_wounds_one`, `lethal_hits`, `devastating_wounds`, … (extensible). |
| `value` | Optional numeric (e.g. +1). |
| `scope` | Which stage applies. |

**Ordering**: Documented ordered list in `packages/domain` (single source of truth); tests lock order.

### `DiceResolution` (result aggregate)

| Field | Description |
|-------|-------------|
| `id` | UUID. |
| `attackConfigurationSnapshot` | Immutable copy used for roll. |
| `stages` | Ordered: `hits`, `wounds`, `saves`, `fnp` (each optional skip). |
| `perDie` | Arrays with face, unmodified, modified outcome, tags (`crit`, `fail`, `lethal`, etc.). |
| `summary` | Wounds allocated, damage inflicted, etc. |
| `rngMetadata` | Non-secret: seed if dev/test. |

**Invariants**: Result is reproducible from snapshot + seed.

---

## Validation rules (cross-cutting)

- List import (JSON): reject with diagnostics if JSON invalid or zero units parsed; reference paths/keys in errors when useful.
- Attack: block if weapon illegal for phase or model row.
- Modifiers: reject conflicting pair per engine rules table (see tests).
- Dice: cap per roll configurable constant to avoid UI freeze (soft warn, hard cap TBD in tasks).
