# Playwright Testing

Playwright covers Electron integration and e2e workflows. Tests run with isolated user-data directories and shared DSL helpers under `tests/support`.

## Quick start

```bash
# Integration (Electron) suite with traces on failure
npx playwright test --project=electron-integration --reporter=list --workers=1 --trace=retain-on-failure

# E2E smoke (same app, less mocking)
npx playwright test --project=electron-e2e --reporter=list --workers=1 --trace=retain-on-failure

# Single test or pattern
npx playwright test tests/integration/entity-browser.spec.ts:262 --project=electron-integration --reporter=list --workers=1 --trace=retain-on-failure
```

Artifacts: `test-results/artifacts/...`. Open traces with `npx playwright show-trace <trace.zip>`.

## DSL essentials

Import from `tests/support`:

- `launchWithDSL()` → launches Electron with isolated storage and returns `{ app, window, userDataDir, appDSL, entityBrowser, yamlEditor, ... }`.
- `close(ctx)` → cleans up app and temp dirs.
- Electron launcher lives in `tests/support/electron.ts`; DSL classes in `tests/support/dsl/*`.

Use DSL methods for interaction and waits (palette/card selection, YAML editor, entity browser). Avoid raw `waitForTimeout` in specs.

## Mocking patterns

- HA connection/entities: `simulateHAConnection`, `mockHAEntities`, `mockHAWebSocket` (see `tests/helpers/mockHelpers.ts`).
- IPC stubbing:
  - Prefer the existing pattern of stubbing main-process IPC handlers via `electronApp.evaluate(({ ipcMain }, ...) => ipcMain.handle/removeHandler(...))`.
  - There is a helper for failure cases: `stubIpcFailure` (see `tests/helpers/mockHelpers.ts` and usage in integration specs).
- Monaco/YAML: `YamlEditorDSL` helpers for opening modal, inserting entities, validation checks.

Prefer enabling mocks in `beforeEach` inside specs; keep data sets small/deterministic.

## Troubleshooting

- If UI is blank, confirm main window selection via `launchWithDSL` (it filters DevTools windows).
- Check `test-results/artifacts` screenshots + traces for selectors; rely on `data-testid` from DSL.
- Common helpers: `entityBrowser.open()`, `entityBrowser.expectClosed()`, `yamlEditor.expectValidationError()`, `appDSL.waitUntilReady()`.
- Storage isolation: each test auto-creates a temp user data dir; no manual cleanup needed beyond `close(ctx)`.
- If Electron fails to launch with an error like `bad option: --remote-debugging-port=0`, ensure `ELECTRON_RUN_AS_NODE` is not set in the environment (this repo's Electron launchers remove it defensively).

### Ant Design Popover Not Opening

If a color picker, gradient editor, or other Ant Design Popover isn't opening:

1. **Check if another portal is blocking**: Open traces and look for visible `.ant-select-dropdown` or `.ant-popover` elements. An orphaned dropdown from a previous interaction can intercept clicks. Fix: send `Escape` and wait for portal to close before retrying.
2. **Check if the trigger is scrolled out of view**: The DSL must call `scrollIntoViewIfNeeded()` on the trigger (e.g., swatch button) before clicking. Without this, `force: true` clicks may dispatch to coordinates outside the visible container.
3. **Check if the fallback clicks the wrong element**: The fallback must click the same trigger element (e.g., swatch), not a parent wrapper `<div>`. Clicking a wrapper `<div>` does not trigger Ant Design Popover open logic.
4. **Check for CSS transition interference**: Ant Design hides popovers with `ant-popover-hidden` class. During leave transitions, the popover may be "visible" but not interactive. Use `waitFor({ state: 'hidden' })` on the old popover before opening a new one.

### Clustered Failures Point to Shared DSL

If 5+ tests fail in a single regression run with similar error patterns (e.g., "popover not visible", "timeout waiting for option"):

1. **Stop editing specs.** This is a shared DSL regression (TESTING_STANDARDS.md Standard #10).
2. **Identify the common DSL method** by comparing stack traces across failures.
3. **Check git diff** on that DSL method since the last passing run.
4. **Fix the DSL method once**, then re-run all affected specs.
5. **Run blast-radius check**: `grep -r "methodName" tests/e2e/ tests/integration/` to find all consumers.

### PropertiesPanel Child Components Losing State

If color pickers, gradient editors, or other Popover-based components lose state (popover closes, input clears, focus lost) immediately after an `onChange`:

1. **Check if the component is inside memoized Tabs items** — `PropertiesPanel.tsx` wraps tab content in `useMemo` with structural-only deps. If a new component is added outside the memo, or the memo dependencies include full object references (e.g., `card` instead of `card?.type`), the component will unmount and remount on every form change, destroying all local state.

2. **Check popover state cache** — Components with Popovers inside Tabs must use the module-level `popoverStateCache` pattern. See `ColorPickerInput.tsx` or `GradientPickerInput.tsx` for reference implementations.

3. **Check Popover content memoization** — Content passed to `<Popover content={...}>` must be wrapped in `useMemo`. Without this, the portal DOM is recreated on every render.

4. **Verify with lifecycle logging** — Add `useEffect(() => { console.log('mount'); return () => console.log('unmount'); }, [])` temporarily to confirm the component survives re-renders triggered by `onChange`.

5. **Root cause pattern** — The error pattern is: Playwright clicks/fills an element → `onChange` fires → parent re-renders → Tabs items reference changes → child unmounts/remounts → original DOM node is destroyed → Playwright fails with "element was detached from the DOM, retrying". This is a **product code issue**, not a test issue. Fix the product code (memoize Tabs items); do not add test workarounds.

See `ai_rules.md` Rule 8 and `TESTING_STANDARDS.md` Standard #29 for the required patterns.

### Carousel Autoplay Flakiness

If `carousel.spec.ts` autoplay test fails intermittently:

1. **Increase polling timeout** or use Playwright's Clock API for deterministic timer control.
2. **Ensure card is deselected** before checking autoplay — Swiper pauses autoplay when the card is selected.
3. **Check autoplay delay** in the YAML fixture. Short delays (< 1000ms) are unreliable under full-suite load on WSL2.

## Flakiness Stabilization Runbook

Use this workflow for timeout-heavy or cross-spec flaky failures.

1. Confirm harness consistency:
   - E2E specs should use `launchWithDSL()` and `close(ctx)`.
2. Remove sleep-driven waits:
   - Replace `waitForTimeout` with state-based DSL waits and `expect.poll`.
3. Fix at abstraction boundary:
   - If many failures point to one helper/DSL method, fix that method first.
4. Preserve diagnostics:
   - Keep `--trace=retain-on-failure`.
   - Attach state metadata (`testInfo.attach`) for hard-to-reproduce readiness issues.
5. Stabilize before broad reruns:
   - Run targeted 1x, then targeted 5x loop, then full suite.
6. Run guardrails before signoff:
   - `npm run test:e2e:guardrails`

### Recommended Commands

```bash
# Targeted with trace
npx playwright test <spec-or-grep> --project=electron-e2e --workers=1 --trace=retain-on-failure

# Stability loop (Linux/macOS)
for i in 1 2 3 4 5; do npx playwright test <spec-or-grep> --project=electron-e2e --workers=1 --trace=retain-on-failure || break; done

# Stability loop (PowerShell)
1..5 | ForEach-Object { npx playwright test <spec-or-grep> --project=electron-e2e --workers=1 --trace=retain-on-failure; if ($LASTEXITCODE -ne 0) { break } }

# Full E2E regression
npx playwright test --project=electron-e2e --workers=1 --trace=retain-on-failure
```

### Artifact Review

```bash
# Open an individual failure trace
npx playwright show-trace test-results/artifacts/<failure-dir>/trace.zip
```

## CI Loop Test (Flakiness Focus)

Use this when you need a CI-style repeat full pass to surface intermittent failures.
The goal is to identify tests that pass in one run and fail in another, then focus
diagnosis on the tests and helpers that are inconsistent. When diagnosing flakes,
review relevant specs, DSL/helpers, and product code as needed, and research online
before proposing fixes.

### Command

```bash
for i in 1 2 3; do
  echo "===== FULL SUITE LOOP $i ====="
  npx playwright test --project=electron-e2e --workers=1 --trace=retain-on-failure || break
done
```

### How to Use Results

1. Compare pass/fail across loops and list any tests that are inconsistent.
2. For each inconsistent test, inspect traces/screenshots and then:
   - reuse existing patterns in `tests/support/dsl/**` before creating new helpers
   - validate selectors/waits against `docs/testing/TESTING_STANDARDS.md`
   - consider product behavior if the UI is inconsistent
   - research online for framework-specific issues (Playwright/Electron/AntD)
3. Propose fixes that address root causes (not just timing).

## Standards

See `docs/testing/TESTING_STANDARDS.md` for required conventions (selectors, waits, DSL boundaries, mocking rules).
If you are using an AI agent, see `ai_rules.md` for the execution/reporting workflow (including the “one test run then pause/diagnose/ask” rule).
