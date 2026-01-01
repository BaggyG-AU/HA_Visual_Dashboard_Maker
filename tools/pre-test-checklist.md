# Pre-Test Checklist (Git + Workflow Hygiene)

This checklist is used whenever you are about to switch phases/branches in the workflow:

**main → feature → test → feature → main**

The **core “git clean” steps are the same** at each transition. Where a step differs by phase, it’s called out in the relevant section.

---

## Core Git Clean Checklist (use at every transition)

Run these steps **before** you switch branches or run any of the `/tools/*` scripts.

1. **Confirm you are in the repo root**
   - You should see folders like `src/`, `tests/`, `tools/`, `prompts/`

2. **Confirm your current branch**
   - Check what branch you’re on (feature/test/main) so you don’t run the wrong script.

3. **Confirm working tree is clean**
   - There must be **no modified files**, **no staged-but-uncommitted files**, and **no untracked files** you care about.
   - If there are changes:
     - Decide: **commit**, **stash**, or **discard** (see “Decision rules” below).

4. **Confirm you are not mid-merge/rebase**
   - If you are in a merge/rebase, finish it or abort it before continuing.

5. **Pull/fetch latest**
   - Make sure your local branch is up-to-date with origin.
   - Prefer fast-forward pulls (avoid accidental merge commits).

6. **Push your branch if it’s ahead**
   - If your branch is ahead of origin, push it before switching phases.
   - This avoids losing work and keeps the test-branch workflow predictable.

7. **Re-run quick local checks (recommended)**
   - Run your normal fast checks relevant to the phase (lint/unit/integration) before moving to E2E.
   - (The AI tools cannot run tests in sandbox mode; you do this locally/CI.)

---

## Decision Rules (when the repo isn’t clean)

If `git status` shows changes:

### A) Modified files (tracked)
- **If the changes are part of the feature/test work** → commit them with a clear message.
- **If they’re temporary/debug noise** → discard or stash.
- **If they’re workflow tooling (prompts/tools/tasks)** → commit them before creating a test branch.

### B) Untracked files
- **If you want them in the repo** → add + commit.
- **If they’re generated output** → add to `.gitignore` and remove.
- **If they’re temporary** → delete them or stash via a temporary commit (last resort).

### C) Staged but not committed
- Commit them (preferred), or unstage if you staged by accident.

---

## Phase Checklists

### 1) main → feature (starting a new feature)

Use this when you are on `main` and want to start feature development (Claude).

**Pre-flight**
- Complete the **Core Git Clean Checklist** on `main`.
- Ensure `main` is up-to-date with origin.

**Action**
- Run:
  - `tools/feature-start "<feature name>"`

**After**
- Confirm you are on `feature/<name>`
- Open the Claude prompt:
  - `prompts/claude/feature-development.md`

---

### 2) feature → test (switching to E2E stabilization / Codex)

Use this when feature work is complete and you are ready to focus on Playwright failures.

**Pre-flight**
- Complete the **Core Git Clean Checklist** on the `feature/<name>` branch.
- Ensure all feature work (including prompt/tooling changes) is **committed**.
- Ensure the feature branch is **pushed** (not ahead of origin).

**Action**
- Run:
  - `tools/test-start "<feature name>"`

**After**
- Confirm you are on `test/<name>`
- Open the Codex prompt:
  - `prompts/codex/playwright-fix.md`

**E2E loop**
- Run Playwright tests locally/CI.
- Feed failures (output + traces + screenshots) into Codex.
- Repeat until green.

---

### 3) test → feature (bringing E2E fixes back)

Use this when E2E is passing and you want to merge the test fixes into the feature branch.

**Pre-flight**
- Complete the **Core Git Clean Checklist** on `test/<name>`.
- Confirm all test fixes are **committed**.
- Confirm the test branch is **pushed** (so it’s recoverable if anything goes wrong).

**Action**
- Run:
  - `tools/test-finish "<feature name>"`

**After**
- Confirm you are back on `feature/<name>` (or that `feature/<name>` now includes the test fixes).
- Re-run your relevant test suites (sanity check).

---

### 4) feature → main (final merge)

Use this when feature is complete and stable (unit/integration + E2E green).

**Pre-flight**
- Complete the **Core Git Clean Checklist** on `feature/<name>`.
- Ensure the feature branch is **pushed** and not diverged.
- Ensure E2E is green and all required checks are complete.

**Action**
- Run:
  - `tools/feature-finish "<feature name>"`

**After**
- Confirm you are on `main`
- Pull latest `main` and verify CI/required checks as normal.

---

## Quick “Am I ready to start testing?” gate

You are ready to create a `test/<name>` branch when ALL are true:

- Feature work is complete enough to be tested
- `git status` is clean (no modified/untracked files)
- Feature branch is pushed (not ahead of origin)
- You can clearly describe the failing E2E behavior / target tests
- You will use `prompts/codex/playwright-fix.md` and keep changes minimal

---

## Notes

- The goal is consistency and predictability:
  - **feature branches** are for product work (Claude)
  - **test branches** are for E2E stabilization (Codex)
  - **main** is only updated via the feature branch path
- Update this checklist when:
  - new prompt templates are added
  - new `/tools/*` scripts change behavior
  - verification steps change (e.g., CI commands, test runners)
