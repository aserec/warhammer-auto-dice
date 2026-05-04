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

**Decision**: Treat BCP as an **external read-only dependency** behind a **`BcpListSource` port** (interface in domain or `packages/domain` ingestion layer). **Next.js Route Handlers** (or Server Actions) perform HTTP fetches server-side so secrets and rate limits stay off the client. Ship MVP with **manual paste** always available; BCP behind **feature flag** + env-based credentials or public-read endpoints as discovered during implementation. Automated tests use **fixture JSON** and **mock fetch**, not live BCP.

**Rationale**: Spec FR-006 requires graceful degradation; BCP has no stable public contract in this document—adapter isolation prevents domain coupling.

**Alternatives considered**: Client-only scraping (rejected: brittle, CORS, ToS risk); block MVP on real BCP API (rejected: delays paste-first value).

## 4. Army list paste formats (MVP)

**Decision**: Parser architecture is **strategy per format** (see `contracts/list-parser-plugin.md`). **MVP ships one primary format** chosen from real sample files gathered at implementation start (candidates: common **GW / Wahapedia / app** text exports). Second format is **P2** once first is stable.

**Rationale**: Spec allows multiple formats but requires golden tests; one format keeps MVP shippable.

**Alternatives considered**: Universal parser (rejected: unrealistic).

## 5. Persistence (session scope)

**Decision**: Serialize **Game aggregate** + **roster snapshots** + **attack history** to **IndexedDB** via a **`GameRepository` port** with in-memory implementation for tests. **Additionally**, maintain a **`RulesCatalogRepository`** in IndexedDB (separate store) for **Wahapedia-backed** model and weapon payloads shared across games (see §12).

**Rationale**: Matches spec session persistence without cloud; swappable for API later; rules catalog avoids duplicating large payloads inside every `Game` snapshot.

**Alternatives considered**: localStorage only (acceptable for small games; may hit size limits with full lists).

## 6. Randomness

**Decision**: Production uses `crypto.getRandomValues`; domain accepts **`RngPort`** with **seeded deterministic** implementation for Vitest and Playwright where needed.

**Rationale**: Satisfies spec reproducibility and SC-002 regression style goals.

## 7. Animation and accessibility

**Decision**: Use **CSS transitions** and **View Transitions API** only where supported; gate motion behind **`prefers-reduced-motion`**; always render full numeric breakdown.

**Rationale**: Implements FR-015/FR-016 without heavy client animation libraries initially.

**Alternatives considered**: Framer Motion (deferred: add only if motion design exceeds CSS capabilities).

## 8. TanStack vs Zustand split

**Decision**: **TanStack Query** for **BCP** fetches, **Wahapedia batch hydration**, and any future HTTP APIs; **Zustand** for active game UI (wizard step, selected units, transient modifier toggles) coexisting with serialized game state flushed through repository.

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

## 12. Wahapedia profile and weapon hydration (authoritative stats)

**Decision**: **Model profiles** and **weapon profiles** used in combat are **always** sourced from **Wahapedia** through a **Next.js Route Handler** (`apps/web/app/api/wahapedia/**`) that performs **server-side** HTTP fetches (or other sanctioned retrieval), normalizes responses into domain-compatible structures, and returns **batch JSON** to the client. The client writes results to a **dedicated IndexedDB object store** (`RulesCatalogRepository`, separate from `GameRepository`) keyed by stable **`RulesEntityKey`** values emitted during list parse / roster mapping (see `contracts/wahapedia-rules-catalog.md`). **Every** key required by a roster MUST be persisted **before** the roster is marked ready for play. **Cache reuse**: identical keys on the **same origin** skip network when a fresh-enough row exists (policy: ETag / `fetchedAt` TTL documented at implementation).

**Rationale**: List exports alone are insufficient for trustworthy automation; Wahapedia is the community’s canonical structured reference for 10th Edition datasheets. Local IndexedDB is the best fit for a PWA: large JSON payloads, structured keys, shared across games, no server DB in v1. **“Everybody using the app”** on this stack means **all sessions on the same browser installation** share one rules catalog per origin (not a global cloud cache).

**Legal / policy**: Implementation MUST comply with Wahapedia **terms of use** and **robots.txt**; prefer documented APIs or allowed scraping patterns. If direct integration is disallowed, the plan MUST switch to an **approved** alternate data source while keeping the same **port + contract** shape—do not couple domain logic to HTML selectors without an isolation layer.

**Alternatives considered**: **Embed stats in list text only** (rejected: FR-021); **remote Postgres catalog** (deferred: adds hosting cost and privacy surface); **SQLite in WASM** (deferred: IndexedDB suffices).
