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

## SCOPE (IMPORTANT)

This repo has multiple automated test layers:
- **Unit**: `vitest` (pure logic)
- **Playwright E2E**: `electron-e2e` (end-to-end user workflows; DSL-first)
- **Playwright Integration**: `electron-integration` (broader app/service workflows; may use fixtures/helpers)

Not every rule in this document applies equally to every layer. When a rule is E2E-only or Integration-only, it is labeled explicitly.

---

## CORE PRINCIPLES

### 1. Use the DSL for E2E Tests (MANDATORY)

All **E2E** Playwright tests MUST use helper methods from the DSL.

Do NOT:
- Call Playwright APIs directly in test specs
- Use raw selectors or timing logic in tests

Do:
- Use DashboardDSL, CardDSL, EntityBrowserDSL, etc.

---

### 2. Import Rules (E2E vs Integration)

**E2E:** Specs may only import helpers/DSLs from:

tests/support/

**Integration:** Specs MAY import from `tests/fixtures/**` and `tests/helpers/**` when appropriate. Prefer using `tests/support/**` DSLs for UI workflows when available, but do not force large refactors purely to satisfy import rules.

---

### 3. Direct Playwright API Calls in Specs

**E2E:** Specs MUST NOT contain:
- Raw selectors
- Timing logic
- Conditional UI handling
- Retry logic

All of this belongs in the DSL layer.

**Integration:** Prefer helpers/fixtures to encapsulate selectors/waits. If direct calls are used, they must be:
- State-based (no arbitrary sleeps)
- Scoped and stable (prefer `data-testid`, role, and well-scoped locators)
- Centralized when reused (move to helpers/fixtures/DSL rather than duplicating)

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

### Naming Hygiene
- Avoid special characters in test titles that require escaping (for example `+`, `*`, `$`, `?`, `|`). Prefer plain words (e.g., use “and” instead of “+”) so grep filters and Playwright `-g` patterns stay simple and portable.

---

### 5. One Assertion Per Behavior

Each test should assert one observable user behavior.

---

### 6. No Arbitrary Timeouts

Using fixed delays (`waitForTimeout`) or sleep-based synchronization to make tests pass is forbidden.

All waits must be state-based and implemented in the DSL.

**Exception — `test.setTimeout()` for legitimately long tests**: When a test performs many sequential UI operations that accumulate significant wall-clock time (e.g., Electron launch + multiple YAML round-trips + Ant Design dropdown interactions on WSL2), `test.setTimeout()` may be used to set a realistic per-test timeout. This is NOT a synchronization mechanism — it simply prevents a correct, running test from being killed prematurely. Requirements:
- The root cause of slowness must be understood and documented in a comment
- The timeout must reflect measured execution time with reasonable headroom (not an arbitrary large number)
- The test must NOT use `waitForTimeout` for synchronization anywhere in its call chain

Guardrail check:
- Run `npm run test:e2e:guardrails` to block raw sleeps and non-unified launch helpers in E2E specs.

---

### 7. Failures Must Be Actionable

When a test fails, it must be immediately clear:
- Which workflow broke
- At what abstraction level
- Why the user experience is incorrect

---

## UNIT TESTING STANDARDS (NEW)

- Scope: Pure logic only (services, data transforms, selectors, reducers/stores). No DOM, Electron, or IPC in unit tests.
- Deterministic data: Use minimal fixtures under `tests/unit/fixtures` and avoid randomness; keep inputs small and explicit.
- Assertions: Prefer explicit shape/value assertions over snapshots; verify ordering when relevant (e.g., sorted lists, YAML output order).
- Isolation: Reset shared stores/state between tests; avoid leaking singletons (reset or recreate as needed).
- Coverage priorities:
  - Filtering/sorting/limiting rules
  - Layout/math helpers
  - Serialization/round-trip (YAML/JSON)
  - State machine decisions and model utilities (dirty state, undo/redo, selections)
- Mocks: Stub only external edges (fs/IPC/network); prefer hand-rolled stubs over global mocks.

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

Debugging must be based on evidence (traces, screenshots, DOM snapshots, console output).

AI agent execution/reporting policy (including “one test run then pause/diagnose/ask”) is defined in `ai_rules.md`.
AI agents cannot open Playwright trace viewers, but CAN unzip and analyze `trace.zip` files and other artifacts.

Debugging must be based on:
- Playwright traces
- Screenshots
- DOM snapshots
- Console output

Agents must not guess or claim tests were run.

---

### 12. AI Test/Resolve Cycle Limit (MANDATORY)

When an AI agent is running tests and resolving errors, it MUST adhere to a **maximum of three (3) test/resolve cycles** before pausing for user input.

**Definition of a Cycle**: One cycle consists of:
1. Running tests (full suite or targeted)
2. Analyzing failures
3. Implementing a fix
4. Re-running tests to verify

**After Three Cycles Without Resolution**, the AI agent MUST:

1. **STOP** further autonomous fix attempts
2. **Provide a Full Summary** including:
   - The original test failure(s) and error message(s)
   - Root cause analysis (what the AI believes is causing the failure)
   - Each fix attempt made (what was changed and why)
   - Current state (what's still failing and how)
3. **Document What Was Tried**:
   - Specific code changes made in each cycle
   - Test results after each change
   - Any patterns or insights discovered
4. **Provide Recommendations**:
   - Suggested next steps (prioritized)
   - Alternative approaches not yet tried
   - Whether the issue may require architectural changes
   - Whether the test itself may need revision
   - Any external dependencies or environmental factors

**Rationale**: This prevents AI agents from:
- Spinning endlessly on difficult issues
- Making progressively worse changes trying to "fix" symptoms
- Wasting context and compute on diminishing returns
- Missing opportunities for human insight on complex problems

**User Decision Point**: After receiving the summary, the user can:
- Provide guidance and allow the AI to continue
- Take over debugging manually
- Skip/defer the failing test with documentation
- Escalate to a different debugging approach

**Example Summary Format**:
```
## Test Resolution Summary (3 cycles exhausted)

### Original Failure
- Test: `should update YAML when color is changed`
- Error: `Monaco model not detected after 5000ms timeout`

### Root Cause Analysis
The Monaco editor instance is not exposing its model to the global window
object despite the code appearing correct...

### Fix Attempts
1. **Cycle 1**: Added explicit window.__monacoModel assignment
   - Result: Still failing, model undefined
2. **Cycle 2**: Moved assignment to useEffect with editor dependency
   - Result: Model briefly available, then undefined
3. **Cycle 3**: Added retry logic in test with polling
   - Result: Polling finds model intermittently, test flaky

### Current State
Test passes ~30% of runs. Monaco initialization timing appears
non-deterministic in test environment.

### Recommendations
1. **(Recommended)** Investigate Monaco lifecycle in Electron test context
2. Add Monaco-specific test fixture with guaranteed initialization
3. Consider mocking Monaco for this specific test
4. Skip test with documentation if blocking release
```

**Enforcement**: AI agents that continue past three cycles without pausing violate this standard and the behavior should be reported.

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

## INTEGRATION TEST STRUCTURE (REFERENCE)

Integration specs commonly use:
- Fixtures: `tests/fixtures/**`
- Helpers: `tests/helpers/**`

Prefer DSL reuse for UI workflows when it improves consistency, but integration tests may legitimately validate lower-level behavior and error conditions with dedicated fixtures/helpers.

## COLOR PICKER TEST PATTERNS

### Use the Color Picker DSL

Use `ColorPickerDSL` for all color picker interactions; do not write selectors in specs.

Common flows:
- Closed state: assert the main input (`data-testid="<field>"`) is visible and has the right value.
- Open state: open via swatch (`<field>-swatch`) and assert the picker container (`<field>-picker`) is visible.
- Selection: type into the picker input (`<field>-picker-input`) and confirm with `Enter`.
- Recents: assert the recent colors list is present via ARIA role list and the swatch test ids.

## GRADIENT EDITOR TESTING PATTERNS

- Use `GradientEditorDSL` (`tests/support/dsl/gradientEditor.ts`) for all interactions; do not add raw selectors in specs.
- Open via `enableGradient()` and swatch (or `openGradientPopoverWithKeyboard`) to match real flow.
- Keyboard coverage: `tabToStop`, `tabToAngleInput`, `pressArrowKey`/`pressDelete`/`pressEnter`; expect focus with `expectStopFocused`.
- YAML round-trip: read/write via `YamlEditorDSL` scoped to Properties Panel; assert `background: linear|radial-gradient(...)` persists after switching tabs.
- Presets: prefer DSL helpers `savePreset`, `exportPresets`, `importPresets`, `applyPreset`; rely on built-in diagnostics attachments instead of adding waits.
- Accessibility: stop list should remain `role="listbox"` with `role="option"` rows; angle/position inputs must keep ARIA labels.

### Visual Regression Snapshots

If you add `toHaveScreenshot` expectations:
- Use stable names without escape-required characters.
- Disable animations and caret in screenshot options.
- Capture the smallest meaningful region (input control or popover container) to reduce flake.

### Keyboard Reachability

Avoid brittle tab-order assumptions when portals are involved (Ant Design popovers are rendered in a portal).
Instead:
- Focus a known starting element (e.g. swatch)
- Assert that expected controls are keyboard-reachable within a small bounded number of `Tab` presses via DSL helpers

---

## SKIPPED TESTS REGISTER (source of truth)

All skipped tests are tracked in `docs/testing/SKIPPED_TESTS_REGISTER.md`. Keep that file updated whenever a test is skipped or unskipped.

## Monaco / YAML Editor Verification (Properties Panel)

Failures we’ve seen: Monaco models not exposed to Playwright, multiple YAML containers (modal + properties) causing strict-mode locator conflicts, and virtualized `.view-lines` scraping returning incomplete content.

Correct approach (must follow):
1) Read YAML from the authoritative Monaco model:
   - Prefer explicit test handles: `window.__monacoModel` / `window.__monacoEditor`.
   - Otherwise, pick the editor whose `getContainerDomNode()` is inside the visible Properties Panel `[data-testid="yaml-editor-container"]` and has a non-zero bounding box.
   - Only as last resort, scrape `.view-lines` (log that you fell back).
2) Readiness: consider Monaco “ready” if any of these are true:
   - `window.__monacoModel?.getValue`
   - `window.__monacoEditor?.getModel?.()`
   - `window.monaco?.editor?.getModels()?.length > 0`
3) Diagnostics (required on failure, recommended on success):
   - Collect and attach JSON diagnostics: presence of explicit handles, editor/model counts and URIs, chosen editor path, container visibility/bounding box, scope hint (“properties” vs “modal”).
   - Stdout logging is optional and must be gated (use `PW_DEBUG=1` / `E2E_DEBUG=1`) unless you are logging during an error path (e.g., immediately before throwing).
4) Scoping:
   - Use locators scoped to the Properties Panel (`[data-testid="properties-panel"] [data-testid="yaml-editor-container"]`) to avoid strict-mode conflicts with modal YAML editors.
5) No timing hacks:
   - Do not add arbitrary `waitForTimeout`. Use `waitForFunction` with the readiness predicate above and modest timeouts (≤10s).

Reference implementation:
- See `tests/support/dsl/yamlEditor.ts` (Monaco-ready predicate, diagnostics, content selection) and the now-unskipped tests in `tests/e2e/color-picker.spec.ts` and `tests/e2e/gradient-editor.spec.ts`.

---

## Debug Logging & Diagnostics (E2E/Integration)

Debug logging is allowed, but must be **structured**, **gated**, and **attached** so it doesn’t become noise or brittle test logic.

Rules (mandatory):
1) **No raw DOM debug logic in specs**
   - Specs must not `evaluate()` the page to query arbitrary DOM for debugging (e.g., dumping `[data-testid]`).
   - If you need runtime diagnostics, add a DSL method or helper that collects and attaches diagnostics.
2) **Prefer attachments over stdout**
   - Use `testInfo.attach(...)` for all debug data (JSON/text). This keeps evidence with the failure in the HTML report.
   - Printing to stdout is optional and must not be the only record of diagnostics.
3) **Gate console output**
   - Unconditional `console.log` in specs is forbidden.
   - If stdout output is needed, gate it behind an env var (`PW_DEBUG=1` or `E2E_DEBUG=1`) and keep it minimal (one-line summaries).
4) **Keep debug output small and safe**
   - Attach only what’s necessary (IDs present, state summaries, selected mode, etc.).
   - Do not attach full DOM dumps unless a standard explicitly requires it (e.g., Monaco diagnostics).

Reference helper:
- `tests/support/helpers/debug.ts` (`attachDebugJson`, `debugLog`, gated stdout via `PW_DEBUG=1` / `E2E_DEBUG=1`)

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

---

## HAVDM ADVANCED FEATURES TESTING REQUIREMENTS (JANUARY 2026)

### Overview

All new advanced features (Phases 1-7) must meet enhanced testing standards to ensure quality and prevent regressions.

---

### Testing Matrix for New Features

| Feature Type | Unit Tests | E2E Tests | Visual Regression | Performance | Accessibility |
|-------------|-----------|-----------|-------------------|-------------|---------------|
| **Visual Components** (Color Picker, Gradients) | Required (95%+) | Required (DSL) | Required | Optional | Required |
| **Services/Utilities** (Font Service, Smart Actions) | Required (95%+) | Optional | N/A | Optional | N/A |
| **Complex Features** (Entity Remapping, Logic Editor) | Required (95%+) | Required (DSL) | Required | Required | Required |
| **Layout Components** (Carousel, Accordion) | Required (95%+) | Required (DSL) | Required | Required | Required |
| **Visualizations** (Graphs, Gauges) | Required (95%+) | Required (DSL) | Required | Required | Required |

---

### Feature-Specific DSL Requirements

New DSL modules MUST be created for:

1. **Color Picker** (`tests/support/dsl/colorPicker.ts`):
   - `openColorPicker()`
   - `selectColor(hex: string)`
   - `adjustHue(value: number)`
   - `selectRecentColor(index: number)`
   - `closeColorPicker()`

2. **Animation** (`tests/support/dsl/animation.ts`):
   - `selectAnimation(type: string)`
   - `configureAnimation(config: AnimationConfig)`
   - `previewAnimation()`
   - `verifyAnimationApplied()`

3. **Typography** (`tests/support/dsl/typography.ts`):
   - `selectFont(fontFamily: string)`
   - `adjustFontSize(size: string)`
   - `setFontWeight(weight: number)`
   - `verifyFontApplied()`

4. **Carousel** (`tests/support/dsl/carousel.ts`):
   - `addCarouselCard()`
   - `configureCarousel(config: CarouselConfig)`
   - `navigateSlide(direction: 'next' | 'prev')`
   - `verifySlideCount(count: number)`

5. **Entity Remapping** (`tests/support/dsl/entityRemapping.ts`):
   - `openRemappingDialog()`
   - `selectEntityMapping(oldEntity: string, newEntity: string)`
   - `applyRemapping()`
   - `verifyRemappingApplied()`

6. **Graphs** (`tests/support/dsl/graphs.ts`):
   - `addGraphCard(type: string)`
   - `configureGraph(config: GraphConfig)`
   - `verifyGraphData(expectedData: any[])`
   - `verifyGraphRendered()`

**Rule**: Every new user-facing feature interaction MUST have corresponding DSL methods. NO raw Playwright API calls in test specs.

---

### Visual Regression Standards

For features with visual components (Phases 1, 2, 4, 5):

1. **Baseline Screenshots Required**:
   - Component in default state
   - Component with user interactions (hover, focus, active)
   - Component with various configurations
   - Component in error state (if applicable)

2. **Comparison Threshold**: 0.1% pixel difference allowed
3. **Update Process**: Baselines updated only after manual review and approval
4. **Tools**: Playwright's built-in screenshot comparison

**Example Test**:
```typescript
test('Color Picker visual appearance', async () => {
  await dsl.cards.selectCard(0);
  await dsl.colorPicker.openColorPicker();

  // Baseline screenshot
  await expect(page.locator('[data-testid="color-picker"]')).toHaveScreenshot('color-picker-default.png');

  // With color selected
  await dsl.colorPicker.selectColor('#FF5733');
  await expect(page.locator('[data-testid="color-picker"]')).toHaveScreenshot('color-picker-selected.png');
});
```

---

### Performance Testing Standards

For performance-critical features (animations, graphs, carousels):

1. **Frame Rate Benchmarks**:
   - Animations must maintain 60fps (measure with `performance.now()`)
   - No dropped frames during carousel swiping
   - Graph rendering < 500ms for typical dataset (100 data points)

2. **Memory Benchmarks**:
   - No memory leaks over 100 interactions (use Chrome DevTools)
   - Max memory increase < 50MB for feature usage

3. **Load Time Benchmarks**:
   - Google Fonts loading < 200ms cached, < 2s uncached
   - Component initialization < 100ms
   - Swiper.js carousel load < 300ms

**Example Performance Test**:
```typescript
test('Animation maintains 60fps', async () => {
  await dsl.cards.selectCard(0);
  await dsl.animation.selectAnimation('fade-in');
  await dsl.animation.configureAnimation({ duration: 1000 });

  const metrics = await page.evaluate(() => {
    const frames: number[] = [];
    let lastTime = performance.now();

    function measureFrame() {
      const now = performance.now();
      frames.push(now - lastTime);
      lastTime = now;

      if (frames.length < 60) {
        requestAnimationFrame(measureFrame);
      }
    }

    requestAnimationFrame(measureFrame);

    return new Promise(resolve => {
      setTimeout(() => {
        const avgFrameTime = frames.reduce((a, b) => a + b) / frames.length;
        resolve({ avgFrameTime, fps: 1000 / avgFrameTime });
      }, 1100);
    });
  });

  expect(metrics.fps).toBeGreaterThan(55); // Allow slight variance
});
```

---

### Accessibility Testing Standards (WCAG 2.1 AA)

All new features MUST pass accessibility tests:

1. **Keyboard Navigation**:
   - Tab through all interactive elements
   - Activate elements with Enter/Space
   - Arrow keys for component-specific navigation (e.g., color picker)
   - Escape key to close modals/popups

2. **Screen Reader Compatibility**:
   - All interactive elements have ARIA labels
   - State changes announced (e.g., "Color selected: #FF5733")
   - Error messages read aloud

3. **Color Contrast**:
   - Minimum 4.5:1 for normal text
   - Minimum 3:1 for large text
   - Automated contrast checks in tests

4. **Motion Sensitivity**:
   - Animations disabled when `prefers-reduced-motion: reduce`
   - Alternative visual feedback provided

**Example Accessibility Test**:
```typescript
test('Color Picker keyboard navigation', async () => {
  await dsl.cards.selectCard(0);
  await dsl.colorPicker.openColorPicker();

  // Tab to color picker
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-testid="color-picker-hue"]')).toBeFocused();

  // Arrow keys to adjust hue
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');

  // Verify ARIA label updated
  const ariaLabel = await page.locator('[data-testid="color-picker-hue"]').getAttribute('aria-label');
  expect(ariaLabel).toContain('Hue');

  // Enter to confirm
  await page.keyboard.press('Enter');
  await dsl.colorPicker.closeColorPicker();
});

test('Animations respect prefers-reduced-motion', async () => {
  // Set prefers-reduced-motion
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await dsl.cards.selectCard(0);
  await dsl.animation.selectAnimation('fade-in');

  // Verify animation disabled
  const animationDuration = await page.evaluate(() => {
    const card = document.querySelector('[data-card-index="0"]');
    return getComputedStyle(card!).animationDuration;
  });

  expect(animationDuration).toBe('0s'); // Animation disabled
});
```

---

### Test Coverage Requirements

| Code Type | Coverage Target | Enforcement |
|-----------|----------------|-------------|
| **Services/Utilities** | 95%+ | CI blocks merge if below |
| **Components** | 90%+ | CI blocks merge if below |
| **Features** | 90%+ | CI blocks merge if below |
| **Integration/E2E** | All critical paths | Manual review required |

---

### Definition of Done (Testing)

A feature is NOT complete until:

- ✅ All unit tests passing (coverage targets met)
- ✅ All E2E tests passing (using DSL, no raw API calls)
- ✅ Visual regression tests passing (or baselines reviewed/approved)
- ✅ Performance benchmarks met (if applicable)
- ✅ Accessibility tests passing (WCAG 2.1 AA)
- ✅ No P0/P1 bugs outstanding
- ✅ Test documentation complete (README in feature folder)

---

### CI/CD Integration

All tests run automatically on:
- Every PR commit
- Before merge to main
- Nightly builds (full regression suite)

**CI Pipeline**:
1. Lint (ESLint + Prettier)
2. Unit tests (Jest + Vitest)
3. E2E tests (Playwright, headed mode for debugging on failure)
4. Visual regression tests (Playwright screenshots)
5. Performance tests (flagged if benchmarks not met)
6. Accessibility tests (axe-core + manual keyboard tests)

**Failure Policy**:
- Any test failure blocks merge
- Performance failures require manual review (may proceed with justification)
- Visual regression failures require baseline update approval

---

## MONACO EDITOR TESTING PATTERNS (CRITICAL)

### Global Window References for Monaco Models

**Issue**: Monaco editor instances in PropertiesPanel must be exposed to global scope for E2E tests to read content.

**Pattern** (from YamlEditor.tsx):
```typescript
// After creating Monaco editor
if (typeof window !== 'undefined') {
  (window as any).__monacoEditor = editor;
  (window as any).__monacoModel = editor.getModel();
}

// In cleanup
if (typeof window !== 'undefined') {
  delete (window as any).__monacoEditor;
  delete (window as any).__monacoModel;
}
```

**Applied to**: YamlEditor.tsx, PropertiesPanel.tsx (lines 177-181, 215-219, 234-238)

**DSL Access** (YamlEditorDSL.getEditorContent()):
```typescript
async getEditorContent(): Promise<string> {
  return await this.window.evaluate(() => {
    const model = (window as any).monaco?.editor?.getModels()[0];
    return model ? model.getValue() : '';
  });
}
```

**Using expect.poll() for Monaco Content**:
```typescript
// Wait for Monaco model to initialize before reading
await expect
  .poll(async () => yamlEditor.getEditorContent(), {
    timeout: 5000,
  })
  .not.toBe('');
```

**Known Limitation**: Some Monaco editor instances may not properly expose models to tests even with global references. If test consistently fails after multiple debugging attempts, skip test and document limitation.

---

## ANT DESIGN SELECT INTERACTION PATTERNS (CRITICAL)

Ant Design `<Select>` components render dropdown options in a portal outside the Select field. This creates several Playwright gotchas that have caused flaky tests.

### 1. Use `waitFor()` Not `isVisible()` for Dropdown Options

`isVisible()` returns `false` **immediately** when an element is not yet in the DOM — the timeout parameter is ignored for non-existent elements. For dropdown options that render asynchronously in a portal, always use `waitFor({state: 'visible'})`:

```typescript
// BAD — returns false immediately if option not yet in DOM
const found = await option.isVisible({ timeout: 2000 });

// GOOD — properly waits for DOM insertion then visibility
const found = await option
  .waitFor({ state: 'visible', timeout: 2000 })
  .then(() => true)
  .catch(() => false);
```

### 2. Combobox Input Location

The search input (`input[role="combobox"]`) lives inside the **Select field component**, NOT inside the dropdown portal (`.ant-select-dropdown`).

```typescript
// BAD — searches in the wrong place (dropdown portal)
const combobox = this.window.locator('.ant-select-dropdown:visible input[role="combobox"]');

// GOOD — searches inside the Select field itself
const combobox = selectField.locator('input[role="combobox"]');
```

### 3. Use `pressSequentially()` Not `keyboard.type()` for Search

`keyboard.type()` types into whatever is focused, character by character. With Ant Design's search-enabled Select, each keystroke triggers a search re-render. On WSL2 with IPC latency, typing a 31-character entity ID this way takes ~10 seconds. Use `pressSequentially()` on the specific combobox input instead:

```typescript
// BAD — 10+ seconds for long values due to per-keystroke re-renders
await this.window.keyboard.type('input_boolean.show_controls');

// GOOD — much faster, targets specific input
await combobox.pressSequentially(value, { delay: 0 });
```

### 4. Reference Pattern: `selectAntOption()`

The canonical helper for Ant Design Select interactions is in `ConditionalVisibilityDSL.selectAntOption()`. When writing new DSL methods that interact with Ant Design Selects, follow this pattern:

1. Click the Select field to open the dropdown
2. Try `waitFor()` on the desired option in the dropdown portal (fast path)
3. If not found, fall back to `pressSequentially()` on the combobox input inside the Select field
4. Press Enter to confirm

See `tests/support/dsl/conditionalVisibility.ts` for the reference implementation.

---

## COLOR PICKER TESTING PATTERNS

### Nested Component Test ID Strategy

**Pattern**: ColorPickerInput wraps ColorPicker in Ant Design Popover, creating nested structure:
- ColorPickerInput has testId: `button-card-color-input`
- Popover contains ColorPicker with testId: `button-card-color-input-picker`
- ColorPicker elements have `-picker` suffix: `button-card-color-input-picker-input`

**DSL Implementation**:
```typescript
getColorInput(testId = 'color-picker'): Locator {
  // For ColorPickerInput wrappers, the picker is at ${testId}-picker
  // and its input is at ${testId}-picker-input
  return this.window.getByTestId(`${testId}-picker-input`);
}
```

### Input Commit Behavior

**Pattern**: Form inputs should NOT commit on every keystroke - only on Enter/blur:
```typescript
const handleInputChange = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue); // Update local state only
    // Don't call onChange here - wait for Enter or blur
  },
  [disabled]
);
```

**Why**: Allows Escape key to revert uncommitted changes, follows standard form UX patterns.

### Invalid Input Handling

**Pattern**: Revert to last valid value on blur if input is invalid:
```typescript
const handleInputBlur = useCallback(() => {
  if (format === 'hex') {
    const validation = validateHex(inputValue);
    if (validation.valid && validation.normalized) {
      onChange?.(validation.normalized);
    } else {
      // Revert to last valid value if invalid
      setInputValue(value);
    }
  }
}, [inputValue, value]);
```

---

## SKIPPED TESTS REGISTRY

Tests that have been skipped after extensive debugging efforts. These represent known limitations or complex issues requiring future investigation.

| Test File | Test Name | Date Skipped | Reason | Reference |
|-----------|-----------|--------------|---------|-----------|
| `tests/e2e/color-picker.spec.ts` | "should update YAML when color is changed" | Jan 6, 2026 | Monaco editor model not detected by test despite global window references. Visual UI confirms YAML updates correctly. Multiple debugging attempts failed. | FOUNDATION_LAYER_IMPLEMENTATION.md |
| `tests/e2e/gradient-editor.spec.ts` | "gradient editor applies preset and persists to yaml" | Jan 7, 2026 | Playwright cannot reliably target the Properties Panel YAML editor when portals/duplicate YAML containers exist; manual runs show YAML updates correctly. Pending improved YAML editor detection. | UI_ENHANCEMENT_LAYER_IMPLEMENTATION.md |

**Policy**: Skipped tests MUST:
1. Include detailed comment explaining why test was skipped
2. Reference documentation with investigation details
3. Be reviewed quarterly for potential fixes
4. Not block feature deployment if functionality works manually

---

## FLAKINESS PREVENTION STANDARDS (NEW)

These are mandatory for Playwright E2E and shared DSL code.

### 13. Single E2E Harness Contract

E2E specs must use one launcher/readiness path:
- `launchWithDSL()` and `close(ctx)` from `tests/support/electron.ts`

Do not mix launcher contracts in E2E specs. If an exception is required, document it inline with rationale and removal condition.

### 14. No Sleep-Based Synchronization

For E2E and DSL layers:
- `waitForTimeout(...)` is forbidden as synchronization logic.
- Use state-based waits only (visibility, enabled, selected, attached, value/state convergence).
- Use `expect.poll(...)` for async persistence and eventual consistency checks.

### 15. DSL Readiness Contract Requirement

Every DSL method that changes UI state must validate readiness before returning:
- expected control/tab/panel is active
- dependent content is mounted and interactive
- failure includes actionable state snapshot details

### 16. Visual Assertion Stability Rules

Before `toHaveScreenshot`:
1. Ensure deterministic viewport and scale.
2. Disable animations/caret where applicable.
3. Assert target UI state has converged.

Snapshot baselines may be updated only after confirming behavior correctness from traces/screenshots.

### 17. Performance Assertion Stability Rules

Performance checks must avoid single-sample thresholds when host noise is significant.
- Prefer sampled windows and aggregate criteria.
- Keep thresholds tied to documented environment assumptions.

### 18. Flake Fix Verification Gate

Any flake fix must pass:
1. One targeted run with traces on failure
2. 5x targeted stability loop
3. One full-suite regression pass

Do not claim stabilization without these checks.

### 19. Regression Guardrail

Introduce/maintain a static check that fails CI when raw sleeps are added to `tests/e2e/**`, except approved debug-only files explicitly documented.

### 20. DSL Change Blast-Radius Check (MANDATORY)

When modifying a shared DSL method (any method in `tests/support/dsl/**` called by more than one spec), the developer or AI agent MUST:

1. **Identify all consuming specs** — grep for the method name across `tests/e2e/**` and `tests/integration/**`.
2. **Run all affected specs** before merging, not just the spec that motivated the change.
3. **If the consuming spec count exceeds 5**, run a full-suite regression pass before merging.

**Rationale**: In the 2026-02-07 regression, a single change to `ColorPickerDSL.openPopover()` caused 14 of 17 failures because 10+ specs depend on it. The change was tested only against the spec that motivated it.

**Enforcement**: Pull requests that modify shared DSL methods without evidence of consuming-spec validation should be rejected.

### 21. `keyboard.type()` Prohibition in DSL (MANDATORY)

`keyboard.type()` types into whatever element is currently focused, one character at a time. With Ant Design search-enabled components, each keystroke triggers re-renders. On WSL2 with IPC latency, this can take 10+ seconds for long values.

**Rule**: DSL methods MUST use `pressSequentially()` on a specific input locator instead of `keyboard.type()`:

```typescript
// BAD — types into focused element, one char at a time, triggers per-keystroke re-renders
await this.window.keyboard.type('input_boolean.show_controls');

// GOOD — targets specific input, much faster
await combobox.pressSequentially(value, { delay: 0 });
```

**Exception**: `keyboard.type()` is acceptable for Monaco editor text entry (different input model) and must be documented with a comment.

### 22. Popover/Portal Open Contract (MANDATORY)

DSL methods that open Ant Design Popovers must follow this contract:

1. **Scroll the trigger into view** before clicking: `await trigger.scrollIntoViewIfNeeded()`.
2. **Click the trigger element itself** (e.g., the swatch button), not a parent wrapper.
3. **Verify the popover is visible** after clicking.
4. **Fallback path must re-click the trigger**, not a different element:

```typescript
// BAD — fallback clicks wrapper div, which doesn't trigger popover
const input = this.window.getByTestId(inputTestId);  // wrapper <div>
await input.click({ force: true });

// GOOD — fallback re-clicks the actual trigger (swatch)
const retrySwatch = this.getColorSwatch(inputTestId);
await retrySwatch.scrollIntoViewIfNeeded();
await retrySwatch.click({ force: true });
```

5. **Flow-defensive close-and-retry**: If a blocking portal/dropdown is still open, send Escape, wait for it to close, then re-click the trigger:

```typescript
try {
  await this.expectVisible(testId);
} catch {
  await this.window.keyboard.press('Escape');
  await this.window.waitForFunction(
    () => document.querySelectorAll('.ant-popover:not(.ant-popover-hidden)').length === 0,
    null, { timeout: 2000 }
  ).catch(() => undefined);
  const retrySwatch = this.getColorSwatch(testId);
  await retrySwatch.scrollIntoViewIfNeeded();
  await retrySwatch.click({ force: true });
  await this.expectVisible(testId, 5000);
}
```

6. **Idempotency**: The open method must be safe to call when the popover is already open (check first, return early if visible).

### 23. `force: true` Click Rationale Requirement

Every `force: true` click in DSL code must include a one-line comment explaining why it is needed. `force: true` skips Playwright's visibility, stability, and hit-target checks. While it still scrolls into view and dispatches real DOM events, it can mask genuine bugs.

```typescript
// GOOD — documented rationale
// force: Ant Design swatch is behind transparent overlay during popover transition
await swatch.click({ force: true });

// BAD — no explanation
await swatch.click({ force: true });
```

**Prefer alternatives first**: `waitFor({ state: 'visible' })`, `scrollIntoViewIfNeeded()`, clicking a parent element, or `dispatchEvent('click')`.

---

## VISUAL SNAPSHOT STABILITY RULES (NEW)

These rules prevent visual regression test failures caused by subpixel rendering variance, not actual UI changes.

### 24. Dimension Swap Prevention

Element-based screenshots (`expect(locator).toHaveScreenshot()`) can produce 1px dimension swaps (e.g., 40x41 vs 41x40) due to subpixel bounding-box rounding. This fails the screenshot comparison even when the visual content is identical.

**Rule**: When a snapshot target's bounding box can vary by 1px due to font rasterization or subpixel layout:

1. Get the element's `boundingBox()` and compute a fixed-dimension `clip` with rounded coordinates.
2. Use `page.screenshot({ clip })` instead of `expect(locator).toHaveScreenshot()`.
3. This ensures deterministic pixel dimensions across runs.

```typescript
// BAD — element bounding box can shift by 1px between runs
await expect(icon).toHaveScreenshot('icon.png');

// GOOD — fixed clip from measured bounding box
const box = await icon.boundingBox();
const clip = {
  x: Math.floor(box!.x),
  y: Math.floor(box!.y),
  width: Math.ceil(box!.width) + 1,  // +1 to absorb rounding
  height: Math.ceil(box!.height) + 1,
};
await expect(page).toHaveScreenshot('icon.png', { clip });
```

### 25. Subpixel Drift Tolerance

For known subpixel drift in small decorative elements (e.g., pagination dots, focus rings), a small `maxDiffPixels` allowance is permitted ONLY in DSL methods, not in spec files.

Requirements:
- The drift must be understood and documented with a rationale comment.
- The value must be minimal (typically < 20 pixels).
- Prefer `maxDiffPixelRatio` for large screenshots and `maxDiffPixels` for small, bounded elements.

```typescript
// GOOD — in DSL, documented rationale
async expectPaginationScreenshot(name: string, cardIndex = 0): Promise<void> {
  await expect(pagination).toHaveScreenshot(name, {
    animations: 'disabled',
    caret: 'hide',
    // Allow minimal pixel drift from subpixel centering in pagination dots.
    maxDiffPixels: 10,
  });
}
```

### 26. Screenshot Environment Consistency

Visual regression baselines must be generated and compared within the same environment (OS, GPU, font renderer). Cross-environment comparisons (macOS vs Linux, local vs Docker) are inherently unreliable.

- Store baselines per-platform using Playwright's `{name}-{projectName}-{platform}.png` naming.
- Update baselines only after confirming behavior correctness from traces/screenshots.
- Never update baselines to "make the test pass" without understanding what changed.

---

## SHARED ANT DESIGN SELECT UTILITY (NEW)

### 27. Consolidate Ant Design Select Interaction Logic

Multiple DSL files implement their own Ant Design Select handling (attributeDisplay, backgroundCustomizer, conditionalVisibility, stateIcons). This leads to inconsistent patterns and regression when one is fixed but others aren't.

**Rule**: New DSL methods that interact with Ant Design `<Select>` components MUST use a shared utility. The canonical helper is `selectAntOption()` in `tests/support/dsl/conditionalVisibility.ts`. When a shared module is extracted, all existing DSLs must be migrated to it.

The shared pattern must:
1. Click the Select field to open the dropdown.
2. Try `waitFor({ state: 'visible' })` on the desired option in the dropdown portal (fast path).
3. If not found, fall back to `pressSequentially()` on the combobox input inside the Select field.
4. Press Enter to confirm.

Do NOT:
- Use `keyboard.type()` for Select search input.
- Use `isVisible()` to detect dropdown options (returns false immediately for non-DOM elements).
- Duplicate this logic across multiple DSL files.

---

## LONG TEST TIMEOUT JUSTIFICATION (STRENGTHENED)

### 29. Product Code Testability — Ant Design Rendering Stability (MANDATORY)

E2E test stability depends on product-code rendering stability. The most common cause of clustered E2E failures (5+ tests failing with "element detached from DOM") is **product code that destroys and recreates DOM** during React re-renders — not bad test selectors or timing.

When writing or modifying components that contain Ant Design `Tabs`, `Popover`, `Modal`, or other portal-based UI:

1. **Ant Design Tabs `items` must be memoized** — Never use inline `items={[...]}`. Wrap in `useMemo` with structural-only deps (e.g., `card?.type`, not `card`). See `ai_rules.md` Rule 8a.

2. **Popover state must survive parent re-renders** — If a Popover-based component lives inside Tabs or another container that may remount children, use a module-level popover state cache. See `ai_rules.md` Rule 8b.

3. **Memoize Popover content** — Wrap content passed to `<Popover content={...}>` in `useMemo` to prevent portal re-mount on every render. See `ai_rules.md` Rule 8e.

4. **Handlers in Tabs must use refs, not closures** — If a `useCallback` handler is in the dependency list of a tab memoization, it must use `useRef` for values that change on every render (e.g., the current card object). See `ai_rules.md` Rule 8c.

5. **No hooks after early returns** — `useMemo`, `useCallback`, `useState`, and `useEffect` must never be placed after a conditional `return`. This crashes the component. See `ai_rules.md` Rule 8d.

6. **Test for unmount/remount when adding components inside Tabs** — After adding a new Popover-based component to a tab panel, manually verify it survives a form value change without losing state. Add `useEffect(() => { console.log('mount'); return () => console.log('unmount'); }, [])` during development to confirm.

**Root cause reference**: The 2026-02-08 regression (17 failures → 0 after fix) was caused entirely by product code — `PropertiesPanel.tsx` passing an inline `items` array to `<Tabs>`, causing ColorPickerInput and GradientPickerInput to unmount/remount on every card property change. See `E2E_FAILURES_RCA.md` "Root Cause Analysis (2026-02-08)".

---

### 28. Measured-Runtime Documentation Requirement

When using `test.setTimeout()` for legitimately long tests (see Section 6 exception), the comment MUST include:

1. **What makes the test slow** — e.g., "Electron launch + 3 YAML round-trips + 2 AntD Select interactions".
2. **Measured execution time** — e.g., "Measured at ~65-75s on WSL2".
3. **The headroom calculation** — e.g., "Set to 100s (75s measured + 33% headroom)".

```typescript
// GOOD — fully justified
// This test performs: Electron launch (~8s) + dashboard create (~3s) + YAML round-trip (~5s)
// + 3 AntD Select interactions (~10s each on WSL2) + final assertions (~5s).
// Measured at ~55-65s on WSL2. Set to 100s (65s + 54% headroom).
test.setTimeout(100_000);

// BAD — arbitrary number, no rationale
test.setTimeout(120000);
```

---

**Last Updated**: February 8, 2026
**Next Review**: After Phase 4 completion (v0.5.0)
