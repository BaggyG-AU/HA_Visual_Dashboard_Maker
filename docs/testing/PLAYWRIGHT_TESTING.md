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
- If Electron fails to launch with an error like `bad option: --remote-debugging-port=0`, ensure `ELECTRON_RUN_AS_NODE` is not set in the environment (this repo’s Electron launchers remove it defensively).

## Standards

See `docs/testing/TESTING_STANDARDS.md` for required conventions (selectors, waits, DSL boundaries, mocking rules).
If you are using an AI agent, see `ai_rules.md` for the execution/reporting workflow (including the “one test run then pause/diagnose/ask” rule).
