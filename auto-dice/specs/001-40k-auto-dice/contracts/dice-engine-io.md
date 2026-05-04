# Contract: Dice resolution engine (domain boundary)

**Version**: 0.2 | **Date**: 2026-05-04

## Purpose

Define the **input/output contract** for pure combat resolution in `packages/domain` so UI, persistence, and tests share one language.

## Inputs

### `ResolveAttackInput`

| Property | Required | Description |
|----------|------------|-------------|
| `rulesProfileId` | yes | e.g. `wh40k-10e-v1`. |
| `attackConfiguration` | yes | Immutable snapshot: phase, units, weapon, attack count, participating model rows, defender save + FNP. **Weapon and defender profile numeric fields** originate from the **imported list JSON → roster mapping** (see `test-data/` examples and `list-parser-plugin.md`); the engine consumes the snapshot only. |
| `modifiers` | yes | Ordered list of normalized modifier descriptors (`kind`, optional `value`, `scope`). |
| `rng` | yes | `RngPort` implementation (seeded in tests). |

## Outputs

### `ResolveAttackOutput`

| Property | Description |
|----------|-------------|
| `stages` | Ordered list of stage results: `hits`, `wounds`, `saves`, `fnp`. Each contains aggregates + `dice[]`. |
| `dice[i]` | `face`, `unmodified`, `effective`, `tags[]` (`crit_hit`, `crit_wound`, `lethal`, `devastating`, etc.). |
| `summary` | Human-auditable numbers: failed/succeeded saves, damage after FNP, etc. |
| `blockingErrors` | Empty on success; non-empty means roll must not be shown as completed (e.g. illegal modifier combo). |

## Invariants

1. Same `ResolveAttackInput` + same `rng` sequence ⇒ **byte-identical** `ResolveAttackOutput` (golden tests).
2. Engine does **not** mutate `attackConfiguration`.
3. Stage order is fixed; skipped stages appear with `skipped: true` and reason (e.g. no save allowed).

## Consumer responsibilities

- **UI**: Maps `stages` to components; applies motion based on `tags` without altering numbers.
- **Persistence**: Stores `ResolveAttackOutput` (or compressed summary) append-only in `Game.resolutionHistory`.
