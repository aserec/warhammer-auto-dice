# Tasks: Warhammer 40,000 Automated Dice Resolution

**Input**: Design documents from `specs/001-40k-auto-dice/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [research.md](./research.md), [quickstart.md](./quickstart.md), [contracts/](./contracts/)

**Tests**: Per `.specify/memory/constitution.md`, tests are **mandatory**: Vitest (TDD) for domain and UI logic; Playwright for primary journeys including a **mobile viewport** project per `plan.md`.

**Organization**: Phases follow **dependency order** among P1 stories: US1 → US2 → US4 → US6 → US7, then P2 stories **US5** → **US3**, then polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no ordering dependency within the same checkpoint)
- **[USn]**: User story from [spec.md](./spec.md)
- Every description includes at least one concrete **file path**

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Turborepo monorepo, Next.js app, domain package, core tooling, PWA shell, Storybook, Playwright.

- [ ] T001 Create Turborepo root at `auto-dice/package.json` with `pnpm-workspace.yaml`, `turbo.json`, and workspace `package.json` scripts (`dev`, `build`, `lint`, `typecheck`, `test`)
- [ ] T002 [P] Scaffold Next.js App Router app in `apps/web/package.json` with `apps/web/next.config.ts` and `apps/web/app/page.tsx` placeholder
- [ ] T003 [P] Scaffold TypeScript library in `packages/domain/package.json`, `packages/domain/tsconfig.json`, and `packages/domain/src/index.ts`
- [ ] T004 [P] Add shared TSConfig base at `tooling/tsconfig/base.json` and extend from `apps/web/tsconfig.json` and `packages/domain/tsconfig.json`
- [ ] T005 Add ESLint flat config at `eslint.config.mjs` (root) with Next.js + TypeScript rules for `apps/web` and `packages/domain`
- [ ] T006 [P] Configure Tailwind in `apps/web/tailwind.config.ts`, `apps/web/postcss.config.mjs`, and wire styles in `apps/web/app/globals.css`
- [ ] T007 Initialize shadcn/ui via `apps/web/components.json`, `apps/web/lib/utils.ts`, and add base `apps/web/components/ui/button.tsx`
- [ ] T008 [P] Add Vitest to `packages/domain` with `packages/domain/vitest.config.ts` and example `packages/domain/src/__test__/smoke.test.ts`
- [ ] T009 [P] Add Vitest + Testing Library to `apps/web` with `apps/web/vitest.config.ts` and `apps/web/test/setup.ts`
- [ ] T010 Add Playwright with desktop + mobile projects in `apps/web/playwright.config.ts` and scaffold `apps/web/e2e/.gitkeep`
- [ ] T011 [P] Add Storybook 8+ for `apps/web` with `apps/web/.storybook/main.ts` and `apps/web/.storybook/preview.ts` importing Tailwind globals
- [ ] T012 Integrate PWA toolkit (Serwist or `@ducanh2912/next-pwa` per [research.md](./research.md) §11) in `apps/web/next.config.ts` with precache scope documented in `apps/web/README.md`
- [ ] T013 [P] Add installable manifest assets: `apps/web/public/icons/icon-192.png`, `apps/web/public/icons/icon-512-maskable.png`, and `apps/web/app/manifest.ts` (Next metadata API) or `apps/web/public/manifest.webmanifest` consistent with T012
- [ ] T014 Add `apps/web/app/layout.tsx` metadata (`applicationName`, `appleWebApp`, `icons`) and `viewport` (`themeColor`, `viewportFit: 'cover'`) for mobile/PWA per [plan.md](./plan.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: RNG abstraction, persistence port, app providers, safe-area-ready shell—**no user story is complete until this exists**.

**⚠️ CRITICAL**: User story phases must not start until **T022** (end of this phase) is complete.

- [ ] T015 Define `RngPort` in `packages/domain/src/rng/rng-port.ts` and crypto-backed `BrowserRng` stub type (implementation may live in `apps/web` adapter implementing port from domain tests via injection)
- [ ] T016 Implement `SeededRng` in `packages/domain/src/rng/seeded-rng.ts` for deterministic tests
- [ ] T017 [P] Add Vitest `packages/domain/src/rng/seeded-rng.test.ts` locking sequence reproducibility
- [ ] T018 Define `GameRepository` port in `packages/domain/src/persistence/game-repository.port.ts` per [data-model.md](./data-model.md)
- [ ] T019 Implement IndexedDB-backed repository in `apps/web/lib/persistence/indexeddb-game-repository.ts` satisfying `GameRepository` (import types from `packages/domain`)
- [ ] T020 Add TanStack Query client factory in `apps/web/lib/query-client.ts` and wrap app with `QueryClientProvider` in `apps/web/app/providers.tsx`
- [ ] T021 Add Zustand `apps/web/lib/stores/game-session-store.ts` with typed shape for `currentGameId` and hydration actions (minimal until US1)
- [ ] T022 Extend `apps/web/app/globals.css` with safe-area utilities (`env(safe-area-inset-*)`) and base typography for mobile readability per [plan.md](./plan.md)

**Checkpoint**: Foundation ready — user story work may begin.

---

## Phase 3: User Story 1 — Create a local game with two players and army lists (Priority: P1) 🎯 MVP

**Goal**: Two-player `Game` shell with list slots; create, open, persist via `GameRepository`.

**Independent Test**: Create game with two names, reopen from persistence, see both players (spec US1).

### Tests for User Story 1 (required per constitution) ⚠️

> Write these tests **first**; they must **fail** until implementation exists.

- [ ] T023 [P] [US1] Vitest `packages/domain/src/game/game.aggregate.test.ts` for `createGame` / invariants (two players, roster slots)
- [ ] T024 [P] [US1] Playwright `apps/web/e2e/us1-game-create.spec.ts` covering new game → persisted → reload sees players

### Implementation for User Story 1

- [ ] T025 [US1] Implement `Game` aggregate and factory in `packages/domain/src/game/game.ts` and `packages/domain/src/game/create-game.ts` per [data-model.md](./data-model.md)
- [ ] T026 [P] [US1] Implement `Player` VO in `packages/domain/src/game/player.ts`
- [ ] T027 [US1] Wire `saveGame` / `loadGame` in `apps/web/lib/persistence/indexeddb-game-repository.ts` for full `Game` snapshot serialization in `packages/domain/src/game/game.snapshot.ts` (types + mappers)
- [ ] T028 [US1] Add `apps/web/app/games/new/page.tsx` form (two player names, create button)
- [ ] T029 [US1] Add `apps/web/app/games/[gameId]/page.tsx` shell showing both players and navigation to list/attack flows (placeholder sections OK)
- [ ] T030 [US1] Connect `apps/web/lib/stores/game-session-store.ts` to load/save via repository in `apps/web/lib/game/use-game-controller.ts`

**Checkpoint**: US1 works alone (game CRUD shell).

- [ ] T031 [US1] Run `.cursor/skills/custom/pre-commit-design-review/SKILL.md` on the feature diff vs `HEAD` after this story's substantive UI batch per constitution (scope: `apps/web/app/games/**`, `apps/web/lib/game/**`)
---

## Phase 4: User Story 2 — Import army lists (JSON roster) (Priority: P1)

**Goal**: **JSON roster** import (see `auto-dice/test-data/example-votann-list.json`, `auto-dice/test-data/example-tzeentch-list.json`) → structured `Roster` draft + diagnostics; **weapons and model profiles** come only from mapped list data; review UI before commit.

**Independent Test**: Golden fixtures (aligned to `test-data/`) parse in Vitest; malformed JSON shows errors (spec US2).

### Tests for User Story 2 (required per constitution) ⚠️

- [ ] T032 [P] [US2] Commit **full copies** (or workspace-legal symlinks) of `auto-dice/test-data/example-votann-list.json` and `auto-dice/test-data/example-tzeentch-list.json` under `packages/domain/src/ingestion/__fixtures__/`—**do not hand-truncate** arbitrary subtrees (risks dropping weapons/profiles). If CI size ever requires smaller files, add **separate** `*-smoke.json` fixtures that still include at least one complete unit with weapons for combat mapping tests, documented in `packages/domain/src/ingestion/__fixtures__/README.md`. Vitest `packages/domain/src/ingestion/json-roster-parser.test.ts` covers happy + malformed paths
- [ ] T033 [P] [US2] Playwright `apps/web/e2e/us2-json-import.spec.ts` imports fixture JSON (paste or `readFile` in test), asserts review table shows units/weapons from list

### Implementation for User Story 2

- [ ] T034 [US2] Define parser plugin types per [contracts/list-parser-plugin.md](./contracts/list-parser-plugin.md) in `packages/domain/src/ingestion/list-parse-result.ts` and `packages/domain/src/ingestion/list-parser-plugin.ts`
- [ ] T035 [US2] Implement first parser strategy in `packages/domain/src/ingestion/strategies/json-roster-parser.ts` (MVP **JSON roster** format from [research.md](./research.md) §4, validated against `auto-dice/test-data/*.json`)
- [ ] T036 [US2] Map parse output to `Roster` / `Unit` / `WeaponProfile` shapes in `packages/domain/src/ingestion/map-to-roster.ts` (profiles + weapons **only** from list document)
- [ ] T037 [US2] Add `apps/web/components/roster/paste-import-dialog.tsx` using shadcn `Dialog`, `Textarea` (JSON paste), and error list from diagnostics; wire copy from `auto-dice/test-data/` for dev smoke if useful
- [ ] T038 [US2] Add `apps/web/components/roster/list-review-table.tsx` for confirming parsed units before attach
- [ ] T039 [US2] Integrate attach flow into `apps/web/app/games/[gameId]/page.tsx` (or `apps/web/app/games/[gameId]/lists/page.tsx`) updating `Game` via store + repository

**Checkpoint**: US1+US2 — game with imported lists.

- [ ] T040 [US2] Run `.cursor/skills/custom/pre-commit-design-review/SKILL.md` on the feature diff vs `HEAD` after this story's substantive UI batch per constitution (scope: `apps/web/components/roster/**`, `apps/web/app/games/**`)
---

## Phase 5: User Story 4 — Shooting/melee and attack assignment (Priority: P1)

**Goal**: Phase toggle, attacker/defender units, weapon selection with validation against roster + phase.

**Independent Test**: Illegal weapon/phase blocked with message; legal shows summary (spec US4).

### Tests for User Story 4 (required per constitution) ⚠️

- [ ] T041 [P] [US4] Vitest `packages/domain/src/combat/attack-configuration.test.ts` for legal/illegal combinations
- [ ] T042 [P] [US4] Playwright `apps/web/e2e/us4-attack-wizard.spec.ts` selects shooting, units, weapon; sees summary

### Implementation for User Story 4

- [ ] T043 [US4] Implement `AttackConfiguration` VO + validators in `packages/domain/src/combat/attack-configuration.ts`
- [ ] T044 [US4] Add `apps/web/lib/stores/attack-wizard-store.ts` holding wizard draft synced to URL or game slice
- [ ] T045 [US4] Add `apps/web/components/combat/attack-phase-toggle.tsx` (shooting vs melee) with accessible labels
- [ ] T046 [P] [US4] Add `apps/web/components/combat/unit-picker.tsx` and `apps/web/components/combat/weapon-picker.tsx` reading from roster props
- [ ] T047 [US4] Add `apps/web/components/combat/attack-summary-card.tsx` showing BS/S/A/D/AP/save context from selections
- [ ] T048 [US4] Add route surface `apps/web/app/games/[gameId]/attack/page.tsx` composing the wizard

**Checkpoint**: Attack configuration UI + domain validation without rolling yet.

- [ ] T049 [US4] Run `.cursor/skills/custom/pre-commit-design-review/SKILL.md` on the feature diff vs `HEAD` after this story's substantive UI batch per constitution (scope: `apps/web/components/combat/**`, `apps/web/app/games/**/attack/**`)
---

## Phase 6: User Story 6 — Attack modifiers (Priority: P1)

**Goal**: User-selectable modifiers; deterministic order; conflicts block with message (spec US6).

**Independent Test**: Table-driven Vitest for order + one combined modifier E2E segment (spec US6).

### Tests for User Story 6 (required per constitution) ⚠️

- [ ] T050 [P] [US6] Vitest table specs in `packages/domain/src/combat/modifiers/modifier-engine.test.ts` covering ordering and conflicts
- [ ] T051 [P] [US6] Playwright assertion in `apps/web/e2e/us6-modifiers.spec.ts` toggling modifiers changes preview copy in `apps/web/components/combat/attack-summary-card.tsx`

### Implementation for User Story 6

- [ ] T052 [US6] Define modifier descriptors in `packages/domain/src/combat/modifiers/modifier-types.ts`
- [ ] T053 [US6] Implement ordering + application rules in `packages/domain/src/combat/modifiers/modifier-engine.ts` (document order in `packages/domain/src/combat/modifiers/README.md`)
- [ ] T054 [US6] Add `apps/web/components/combat/modifier-bar.tsx` with toggles bound to `attack-wizard-store.ts`
- [ ] T055 [US6] Extend `AttackConfiguration` builder in `packages/domain/src/combat/attack-configuration.ts` to embed normalized `Modifier[]`

**Checkpoint**: Modifiers feed into configuration object used by resolver (next phase).

- [ ] T056 [US6] Run `.cursor/skills/custom/pre-commit-design-review/SKILL.md` on the feature diff vs `HEAD` after this story's substantive UI batch per constitution (scope: `apps/web/components/combat/**`)
---

## Phase 7: User Story 7 — Roll and review dice (Priority: P1)

**Goal**: Full pipeline per [contracts/dice-engine-io.md](./contracts/dice-engine-io.md); UI stages; subtle highlights; reduced-motion parity (spec US7, FR-015/FR-016).

**Independent Test**: Golden seeded tests match summary; Playwright desktop + mobile roll path (spec US7).

### Tests for User Story 7 (required per constitution) ⚠️

- [ ] T057 [P] [US7] Vitest golden tests in `packages/domain/src/combat/dice/resolve-attack.test.ts` per [contracts/dice-engine-io.md](./contracts/dice-engine-io.md)
- [ ] T058 [P] [US7] Playwright `apps/web/e2e/us7-roll-desktop.spec.ts` full roll assertions
- [ ] T059 [P] [US7] Playwright `apps/web/e2e/us7-roll-mobile.spec.ts` same flow on `390x844` project from `apps/web/playwright.config.ts`

### Implementation for User Story 7

- [ ] T060 [US7] Implement `resolveAttack` entry in `packages/domain/src/combat/dice/resolve-attack.ts` orchestrating hit/wound/save/fnp stages
- [ ] T061 [P] [US7] Implement stage modules under `packages/domain/src/combat/dice/stages/hits.ts`, `wounds.ts`, `saves.ts`, `fnp.ts` as needed to keep files small
- [ ] T062 [US7] Add `apps/web/components/combat/dice-stage-breakdown.tsx` for per-stage dice lists with subtle highlight tokens
- [ ] T063 [US7] Add `apps/web/hooks/use-prefers-reduced-motion.ts` and gate animations in `apps/web/components/combat/dice-stage-breakdown.tsx`
- [ ] T064 [US7] Add `apps/web/components/combat/roll-button.tsx` calling domain resolver with injected `SeededRng` in tests and `BrowserRng` in app from `apps/web/lib/rng/browser-rng.ts`
- [ ] T065 [US7] Persist last `DiceResolution` into game history via `packages/domain/src/game/resolution-history.ts` and `indexeddb-game-repository.ts`

**Checkpoint**: Vertical slice **create → import JSON lists → configure → modify → roll** works (core MVP).

- [ ] T066 [US7] Run `.cursor/skills/custom/pre-commit-design-review/SKILL.md` on the feature diff vs `HEAD` after this story's substantive UI batch per constitution (scope: `apps/web/components/combat/**`, `apps/web/hooks/**`)
---

## Phase 8: User Story 5 — Model rows and identical-model stacks (Priority: P2)

**Goal**: Stack `+/-` and distinct rows; eligibility updates weapon picker (spec US5).

**Independent Test**: Vitest for stack math; Playwright adjusts count then weapon availability (spec US5).

### Tests for User Story 5 (required per constitution) ⚠️

- [ ] T067 [P] [US5] Vitest `packages/domain/src/game/model-rows.test.ts` for stack/individual invariants
- [ ] T068 [P] [US5] Playwright `apps/web/e2e/us5-model-stacks.spec.ts` changes `ModelStackControl` count and observes picker change in `apps/web/components/combat/weapon-picker.tsx`

### Implementation for User Story 5

- [ ] T069 [US5] Implement `ModelRow` helpers in `packages/domain/src/game/model-row.ts` (stack increment/decrement, row elimination)
- [ ] T070 [US5] Add `apps/web/components/roster/model-stack-control.tsx` with shadcn `Button` +/- and live region announcements
- [ ] T071 [US5] Add `apps/web/components/roster/model-row-list.tsx` for heterogeneous rows
- [ ] T072 [US5] Wire model state into `attack-wizard-store.ts` and `attack-configuration.ts` validation paths in `packages/domain/src/combat/attack-configuration.ts`

**Checkpoint**: Model-level state integrated with attack configuration and rolls.

- [ ] T073 [US5] Run `.cursor/skills/custom/pre-commit-design-review/SKILL.md` on the feature diff vs `HEAD` after this story's substantive UI batch per constitution (scope: `apps/web/components/roster/**`, `apps/web/components/combat/**`)
---

## Phase 9: User Story 3 — Best Coast Pairings preload (Priority: P2)

**Goal**: Server fetch + TanStack Query + fallback to **manual JSON list import** per [contracts/bcp-adapter.md](./contracts/bcp-adapter.md).

**Independent Test**: Mock fetch tests + E2E error path falls back to **JSON import UI** (spec US3).

### Tests for User Story 3 (required per constitution) ⚠️

- [ ] T074 [P] [US3] Vitest `apps/web/lib/bcp/bcp-adapter.test.ts` using `global.fetch` mock for success + `rate_limited` + `network`; include a **minimal SC-005 guard**: on mocked success, assert wall time from call start to resolved lists is **under 30_000 ms** (`performance.now()`), so accidental synchronous stalls or runaway retries fail CI while normal fast mocks stay well under the ceiling
- [ ] T075 [P] [US3] Playwright `apps/web/e2e/us3-bcp-fallback.spec.ts` intercepts route to force error, expects **manual JSON list import** fallback UI from `apps/web/components/bcp/bcp-import-flow.tsx`

### Implementation for User Story 3

- [ ] T076 [US3] Add DTO types in `apps/web/lib/bcp/bcp-types.ts` matching contract success/failure union
- [ ] T077 [US3] Implement `apps/web/lib/bcp/bcp-adapter.ts` calling `apps/web/app/api/bcp/match/route.ts`
- [ ] T078 [US3] Add Route Handler `apps/web/app/api/bcp/match/route.ts` with server-only env vars from [quickstart.md](./quickstart.md)
- [ ] T079 [US3] Add TanStack hook `apps/web/lib/bcp/use-bcp-match.ts` (query key includes `eventId`, `matchId`)
- [ ] T080 [US3] Add `apps/web/components/bcp/bcp-import-flow.tsx` and entry from `apps/web/app/games/new/page.tsx` behind `process.env.FEATURE_BCP_IMPORT`

**Checkpoint**: BCP path optional; **JSON list import** always works.

- [ ] T081 [US3] Run `.cursor/skills/custom/pre-commit-design-review/SKILL.md` on the feature diff vs `HEAD` after this story's substantive UI batch per constitution (scope: `apps/web/components/bcp/**`, `apps/web/app/api/bcp/**`, `apps/web/lib/bcp/**`)
---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Storybook coverage, constitution design review, PWA verification, docs.

- [ ] T082 [P] Add Storybook story `apps/web/components/combat/dice-stage-breakdown.stories.tsx`
- [ ] T083 [P] Add Storybook story `apps/web/components/roster/model-stack-control.stories.tsx`
- [ ] T084 [P] Add Storybook story `apps/web/components/combat/modifier-bar.stories.tsx`
- [ ] T085 [P] Add Storybook story `apps/web/components/roster/list-review-table.stories.tsx` (aligns [research.md](./research.md) §9 + constitution Storybook gate for non-trivial roster UI)
- [ ] T086 Run `.cursor/skills/custom/pre-commit-design-review/SKILL.md` on the feature diff vs `HEAD` after Phase 10 Storybook/PWA/doc edits per constitution (final polish pass; per-story reviews already above)
- [ ] T087 Document PWA manual test results and Lighthouse scores in `apps/web/docs/PWA-VERIFICATION.md` (create folder if missing)
- [ ] T088 Validate commands in [quickstart.md](./quickstart.md) end-to-end and update `specs/001-40k-auto-dice/quickstart.md` if commands drift

---

## Dependencies & Execution Order

### Phase Dependencies

| Phase | Depends on | Notes |
|-------|------------|--------|
| 1 Setup | — | Start immediately |
| 2 Foundational | Phase 1 | **Blocks all user stories** |
| 3 US1 | Phase 2 | MVP shell |
| 4 US2 | Phase 3 | Needs `Game` to attach rosters |
| 5 US4 | Phase 4 | Needs parsed `Roster` / weapons |
| 6 US6 | Phase 5 | Modifiers attach to `AttackConfiguration` built in US4 |
| 7 US7 | Phase 5 + 6 | Resolver needs configuration + modifiers |
| 8 US5 | Phase 5 | Refines eligibility; can ship after first roll MVP if needed |
| 9 US3 | Phase 3 | Independent of dice; can parallelize after Phase 2 **if** staffed separately |
| 10 Polish | All desired stories | Run after MVP slice or full feature |

### User Story Dependency Graph

```text
US1 (game) → US2 (lists) → US4 (attack cfg) → US6 (modifiers) → US7 (rolls)
                              ↘ US5 (model rows) → (tightens US4/US7)
US1 → US3 (BCP)  [optional parallel after US1]
```

### Within Each User Story

1. Vitest / Playwright tests listed in the story phase **fail first**  
2. Domain types and pure functions (`packages/domain`)  
3. Adapters and browser I/O (`apps/web/lib/**`)  
4. UI (`apps/web/components/**`, `apps/web/app/**`)  
5. Repository / store integration  
6. Run the story’s **pre-commit design review** task (`.cursor/skills/custom/pre-commit-design-review/SKILL.md`, same skill invoked again in Phase 10 **T086** after Storybook/PWA/doc polish) on the feature diff vs `HEAD` after substantive UI for that story

### Parallel Opportunities

- **Phase 1**: T002, T003, T004, T006, T008, T009, T011, T013 in parallel after T001 exists (watch lockfile merge conflicts).
- **Phase 2**: T017 parallel with T019–T022 once T015–T016 exist.
- **Within US7**: T057–T059 parallel; T061 parallel after T060 started.
- **Cross-team**: After Phase 2, **US3** (BCP) can proceed in parallel with **US4–US7** chain if BCP developer does not touch dice files.

---

## Parallel Example: User Story 7 (tests first)

```bash
# Same story, parallel test files after resolve-attack API is sketched:
packages/domain/src/combat/dice/resolve-attack.test.ts
apps/web/e2e/us7-roll-desktop.spec.ts
apps/web/e2e/us7-roll-mobile.spec.ts
```

---

## Implementation Strategy

### MVP First (minimum vertical slice)

1. Complete **Phase 1–2**  
2. Complete **US1 → US2 → US4 → US6 → US7** (Phases 3–7) with **default “all models alive”** if US5 not done yet  
3. **STOP**: Run Playwright desktop + mobile smoke; demo deploy to Vercel preview

### Incremental delivery after MVP

4. Add **US5** (model stacks) → rerun attack + roll tests  
5. Add **US3** (BCP) with feature flag → contract tests + mocked E2E  
6. **Phase 10** polish (Storybook, PWA verification doc, final design review **T086**)

### Suggested MVP scope

- **User stories in MVP**: **US1, US2, US4, US6, US7** (all P1)  
- **Deferred by priority**: **US5**, **US3** (P2) unless tournament import is required for first release

---

## Task Summary

| Metric | Value |
|--------|--------|
| **Total tasks** | 88 |
| **Phase 1** | 14 |
| **Phase 2** | 8 |
| **US1** | 9 (2 test + 6 impl + 1 design review) |
| **US2** | 9 (2 test + 6 impl + 1 design review) |
| **US4** | 9 (2 test + 6 impl + 1 design review) |
| **US6** | 7 (2 test + 4 impl + 1 design review) |
| **US7** | 10 (3 test + 6 impl + 1 design review) |
| **US5** | 7 (2 test + 4 impl + 1 design review) |
| **US3** | 8 (2 test + 5 impl + 1 design review) |
| **Polish** | 8 |
| **Parallel-friendly tasks** | 33 marked `[P]` |

**Format validation**: All tasks use `- [ ]`, sequential **T001–T088**, story phases include **[USn]**, and each line names at least one **path** under `auto-dice/` (`apps/web/...`, `packages/domain/...`, `test-data/...`, `tooling/...`, or `eslint.config.mjs`).

---

## Notes

- When a task touches `packages/domain`, follow **red → green → refactor** with Vitest.  
- After each story checkpoint, run **`pnpm test`** at root, **targeted Playwright** for that story’s `apps/web/e2e/us*.spec.ts`, and the story’s **pre-commit design review** checkbox.  
- **BCP secrets** never use `NEXT_PUBLIC_*` prefix (see [quickstart.md](./quickstart.md)).  
- **Golden roster JSON** for shapes, weapons, and profiles: `auto-dice/test-data/example-votann-list.json`, `auto-dice/test-data/example-tzeentch-list.json`.

---

## Extension Hooks

**Optional Post-Hook**: `git` — `speckit.git.commit` — commit `tasks.md` when satisfied.
