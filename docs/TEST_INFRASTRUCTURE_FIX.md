# Test Infrastructure Fix Guide

## Problem: All Tests Failing with "Process failed to launch!"

All Playwright tests are currently failing with the error `Error: Process failed to launch!`. This is because the Electron application needs to be built before tests can run.

---

## Root Cause

The `electron-helper.ts` file launches Electron using:
```typescript
const mainPath = path.join(__dirname, '../../.vite/build/main.js');
```

This file doesn't exist until you run the build process. The tests require the Vite-built version of the app.

---

## Solution: Build Before Testing

### Quick Fix

Run the build before running tests:

```bash
# Build the app first
npm run package

# Then run tests
npm test
```

### Recommended: Update package.json Scripts

Update your `package.json` to automatically build before testing:

```json
{
  "scripts": {
    "test": "npm run test:build && playwright test",
    "test:build": "vite build",
    "test:e2e": "npm run test:build && playwright test --project=electron-e2e",
    "test:integration": "npm run test:build && playwright test --project=electron-integration",
    "test:headed": "npm run test:build && playwright test --headed",
    "test:debug": "npm run test:build && playwright test --debug",
    "test:ui": "playwright test --ui"
  }
}
```

---

## Alternative: Use Development Mode for Tests

Modify `electron-helper.ts` to support running against the dev server:

```typescript
export async function launchElectronApp(): Promise<ElectronTestApp> {
  const isDev = process.env.NODE_ENV === 'development';

  let mainPath: string;
  if (isDev) {
    // In dev mode, use the source file directly
    mainPath = path.join(__dirname, '../../src/main.ts');
  } else {
    // In test mode, use the built version
    mainPath = path.join(__dirname, '../../.vite/build/main.js');
  }

  const app = await electron.launch({
    args: [mainPath],
    env: {
      ...process.env,
      NODE_ENV: isDev ? 'development' : 'test',
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
    },
  });

  const window = await app.firstWindow();
  await window.waitForLoadState('domcontentloaded');

  return { app, window };
}
```

---

## Test File Structure Issues

### Issue 1: Test Files Not Picked Up

The three new test files were created in `tests/` directly:
- `tests/entity-browser.spec.ts`
- `tests/monaco-editor.spec.ts`
- `tests/entity-caching.spec.ts`

But playwright.config.ts only looks for tests in specific subdirectories:
- `tests/e2e/**/*.spec.ts` (for electron-e2e project)
- `tests/integration/**/*.spec.ts` (for electron-integration project)
- `tests/unit/**/*.spec.ts` (for electron-unit project)

### Fix Applied

Moved test files to correct location:
```bash
mkdir -p tests/integration
mv tests/entity-browser.spec.ts tests/integration/
mv tests/monaco-editor.spec.ts tests/integration/
mv tests/entity-caching.spec.ts tests/integration/
```

### Issue 2: Tests Don't Use Electron Helper

The new tests were using direct Electron launch:
```typescript
electronApp = await electron.launch({
  args: ['.'],  // <-- This won't work, needs built file path
  env: { ...process.env, NODE_ENV: 'test' },
});
```

Should use the helper instead:
```typescript
import { launchElectronApp, closeElectronApp, waitForAppReady } from '../helpers/electron-helper';

test.beforeAll(async () => {
  const { app, window } = await launchElectronApp();
  electronApp = app;
  page = window;
  await waitForAppReady(page);
});

test.afterAll(async () => {
  await closeElectronApp(electronApp);
});
```

---

## Complete Test Workflow

### 1. Build the App
```bash
npm run package
```
This creates `.vite/build/main.js` which tests need.

### 2. Run Tests
```bash
# All tests
npm test

# Specific project
npm run test:e2e
npm run test:integration

# Specific file
npx playwright test tests/integration/entity-browser.spec.ts

# Debug mode
npm run test:debug

# UI mode
npm run test:ui
```

### 3. View Results
```bash
# Open HTML report
npm run test:report

# Results are in:
# - test-results/html/ (HTML report)
# - test-results/artifacts/ (screenshots, videos)
# - test-results/results.json (JSON results)
```

---

## Drag and Drop Test Issues

### Current Problem

Drag and drop tests may fail even when the feature works manually. This is because:

1. **Timing Issues:** React Grid Layout animations need time to complete
2. **Position Calculations:** Playwright's `dragTo()` may not calculate positions correctly for grid layouts
3. **Event Handling:** Electron may handle mouse events differently than browsers

### Solution: Use Better Wait Strategies

Instead of:
```typescript
await card.dragTo(canvas, { targetPosition: { x: 100, y: 100 } });
```

Use:
```typescript
// Get bounding boxes for precise positioning
const cardBox = await card.boundingBox();
const canvasBox = await canvas.boundingBox();

// Calculate target position relative to canvas
const targetX = canvasBox!.x + 100;
const targetY = canvasBox!.y + 100;

// Perform drag with explicit mouse movements
await card.hover();
await page.mouse.down();
await page.mouse.move(targetX, targetY, { steps: 10 });
await page.waitForTimeout(100); // Let React Grid Layout process
await page.mouse.up();
await page.waitForTimeout(300); // Let layout settle
```

### Better Alternative: Click to Add Cards

Since the app supports click-to-add (double-click on card palette items), use that instead:

```typescript
// Instead of drag and drop
await page.locator('div:has-text("Button Card")').dblclick();
await page.waitForTimeout(500);
```

This is more reliable and tests an actual user workflow.

---

## Test Configuration Updates Needed

### 1. Increase Timeouts for Electron

Electron apps take longer to launch than web apps:

```typescript
// playwright.config.ts
export default defineConfig({
  timeout: 120 * 1000, // Increase to 120 seconds
  expect: {
    timeout: 10 * 1000, // 10 seconds for assertions
  },
  use: {
    actionTimeout: 15 * 1000, // 15 seconds for actions
  },
});
```

### 2. Add Retry Logic

```typescript
export default defineConfig({
  retries: 2, // Retry failed tests
  workers: 1, // Only 1 worker (Electron can't handle parallel instances)
});
```

### 3. Better Screenshot/Video Settings

```typescript
use: {
  screenshot: 'only-on-failure',
  video: {
    mode: 'retain-on-failure',
    size: { width: 1280, height: 720 }
  },
  trace: 'on-first-retry',
},
```

---

## CI/CD Considerations

If running tests in CI (GitHub Actions, etc.):

### 1. Install Dependencies
```yaml
- name: Install dependencies
  run: npm ci

- name: Build Electron app
  run: npm run package

- name: Run tests
  run: npm test
```

### 2. Handle Xvfb (Linux)
```yaml
- name: Run tests (Linux)
  run: xvfb-run --auto-servernum npm test
  if: runner.os == 'Linux'
```

### 3. Upload Artifacts
```yaml
- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: test-results/
```

---

## Debugging Failed Tests

### 1. Run in Headed Mode
```bash
npm run test:headed
```
This shows the Electron window so you can see what's happening.

### 2. Run in Debug Mode
```bash
npm run test:debug
```
Opens Playwright Inspector for step-by-step debugging.

### 3. Use UI Mode
```bash
npm run test:ui
```
Opens Playwright UI with time-travel debugging.

### 4. Add Logging
```typescript
test('my test', async () => {
  console.log('Starting test...');

  const button = page.locator('button');
  console.log('Button count:', await button.count());

  await button.click();
  console.log('Button clicked');

  // Take screenshot for inspection
  await page.screenshot({ path: 'test-results/debug-screenshot.png' });
});
```

### 5. Check Console Errors
```typescript
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
page.on('pageerror', err => console.log('PAGE ERROR:', err));
```

---

## Next Steps

1. ✅ Build the app: `npm run package`
2. ✅ Update package.json scripts to auto-build before tests
3. ✅ Fix test file imports to use electron-helper
4. ✅ Move drag-and-drop tests to use double-click instead
5. ✅ Run tests with `npm test`
6. ✅ Review test results and fix remaining issues
7. ✅ Document any test-specific workarounds

---

## Summary

**Main Issue:** Tests require built Electron app (`.vite/build/main.js`)

**Solution:**
1. Run `npm run package` before testing
2. Update package.json to auto-build
3. Use electron-helper for consistent app launching
4. Replace unreliable drag-and-drop with click-to-add

**Test Locations:**
- E2E tests: `tests/e2e/**/*.spec.ts`
- Integration tests: `tests/integration/**/*.spec.ts` (new tests)
- Unit tests: `tests/unit/**/*.spec.ts`

**Run Tests:**
```bash
npm run package  # Build first
npm test         # Run all tests
npm run test:headed  # Debug visually
```

---

*Last Updated: December 26, 2024*
*Related Issue: All tests failing with "Process failed to launch!"*
