# AI Prompt Library

This directory contains **curated, version-controlled prompt templates** used with AI coding tools (Claude, OpenAI Codex) to ensure **consistent, safe, and repeatable workflows**.

Prompts in this directory are treated as **first-class tooling**, not ad-hoc chat instructions.

---

## Why this exists

This repository uses **multiple AI tools with clearly separated responsibilities**:

- **Claude** → feature development and refactoring
- **OpenAI Codex** → Playwright E2E test stabilization

Without guardrails, this easily leads to:
- flaky tests
- duplicated solutions
- AI tools “fighting” each other
- accidental product changes while fixing tests

This prompt library exists to **encode workflow, constraints, and best practice once**, and reuse them consistently.

---

## Directory structure

prompts/
├─ README.md ← you are here
├─ claude/
│ └─ feature-development.md
├─ codex/
│ └─ playwright-fix.md
└─ shared/
├─ ai_rules.md
└─ verification-rules.md

yaml
Copy code

---

## Prompt roles

| Location | Purpose |
|--------|---------|
| `claude/` | Feature development, refactors, unit/integration work |
| `codex/` | Playwright E2E defect fixing and test hardening |
| `shared/` | Non-negotiable rules that apply to *all* AI work |

---

## Core rules

- Prompts are **versioned and reviewed like code**
- All AI-assisted work **must comply with `shared/ai_rules.md`**
- AI tools **cannot run tests** — verification instructions must always be provided
- The **immutable troubleshooting rule** applies everywhere:

> When debugging failing code or tests, you MUST first search for and reuse
> existing passing implementations (tests, specs, helpers, DSLs, utilities)
> before inventing new approaches.

---

## How prompts interact with `/tools`

This repository pairs **prompt templates** with **automation scripts** to enforce
both *where* work happens and *how* it is performed.

### Branch lifecycle scripts

- `tools/feature-start`  
  Creates `feature/<name>` for feature development (Claude)
- `tools/test-start`  
  Creates `test/<name>` from feature branch (Codex)
- `tools/test-finish`  
  Merges test fixes back into feature branch
- `tools/feature-finish`  
  Merges feature into `main`

### Prompt ↔ branch mapping

| Branch | Script | Prompt |
|--------|--------|--------|
| `feature/<name>` | `feature-start` | `prompts/claude/feature-development.md` |
| `test/<name>` | `test-start` | `prompts/codex/playwright-fix.md` |

Scripts define **branch boundaries**.  
Prompts define **allowed behavior inside those boundaries**.

---

## Standard workflow

1. Start feature work  
   tools/feature-start "my feature"
   Use `prompts/claude/feature-development.md`. Complete feature + unit/integration tests.

2. Run E2E tests.
   If Playwright fails, stop feature work and start test stabilization.

3. Complete feature + unit/integration tests

4. Start test stabilization  
   tools/test-start "my feature"
   Use `prompts/codex/playwright-fix.md`.

5. Merge test fixes back  
   tools/test-finish "my feature"

6. Merge feature into main  
   tools/feature-finish "my feature"

---

## VS Code integration

Prompt templates are exposed via VS Code Tasks.

- Command Palette: `Tasks: Run Task`
- Select one:
  - `Prompts: Open Claude Feature Prompt`
  - `Prompts: Open Codex Playwright Fix Prompt`
- (Optional) configure workspace keyboard shortcuts.

---

## Adding new prompts

When adding prompt templates:
- Place them under the correct directory.
- Update this README to document purpose, intended branch, and associated script (if any).
- (Recommended) add a VS Code Task for quick access.

If it is not documented here, it is not part of the workflow.
