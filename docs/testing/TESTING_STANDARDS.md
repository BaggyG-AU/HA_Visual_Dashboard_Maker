# Testing Standards – Playwright Helper DSL  
Electron + React + TypeScript

Last Updated: 2025-12-29

---

## PURPOSE

These standards ensure automated tests remain stable, readable, and resilient as the application evolves.

They are designed to support:
- A shared Playwright DSL (Domain-Specific Language)
- Multiple AI coding agents (Claude, Codex, etc.)
- UI workflows that may change over time

Tests must fail only when behavior is broken — not when UI flows evolve.

---

## CORE PRINCIPLES

### 1. Use the DSL for ALL Tests

All Playwright tests MUST use helper methods from the DSL.

Do NOT:
- Call Playwright APIs directly in test specs
- Use raw selectors or timing logic in tests

Do:
- Use DashboardDSL, CardDSL, EntityBrowserDSL, etc.

---

### 2. Import from tests/support

All helpers, DSLs, fixtures, and utilities MUST live under:

tests/support/

Tests may only import from this directory tree.

---

### 3. Zero Direct Playwright API Calls in Specs

Test specs MUST NOT contain:
- Raw selectors
- Timing logic
- Conditional UI handling
- Retry logic

All of this belongs in the DSL layer.

---

### 4. Tests Must Read Like User Workflows

Tests should read like a human description of user intent.

Good:
- Create dashboard
- Add card
- Select card

Bad:
- Click element X
- Wait 500 ms
- Query DOM directly

---

### 5. One Assertion Per Behavior

Each test should assert one observable user behavior.

---

### 6. No Arbitrary Timeouts

Using fixed delays or increasing timeouts to make tests pass is forbidden.

All waits must be state-based and implemented in the DSL.

---

### 7. Failures Must Be Actionable

When a test fails, it must be immediately clear:
- Which workflow broke
- At what abstraction level
- Why the user experience is incorrect

---

## FLOW-AWARE TESTING REQUIREMENTS (MANDATORY)

### 8. UI Flow Changes MUST Be Reflected in the DSL

If a feature introduces any new UI step between two previously adjacent user actions (for example: a dialog, wizard, selection screen, or confirmation layer), the following is mandatory:

1. Identify the shared DSL method responsible for the workflow
2. Update the DSL first, not individual test specs
3. Explicitly handle the new step in the DSL
4. Preserve backward compatibility where possible

Violations include:
- Updating dozens of specs to accommodate a new UI layer
- Adding workarounds in test files

Correct behavior:
- One DSL update restores all downstream tests

---

### 9. DSL Methods Must Be Flow-Defensive

High-level DSL methods must handle optional or evolving UI steps.

They must:
- Detect intermediate UI states
- Act only if the step is present
- Proceed cleanly if the step is absent

This prevents UX evolution from breaking the test suite.

---

### 10. Systemic Failures Require Root-Cause Fixes

If many tests fail at the same DSL line, this indicates a broken abstraction, not broken tests.

Mandatory response:
1. Stop editing test specs
2. Identify the shared DSL failure
3. Fix the DSL
4. Re-run affected tests

---

## TRACE-DRIVEN DEBUGGING STANDARD

### 11. Evidence-Based Debugging Only

AI agents cannot run tests and cannot open Playwright trace viewers.

Debugging must be based on:
- Playwright traces
- Screenshots
- DOM snapshots
- Console output

Agents must not guess or claim tests were run.

---

## FEATURE DEVELOPMENT – TESTING CHECKLIST (MANDATORY)

Every feature that modifies UI flows must satisfy the following:

- Did the feature introduce new dialogs, wizards, or selection layers?
- Were existing DSL workflows reviewed for broken assumptions?
- Was the DSL updated before modifying test specs?
- Is at least one test asserting the new UI step exists?
- Were state-based waits updated to reflect the new flow?
- Were Playwright traces used to confirm steady-state UI behavior?

If any answer is “no”, the feature is not test-complete.

---

## DSL STRUCTURE

tests  
└── support  
    ├── dsl  
    │   ├── dashboard.ts  
    │   ├── cards.ts  
    │   ├── entityBrowser.ts  
    │   └── index.ts  
    ├── fixtures  
    ├── mocks  
    └── helpers  

The DSL layer encapsulates:
- Selectors
- Timing logic
- Conditional UI flows
- State detection
- Retry behavior

---

## ADDING OR MODIFYING DSL METHODS

When adding or modifying DSL methods:

- Prefer idempotent, state-aware operations
- Avoid assumptions about initial UI state
- Handle optional steps defensively
- Document expected steady-state outcomes

---

## DEFINITION OF DONE (TESTING)

A feature is not complete unless:

- All impacted DSL workflows are updated
- Tests pass without spec-level workarounds
- No raw selectors were added to test specs
- New UI layers are explicitly handled in the DSL
- At least one test validates the new user path

---

## ENFORCEMENT

Pull requests must be rejected if they:

- Add UI layers without updating the DSL
- Patch specs instead of fixing abstractions
- Introduce arbitrary waits or timeout increases
- Ignore trace evidence during failure analysis

---

## FINAL NOTE

This standard exists to prevent brittle tests and large-scale failures caused by small UX changes.

If many tests fail at once, the DSL is the first place to look.
