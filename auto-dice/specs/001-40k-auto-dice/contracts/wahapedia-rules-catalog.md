# Contract: Wahapedia rules catalog (hydration + local cache)

**Version**: 0.1 | **Date**: 2026-05-04

## Purpose

**Model profiles** and **weapon profiles** used for attack configuration and dice resolution are **not** inferred solely from pasted list text. On each successful list load, the app **resolves** every referenced datasheet / weapon / profile against **Wahapedia** (via a **server-side adapter**), then **persists** the full normalized payloads in the **local rules catalog** (IndexedDB on the client, separate object store from game snapshots) so:

- Subsequent games and list imports on the **same browser installation** reuse cached data without refetching.
- Offline play remains possible **after** the catalog has been populated for the units in the current game.

This contract defines the **boundary** between domain expectations and the Wahapedia-backed adapter; the exact HTML/JSON fetch strategy is an implementation detail behind the Route Handler, subject to **rate limits, caching, and site terms of use** (see `research.md` §12).

## `RulesEntityKey` (conceptual)

Stable opaque key produced by the list parser + roster mapper, sufficient for the adapter to locate the correct Wahapedia resource (e.g. faction + unit slug + weapon id). Keys MUST be **deterministic** for the same parsed row so IndexedDB deduplication works.

| Field | Type | Notes |
|-------|------|--------|
| `kind` | `"datasheet" \| "weapon" \| "profile"` | What to hydrate. |
| `wahapediaPath` or `stableId` | string | Adapter-defined; versioned if Wahapedia layout changes. |

## Batch hydrate request (HTTP / internal)

| Field | Type | Notes |
|-------|------|--------|
| `keys` | `RulesEntityKey[]` | **All** keys required for the roster being attached; no partial attach without explicit user override (see errors). |

## Batch hydrate response (success)

| Field | Type | Notes |
|-------|------|--------|
| `records` | array | One entry per resolved key. |
| `records[].key` | `RulesEntityKey` | Echo. |
| `records[].normalized` | object | **WeaponProfile**-compatible and model-profile-compatible shapes expected by `packages/domain` combat layer (exact TS types live in domain). |
| `records[].sourceEtag` | string? | Optional cache validator from upstream. |
| `records[].fetchedAt` | ISO string | Server time when fetched. |

## Error union

| Code | Meaning | UX |
|------|-----------|-----|
| `missing_entity` | Wahapedia has no match for a key | Block attach; show which unit/weapon; allow retry or edit paste. |
| `rate_limited` | Too many requests | Backoff + retry; show message. |
| `upstream_unavailable` | Network or Wahapedia error | Retry; optional degraded mode only if spec explicitly allows (default: block until resolved). |
| `parse_upstream_failed` | Adapter could not normalize payload | Treat as `missing_entity` for that key. |

## Persistence (client)

The app MUST write each successful `records[]` entry to **`RulesCatalogRepository`** (IndexedDB) keyed by `RulesEntityKey` (or a hash thereof) **before** the roster is marked committed on the `Game`.

## Testing

- Vitest: adapter mapping with **fixture JSON** captured from Wahapedia responses (redacted if needed); no live network in CI by default.
- Playwright: mocked route returns batch JSON; assert IndexedDB contains expected keys after import (or assert UI gate “rules ready” before attach).
