---
name: playwright-electron-testing
description: Implement reliable Playwright end-to-end tests for Electron + React + TypeScript apps. Focus on robust selectors, Monaco editor interactions, storage/profile isolation, React hydration timing, and multi-window Electron launch fixtures.
---

## ⚠️ CRITICAL RULE: TEST-CYCLE BUDGET — 3 ROUNDS, THEN STOP

You **may** run tests, but you are capped at **three rounds per authorization**,
to prevent endless test→fix→test loops:

1. **Round 1 — run.** Run the suite (headless under Xvfb — see the
   `headless-electron-testing` guidance; full run → background + poll).
2. **Round 2 — remediate.** Fix the failures.
3. **Round 3 — run + report.** Run the suite once more, then **REPORT** the
   result to the user.

**Then STOP.** Do **not** start another test→remediate→test cycle. If the results
still need work, say so and **ask the user to authorize another cycle** — do not
loop on your own. The budget **resets** only when the user authorizes a new cycle.

Notes:

- A single quick red-before-green check while _writing_ a fix (run one new test to
  see it fail on base, then pass) is part of authoring, not the remediate loop —
  but stay economical; don't let it become a back-door loop.
- "Run" means a validation run of the relevant suite/spec. Prefer the narrowest
  scope that proves the point; reserve the full ~14–19 min electron-e2e for
  deploy/canvas/UI-render or `PropertiesPanel` changes.
- Always run tests **headless under Xvfb** on this WSL2 host so windows don't
  steal focus (`npm run test:e2e:headless`).

---

# Playwright Electron Testing (Electron + React + TypeScript)

You are implementing Playwright-based automated tests for an Electron desktop app that uses React + TypeScript (often Electron Forge + Vite).

**Goal:** Reliable, flake-resistant tests. Explicitly handle Electron window selection, React hydration timing, Monaco editor quirks, and storage/profile consistency.

---

## Core principles (non-negotiable)

1. **Use `@playwright/test`** (fixtures, `expect`, locators). Do not invent a custom runner.
2. **Trace on failure is mandatory** (`trace: 'on-first-retry'` or `'retain-on-failure'`) because Electron flakes are otherwise impossible to diagnose.
3. **Explicit window management**: NEVER assume the first window is the main app window.
4. **No “sleep fixes”**: Do not use `waitForTimeout()` except as a last-resort diagnostic aid.
5. **Prefer user-first locators** (`getByRole`, `getByLabel`, `getByText`) and stable test IDs for non-semantic UI.
6. **Monaco Editor rules (mandatory)**:
   - NEVER load Monaco via CDN (`cdn.jsdelivr`, `unpkg`, etc.)
   - NEVER use `vs/loader.js` or AMD `require.config`
   - ALWAYS bundle Monaco locally using ESM imports
   - ALWAYS explicitly wire Monaco workers (`MonacoEnvironment.getWorker`)
   - Assume Electron CSP blocks all remote scripts by default
7. **Test selectors policy**:
   - All non-semantic UI (cards, grids, panels, modals) MUST expose `data-testid`
   - Tests MUST prefer `getByTestId()` over CSS or text selectors
   - Do NOT rely on Ant Design or React Grid Layout class names
8. **Renderer diagnostics (mandatory in E2E)**:
   - Attach listeners for:
     - `page.on('console')`
     - `page.on('pageerror')`
     - `page.on('requestfailed')`
   - Tests must surface CSP, worker, and asset-loading failures

Playwright locator best practices + testId configuration exist; use them. (See official docs.)

---

## Phase 1: Repo inspection (do this first)

Before writing tests, scan the repo to answer:

1. **Launch method**
   - Dev mode (`electron .` / `vite dev` / `electron-forge start`) vs packaged exe.
2. **Window logic**
   - Search `main.ts` for `new BrowserWindow()` and identify splash vs main window.
3. **URL / load target**
   - Does renderer load `file://` or `http://localhost:<port>`?
4. **Storage + auth**
   - Where does auth state live? localStorage? IndexedDB? cookies? file store?

---

## Phase 2: The “Golden” Electron fixture

Most failures are brittle setup. Create a reusable fixture (e.g. `e2e/fixtures/electron.ts`) that:

- launches the app
- selects the correct window (splash-safe)
- waits for _app ready_ (not just DOM loaded)
- provides a clean profile for each run (or at least each worker)

### Golden fixture template (adapt paths to your repo)

```ts
import {
  _electron as electron,
  ElectronApplication,
  Page,
  test as base,
  expect,
} from '@playwright/test';
import path from 'path';
import os from 'os';
import fs from 'fs';
import crypto from 'crypto';

type TestFixtures = {
  electronApp: ElectronApplication;
  page: Page; // main app window
};

function mkTempUserDataDir() {
  const dir = path.join(os.tmpdir(), `pw-electron-${crypto.randomBytes(8).toString('hex')}`);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function waitForAppReady(page: Page) {
  // Replace with a *single* canonical readiness condition.
  // This should be a stable “app shell” locator that exists only when React is hydrated.
  await expect(page.getByTestId('app-shell')).toBeVisible({ timeout: 15000 });
}

export const test = base.extend<TestFixtures>({
  electronApp: async ({}, use) => {
    const mainPath = path.join(__dirname, '..', '..', 'dist-electron', 'main.js'); // verify in repo
    const userDataDir = mkTempUserDataDir();

    const app = await electron.launch({
      args: [
        mainPath,
        // Profile isolation to avoid storage mismatches between tests/runs:
        `--user-data-dir=${userDataDir}`,
      ],
      env: { ...process.env, NODE_ENV: 'test', E2E: '1' },
    });

    await use(app);
    await app.close();
  },

  page: async ({ electronApp }, use) => {
    // Splash screen defense: window may not be first, or may be same window that later navigates.
    let page: Page | null = null;

    // First try: wait for a window that matches “main app” heuristics.
    // If your app uses a single window that navigates, handle that too.
    page = await electronApp.waitForEvent('window', async (p) => {
      const url = p.url();
      return url.includes('index.html') || url.includes('localhost');
    });

    // Base load state is NOT “app ready”. Hydration must be awaited separately.
    await page.waitForLoadState('domcontentloaded');

    // Canonical readiness signal.
    // If you cannot add data-testid yet, use getByRole / getByText against a stable landmark element.
    await waitForAppReady(page);

    await use(page);
  },
});
```
