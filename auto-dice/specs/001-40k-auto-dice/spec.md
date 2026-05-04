# Feature Specification: Warhammer 40,000 Automated Dice Resolution

**Feature Branch**: `001-40k-auto-dice`  
**Created**: 2026-05-04  
**Status**: Draft  
**Input**: User description: "Build an application that allows users to automatically throw all dice in a Warhammer 40k game…" (game creation with two players and lists; manual list paste; Best Coast Pairings match preload; shooting vs melee; attacker, target, weapons; living models and identical-model counts; attack modifiers; full hit/wound/save/FNP resolution with clear, subtly animated results highlighting critical outcomes)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a local game with two players and army lists (Priority: P1)

A player sets up a **game** between exactly **two players**, each with an **army list**. For the initial release, setup is **local to the device** (no requirement for simultaneous online play). Lists are attached to each player before or during game creation.

**Why this priority**: Without a game container and two lists, no dice resolution can occur; this is the minimum viable shell.

**Independent Test**: Create a game with placeholder names, attach minimal valid list data for both sides, open the game shell, and confirm both players and lists are visible and editable.

**Acceptance Scenarios**:

1. **Given** the user starts a new game flow, **When** they enter two player identities and attach one list per player, **Then** a game is created that shows both players and their lists.
2. **Given** a saved game, **When** the user reopens it, **Then** the same two players and list associations are restored.
3. **Given** core domain rules for list validation exist, **When** the user saves the game, **Then** automated tests cover validation outcomes for representative valid and invalid list inputs.

**Acceptance (test mapping)**: Domain logic for game creation and list association is covered by automated unit tests; the primary creation flow is covered by an automated end-to-end test.

---

### User Story 2 - Import army lists by pasting supported Warhammer 40,000 formats (Priority: P1)

A user pastes list text in one or more **supported official or common community export formats** for Warhammer 40,000. The application parses enough structure to identify **units**, **models**, **weapons**, and **profiles** needed for attacks and saves.

**Why this priority**: Manual paste is the default path when no tournament integration is used.

**Independent Test**: Paste sample lists of each supported format and confirm units and weapons appear in a structured review screen before committing to the game.

**Acceptance Scenarios**:

1. **Given** a supported paste format, **When** the user pastes and confirms import, **Then** the list is structured into units with selectable weapons and model groups.
2. **Given** malformed or unrecognized text, **When** the user attempts import, **Then** the user sees a clear error with guidance (line or section hints when possible) without corrupting an existing list.
3. **Given** parser behavior is defined, **When** tests run, **Then** representative golden samples for each supported format pass parsing expectations.

**Acceptance (test mapping)**: Parsing and validation are covered by automated unit tests with fixture files; a primary import path is covered by an automated end-to-end test.

---

### User Story 3 - Preload lists from a Best Coast Pairings event match (Priority: P2)

A user creates a game by referencing an **event** and a **specific paired match** in Best Coast Pairings so both army lists load without manual paste.

**Why this priority**: High value for tournament players but depends on an external system and user authorization; it can ship after paste-based MVP if needed.

**Independent Test**: With a test double or sandbox credentials, select an event and match; verify both lists populate and are editable like pasted lists.

**Acceptance Scenarios**:

1. **Given** the user provides valid event and match identifiers the application understands, **When** they confirm preload, **Then** both players receive the correct lists from that pairing.
2. **Given** the pairing service is unavailable or returns an error, **When** preload is attempted, **Then** the user sees a recoverable error and can fall back to manual paste.
3. **Given** integration contracts, **When** automated tests run, **Then** success and common failure responses from the pairing source are exercised without manual steps.

**Acceptance (test mapping)**: Integration boundaries are covered by contract or integration-style automated tests; the happy-path selection UI is covered by an automated end-to-end test when a test environment is available.

---

### User Story 4 - Configure shooting or melee and assign attackers, weapons, and targets (Priority: P1)

Inside an active game, the user chooses whether the attack is **shooting** or **melee**, selects the **attacking unit**, **defending unit**, and **weapon profile** (and relevant weapon options when a unit has several). The application uses list-derived stats for characteristics required to resolve dice.

**Why this priority**: Correct phase and weapon selection is required for meaningful automation.

**Independent Test**: Configure one shooting attack and one melee attack between imported units and confirm the attack summary shows expected inputs before rolling.

**Acceptance Scenarios**:

1. **Given** units with multiple weapons, **When** the user picks a weapon, **Then** the attack summary reflects that weapon’s stats and restrictions implied by phase (shooting vs melee) as defined by the product’s supported rules scope.
2. **Given** an illegal combination (for example, a weapon not available to the attacking model group), **When** the user attempts to proceed, **Then** the application blocks roll with an explanation.
3. **Given** attack configuration rules, **When** automated tests run, **Then** representative legal and illegal selections are asserted.

**Acceptance (test mapping)**: Selection and validation logic is covered by automated unit tests; a full configure-and-preview path is covered by an automated end-to-end test.

---

### User Story 5 - Track which models are active and distinguish identical groups (Priority: P2)

The user indicates **which models remain in play** for involved units. Models that share the same profile and equipment may be represented as a **single stack with a numeric count** and increment/decrement controls. Models that differ by profile, equipment, or weapon options appear as **distinct rows** so the user can toggle or adjust them independently.

**Why this priority**: Dice volume and weapon eligibility depend on surviving models; stacks reduce tedious repetition.

**Independent Test**: Adjust counts and distinct rows, then start an attack and confirm the UI uses the adjusted state in the attack summary.

**Acceptance Scenarios**:

1. **Given** a unit with homogeneous models, **When** the user changes the count with +/- controls, **Then** subsequent attacks in the same session use the updated count until changed again.
2. **Given** a unit with heterogeneous models, **When** the user marks specific rows as removed, **Then** weapons tied to removed rows are unavailable for attack selection.
3. **Given** model state rules, **When** automated tests run, **Then** stack math and row toggling update attack eligibility as expected.

**Acceptance (test mapping)**: State transitions for stacks and rows are covered by automated unit tests; a multi-row unit is exercised in an automated end-to-end test.

**Deferred enhancement (documented)**: Persisting “memory” of identical-model counts across separate visits or devices beyond the current session is explicitly **out of scope for the first delivery** of this story; only in-session persistence is required initially.

---

### User Story 6 - Add attack modifiers and special rules that affect dice (Priority: P1)

The user attaches **modifiers** to the attack sequence (examples: bonuses or penalties to hit or wound, rerolls of specific results, rules that change outcomes on critical hits such as lethal hits or devastating wounds, and similar effects within the supported rules scope). Modifiers apply in a **documented order** so results are reproducible.

**Why this priority**: Warhammer 40,000 combat without modifiers is unrealistic; users will reject the tool if common effects are missing or inconsistent.

**Independent Test**: Enable a known combination of modifiers, roll with fixed randomness in tests, and compare to hand-calculated expectations.

**Acceptance Scenarios**:

1. **Given** a list of supported modifiers, **When** the user toggles modifiers relevant to the attack, **Then** the roll preview text explains what will change.
2. **Given** conflicting modifier instructions the product cannot resolve, **When** the user attempts to roll, **Then** the application blocks the roll and explains the conflict.
3. **Given** documented modifier ordering, **When** automated tests run, **Then** each supported modifier type has at least one expected outcome case.

**Acceptance (test mapping)**: Modifier resolution is covered by automated unit tests with table-driven cases; a combined-modifier scenario appears in an automated end-to-end test.

---

### User Story 7 - Roll and review hit, wound, save, and Feel No Pain outcomes (Priority: P1)

The user executes a roll. The application presents **individual dice results** and **aggregated outcomes** for **hit rolls**, **wound rolls**, **saving throws**, and **Feel No Pain** (or equivalent “ignore damage” rolls when in scope), including how many attacks reached each stage. **Critical or rules-significant outcomes** (for example unmodified critical hits that trigger special rules, auto-wounds, or failed saves that lead to damage) are **visually emphasized in a subtle way**. Presentation uses **light motion** (for example short fades or counts ticking) that does not block reading or copying results.

**Why this priority**: This is the core user value—clear, trustworthy, readable automation.

**Independent Test**: Run a roll with known inputs and verify stage counts, special highlights, and final damage or failed attack narrative match expectations.

**Acceptance Scenarios**:

1. **Given** a configured attack with saves and Feel No Pain enabled, **When** the user rolls, **Then** all stages appear in order with per-die visibility and a clear final summary.
2. **Given** a result that triggers a special rule highlight, **When** results render, **Then** the special outcome is distinguishable without overwhelming the layout.
3. **Given** fixed random seeds in automated tests, **When** the same attack is rolled twice, **Then** outcomes are identical, proving reproducibility for regression testing.

**Acceptance (test mapping)**: The full resolution pipeline is covered by automated unit tests; the roll and review screen is covered by an automated end-to-end test including at least one highlighted special outcome.

---

### Edge Cases

- One or both lists fail import mid–game creation; user can correct paste or cancel without partial corrupt games.
- Units lose all models mid-sequence; attack configuration invalidates with a clear message.
- Weapons with variable attacks or damage: user supplies or confirms attack count and damage characteristics according to product rules for supported profiles.
- Saves that are impossible or automatic (for example no save allowed): pipeline skips or labels the stage appropriately.
- User applies modifiers that require player choice mid-resolution (if any): product either disallows unsupported choices with explanation or walks a minimal decision flow—only behaviors explicitly in scope per assumptions below.
- Very large dice pools: results remain readable (grouping, pagination, or expand/collapse) without changing underlying random outcomes.
- Accessibility: users who disable motion still receive the same numeric and textual information.
- Mobile: on-screen keyboard or safe areas (notches, home indicators) MUST NOT permanently obscure primary actions; layouts adapt or scroll so users can complete paste, configure, and roll.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow creation of a two-player game associated with two army lists before dice resolution begins.
- **FR-002**: The system MUST support local-only game setup for the initial release (no requirement that two human players join from separate devices).
- **FR-003**: Users MUST be able to import an army list by pasting text in each supported Warhammer 40,000 list format advertised by the product.
- **FR-004**: The system MUST parse imported lists into units, weapons, and model groupings sufficient to configure attacks and saving throws.
- **FR-005**: Users MUST be able to create a game by selecting a Best Coast Pairings event and match, when that integration is enabled for their environment, and preload both lists from the pairing.
- **FR-006**: When Best Coast Pairings data cannot be retrieved, the system MUST surface a clear error and allow the user to continue with manual list entry.
- **FR-007**: Users MUST declare whether an attack sequence is shooting or melee before rolling.
- **FR-008**: Users MUST select attacking unit, defending unit, and weapon (and required weapon options) from list-derived choices; illegal combinations MUST be prevented with explanations.
- **FR-009**: Users MUST be able to adjust defending and attacking model availability using distinct rows for non-identical models and a numeric counter with increment and decrement for identical model stacks.
- **FR-010**: In-session adjustments to model counts or rows MUST affect subsequent attack configuration in the same session immediately.
- **FR-011**: Users MUST be able to attach supported attack modifiers and special outcomes (including but not limited to effects analogous to lethal hits, devastating wounds, hit or wound bonuses, and targeted rerolls) subject to the product’s supported rules scope.
- **FR-012**: The system MUST apply modifiers in a documented, deterministic order so two runs with the same inputs and random seed produce identical results.
- **FR-013**: The system MUST execute and display hit rolls, wound rolls, saving throws, and Feel No Pain rolls when applicable to the attack and defender.
- **FR-014**: Results MUST include per-die detail and aggregated summaries per stage, ending with unambiguous final combat outcome information (for example damage suffered or attacks negated), consistent with the supported rules scope.
- **FR-015**: The system MUST visually emphasize rules-significant outcomes in a subtle, consistent manner and MUST provide short, non-blocking motion for users who keep motion enabled.
- **FR-016**: When motion is reduced at the platform or user preference level, the system MUST still present full numeric and textual outcomes.
- **FR-017**: The system MUST provide a **mobile-friendly** layout for primary flows (game setup, list import, attack configuration, dice results) on typical phone screen sizes without relying on horizontal scrolling for essential controls.
- **FR-018**: The system MUST be deliverable as a **Progressive Web App (PWA)** with a valid **Web App Manifest** and **service worker** such that users on supported mobile browsers can **install** the application to the device home screen and launch it in a standalone display mode where the platform supports it.

### Key Entities

- **Game**: Two players, references to two army lists, session state, and history of resolutions in the session.
- **Player**: Display name or identifier within a game.
- **Army list**: Structured data derived from paste or Best Coast Pairings preload, versioned by import time and source.
- **Unit**: Organizational container with models and optional transport relationships as present in list data.
- **Model row**: Either a stack of identical models (count) or an individual distinct model configuration.
- **Weapon profile**: Stats and abilities required for hit, wound, damage, and armor penetration calculations within supported scope.
- **Attack configuration**: Phase, attacker, defender, weapon, number of attacks, active model rows, and attached modifiers.
- **Dice resolution**: Ordered stages (hit, wound, save, Feel No Pain), per-die outcomes, special flags, and final summary.
- **Best Coast Pairings reference**: Event identifier, match identifier, and retrieved list payloads or error metadata.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can create a two-player game with pasted lists and reach a successful first roll in under ten minutes when using provided sample lists.
- **SC-002**: At least ninety percent of dice outcomes in automated regression suites match independently calculated expected distributions or exact expected results for seeded scenarios.
- **SC-003**: Ninety-five percent of moderated usability tasks (configure attack → roll → read final damage) are completed without moderator intervention using only in-app guidance.
- **SC-004**: For attacks up to sixty individual dice across all stages, results remain readable without horizontal scrolling on a standard laptop viewport (content may use vertical expansion or disclosure patterns).
- **SC-005**: When Best Coast Pairings preload succeeds in a configured test environment, list population for both players completes in under thirty seconds ninety-five percent of the time.
- **SC-006**: On a **390 px** wide logical viewport, users complete the path from opening an existing game through one full attack roll and reading the final summary **without horizontal scrolling** for required controls, and primary tap targets meet platform-typical minimum size guidelines (approximately **44 × 44 px** or equivalent).

## Assumptions

- **Rules scope**: The product targets the **currently supported Warhammer 40,000 edition and FAQs** as defined in the implementation plan; unsupported editions or optional rulesets are out of scope unless later specified.
- **Single active user**: Initial games are controlled by one user on one device; competitive integrity features for two-device verification are future scope.
- **Best Coast Pairings**: Access depends on user credentials or public data availability as determined during planning; the specification does not mandate a specific commercial relationship beyond what users already have for normal BCP use.
- **Randomness**: Dice use cryptographically suitable or industry-standard consumer random generation; test environments can inject seeds for repeatability.
- **Session persistence**: Game and list data persist for at least the duration of the browser or app session; long-term cloud sync is future scope unless added later.
- **Identical model memory**: Cross-session persistence of identical-model counts is explicitly deferred as noted in User Story 5.
