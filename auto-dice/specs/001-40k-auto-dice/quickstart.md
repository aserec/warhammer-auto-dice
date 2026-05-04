# Quickstart (post-scaffold)

**Feature**: `001-40k-auto-dice` | **Date**: 2026-05-04

This document describes how to run the monorepo **after** the initial Turborepo + Next.js + packages layout exists (created during implementation, not by this plan command).

## Prerequisites

- **Node.js** LTS (version pinned in root `.nvmrc` or `package.json` `engines` when scaffolded).
- **pnpm** (recommended) or alternative aligned with workspace policy.

## Install

```bash
cd auto-dice
pnpm install
```

## Development

```bash
pnpm dev
```

Runs Turborepo dev task targeting **`apps/web`** (Next.js). Open the URL printed in the terminal (default `http://localhost:3000`).

## Unit and component tests

```bash
pnpm test
# or per package
pnpm --filter @whad/domain test
pnpm --filter web test
```

Vitest is the default test runner per package.

## Storybook

```bash
pnpm storybook
```

Host lives with **`apps/web`** unless the repo documents a dedicated Storybook app.

## End-to-end tests

```bash
pnpm --filter web exec playwright install
pnpm e2e
```

Playwright specs under `apps/web/e2e`. Agents should run E2E via **Playwright MCP** per constitution. The Playwright config should include at least one **mobile viewport** project for the primary game + roll flow.

## Production build and PWA

```bash
pnpm build
pnpm --filter web start
```

- Open the **HTTPS** or `localhost` URL required by the chosen PWA toolkit (some install criteria need HTTPS; use Vercel preview or `mkcert` locally if needed).
- In **Chrome (Android)** or **Safari (iOS)**, use **Install app** / **Add to Home Screen** and confirm the app launches in standalone display.
- Run **Lighthouse** (Chrome DevTools) on the production build and address PWA / installability failures before release.

## Lint and typecheck

```bash
pnpm lint
pnpm typecheck
```

## Environment variables (illustrative)

| Variable | Purpose |
|----------|---------|
| `BCP_API_BASE` | Server-side BCP adapter base URL (if used). |
| `BCP_API_TOKEN` | Server-only secret for BCP (never `NEXT_PUBLIC_*`). |
| `FEATURE_BCP_IMPORT` | `"true"` to expose BCP UI paths. |

Exact names are finalized at implementation; BCP remains optional behind flag.

**SC-005 (preload latency)**: `tasks.md` **T074** requires a minimal Vitest guard that mocked successful BCP list fetch resolves within **30 seconds** wall time—real p95 behavior is still validated in a configured environment or manual checklist, not only this ceiling test.

## Useful paths

| Artifact | Path |
|----------|------|
| Spec | `specs/001-40k-auto-dice/spec.md` |
| Plan | `specs/001-40k-auto-dice/plan.md` |
| Domain contracts | `specs/001-40k-auto-dice/contracts/` |
| Golden roster JSON (ingestion / E2E fixtures) | `test-data/example-votann-list.json`, `test-data/example-tzeentch-list.json` |

Use these JSON files as the **authoritative examples** for roster shape, **model profiles**, and **weapons** loaded into the domain after import.
