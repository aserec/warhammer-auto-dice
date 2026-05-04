# Research: Warhammer 40,000 Automated Dice Resolution

**Feature**: `001-40k-auto-dice` | **Date**: 2026-05-04

## 1. Rules edition baseline

**Decision**: Implement combat resolution against **Warhammer 40,000 10th Edition** core sequence (hit / critical hit effects as modeled, wound, save, damage, Feel No Pain) as the default **rules profile** in `packages/domain`.

**Rationale**: Spec assumes “currently supported edition” as defined in plan; 10th is the active mainstream ruleset; keeps hit/wound/save/FNP pipeline aligned with user examples (lethal hits, devastating wounds).

**Alternatives considered**: 9th-only engine (rejected: diverges from common tournament + app exports today); multi-edition from day one (rejected: doubles scope; add second profile later behind explicit game setting).

## 2. Monorepo and framework versions

**Decision**: **Turborepo** + **pnpm workspaces** (if repo has no lockfile preference, default pnpm for disk efficiency). **Next.js** and **React** pinned to **latest stable** at scaffold time with **documented lockfile commit**; minor bumps routine, major bumps require short migration note in plan appendix.

**Rationale**: Matches user directive and constitution; reproducible CI on Vercel and local.

**Alternatives considered**: npm workspaces only (acceptable; document in root README if user prefers).

## 3. Best Coast Pairings integration

**Decision**: Treat BCP as an **external read-only dependency** behind a **`BcpListSource` port** (interface in domain or `packages/domain` ingestion layer). **Next.js Route Handlers** (or Server Actions) perform HTTP fetches server-side so secrets and rate limits stay off the client. Ship MVP with **manual JSON list import** (same conceptual document as `test-data` examples) always available; BCP behind **feature flag** + env-based credentials or public-read endpoints as discovered during implementation. Automated tests use **fixture JSON** (including `auto-dice/test-data/*.json`) and **mock fetch**, not live BCP.

**Rationale**: Spec FR-006 requires graceful degradation; BCP has no stable public contract in this document—adapter isolation prevents domain coupling.

**Alternatives considered**: Client-only scraping (rejected: brittle, CORS, ToS risk); block MVP on real BCP API (rejected: delays **JSON list import** value).

## 4. Army list import format (MVP)

**Decision**: Parser architecture remains **strategy per format** (see `contracts/list-parser-plugin.md`). **MVP ships one primary format: JSON roster documents** produced by common list builders (Battlescribe-style `roster` → `forces` / nested `selections` trees). **Canonical golden files** in the repo: `auto-dice/test-data/example-votann-list.json` and `auto-dice/test-data/example-tzeentch-list.json`. Ingestion maps these documents into domain `Roster` / `Unit` / `WeaponProfile` / model rows; **weapons and model profiles used in combat are not authored independently**—they always come from the imported JSON (plus in-session model counts). Additional formats (plain-text exports, second JSON dialect) are **P2** once the JSON path is stable.

**Rationale**: Real project data already exists as large JSON lists; avoids ambiguous text parsing for MVP while still meeting spec testability with fixtures.

**Alternatives considered**: Text-only paste first (superseded: repo standard is JSON examples); universal parser (rejected: unrealistic).

## 5. Persistence (session scope)

**Decision**: Serialize **Game aggregate** + **roster snapshots** + **attack history** to **IndexedDB** via a **`GameRepository` port** with in-memory implementation for tests.

**Rationale**: Matches spec session persistence without cloud; swappable for API later.

**Alternatives considered**: localStorage only (acceptable for small games; may hit size limits with full lists).

## 6. Randomness

**Decision**: Production uses `crypto.getRandomValues`; domain accepts **`RngPort`** with **seeded deterministic** implementation for Vitest and Playwright where needed.

**Rationale**: Satisfies spec reproducibility and SC-002 regression style goals.

## 7. Animation and accessibility

**Decision**: Use **CSS transitions** and **View Transitions API** only where supported; gate motion behind **`prefers-reduced-motion`**; always render full numeric breakdown.

**Rationale**: Implements FR-015/FR-016 without heavy client animation libraries initially.

**Alternatives considered**: Framer Motion (deferred: add only if motion design exceeds CSS capabilities).

## 8. TanStack vs Zustand split

**Decision**: **TanStack Query** for BCP fetches and any future HTTP APIs; **Zustand** for active game UI (wizard step, selected units, transient modifier toggles) coexisting with serialized game state flushed through repository.

**Rationale**: Matches constitution guidance; clear separation server-async vs client session.

## 9. Storybook scope

**Decision**: Storybook for **DiceStageBreakdown**, **ModifierChipBar**, **ModelStackControl**, **ListReviewTable**; not required for one-off layout wrappers.

**Rationale**: Constitution Storybook gate for non-trivial components.

## 10. SuperPowers

**Decision**: Use SuperPowers-style **explicit checklists** in task execution: red test, minimal green, refactor, then design-review skill, then Playwright smoke for touched flows.

**Rationale**: User-requested process discipline layered on constitution.

## 11. Mobile-friendly UI and installable PWA

**Decision**: Treat **phones and small tablets** as first-class targets alongside laptop. Ship an **installable PWA**: valid **Web App Manifest**, **icons** (including maskable), **`display`: `standalone` or `standalone`-compatible**, **theme** colors, and a **service worker** that precaches the **app shell** (Next.js static chunks + critical assets). Choose integration at scaffold time between **Serwist** (`@serwist/next`) and an actively maintained **`next-pwa` fork** (e.g. `@ducanh2912/next-pwa`) based on App Router compatibility, bundle impact, and maintenance signals—document the chosen package in the app README.

**Rationale**: Users want table-side use on phones and “add to home screen” install without app store friction; HTTPS on Vercel satisfies PWA secure context.

**Alternatives considered**: Expo / React Native only (rejected for MVP: duplicates domain work); web-only without SW (rejected: no offline shell, weaker install story).

**Offline expectations**: Re-open and roll against **already persisted** game data offline; first visit, BCP import, and deploy updates require network (update strategy: skipWaiting / user prompt per chosen PWA toolkit).
