<!--
Sync Impact Report
- Version change: (initial template placeholders) → 1.0.0
- Principles: Established I–V (TDD, Playwright E2E, design-review gate, UX consistency, performance).
- Added sections: Technology Stack & Architecture; Development Workflow & Quality Gates.
- Removed sections: None (replaced placeholder-only document).
- Templates: plan-template.md ✅ | spec-template.md ✅ | tasks-template.md ✅ | commands/*.md N/A (no changes needed)
- Follow-up TODOs: None.
-->

# Warhammer Auto Dice Constitution

## Core Principles

### I. Test-Driven Development (NON-NEGOTIABLE)

All production logic MUST follow the Red–Green–Refactor cycle: write or extend a failing automated
test first (Vitest for units, components, and hooks), observe the failure, then implement the
minimum code to pass, then refactor with tests green. Skipping the failing-test step to “save time”
is forbidden. Public behavior and regressions MUST be locked in by tests before merge.

### II. End-to-End Verification with Playwright

Every feature that changes user-visible behavior, navigation, or critical server interactions MUST
ship with Playwright coverage for the primary happy paths and agreed edge cases. After each feature
is implemented, agents MUST add or update Playwright specs and run them using the **Playwright MCP**
tools (discover tool schemas under the project MCP configuration, then invoke the appropriate run
or browser tools). E2E suites MUST pass before the feature is considered complete.

### III. Automated Design Review on the Active Diff

After each substantive change batch, agents MUST run the **pre-commit-design-review** skill
(`.cursor/skills/custom/pre-commit-design-review/SKILL.md`) scoped strictly to the current diff
versus `HEAD` (staged and unstaged), without asking the user for confirmation to perform the
review itself. When the skill supports auto-apply and the constitution’s quality bar is met,
agents SHOULD apply safe fixes without confirmation; otherwise they MUST report actionable items tied
to the diff. Reviews MUST NOT expand scope to untouched files except for regressions introduced by
the diff.

### IV. User Experience Consistency

The product MUST present a coherent interface: shared layout, typography, spacing, and interaction
patterns via **Tailwind CSS** and **shadcn/ui** primitives; new UI MUST reuse existing tokens and
components before introducing variants. **Storybook** MUST be used to document and visually regress
non-trivial components. Accessibility (keyboard, focus, labels, contrast) is a default requirement,
not an add-on.

### V. Performance and Runtime Quality

Implementation MUST follow **Vercel React Best Practices** (see project `.agents/skills` guidance)
and **Next.js** defaults for caching, streaming, and bundle discipline. Features MUST define concrete
performance expectations in plans (for example: interaction-ready targets, data-fetch waterfalls
avoided, list virtualization where needed). Agents MUST prefer **TanStack** libraries (Query,
Router, Table as applicable) and **Zustand** for client state only where they reduce complexity and
re-renders versus ad-hoc context. Lazy loading and code splitting MUST be considered for heavy
client surfaces.

## Technology Stack & Architecture

The codebase MUST use the **current latest stable** releases of the following, unless a plan
documents a temporary pin with an owner and expiry:

- **Language**: TypeScript everywhere for application code.
- **Framework**: **Next.js** (App Router patterns) on the **React** ecosystem.
- **Monorepo**: **Turborepo** for task orchestration and caching across packages/apps.
- **Styling & UI**: **Tailwind CSS** + **shadcn/ui**.
- **Domain modeling**: **Domain-Driven Design (DDD)** — bounded contexts, ubiquitous language in
  specs and plans, entities and value objects reflected in module boundaries.
- **Unit / component tests**: **Vitest**.
- **E2E tests**: **Playwright** (via Playwright MCP in agent workflows).
- **Data fetching / async client state**: **TanStack Query** (and other TanStack packages as
  warranted).
- **Client UI state**: **Zustand** when local state is shared across subtrees without prop drilling.
- **Documentation & visual QA**: **Storybook**.
- **Agent discipline**: **SuperPowers**-style structured workflows (planning, isolation, explicit
  test and review gates) MUST complement—not replace—this constitution’s TDD and Playwright rules.

## Development Workflow & Quality Gates

- **Spec Kit alignment**: `/speckit-specify`, `/speckit-plan`, `/speckit-tasks`, and
  `/speckit-implement` outputs MUST remain consistent with this constitution; constitution conflicts
  are resolved by updating specs or plans, not by ignoring principles.
- **Feature completion**: A feature is incomplete until Vitest coverage for new logic exists,
  Playwright scenarios pass via MCP where applicable, and the design-review skill has been run on
  the feature diff.
- **Deployment**: **Vercel** hosting and previews MUST respect performance and environment-variable
  practices documented for the project.

## Governance

This constitution supersedes informal coding preferences for Spec Kit work in this repository.
Amendments require: (1) an updated version line using semantic versioning (MAJOR for incompatible
principle removals or redefinitions; MINOR for new principles or materially expanded rules; PATCH
for clarifications); (2) an updated **Last Amended** date; (3) propagation to dependent templates
when gates or mandatory workflows change. All implementation plans and reviews MUST verify
compliance with Core Principles before merge.

**Version**: 1.0.0 | **Ratified**: 2026-05-04 | **Last Amended**: 2026-05-04
