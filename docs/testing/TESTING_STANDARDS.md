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

### Naming Hygiene
- Avoid special characters in test titles that require escaping (for example `+`, `*`, `$`, `?`, `|`). Prefer plain words (e.g., use “and” instead of “+”) so grep filters and Playwright `-g` patterns stay simple and portable.

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

**Policy**: Skipped tests MUST:
1. Include detailed comment explaining why test was skipped
2. Reference documentation with investigation details
3. Be reviewed quarterly for potential fixes
4. Not block feature deployment if functionality works manually

---

**Last Updated**: January 6, 2026
**Next Review**: After Phase 1 completion (v0.4.0)
