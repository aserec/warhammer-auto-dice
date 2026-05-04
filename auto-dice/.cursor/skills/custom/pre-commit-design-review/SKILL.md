---
name: pre-commit-design-review
description: Analyzes staged and unstaged changes against clean code, DRY, SOLID, and design best practices; returns a numbered proposal list and optionally applies fixes after user confirmation or when auto-apply is requested. Use before committing, when the user asks for a design or code-quality pass on pending changes, or when invoking pre-commit design review.
disable-model-invocation: true
---

# Pre-commit design and clean-code review

## Goal

Review **all pending work** (staged **and** unstaged) against solid engineering practices, then either wait for the user to choose which numbered items to apply or apply everything automatically when requested.

## Scope of diffs

1. Confirm a Git repo: `git rev-parse --is-inside-work-tree`.
2. Collect changes versus `HEAD` so both index and working tree are included:
   - **Preferred**: `git diff HEAD` (full patch).
   - **Supplement**: `git diff --stat HEAD` for a compact file list.
3. If there is no diff, say so and stop.
4. If only binary or generated files changed, note limitations and review what is readable.

Focus the review on **lines and files that appear in that diff**. Do not demand refactors of untouched code unless a change in the diff creates a clear regression (for example, a new public API that violates consistency with the rest of the module).

## Review dimensions (checklist for the agent)

Use this as a mental checklist; report only findings that are **actionable** and tied to the diff.

| Area | Look for |
|------|----------|
| **SOLID** | SRP violations (god methods/classes), tight coupling where an interface or small extraction would clarify, LSP-breaking overrides, needless interface churn |
| **DRY** | Duplicated logic, copy-pasted blocks, parallel structures that could share one abstraction |
| **Clean code** | Meaningful names, small functions, low nesting, honest comments, dead code introduced by the diff |
| **Design** | Appropriate boundaries, error-handling strategy, testability, API surface creep, leaky abstractions |
| **Pragmatism** | Avoid nitpicks; prefer issues that improve correctness, maintainability, or security |

Respect project conventions (linters, architecture, existing patterns) when they conflict with generic textbook rules.

## Auto-apply vs confirm

**Detect auto-apply** when the user (or invoker) clearly asks to skip the confirmation step, for example:

- Phrases: `auto-apply`, `auto apply`, `apply automatically`, `without confirmation`, `no prompt`, `skip confirmation`, `just fix it`
- A dedicated flag or parameter if the user passes one (treat `--auto-apply` / `--yes` style tokens the same)

**If auto-apply is on**: after the analysis, **do not** wait; implement **all** proposed changes that are still valid, then summarize what was done.

**If auto-apply is off** (default): after the analysis, **stop and wait** for the user’s next message before editing for those proposals.

## Output format (required)

Structure the first response so the user can scan it quickly.

1. **Short summary** (one short paragraph): scope (e.g. number of files), overall risk, and whether anything is blocking.
2. **Overview table** (when there are multiple findings):

   | # | Severity | Category | Location |
   |---|----------|----------|----------|
   | 1 | … | … | `path` — symbol or region |

   Use **Critical** / **Important** / **Suggestion** (or similar) for severity; keep categories short (e.g. SRP, DRY, naming, error handling).

3. **Numbered proposals** (this list is what the user selects from):

   For each item **n**:

   - **Title** line: `### n. <short title>`
   - **Location**: backticked path(s); name types, functions, or modules.
   - **Observation**: what violates which principle or practice (one tight paragraph).
   - **Proposed change**: concrete edit or refactor (bullet list is fine).
   - **Optional**: minimal code fence only when a tiny snippet clarifies the fix.

4. If there are **no** material issues: state that explicitly and optionally offer optional polish (only if useful).

Use lists, **bold** for severity and decision points, and file paths in `` `backticks` `` throughout.

## After proposals: user commands

When **not** auto-applying, end with a single line such as:

> Reply with **`all`** / **`go`** (or similar) to apply every item, or with **numbers** (e.g. `1`, `3`, `1-3`, `1, 4`) for a subset.

**Treat as “apply everything”** when the user clearly approves the full set, including phrases like: `all`, `go`, `yes`, `apply all`, `everything`, `do all`, `proceed`, `ship it`, `lgtm`, `do it`, `the whole list`.

**Treat as partial apply** when the user gives:

- Individual numbers: `2`, `2 and 5`, `2, 5`
- Ranges: `1-3` meaning inclusive 1 through 3

**Ambiguity**: if selection is unclear, ask one brief clarifying question instead of guessing.

**Implementation rules**:

- Apply **only** the selected numbered items (or all if approved).
- Re-read affected files before editing; keep edits minimal and coherent with the codebase.
- If an item is no longer applicable after another edit, say so and skip it.
- Run relevant tests or linters if the project has obvious commands; fix new breakage you introduce.

## Final message after implementation

- Bullet list of what was applied (mapped to proposal numbers).
- Mention files touched.
- Note anything deferred and why.
