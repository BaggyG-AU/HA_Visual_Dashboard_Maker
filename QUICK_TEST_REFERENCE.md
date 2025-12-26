# E2E Testing - Quick Reference Guide

## Running Tests

```bash
# All tests
npm run test:e2e

# Headed mode (see browser)
npm run test:e2e -- --headed

# Specific file
npx playwright test tests/e2e/dashboard-operations.spec.ts --headed

# Specific test by name
npx playwright test -g "should add cards" --headed

# Debug test (inspect app)
npx playwright test tests/e2e/debug-app.spec.ts --headed
```

## Writing New Tests - Template

```typescript
import { test, expect } from '@playwright/test';
import {
  launchElectronApp,
  closeElectronApp,
  waitForAppReady,
  createNewDashboard,
  expandCardCategory
} from '../helpers/electron-helper';

test('my test', async () => {
  const { app, window } = await launchElectronApp();

  try {
    await waitForAppReady(window);

    // 1. Create dashboard if test will add cards
    await createNewDashboard(window);

    // 2. Expand category to make cards visible
    await expandCardCategory(window, 'Controls');

    // 3. Find and interact with elements
    const buttonCard = window.locator('text=Button Card');
    await buttonCard.click();

    // 4. Assert expected behavior
    const cards = await window.locator('.react-grid-item').count();
    expect(cards).toBeGreaterThan(0);

  } finally {
    await closeElectronApp(app);
  }
});
```

## Common Patterns

### Add Card to Canvas

```typescript
await createNewDashboard(window);
await expandCardCategory(window, 'Controls');
await window.locator('text=Button Card').click();
await window.waitForTimeout(500); // Let card render
```

### Select Card on Canvas

```typescript
const card = window.locator('.react-grid-item').first();
await card.click();
await window.waitForTimeout(300);
```

### Check Properties Panel

```typescript
const propertiesPanel = window.locator('[class*="PropertiesPanel"]');
const formItems = await propertiesPanel.locator('.ant-form-item').count();
expect(formItems).toBeGreaterThan(0);
```

### Flexible Card Locator

```typescript
// Try multiple selectors
const card = window
  .locator('text=Button Card')
  .or(window.locator('text=Button'))
  .first();
```

### Take Screenshot

```typescript
await window.screenshot({
  path: 'test-results/screenshots/my-test.png'
});
```

## Helper Functions

### createNewDashboard(window)
**Required before adding cards!**
```typescript
const success = await createNewDashboard(window);
if (!success) {
  console.log('Dashboard creation failed');
}
```

### expandCardCategory(window, categoryName)
**Required to make cards visible!**
```typescript
await expandCardCategory(window, 'Controls');
await expandCardCategory(window, 'Information');
await expandCardCategory(window, 'Media');
```

### expandAllCardCategories(window)
Expand all at once:
```typescript
await expandAllCardCategories(window);
```

## Card Categories

| Category | Cards |
|----------|-------|
| **Layout** | Horizontal Stack, Vertical Stack, Grid |
| **Sensors & Display** | Gauge, Sensor, Glance |
| **Controls** | Button, Light, Thermostat |
| **Information** | Entities, Markdown, History Graph |
| **Media** | Picture Entity, Media Player |
| **Custom Cards** | Bubble Card, Mushroom, Mini Graph |

## Common Selectors

```typescript
// Canvas elements
window.locator('.react-grid-layout')     // Canvas
window.locator('.react-grid-item')       // Card on canvas

// UI panels
window.locator('[class*="CardPalette"]') // Card palette
window.locator('[class*="PropertiesPanel"]') // Properties panel

// Ant Design components
window.locator('.ant-collapse-header')   // Category header
window.locator('.ant-form-item')         // Form field
window.locator('.ant-tabs-tab')          // View tab
window.locator('button')                 // Buttons

// Text matching
window.locator('text=Button Card')       // Exact text
window.locator('text=/button/i')         // Regex (case insensitive)
```

## Debugging Failed Tests

1. **Check screenshot**: `test-results/screenshots/test-failed-1.png`
2. **Read console output**: Helper functions log their actions
3. **Run in headed mode**: See what's happening visually
4. **Use debug test**: Inspect full app state

```bash
# Run debug test
npx playwright test tests/e2e/debug-app.spec.ts --headed

# Check outputs:
# - test-results/screenshots/debug-full-page.png
# - test-results/debug-page.html
```

## Common Issues

### Card Not Found
```typescript
// Problem: Card hidden in collapsed category
await window.locator('text=Button Card').click(); // FAILS

// Solution: Expand category first
await expandCardCategory(window, 'Controls');
await window.locator('text=Button Card').click(); // WORKS
```

### Card Click Does Nothing
```typescript
// Problem: No dashboard exists
await window.locator('text=Button Card').click(); // Card found but not added

// Solution: Create dashboard first
await createNewDashboard(window);
await expandCardCategory(window, 'Controls');
await window.locator('text=Button Card').click(); // Now adds to canvas
```

### Element Not Visible
```typescript
// Add longer timeout
await element.waitFor({ state: 'visible', timeout: 5000 });

// Or wait for animations
await window.waitForTimeout(500);
```

## Test Organization

```
tests/
├── e2e/                    # End-to-end tests
│   ├── app-launch.spec.ts
│   ├── dashboard-operations.spec.ts
│   ├── file-operations.spec.ts
│   ├── properties-panel.spec.ts
│   ├── templates.spec.ts
│   ├── yaml-editor.spec.ts
│   └── debug-app.spec.ts  # Debug/inspection test
├── helpers/
│   └── electron-helper.ts # Reusable test utilities
└── fixtures/              # Test data files
    ├── test-dashboard.yaml
    └── layout-card-dashboard.yaml
```

## Best Practices

1. **Always create dashboard before adding cards**
2. **Always expand categories before looking for cards**
3. **Use flexible locators** (`.or()` for multiple attempts)
4. **Wait for animations** (300-500ms after state changes)
5. **Take screenshots** at key points for debugging
6. **Log liberally** - console.log helps debug failures
7. **Be graceful** - Skip tests if prerequisites aren't met
8. **Clean up** - Always `await closeElectronApp(app)` in finally block

## Example: Complete Test

```typescript
test('should edit button card name', async () => {
  const { app, window } = await launchElectronApp();

  try {
    await waitForAppReady(window);

    // Setup: Create dashboard and add card
    await createNewDashboard(window);
    await expandCardCategory(window, 'Controls');

    const buttonCard = window.locator('text=Button Card').first();
    await buttonCard.click();
    await window.waitForTimeout(500);

    // Action: Select card and edit properties
    const cardOnCanvas = window.locator('.react-grid-item').first();
    await cardOnCanvas.click();
    await window.waitForTimeout(300);

    const nameInput = window.locator('input[id*="name"]').first();
    await nameInput.fill('My Button');

    // Verify
    const value = await nameInput.inputValue();
    expect(value).toBe('My Button');

    // Debug screenshot
    await window.screenshot({
      path: 'test-results/screenshots/button-name-edited.png'
    });

  } finally {
    await closeElectronApp(app);
  }
});
```

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Card not found" | Expand category first |
| "Canvas not found" | Create dashboard first |
| "Element not visible" | Add timeout or wait |
| "Test times out" | Check selector is correct |
| "Window closed unexpectedly" | Keyboard shortcut may close window |
| "Properties panel not found" | Feature may not be implemented yet |

## Success Metrics

- ✅ 110+ tests passing (92%+)
- ✅ Clear error messages when tests fail
- ✅ Screenshots available for debugging
- ✅ Tests run reliably in CI/CD
- ✅ Easy to add new tests

Happy testing! 🎉
