# Data Model: Warhammer 40,000 Automated Dice Resolution

**Feature**: `001-40k-auto-dice` | **Date**: 2026-05-04

Bounded contexts: **Game & Roster**, **Ingestion**, **Rules catalog (local)**, **Combat Resolution**.

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
| `source` | `paste \| bcp` + metadata (`importedAt`, optional `bcpMatchRef`). |
| `rawText` | Original paste (optional if size policy trims; prefer keep for re-parse). |
| `units` | Ordered list of `Unit`. |
| `requiredRulesEntityKeys` | Deduped list of `RulesEntityKey` (from parser + mapper) that **must** exist in the **rules catalog** before this roster is playable. |

**Invariants**: Weapon and profile references inside units are internally consistent (parser validation); **no roster may transition to “committed / ready” until every `requiredRulesEntityKey` has a corresponding `RulesCatalogEntry` persisted** (see FR-019).

### `Unit`

| Field | Description |
|-------|-------------|
| `id` | UUID. |
| `name` | Display name from list. |
| `modelRows` | Non-empty list of `ModelRow`. |
| `weapons` | References into the **rules catalog** (by `RulesEntityKey`) plus display names from list text; resolved `WeaponProfile` values are read from IndexedDB at runtime after hydration. |

### `ModelRow`

| Kind | Fields |
|------|--------|
| `stack` | `profileId`, `equipmentSignature`, `count` (≥ 0), `weaponLoadoutIds`. |
| `individual` | `profileId`, `equipmentSignature`, `alive` boolean, `weaponLoadoutIds`. |

**Invariants**: `count` is integer; weapons on row must exist in unit catalog; destroying last model marks unit as **eliminated** for attack selection.

### `WeaponProfile` (value object — materialized from rules catalog)

Populated from **`RulesCatalogEntry.normalized`** after Wahapedia hydration (not invented from list text).

| Field | Description |
|-------|-------------|
| `catalogKey` | `RulesEntityKey` linking back to IndexedDB row. |
| `id`, `name` | Identity (name may mirror Wahapedia). |
| `type` | `ranged \| melee` (or `both` with phase gate at use site). |
| `attacks` | Numeric or dice expression + user override field for variable counts. |
| `skill`, `strength`, `ap`, `damage` | As per Wahapedia-backed profile (types allow `"D3"` etc.). |
| `keywords` | Optional strings for special interactions (future). |

---

## Rules catalog (local IndexedDB)

Shared across **all games** on the same browser origin. Backed by **`RulesCatalogRepository`** (port); IndexedDB implementation uses an object store distinct from `Game` snapshots.

### `RulesCatalogEntry`

| Field | Description |
|-------|-------------|
| `key` | Stable `RulesEntityKey` (see `contracts/wahapedia-rules-catalog.md`). |
| `normalized` | JSON matching domain expectations for model profile and/or weapon profile. |
| `fetchedAt` | ISO timestamp. |
| `sourceEtag` | Optional upstream validator for refresh policy. |

**Invariants**: Writes are **upserts** by `key`; partial roster hydration MUST NOT mark roster ready (spec FR-021).

### `RulesEntityKey` (value object)

Opaque stable key from parser / mapper; must uniquely identify the Wahapedia resource for a given rules edition baseline (`research.md` §1).

---

## Ingestion

### `ListParseResult` (output of ingestion context)

| Field | Description |
|-------|-------------|
| `success` | Whether parse completed without blocking errors. |
| `roster` | Partial or full `Roster` candidate (see `contracts/list-parser-plugin.md`). |
| `diagnostics` | Errors/warnings with line hints. |
| `formatId` | Strategy id (`gw-text-v1`, etc.). |
| `requiredRulesEntityKeys` | Deduped `RulesEntityKey[]` for downstream Wahapedia batch fetch (may be empty only if parser embeds full stats—**not** allowed for MVP; see spec FR-019). |

**State transition**: `raw` → `parsed` → **`hydrating` (Wahapedia + rules catalog)** → `userConfirmed` → merged into `Game`.

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

- List paste: reject with diagnostics if zero units parsed.
- Rules catalog: reject “ready” if any `requiredRulesEntityKey` missing after hydration attempt.
- Attack: block if weapon illegal for phase or model row.
- Modifiers: reject conflicting pair per engine rules table (see tests).
- Dice: cap per roll configurable constant to avoid UI freeze (soft warn, hard cap TBD in tasks).
