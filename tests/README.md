# Test Suite
## HA Visual Dashboard Maker

This directory contains the automated test suite for the HA Visual Dashboard Maker.

---

## Quick Start

```bash
# Run all tests
npm test

# Run with UI (recommended for development)
npm run test:ui

# Run specific test type
npm run test:e2e
npm run test:integration
npm run test:unit
```

---

## Directory Structure

```
tests/
├── e2e/                      # End-to-end tests (full user workflows)
├── integration/              # Integration tests (component interactions)
├── unit/                     # Unit tests (isolated functionality)
├── fixtures/                 # Test data and sample files
├── helpers/                  # Test utilities and helpers
└── README.md                 # This file
```

---

## Test Files

### End-to-End Tests (`e2e/`)

- **`app-launch.spec.ts`** - Application startup and initialization
- **`card-palette.spec.ts`** - Card palette functionality (search, categories, expand/collapse)
- **`dashboard-operations.spec.ts`** - Dashboard operations (add cards, select, properties panel)

### Integration Tests (`integration/`)

- **`yaml-operations.spec.ts`** - YAML loading, parsing, and round-trip conversion
- **`card-rendering.spec.ts`** - Card rendering on canvas for different card types

### Unit Tests (`unit/`)

- **`card-registry.spec.ts`** - Card registry functionality and categorization

### Test Helpers (`helpers/`)

- **`electron-helper.ts`** - Utilities for launching and controlling the Electron app

### Test Fixtures (`fixtures/`)

- **`test-dashboard.yaml`** - Simple test dashboard with basic cards
- **`layout-card-dashboard.yaml`** - Dashboard with layout-card grid positioning

---

## Writing New Tests

See the [Test Automation Guide](../docs/TEST_AUTOMATION_GUIDE.md) for detailed instructions.

### Quick Template

```typescript
import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, waitForAppReady } from '../helpers/electron-helper';

test.describe('Feature Name', () => {
  test('should do something', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Test actions here
      await window.locator('selector').click();

      // Assertions
      expect(await window.locator('result').count()).toBe(1);
    } finally {
      await closeElectronApp(app);
    }
  });
});
```

---

## Common Commands

```bash
# Development
npm run test:ui              # Playwright UI mode (time-travel debugging)
npm run test:headed          # See the app while testing
npm run test:debug           # Step through tests with debugger

# Specific tests
npx playwright test tests/e2e/app-launch.spec.ts    # Run specific file
npx playwright test -g "should launch"               # Run by name pattern

# Results
npm run test:report          # View HTML test report
```

---

## Test Results

Test results are saved to `test-results/`:

```
test-results/
├── html/                    # HTML report (open index.html)
├── artifacts/               # Screenshots, videos, traces
├── screenshots/             # Named screenshots from tests
└── results.json             # JSON report for CI/CD
```

View HTML report:
```bash
npm run test:report
```

---

## Debugging Tests

### 1. UI Mode (Recommended)
```bash
npm run test:ui
```
- Visual test runner
- Time-travel debugging
- Watch mode

### 2. Debug Mode
```bash
npm run test:debug
```
- Pauses on each action
- Inspector shows selectors

### 3. Screenshots on Failure
Screenshots are automatically captured when tests fail. Find them in:
```
test-results/artifacts/
```

### 4. Trace Viewer
If a test fails, view the trace:
```bash
npx playwright show-trace test-results/artifacts/trace.zip
```

---

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests

Configure in `.github/workflows/test.yml`

---

## Best Practices

1. **Always clean up** - Use `try/finally` to ensure app closes
2. **Use descriptive names** - Test names should explain what they verify
3. **Test independence** - Each test should work standalone
4. **Wait for elements** - Use `waitForSelector()` for dynamic content
5. **Take screenshots** - For visual verification and debugging

---

## Adding New Test Types

To add a new test category:

1. Create directory: `tests/new-category/`
2. Add to `playwright.config.ts`:
   ```typescript
   {
     name: 'new-category',
     testMatch: '**/new-category/**/*.spec.ts',
   }
   ```
3. Add npm script to `package.json`:
   ```json
   "test:new": "playwright test --project=new-category"
   ```

---

## Resources

- **[Test Automation Guide](../docs/TEST_AUTOMATION_GUIDE.md)** - Comprehensive testing guide
- **[Playwright Docs](https://playwright.dev)** - Official Playwright documentation
- **[Electron Testing](https://www.electronjs.org/docs/latest/tutorial/automated-testing)** - Electron testing guide

---

## Troubleshooting

### Tests timing out
- Increase timeout in test or config
- Check if app is launching correctly
- Verify selectors are correct

### Flaky tests
- Add explicit waits
- Check for race conditions
- Ensure test independence

### Screenshots not saving
- Verify `test-results/` directory exists
- Check file permissions
- Use absolute paths

---

**Need Help?**

1. Check the [Test Automation Guide](../docs/TEST_AUTOMATION_GUIDE.md)
2. Review existing test examples in this directory
3. Open an issue: https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker/issues
