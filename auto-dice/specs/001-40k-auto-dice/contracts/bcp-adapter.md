# Contract: Best Coast Pairings list source (adapter)

**Version**: 0.1 | **Date**: 2026-05-04

## Purpose

Isolate **BCP** behind an application-level port so domain and UI depend on stable shapes, not vendor HTTP details.

## `BcpListSource` port (conceptual)

### `fetchMatchLists(input): Promise<BcpFetchResult>`

**Input**

| Field | Description |
|-------|-------------|
| `eventId` | Opaque event identifier from user selection. |
| `matchId` | Opaque match identifier. |

**Output union**

1. **Success**

| Field | Description |
|-------|-------------|
| `playerOneListText` | Raw text or HTML suitable for `ListParserPlugin` pipeline. |
| `playerTwoListText` | Same. |
| `metadata` | Display names, faction names, etc., when available. |

2. **Failure**

| Field | Description |
|-------|-------------|
| `code` | `network`, `unauthorized`, `not_found`, `rate_limited`, `unknown`. |
| `message` | User-safe string. |
| `retryable` | boolean. |

## Server boundary

- Only **server-side** modules (Route Handlers / server actions) call remote BCP endpoints.
- Client receives **already-fetched** or **error** DTOs via TanStack Query.

## Testing

- Provide **fixture JSON** for success and each `code`.
- Vitest tests the adapter with **mock `fetch`**.
- Playwright covers UI fallback to paste when `retryable` or `not_found`.

## Compliance

Respect BCP **terms of use** and rate limits; document discovery of official or allowed APIs in implementation README.
