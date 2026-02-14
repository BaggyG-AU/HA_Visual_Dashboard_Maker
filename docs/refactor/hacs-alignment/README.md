# HACS Card Alignment Refactor — Prompt Framework

## Purpose

This directory contains self-contained prompts for each phase of the HACS card alignment refactor. Each prompt file gives any AI agent (Codex, Claude, or other) everything it needs to execute that refactor phase independently.

## Execution Order

| Phase | Prompt File | Complexity | Description |
|-------|------------|------------|-------------|
| R2 | `R2_CAROUSEL_ALIGNMENT.md` | Medium-High | `custom:swiper-card` → `custom:swipe-card` |
| R3 | `R3_ACCORDION_ALIGNMENT.md` | High | `custom:accordion-card` → `custom:expander-card` |
| R4 | `R4_TABS_ALIGNMENT.md` | Medium | `custom:tabs-card` → `custom:tabbed-card` |
| R5 | `R5_POPUP_ALIGNMENT.md` | Low | Document `custom:popup-card` as HAVDM-only |
| R7 | `R7_IMPORT_EXPORT_SERVICE.md` | Medium | YAML import/export conversion layer |
| R8 | `R8_REGRESSION_TESTING.md` | Medium | Full regression + round-trip YAML tests |

R1 (ai_rules.md update) and R6 (schema cleanup) are folded into R2–R5.

## Agent Routing

Any phase can be assigned to any agent (Codex or Claude) at the user's discretion. Suggested defaults based on complexity:

| Phase | Suggested Agent | Rationale |
|-------|----------------|-----------|
| R2 | Codex | Mechanical renames + property restructuring |
| R3 | Claude | Structural architecture change (multi→single section) |
| R4 | Codex | Mechanical renames + property restructuring |
| R5 | Codex | Minimal changes — documentation + metadata |
| R7 | Claude | New service design with complex conversion logic |
| R8 | Either | Full regression — assign based on availability |

These are suggestions only. The user decides agent assignment for each phase.

## Test Execution

Each phase prompt includes a **Validation** section with three test levels:

1. **Lint**: `npm run lint`
2. **Unit tests**: targeted by feature
3. **E2E tests**: targeted Playwright specs for the changed card type

The executing agent runs all three levels after implementing changes. Full regression and CI are handled separately per user instruction.

All testing follows the established rules in:
- `ai_rules.md` §5 (Test Execution & Reporting Policy)
- `docs/testing/TESTING_STANDARDS.md`
- `docs/testing/PLAYWRIGHT_TESTING.md`

## Dependencies

- R2, R3, R4, R5 are **independent** — can run in parallel on separate branches
- R7 depends on R2+R3+R4 being complete (needs final type shapes)
- R8 depends on all prior phases

## Pre-Reading (include in every prompt)

Agents must read these files before starting any phase:
1. `ai_rules.md` — immutable rules
2. `docs/testing/TESTING_STANDARDS.md` — test conventions
3. `docs/features/HACS_CARD_ALIGNMENT_REFACTOR_PLAN.md` — full context
