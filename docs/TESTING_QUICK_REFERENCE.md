# Testing Quick Reference
## HA Visual Dashboard Maker

Quick reference for running and writing tests.

---

## Run Tests

```bash
# All tests
npm test

# By type
npm run test:e2e
npm run test:integration
npm run test:unit

# Interactive
npm run test:ui           # Best for development
npm run test:headed       # Watch tests run
npm run test:debug        # Step-by-step debugger

# Specific tests
npx playwright test tests/e2e/app-launch.spec.ts
npx playwright test -g "should launch"

# View report
npm run test:report
```

---

## Test Template

```typescript
import { test, expect } from '@playwright/test';
import {
  launchElectronApp,
  closeElectronApp,
  waitForAppReady
} from '../helpers/electron-helper';

test.describe('Feature', () => {
  test('should work', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Actions
      await window.locator('text=Button').click();

      // Assertions
      expect(await window.locator('.result').count()).toBe(1);

    } finally {
      await closeElectronApp(app);
    }
  });
});
```

---

## Common Selectors

```typescript
// By text
window.locator('text=Button Card')
window.locator('text*=Button')  // Contains

// By CSS
window.locator('.ant-btn')
window.locator('[class*="CardPalette"]')

// By test ID (best)
window.locator('[data-testid="save-button"]')

// Combining
window.locator('.ant-collapse').locator('text=Layout')
```

---

## Common Actions

```typescript
// Click
await window.locator('button').click();

// Type
await window.locator('input').fill('search text');

// Select dropdown
await window.locator('select').selectOption('value');

// Keyboard
await window.keyboard.press('Control+S');

// Wait
await window.waitForSelector('.card', { state: 'visible' });
await window.waitForTimeout(500);

// Drag and drop
await source.dragTo(target);
```

---

## Common Assertions

```typescript
// Count
expect(await window.locator('.card').count()).toBe(3);

// Visibility
expect(await window.locator('.error').isVisible()).toBe(true);

// Text content
expect(await window.locator('.title').textContent()).toContain('Dashboard');

// Has class
expect(await element.evaluate(el => el.classList.contains('active'))).toBe(true);

// Screenshot comparison
await expect(window).toHaveScreenshot('baseline.png');
```

---

## Debugging

```bash
# UI Mode (time-travel)
npm run test:ui

# Debug mode
npm run test:debug

# Take screenshot
await window.screenshot({ path: 'debug.png' });

# Console logs
window.on('console', msg => console.log(msg.text()));
```

---

## File Structure

```
tests/
├── e2e/              # User workflows
├── integration/      # Component interactions
├── unit/             # Isolated functions
├── fixtures/         # Test data
└── helpers/          # Utilities
```

---

## Test Data

```typescript
import {
  generateSimpleDashboard,
  generateLargeDashboard,
  dashboardToYAML
} from '../helpers/test-data-generator';

const dashboard = generateSimpleDashboard();
const yaml = dashboardToYAML(dashboard);
```

---

## CI/CD

Tests run automatically on:
- Push to `main`/`develop`
- Pull requests

Configure: `.github/workflows/test.yml`

---

## Best Practices

1. ✅ Always use `try/finally` to close app
2. ✅ Wait for elements before interacting
3. ✅ Use descriptive test names
4. ✅ Keep tests independent
5. ✅ Take screenshots for visual verification

---

## Common Issues

**Timeout**: Increase timeout
```typescript
test.setTimeout(60000);
```

**Flaky**: Add waits
```typescript
await window.waitForSelector('.element');
```

**Can't find element**: Check selector
```typescript
// Debug: see all text on page
console.log(await window.textContent('body'));
```

---

**Full Guide**: [Test Automation Guide](TEST_AUTOMATION_GUIDE.md)
