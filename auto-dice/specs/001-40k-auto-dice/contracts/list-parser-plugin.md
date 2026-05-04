# Contract: List parser plugin (ingestion)

**Version**: 0.2 | **Date**: 2026-05-04

## Purpose

Army list **import** supports **multiple formats** over time; each format implements the same **plugin contract** so parsers stay testable in isolation. **MVP**: the primary input is a **UTF-8 string containing a full JSON roster document** whose shape matches the project’s golden files under `auto-dice/test-data/` (`example-votann-list.json`, `example-tzeentch-list.json`). **Weapons and model profiles** in the resulting `Roster` MUST be populated from that document (see `data-model.md`).

## `ListParserPlugin` interface (conceptual)

| Method / field | Description |
|----------------|-------------|
| `id` | Stable string (`bs-forces-json-v1` for MVP, …). |
| `canParse(raw: string): boolean` | Cheap heuristic (e.g. for JSON: leading `{` + presence of `"roster"` key without parsing the full multi‑MB file when possible). |
| `parse(raw: string): ListParseResult` | Returns `Roster` draft + `diagnostics[]` (`raw` is the full file body for JSON MVP). |

## `ListParseResult`

| Field | Type | Notes |
|-------|------|--------|
| `success` | boolean | `false` if blocking errors. |
| `roster` | `Roster` draft | May be partial if warnings only. |
| `diagnostics` | array | `severity: error \| warn`, `message`, optional `line`, `column`. |

## Golden tests

Each registered `id` MUST ship with **fixture files** in `packages/domain` (or co-located `__fixtures__`) and Vitest cases asserting:

- Minimum: at least one **happy path** and one **malformed** sample.
- For **`bs-forces-json-v1` (or successor id)**: fixtures MUST be **derived from or equivalent to** `auto-dice/test-data/example-votann-list.json` and `auto-dice/test-data/example-tzeentch-list.json` so **weapons and profiles** in tests match real list JSON the app will accept.

## Versioning

Breaking changes to output shape require **new** `rulesProfileId` or parser `id` suffix and migration notes in CHANGELOG.
