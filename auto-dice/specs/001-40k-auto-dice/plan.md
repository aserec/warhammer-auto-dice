# Implementation Plan: Warhammer 40,000 Automated Dice Resolution

**Branch**: `001-40k-auto-dice` | **Date**: 2026-05-04 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/001-40k-auto-dice/spec.md` plus stack directive (React ecosystem latest stable, DDD, Next.js, Tailwind + shadcn/ui, Turborepo, Vitest, SuperPowers-style agent workflow, Vercel React best practices, TanStack, Zustand, Storybook, TypeScript).

## Summary

Deliver a **Turborepo** monorepo whose primary surface is a **Next.js (App Router)** web app for **local two-player games**, **army list ingestion** (**JSON roster documents** first—canonical examples under `auto-dice/test-data/`; **Best Coast Pairings** optional), **attack configuration** (shooting/melee, units, weapons, model stacks), **modifier-aware dice resolution** (hit → wound → save → Feel No Pain), and **accessible, subtly animated** results. **Weapon profiles and model profiles** used for attacks and saves are **loaded only from the imported list JSON** (mapped into the domain roster), not maintained as a separate hand-edited stat matrix in MVP. The experience is **mobile-first and touch-friendly** and ships as an **installable PWA** (manifest + service worker) so users can add it to their phone home screen like a native app. Core rules live in a **pure TypeScript domain package** (DDD: game/roster, ingestion, combat bounded contexts) with **Vitest**-driven TDD, **Playwright** E2E for primary journeys, **Storybook** for non-trivial UI, **TanStack Query** for async/server-backed data (BCP), **Zustand** for cross-screen game UI state, and **Tailwind + shadcn/ui** per constitution. **SuperPowers**-style discipline applies to agent implementation passes (explicit gates: tests, design review, E2E). Hosting follows **Vercel** deployment and performance guidance.

## Technical Context

**Language/Version**: TypeScript (latest stable aligned with Next.js requirements).  
**Primary Dependencies**: React (latest stable via Next.js), Next.js (App Router), Tailwind CSS, shadcn/ui, Turborepo, TanStack Query (and Router only if multi-page client routing exceeds App Router needs), Zustand, Storybook, Vitest, Playwright, Zod (recommended for runtime contracts at boundaries). **PWA**: Web App Manifest + service worker via a **maintained Next.js–compatible** solution (choice finalized in `research.md` §11 — e.g. Serwist or an actively maintained `next-pwa` fork) for installability and offline shell.  
**Storage**: No remote database in v1; **browser persistence** (IndexedDB preferred; `localStorage` acceptable for smaller payloads) behind a small repository port so cloud sync can replace later. BCP payloads, **imported list JSON** (or normalized roster snapshot), and optional raw paste text are stored as part of the serialized game snapshot.  
**Testing**: Vitest (unit, component, hooks); Playwright (E2E); Storybook + test-runner or Vitest browser where useful for isolated components.  
**Target Platform**: Modern evergreen **desktop and mobile** browsers (including Safari iOS and Chrome Android); **installable PWA** on supported platforms. **Vercel** for production and preview deployments (HTTPS required for PWA).  
**Project Type**: Turborepo monorepo — **web application** + shared **domain** package(s).  
**Performance Goals**: Initial game shell and navigation **interaction-ready** under **2 s** on mid-tier laptop on cold load (after JS cached, under **500 ms** for route transitions without large data). On **mobile**, first meaningful paint of the game shell under **3 s** on a typical 4G connection (after first visit cache warm, aim under **2 s**). Dice result view for **≤ 60 dice** across stages remains **readable without horizontal scroll** at **1280 px** width (matches spec SC-004) and **without horizontal scroll** at **390 px** logical width (typical phone). **Touch targets** for primary actions (roll, +/- model count, phase toggle) **≥ 44 × 44 px** equivalent. List import UI stays responsive for **≤ ~6 MB** JSON documents (see `test-data` examples for real sizes); prefer streaming parse or progress for very large files.  
**Constraints**: Deterministic resolution given **seeded RNG** in tests; **WCAG-oriented** contrast and keyboard paths on desktop and **screen-reader + touch** affordances on mobile for primary flows; **`prefers-reduced-motion`** must not hide outcome data (spec FR-016). **`viewport-fit=cover` / safe-area** respected so UI is not clipped under notches or home indicators. **Offline**: service worker precaches **app shell**; full dice resolution works **offline** for an already-loaded game using IndexedDB snapshot; **BCP** and first-time list fetch remain **online**.  
**Scale/Scope**: Single active user per device session; tens of units per list; dice pools in typical 40K ranges (batch UI for outliers).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Plan compliance |
|-----------|------------------|
| **TDD (Vitest)** | Domain dice pipeline, parsers, modifier ordering, and model-row eligibility are implemented **test-first**. React components and hooks that encode behavior get **Vitest + Testing Library** (or equivalent) before merge. |
| **Playwright** | E2E covers: create game → import **JSON list** (fixture derived from `auto-dice/test-data/*.json`) → configure attack → roll → assert staged results; optional second spec for BCP error fallback when wiremock/fixtures exist. Add at least one **mobile viewport** project (e.g. **390 × 844**) for the primary roll path. Run via **Playwright MCP** in agent completion workflow. |
| **Design review** | After substantive UI batches, run **`.cursor/skills/custom/pre-commit-design-review/SKILL.md`** on the feature diff vs `HEAD` (no user confirmation to run the review). |
| **UX (Tailwind + shadcn/ui + Storybook + a11y)** | Design system built on shadcn primitives; **Storybook** for dice breakdown, modifier picker, and list review surfaces; focus order and labels on wizard steps. **Mobile**: responsive layouts (single column on narrow viewports), large touch targets, sticky primary actions where helpful, scrollable dice panels. **PWA**: manifest icons, theme colors, `standalone` or `standalone`-friendly display, install prompt / in-app hint where browser allows. |
| **Performance (Vercel React / Next.js + TanStack + Zustand)** | Use **React Server Components** for static shell and data-light pages; client boundaries only for interactive game/dice surfaces. **TanStack Query** for BCP fetches with explicit stale times and error boundaries. **Zustand** for active game session and attack wizard; avoid prop-drilling large roster trees. Follow project **Vercel React best practices** skill during implementation. |
| **Stack** | Matches constitution stack; any dependency pin (e.g. Next major) documents **owner + expiry** in `research.md`. |

**Gate result**: PASS (no violations requiring Complexity Tracking).

### Constitution Check (post–Phase 1)

Design artifacts (`data-model.md`, `contracts/*`, `research.md`) align with bounded contexts and test gates above. **PASS**.

## Project Structure

### Documentation (this feature)

```text
specs/001-40k-auto-dice/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
└── tasks.md             # /speckit-tasks (not created here)

auto-dice/test-data/     # Golden JSON roster examples (Votann, Tzeentch) — source shape for ingestion + tests
```

### Source Code (repository root)

Greenfield layout under `auto-dice/` (or repo root if promoted):

```text
apps/
└── web/
    ├── app/                    # Next.js App Router routes
    ├── public/
    │   ├── manifest.webmanifest # or app/manifest.ts — Web App Manifest
    │   └── icons/              # maskable + any required sizes (192, 512)
    ├── components/             # Feature UI (shadcn + local)
    ├── lib/                    # App-specific wiring (query client, stores)
    ├── e2e/                    # Playwright specs (include mobile project)
    └── package.json

packages/
├── domain/
│   ├── src/
│   │   ├── game/               # Aggregates: Game, Player, Roster
│   │   ├── ingestion/          # List parse ports + strategies
│   │   ├── combat/             # AttackConfig, modifiers, dice pipeline
│   │   └── rng/                # RNG port + seeded impl
│   └── package.json
├── contracts/                  # Optional: shared Zod schemas if extracted
└── tsconfig/                   # Shared TS configs (optional)

tooling/
└── storybook/                  # Or apps/web .storybook at app root — pick one Storybook host

turbo.json
package.json
pnpm-workspace.yaml             # or npm/yarn per repo choice
```

**Structure Decision**: **Turborepo** with **`apps/web`** as the only Next.js app for MVP and **`packages/domain`** holding all rule-heavy logic (DDD). Parsers can start under `packages/domain/src/ingestion` and split into `packages/list-parsers` if file count or bundle size warrants it. Storybook is colocated with **`apps/web`** (simplest) unless bundle isolation requires a package. Vitest configs per package/app; Playwright lives under **`apps/web/e2e`**.

## Phase 0 — Research

**Output**: [research.md](./research.md)  
All items marked NEEDS CLARIFICATION in an earlier draft are resolved there with explicit decisions (rules edition baseline, BCP integration posture, list format MVP, persistence, **mobile + PWA**).

## Phase 1 — Design & contracts

**Outputs**:

- [data-model.md](./data-model.md) — aggregates, entities, value objects, validation, invariants.
- [quickstart.md](./quickstart.md) — install, dev, test, Storybook, E2E after scaffold.
- [contracts/](./contracts/) — boundary contracts (dice engine, list ingestion plugin, BCP adapter).

**Agent context**: `.cursor/rules/specify-rules.mdc` updated to reference this `plan.md` for tooling and workflow context.

## Testing & quality matrix (summary)

| Layer | Tool | Scope |
|-------|------|--------|
| Domain | Vitest | **JSON roster** parsers (fixtures from `test-data/`), modifier order, full pipeline golden tests with seeded RNG |
| UI components | Vitest + Storybook | Dice row, stage summary, modifier toggles |
| App routes | Playwright | Happy paths + BCP error fallback (mocked); **mobile viewport** smoke on configure → roll |
| BCP adapter | Vitest | **SC-005 ceiling guard**: mocked success path must finish **under 30 s** wall time (`tasks.md` **T074**); real p95 in staging/manual checklist |

## Mobile & PWA (implementation checklist)

- **Responsive UI**: Breakpoints and single-column flows so list review, attack wizard, and dice breakdown need no horizontal pan on phone widths.
- **Touch**: Minimum tap targets, spacing between destructive controls, avoid hover-only affordances.
- **Manifest**: Name, short name, theme/background colors, `start_url`, icon set including **maskable** 512px where possible.
- **Service worker**: Precache static shell; stale-while-revalidate or network-first for HTML as chosen with the PWA library; **do not** cache authenticated BCP responses in SW unless explicitly designed.
- **Install UX**: Document “Add to Home Screen” for Safari iOS and “Install app” for Chrome Android; optional gentle in-app hint after N visits (respect `beforeinstallprompt` only on Chromium).
- **Verification**: Lighthouse PWA category (or successor audits) on production build; manual install test on one iOS and one Android device before calling the feature done.

## SuperPowers alignment

Use **SuperPowers**-style agent workflow for `/speckit-implement`: explicit **plan → isolate → test → review** steps; do not mark stories done without failing test first and green suite; document blockers in tasks rather than skipping gates.

## Complexity Tracking

No constitution violations; table not used.
