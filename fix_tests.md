# Quick Fix for Test Files

The three new test files need to be updated to use the electron-helper.

## Files to Update:
1. tests/integration/entity-browser.spec.ts
2. tests/integration/monaco-editor.spec.ts  
3. tests/integration/entity-caching.spec.ts

## Changes Needed:

### 1. Update imports
Replace:
```typescript
import { test, expect, _electron as electron } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
```

With:
```typescript
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { launchElectronApp, closeElectronApp, waitForAppReady, createNewDashboard } from '../helpers/electron-helper';
```

### 2. Update beforeAll/afterAll
Replace:
```typescript
let electronApp: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
  electronApp = await electron.launch({
    args: ['.'],
    env: { ...process.env, NODE_ENV: 'test' },
  });
  page = await electronApp.firstWindow();
  await page.waitForLoadState('domcontentloaded');
});

test.afterAll(async () => {
  await electronApp.close();
});
```

With:
```typescript
let app: any;
let page: Page;

test.beforeAll(async () => {
  const testApp = await launchElectronApp();
  app = testApp.app;
  page = testApp.window;
  await waitForAppReady(page);
});

test.afterAll(async () => {
  await closeElectronApp(app);
});
```

### 3. Update beforeEach
Replace manual "New Dashboard" clicks with:
```typescript
test.beforeEach(async () => {
  await createNewDashboard(page);
});
```

## After Making Changes:

1. Build the app:
   ```bash
   npm run package
   ```

2. Run the tests:
   ```bash
   npm run test:integration
   ```

3. Or run specific file:
   ```bash
   npx playwright test tests/integration/entity-browser.spec.ts
   ```
