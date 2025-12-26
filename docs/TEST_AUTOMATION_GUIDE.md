# Test Automation Guide
## HA Visual Dashboard Maker

This guide walks you through the complete testing infrastructure for the HA Visual Dashboard Maker, including automated testing, continuous integration, and best practices.

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Infrastructure](#testing-infrastructure)
3. [Running Tests](#running-tests)
4. [Test Types](#test-types)
5. [Writing New Tests](#writing-new-tests)
6. [Continuous Integration](#continuous-integration)
7. [Test Coverage](#test-coverage)
8. [Debugging Tests](#debugging-tests)
9. [Best Practices](#best-practices)
10. [Automation Strategies](#automation-strategies)

---

## Overview

The testing infrastructure uses **Playwright** to test the Electron application. Playwright provides reliable, fast, and comprehensive testing capabilities for desktop applications.

### Why Playwright?

- **Native Electron support** - Launch and control Electron apps programmatically
- **Cross-browser testing** - Test Chromium-based rendering
- **Rich API** - Comprehensive element selection, interaction, and assertion methods
- **Screenshots & Videos** - Visual regression testing capabilities
- **Debugging tools** - UI mode, inspector, and trace viewer
- **CI/CD ready** - Built-in reporters and parallelization

---

## Testing Infrastructure

### Directory Structure

```
tests/
├── e2e/                      # End-to-end tests (full user workflows)
│   ├── app-launch.spec.ts
│   ├── card-palette.spec.ts
│   └── dashboard-operations.spec.ts
├── integration/              # Integration tests (component interactions)
│   ├── yaml-operations.spec.ts
│   └── card-rendering.spec.ts
├── unit/                     # Unit tests (isolated functionality)
│   └── card-registry.spec.ts
├── fixtures/                 # Test data and sample files
│   ├── test-dashboard.yaml
│   └── layout-card-dashboard.yaml
├── helpers/                  # Test utilities and helpers
│   └── electron-helper.ts
└── screenshots/              # Test screenshots (gitignored)
```

### Configuration Files

- **`playwright.config.ts`** - Main Playwright configuration
- **`package.json`** - Test scripts and dependencies
- **`tsconfig.json`** - TypeScript configuration (shared with main app)

### Test Results

```
test-results/
├── html/                     # HTML test report
├── artifacts/                # Screenshots, videos, traces
├── screenshots/              # Named screenshots from tests
└── results.json              # JSON report for CI/CD
```

---

## Running Tests

### Quick Start

```bash
# Run all tests
npm test

# Run specific test type
npm run test:e2e           # End-to-end tests only
npm run test:integration   # Integration tests only
npm run test:unit          # Unit tests only

# Run tests with UI
npm run test:headed        # See the app while testing
npm run test:ui            # Playwright UI mode (best for development)

# Debug tests
npm run test:debug         # Step through tests with debugger

# View test report
npm run test:report        # Open HTML report in browser
```

### Detailed Commands

```bash
# Run specific test file
npx playwright test tests/e2e/app-launch.spec.ts

# Run specific test by name
npx playwright test -g "should launch the application"

# Run tests in parallel (not recommended for Electron)
npx playwright test --workers=2

# Run with verbose output
npx playwright test --reporter=list

# Update snapshots (for visual regression)
npx playwright test --update-snapshots
```

---

## Test Types

### 1. End-to-End (E2E) Tests

**Purpose**: Test complete user workflows from start to finish.

**Location**: `tests/e2e/`

**Examples**:
- Application launches successfully
- User can add cards from palette
- User can save and load dashboards
- All UI components render correctly

**When to write**: For critical user journeys and main features.

**Example**:
```typescript
test('should add card from palette to canvas', async () => {
  const { app, window } = await launchElectronApp();

  // Wait for app to be ready
  await waitForAppReady(window);

  // Click on button card in palette
  await window.locator('text=Button Card').click();

  // Verify card appears on canvas
  const cardsOnCanvas = await window.locator('.react-grid-item').count();
  expect(cardsOnCanvas).toBe(1);

  await closeElectronApp(app);
});
```

### 2. Integration Tests

**Purpose**: Test how multiple components work together.

**Location**: `tests/integration/`

**Examples**:
- YAML parsing and rendering
- Card registry with card renderers
- Properties panel updates card state
- Multi-view dashboard switching

**When to write**: For testing component interactions and data flow.

**Example**:
```typescript
test('should render entities card with proper structure', async () => {
  const { app, window } = await launchElectronApp();

  await waitForAppReady(window);

  // Add entities card
  await window.locator('text=Entities Card').click();

  // Verify card structure
  const cardContent = await window
    .locator('[class*="EntitiesCard"]')
    .count();
  expect(cardContent).toBeGreaterThan(0);

  await closeElectronApp(app);
});
```

### 3. Unit Tests

**Purpose**: Test isolated functions and utilities.

**Location**: `tests/unit/`

**Examples**:
- Card registry lookup functions
- YAML parsing utilities
- Layout calculations
- Data transformations

**When to write**: For pure functions and business logic.

**Example**:
```typescript
test('should categorize cards correctly', async () => {
  // Test the cardRegistry service
  const layoutCards = cardRegistry.getByCategory('layout');
  expect(layoutCards.length).toBeGreaterThan(0);

  const controlCards = cardRegistry.getByCategory('control');
  expect(controlCards.length).toBeGreaterThan(0);
});
```

---

## Writing New Tests

### Test Template

```typescript
/**
 * Test: [Feature Name]
 *
 * Description of what this test suite covers.
 */

import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, waitForAppReady } from '../helpers/electron-helper';

test.describe('[Feature Name]', () => {
  test('should [do something specific]', async () => {
    // 1. Setup - Launch app
    const { app, window } = await launchElectronApp();

    try {
      // 2. Arrange - Wait for app ready
      await waitForAppReady(window);

      // 3. Act - Perform user actions
      await window.locator('selector').click();

      // 4. Assert - Verify expected behavior
      const result = await window.locator('result-selector').count();
      expect(result).toBe(1);

      // 5. Optional - Take screenshot for documentation
      await window.screenshot({
        path: 'test-results/screenshots/feature-name.png'
      });
    } finally {
      // 6. Cleanup - Always close app
      await closeElectronApp(app);
    }
  });
});
```

### Best Practices for Writing Tests

#### 1. Use Descriptive Test Names

```typescript
// ❌ Bad
test('test 1', async () => { ... });

// ✅ Good
test('should display error message when invalid YAML is loaded', async () => { ... });
```

#### 2. Follow AAA Pattern

```typescript
test('example', async () => {
  // Arrange - Set up test conditions
  const { app, window } = await launchElectronApp();
  await waitForAppReady(window);

  // Act - Perform the action being tested
  await window.locator('text=Button Card').click();

  // Assert - Verify the result
  expect(await window.locator('.react-grid-item').count()).toBe(1);

  await closeElectronApp(app);
});
```

#### 3. Use Proper Selectors

```typescript
// ❌ Fragile - Breaks if CSS changes
window.locator('.ant-btn-primary')

// ✅ Better - Text-based (user-centric)
window.locator('text=Save Dashboard')

// ✅ Best - Test IDs (most stable)
window.locator('[data-testid="save-button"]')
```

#### 4. Handle Async Operations

```typescript
// ✅ Wait for elements to appear
await window.waitForSelector('.card-on-canvas', { state: 'visible' });

// ✅ Wait for animations to complete
await window.waitForTimeout(300);

// ✅ Wait for network/IPC calls
await window.waitForLoadState('networkidle');
```

#### 5. Always Clean Up

```typescript
test('example', async () => {
  const { app, window } = await launchElectronApp();

  try {
    // Test code here
  } finally {
    // Always close app, even if test fails
    await closeElectronApp(app);
  }
});
```

---

## Continuous Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Automated Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: windows-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run package

      - name: Run tests
        run: npm test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/
          retention-days: 30

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: screenshots
          path: test-results/screenshots/
          retention-days: 7
```

### CI Best Practices

1. **Always run tests before merging** - Set up branch protection rules
2. **Cache dependencies** - Use npm ci and cache node_modules
3. **Upload artifacts on failure** - Screenshots and traces help debug CI failures
4. **Set appropriate timeouts** - CI may be slower than local machines
5. **Run on multiple OS** - Test on Windows, macOS, Linux if distributing to all

### Local Pre-Commit Hook

Create `.husky/pre-commit`:

```bash
#!/bin/sh
npm run lint
npm run test:e2e
```

Install husky:
```bash
npm install -D husky
npx husky init
```

---

## Test Coverage

### Measuring Coverage

While Playwright doesn't provide built-in coverage for Electron apps, you can measure coverage using V8 coverage:

```typescript
// Add to electron-helper.ts
export async function startCoverage(window: Page) {
  await window.coverage.startJSCoverage();
}

export async function stopCoverage(window: Page) {
  const coverage = await window.coverage.stopJSCoverage();
  // Process coverage data
  return coverage;
}
```

### Coverage Goals

- **Critical paths**: 100% coverage (app launch, save/load, card adding)
- **UI components**: 80%+ coverage
- **Utilities**: 90%+ coverage
- **Error handling**: 70%+ coverage

---

## Debugging Tests

### 1. Playwright UI Mode (Recommended)

```bash
npm run test:ui
```

**Features**:
- Visual test runner
- Time-travel debugging
- Watch mode
- Filter and run specific tests
- View DOM snapshots

### 2. Debug Mode

```bash
npm run test:debug
```

**Features**:
- Pauses on each action
- Inspector shows selectors
- Console shows Playwright commands
- Step through tests manually

### 3. Headed Mode

```bash
npm run test:headed
```

**Features**:
- See the app window during tests
- Watch tests execute in real-time
- Useful for understanding failures

### 4. VS Code Debugging

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Playwright Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/@playwright/test/cli.js",
      "args": ["test", "--debug"],
      "console": "integratedTerminal"
    }
  ]
}
```

### 5. Screenshots and Traces

```typescript
// Take screenshot at any point
await window.screenshot({
  path: 'debug-screenshot.png',
  fullPage: true
});

// Start tracing
await context.tracing.start({ screenshots: true, snapshots: true });

// ... test actions ...

// Stop and save trace
await context.tracing.stop({ path: 'trace.zip' });
```

View trace:
```bash
npx playwright show-trace trace.zip
```

---

## Best Practices

### 1. Test Independence

```typescript
// ✅ Each test is independent
test.describe('Card Operations', () => {
  test('should add card', async () => {
    const { app, window } = await launchElectronApp();
    // Test logic
    await closeElectronApp(app);
  });

  test('should delete card', async () => {
    const { app, window } = await launchElectronApp();
    // Test logic - doesn't depend on previous test
    await closeElectronApp(app);
  });
});
```

### 2. Use Test Fixtures

```typescript
// tests/fixtures/dashboards.ts
export const simpleDashboard = {
  title: 'Simple Dashboard',
  views: [
    {
      title: 'Main',
      cards: [
        { type: 'button', entity: 'light.living_room' }
      ]
    }
  ]
};

// Use in tests
import { simpleDashboard } from '../fixtures/dashboards';
```

### 3. Page Object Model

```typescript
// tests/page-objects/CardPalettePage.ts
export class CardPalettePage {
  constructor(private window: Page) {}

  async searchCard(query: string) {
    await this.window.locator('input[placeholder*="Search"]').fill(query);
  }

  async addCard(cardName: string) {
    await this.window.locator(`text=${cardName}`).click();
  }

  async expandCategory(category: string) {
    await this.window.locator(`text=${category}`).click();
  }
}

// Use in tests
const cardPalette = new CardPalettePage(window);
await cardPalette.searchCard('button');
await cardPalette.addCard('Button Card');
```

### 4. Retry Flaky Tests

```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,  // Retry in CI

  // Or per-test
  test.describe('Flaky Feature', () => {
    test.describe.configure({ retries: 2 });

    test('sometimes fails', async () => {
      // Test logic
    });
  });
});
```

### 5. Custom Matchers

```typescript
// tests/helpers/custom-matchers.ts
export async function toHaveCard(window: Page, cardType: string) {
  const card = await window.locator(`[data-card-type="${cardType}"]`).count();
  return card > 0;
}

// Use in tests
expect(await toHaveCard(window, 'button')).toBe(true);
```

---

## Automation Strategies

### 1. Automated Regression Testing

Run full test suite before every release:

```json
// package.json
{
  "scripts": {
    "prerelease": "npm test && npm run lint",
    "release": "npm run make"
  }
}
```

### 2. Visual Regression Testing

```typescript
test('should match visual snapshot', async () => {
  const { app, window } = await launchElectronApp();

  await waitForAppReady(window);

  // Take baseline screenshot
  await expect(window).toHaveScreenshot('app-initial-state.png', {
    maxDiffPixels: 100  // Allow minor differences
  });

  await closeElectronApp(app);
});
```

Update baselines when UI changes:
```bash
npm test -- --update-snapshots
```

### 3. Performance Testing

```typescript
test('should load large dashboard in under 3 seconds', async () => {
  const { app, window } = await launchElectronApp();

  const startTime = Date.now();

  // Load large dashboard (100+ cards)
  await loadDashboard(window, 'large-dashboard.yaml');

  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000);

  await closeElectronApp(app);
});
```

### 4. Smoke Tests (Quick Validation)

```bash
# Run only critical tests
npx playwright test -g "should launch|should add card|should save"
```

Create smoke test suite:
```typescript
// tests/smoke/critical.spec.ts
test.describe('Smoke Tests', () => {
  test('app launches', async () => { ... });
  test('can add card', async () => { ... });
  test('can save dashboard', async () => { ... });
});
```

### 5. Scheduled Testing

Run tests nightly to catch environment issues:

```yaml
# .github/workflows/nightly-tests.yml
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily

jobs:
  test:
    runs-on: windows-latest
    steps:
      # ... test steps
```

### 6. Cross-Platform Testing

```yaml
# .github/workflows/test.yml
strategy:
  matrix:
    os: [windows-latest, macos-latest, ubuntu-latest]
runs-on: ${{ matrix.os }}
```

### 7. Automated Accessibility Testing

```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('should have no accessibility violations', async () => {
  const { app, window } = await launchElectronApp();

  await waitForAppReady(window);
  await injectAxe(window);

  const violations = await checkA11y(window);
  expect(violations.length).toBe(0);

  await closeElectronApp(app);
});
```

### 8. Data-Driven Testing

```typescript
const testCases = [
  { cardType: 'button', expectedSelector: '.ant-btn' },
  { cardType: 'entities', expectedSelector: '[class*="Entities"]' },
  { cardType: 'glance', expectedSelector: '[class*="Glance"]' },
];

testCases.forEach(({ cardType, expectedSelector }) => {
  test(`should render ${cardType} card correctly`, async () => {
    const { app, window } = await launchElectronApp();

    await waitForAppReady(window);
    await window.locator(`text=${cardType} Card`).click();

    const rendered = await window.locator(expectedSelector).count();
    expect(rendered).toBeGreaterThan(0);

    await closeElectronApp(app);
  });
});
```

### 9. Test Reporting Dashboard

Use Playwright's built-in HTML reporter or integrate with external tools:

```bash
# Generate and view HTML report
npm run test:report
```

For CI/CD, publish reports to:
- **GitHub Pages** - Host test results
- **Allure** - Advanced reporting
- **ReportPortal** - Test management platform

### 10. Parallel Test Execution (Advanced)

For larger test suites:

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 2 : 1,

  // Run tests in separate worker per file
  fullyParallel: false,
});
```

⚠️ **Note**: Electron apps should typically run serially (workers: 1) to avoid conflicts.

---

## Common Test Scenarios

### Testing File Dialogs

```typescript
// Mock file dialog in tests
test('should open dashboard file', async () => {
  const { app, window } = await launchElectronApp();

  // Listen for file chooser dialog
  const fileChooserPromise = window.waitForEvent('filechooser');

  // Trigger file open action
  await window.keyboard.press('Control+O');

  // Handle dialog
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles('tests/fixtures/test-dashboard.yaml');

  // Verify dashboard loaded
  await expect(window).toHaveTitle(/Test Dashboard/);

  await closeElectronApp(app);
});
```

### Testing Keyboard Shortcuts

```typescript
test('should save with Ctrl+S', async () => {
  const { app, window } = await launchElectronApp();

  await waitForAppReady(window);

  // Make a change
  await window.locator('text=Button Card').click();

  // Press Ctrl+S
  await window.keyboard.press('Control+S');

  // Verify save dialog or success message
  await window.waitForSelector('text=Dashboard saved');

  await closeElectronApp(app);
});
```

### Testing Drag and Drop

```typescript
test('should drag card from palette to canvas', async () => {
  const { app, window } = await launchElectronApp();

  await waitForAppReady(window);

  // Find source and target
  const source = window.locator('[data-card-type="button"]');
  const target = window.locator('.canvas-drop-zone');

  // Perform drag and drop
  await source.dragTo(target);

  // Verify card appeared
  const cardsOnCanvas = await window.locator('.react-grid-item').count();
  expect(cardsOnCanvas).toBe(1);

  await closeElectronApp(app);
});
```

### Testing Error States

```typescript
test('should show error on invalid YAML', async () => {
  const { app, window } = await launchElectronApp();

  await waitForAppReady(window);

  // Load invalid YAML
  await loadInvalidYAML(window);

  // Verify error message appears
  await expect(window.locator('.ant-message-error')).toBeVisible();
  await expect(window.locator('text*=Invalid YAML')).toBeVisible();

  await closeElectronApp(app);
});
```

---

## Troubleshooting

### Tests Timing Out

```typescript
// Increase timeout for slow operations
test('slow operation', async () => {
  test.setTimeout(120000);  // 2 minutes

  // ... test code
});
```

### Flaky Tests

1. Add explicit waits
2. Use retry logic
3. Check for race conditions
4. Ensure test independence

### Screenshots Not Capturing

```typescript
// Ensure directory exists
await window.screenshot({
  path: 'test-results/screenshots/test.png',
  fullPage: true
});
```

### CI Tests Failing Locally Pass

1. Check environment differences (CI vs local)
2. Verify dependencies are the same
3. Check for hardcoded paths
4. Review CI logs and screenshots

---

## Summary

This testing infrastructure provides:

✅ **Comprehensive coverage** - E2E, integration, and unit tests
✅ **Easy to run** - Simple npm commands
✅ **CI/CD ready** - GitHub Actions integration
✅ **Debugging tools** - UI mode, inspector, traces
✅ **Visual regression** - Screenshot comparison
✅ **Extensible** - Easy to add new tests

**Next Steps**:

1. Run initial test suite: `npm test`
2. Review test results: `npm run test:report`
3. Add tests for new features as you build them
4. Set up CI/CD with GitHub Actions
5. Establish coverage goals and track progress

---

**Questions or Issues?**

- Review test examples in `tests/` directory
- Check Playwright docs: https://playwright.dev
- Open an issue on GitHub: https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker/issues
