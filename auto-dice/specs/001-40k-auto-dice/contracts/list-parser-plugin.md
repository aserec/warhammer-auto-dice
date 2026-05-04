# Contract: List parser plugin (ingestion)

**Version**: 0.1 | **Date**: 2026-05-04

## Purpose

Army list paste supports **multiple formats** over time; each format implements the same **plugin contract** so parsers stay testable in isolation.

## `ListParserPlugin` interface (conceptual)

| Method / field | Description |
|----------------|-------------|
| `id` | Stable string (`battlescribe-html-v1`, …). |
| `canParse(raw: string): boolean` | Cheap heuristic (not full parse). |
| `parse(raw: string): ListParseResult` | Returns `Roster` draft + `diagnostics[]`. |

## `ListParseResult`

| Field | Type | Notes |
|-------|------|--------|
| `success` | boolean | `false` if blocking errors. |
| `roster` | `Roster` draft | May be partial if warnings only. |
| `diagnostics` | array | `severity: error \| warn`, `message`, optional `line`, `column`. |

## Golden tests

Each registered `id` MUST ship with **fixture files** in `packages/domain` (or co-located `__fixtures__`) and Vitest cases asserting:

- Minimum: at least one **happy path** and one **malformed** sample.

## Versioning

Breaking changes to output shape require **new** `rulesProfileId` or parser `id` suffix and migration notes in CHANGELOG.
