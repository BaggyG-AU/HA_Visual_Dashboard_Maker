# Test Suite - Playwright Helper DSL
## HA Visual Dashboard Maker

This test suite uses a **Domain-Specific Language (DSL)** pattern to make tests readable, maintainable, and reusable.

---

## 🚀 Quick Start

```bash
# Run all E2E tests
npx playwright test --project=electron-e2e --reporter=list

# Run specific test file
npx playwright test --project=electron-e2e tests/e2e/card-palette.spec.ts

# Run with UI mode (time-travel debugging)
npx playwright test --project=electron-e2e --ui

# Run in headed mode (see the app)
npx playwright test --project=electron-e2e --headed
```

---

## ✅ Current Status

### DSL-Migrated Tests (100% Passing)

- **Card Palette**: 5/5 tests passing ✅
- **Dashboard Operations**: 6/6 tests passing ✅
- **Properties Panel**: 6/6 tests passing ✅
- **App Launch**: 4/4 tests passing ✅

**Total**: 21 E2E tests, 100% pass rate 🎉

---

## 📁 Directory Structure

```
tests/
├── support/                    # DSL and test utilities
│   ├── electron.ts            # Electron launcher with isolated storage
│   ├── index.ts               # Main export (launchWithDSL, close)
│   ├── dsl/                   # Domain-Specific Language classes
│   │   ├── app.ts            # App-level operations
│   │   ├── dashboard.ts       # Dashboard lifecycle
│   │   ├── cardPalette.ts     # Card palette interactions
│   │   ├── canvas.ts          # Canvas operations
│   │   └── propertiesPanel.ts # Properties editing
│   └── assertions/            # Assertion helpers
│       ├── yaml.ts            # YAML editor assertions
│       └── properties.ts      # Properties panel assertions
├── e2e/                       # End-to-end tests
│   ├── card-palette.spec.ts  ✅ DSL-based (5 tests passing)
│   ├── dashboard-operations.spec.ts ✅ DSL-based (6 tests passing)
│   ├── properties-panel.spec.ts ✅ DSL-based (6 tests passing)
│   ├── app-launch.spec.ts    ✅ DSL-based (4 tests passing)
│   └── ...                    # Other tests (to be migrated)
├── integration/               # Integration tests
├── unit/                      # Unit tests
├── fixtures/                  # Test data
└── helpers/                   # Legacy helpers (being phased out)
```

---

## 📖 Writing Tests with the DSL

### Basic Template

```typescript
import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';

test.describe('My Feature', () => {
  test('should do something', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();

      // Your test logic using DSL methods
      await ctx.dashboard.createNew();
      await ctx.palette.addCard('button');
      await ctx.canvas.selectCard(0);
      await ctx.properties.setCardName('My Button');

      // Assertions
      const name = await ctx.properties.getCardName();
      expect(name).toBe('My Button');

    } finally {
      await close(ctx);
    }
  });
});
```

### Available DSL APIs

#### `ctx.appDSL` - Application-level

```typescript
await ctx.appDSL.waitUntilReady();
await ctx.appDSL.expectTitle('Title');
await ctx.appDSL.screenshot('name');
const title = await ctx.appDSL.getTitle();
```

#### `ctx.dashboard` - Dashboard lifecycle

```typescript
await ctx.dashboard.createNew();
await ctx.dashboard.expectEmpty();
await ctx.dashboard.expectCardCount(2);
```

#### `ctx.palette` - Card palette

```typescript
await ctx.palette.waitUntilVisible();
await ctx.palette.search('entities');
await ctx.palette.expandCategory('Controls');
await ctx.palette.addCard('button');
```

#### `ctx.canvas` - Canvas operations

```typescript
await ctx.canvas.selectCard(0);
await ctx.canvas.deselectCard();
await ctx.canvas.expectCardCount(2);
await ctx.canvas.expectEmpty();
```

#### `ctx.properties` - Properties panel

```typescript
await ctx.properties.expectVisible();
await ctx.properties.switchTab('YAML');
await ctx.properties.setCardName('Name');
const name = await ctx.properties.getCardName();
```

#### Raw Playwright Access

```typescript
ctx.app       // ElectronApplication
ctx.window    // Page
ctx.userDataDir  // string
```

---

## 📚 Documentation

- **[TESTING_STANDARDS.md](TESTING_STANDARDS.md)** - Comprehensive rules, API docs, and guidelines
- **[DSL_MIGRATION_SUMMARY.md](DSL_MIGRATION_SUMMARY.md)** - Migration status and remaining work
- **Example Tests**: [e2e/card-palette.spec.ts](e2e/card-palette.spec.ts) - Reference implementation

---

## 🎯 Testing Standards (Quick Reference)

### Mandatory Rules

1. ✅ **ALWAYS** use `launchWithDSL()` and `close()`
2. ❌ **NEVER** use raw selectors (`.locator()`, `.getByTestId()`) in spec files
3. ❌ **NEVER** call `.click()`, `.fill()` directly in specs
4. ✅ **ALWAYS** use DSL methods for all interactions
5. ❌ **NEVER** use `waitForTimeout()` in specs (use DSL expectation methods)

### Good vs Bad Examples

**BAD** ❌:
```typescript
const palette = window.getByTestId('card-palette');
await palette.getByTestId('palette-card-button').dblclick();
await window.waitForTimeout(2000);
```

**GOOD** ✅:
```typescript
await ctx.palette.expandCategory('Controls');
await ctx.palette.addCard('button');
await ctx.canvas.expectCardCount(1);
```

---

## 🔧 Adding New DSL Methods

When you need a new interaction:

1. Identify the correct DSL class (`app`, `dashboard`, `palette`, `canvas`, `properties`)
2. Add method to `/tests/support/dsl/<class>.ts`
3. Use ONLY `data-testid` selectors
4. Include explicit state waits
5. Document with JSDoc

**Example**:

```typescript
// /tests/support/dsl/canvas.ts

/**
 * Delete the selected card using Delete key
 */
async deleteSelectedCard(): Promise<void> {
  await this.window.keyboard.press('Delete');
  await expect(this.window.getByTestId('properties-panel'))
    .toHaveCount(0, { timeout: 2000 });
}
```

---

## 🐛 Debugging Tests

### Enable Verbose Logging

```bash
DEBUG=pw:api npx playwright test --project=electron-e2e
```

### Run in Headed Mode

```bash
npx playwright test --project=electron-e2e --headed
```

### Pause on Failure

```typescript
test('my test', async () => {
  const ctx = await launchWithDSL();
  try {
    await ctx.window.pause(); // Pauses execution
    // ...
  } finally {
    await close(ctx);
  }
});
```

---

## 🎨 Why DSL?

### Benefits

1. **Readability**: Tests read like user workflows
2. **Maintainability**: Selector changes only affect DSL classes
3. **Reusability**: Extract DSL to template repo for future apps
4. **Reliability**: Explicit waits eliminate flaky tests
5. **Isolation**: Each test gets isolated storage (no state leakage)

### Before/After Comparison

**BEFORE (Old Pattern)** - 15 lines, fragile:
```typescript
const { app, window } = await launchElectronApp();
await waitForAppReady(window);
const palette = window.getByTestId('card-palette');
const header = palette.getByRole('button', { name: /Controls/i });
await header.click();
await window.waitForTimeout(300);
const card = palette.getByTestId('palette-card-button');
await card.dblclick();
await window.waitForTimeout(2000);
const canvasCards = window.getByTestId('canvas-card');
expect(await canvasCards.count()).toBe(1);
await closeElectronApp(app);
```

**AFTER (DSL Pattern)** - 6 lines, readable:
```typescript
const ctx = await launchWithDSL();
try {
  await ctx.appDSL.waitUntilReady();
  await ctx.palette.expandCategory('Controls');
  await ctx.palette.addCard('button');
  await ctx.canvas.expectCardCount(1);
} finally {
  await close(ctx);
}
```

---

## 📋 Migration Checklist

Migrating an old test? Follow these steps:

- [ ] Import `{ launchWithDSL, close }` from `'../support'`
- [ ] Replace `launchElectronApp()` with `launchWithDSL()`
- [ ] Replace `closeElectronApp()` with `close(ctx)`
- [ ] Remove all `.locator()` / `.getByTestId()` calls
- [ ] Replace with DSL methods
- [ ] Remove `window.waitForTimeout()` → use DSL expectations
- [ ] Remove direct `.click()` / `.fill()` calls
- [ ] Change `window` → `ctx.window`, `app` → `ctx.app`
- [ ] Run tests and verify 100% pass rate

See [DSL_MIGRATION_SUMMARY.md](DSL_MIGRATION_SUMMARY.md) for full migration guide.

---

## 🚨 Common Issues

### `ctx.app.close is not a function`

**Cause**: Using `ctx.app` instead of raw `ElectronApplication`
**Fix**: Use `ctx.app` for ElectronApplication, `ctx.appDSL` for DSL methods

### Test hangs indefinitely

**Cause**: Waiting for element that never appears
**Fix**: Check test ID and ensure element is actually rendered

### Flaky tests

**Cause**: Using `waitForTimeout()` instead of explicit waits
**Fix**: Replace with DSL expectation methods (e.g., `expectCardCount()`)

---

## 📊 Test Results

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
npx playwright show-report
```

---

## 🔗 Resources

- **[Playwright Docs](https://playwright.dev)** - Official Playwright documentation
- **[Electron Testing](https://www.electronjs.org/docs/latest/tutorial/automated-testing)** - Electron testing guide
- **[Project Issues](https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker/issues)** - Report bugs or request features

---

**Last Updated**: 2025-12-29
**DSL Architecture**: 100% Complete
**Core E2E Tests**: 21/21 Passing ✅
