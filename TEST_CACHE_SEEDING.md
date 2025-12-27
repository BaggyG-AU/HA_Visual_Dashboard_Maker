# Entity Cache Seeding for Tests

## Problem

Entity caching tests were failing because:

1. **Manual app usage**: When you run the app manually, it auto-connects to your Home Assistant instance and fetches 644 entities successfully
2. **Test environment**: Tests run in isolation without access to your saved credentials, so no entities are fetched
3. **Empty cache**: Entity Browser shows "No entities cached" because tests never connect to HA

## Root Cause

Tests were designed to connect to a live Home Assistant instance using hardcoded test credentials (`http://localhost:8123` with `test_token`), which:
- Doesn't work unless HA is running locally during tests
- Fails silently without proper error handling
- Leaves Entity Browser empty

## Solution: Seed Test Data

Instead of requiring a live HA connection, we now **seed the entity cache with test data** before tests run.

### New Helper Functions

Added to `tests/helpers/electron-helper.ts`:

#### `seedEntityCache(app: ElectronApplication)`
Seeds the cache with 4 test entities:
- `light.living_room` - A light entity (on)
- `sensor.temperature` - A temperature sensor (72°F)
- `switch.bedroom` - A switch (off)
- `binary_sensor.door` - A door sensor (off)

#### `clearEntityCache(app: ElectronApplication)`
Clears all cached entities (used in test cleanup)

### Usage in Tests

```typescript
test.beforeAll(async () => {
  const testApp = await launchElectronApp();
  app = testApp.app;
  page = testApp.window;
  await waitForAppReady(page);

  // Seed the cache with test entities
  await seedEntityCache(app);
  console.log('Test entities seeded into cache');
});

test.afterAll(async () => {
  await clearEntityCache(app);
  await closeElectronApp(app);
});
```

### Updated Test

The first test in `entity-caching.spec.ts` now verifies:

```typescript
test('should load cached entities from storage', async () => {
  // Open entity browser
  await page.click('button:has-text("Entities")');
  await page.waitForSelector('.ant-modal:has-text("Entity Browser")');

  // Should display the seeded test entities
  const entityRows = page.locator('.ant-table-row');
  const rowCount = await entityRows.count();

  // We seeded 4 entities
  expect(rowCount).toBe(4);

  // Verify specific entities are present
  await expect(page.locator('.ant-table-row:has-text("light.living_room")')).toBeVisible();
  await expect(page.locator('.ant-table-row:has-text("sensor.temperature")')).toBeVisible();
  await expect(page.locator('.ant-table-row:has-text("switch.bedroom")')).toBeVisible();
  await expect(page.locator('.ant-table-row:has-text("binary_sensor.door")')).toBeVisible();
});
```

## Benefits

✅ **Tests are self-contained**: No dependency on live HA instance
✅ **Predictable data**: Always exactly 4 entities with known properties
✅ **Fast execution**: No network calls required
✅ **Reliable**: Won't fail due to network issues or auth problems
✅ **Isolated**: Each test run starts with clean, known state

## Testing Live HA Connection (Optional)

If you want to test against a **real** Home Assistant instance:

1. Set up environment variables:
   ```bash
   export HA_TEST_URL="http://your-ha-instance:8123"
   export HA_TEST_TOKEN="your-long-lived-access-token"
   ```

2. Create separate test file: `entity-caching-live.spec.ts`

3. Use real credentials from env vars instead of seeding

This keeps regular tests fast and isolated while allowing optional integration testing against real HA.

## App Startup Fix

Also fixed the app's startup entity loading:

### Before
```typescript
// Fetch and cache entities on startup
fetchAndCacheEntities();  // Not awaited, errors swallowed
```

### After
```typescript
// Fetch and cache entities on startup (with small delay to ensure WS is stable)
setTimeout(async () => {
  try {
    await fetchAndCacheEntities();
    console.log('Entity cache updated on startup');
  } catch (err) {
    console.error('Failed to fetch entities on startup:', err);
  }
}, 500);
```

Now when you run the app manually:
1. Auto-reconnects to HA on startup
2. Waits 500ms for WebSocket to stabilize
3. Fetches all entities
4. Caches them locally
5. Logs success/failure clearly

## Running Tests

```bash
# Build the app first (required)
npm run package

# Run all integration tests (with seeded cache)
npm run test:integration

# Run entity caching tests specifically
npx playwright test tests/integration/entity-caching.spec.ts

# Run with UI to see what's happening
npx playwright test tests/integration/entity-caching.spec.ts --headed
```

## Summary

**Problem**: Entity Browser empty in tests because no HA connection
**Solution**: Seed test entities into cache before tests run
**Result**: Tests verify cache functionality without needing live HA instance

---

*Last Updated: December 26, 2024*
*Related Files: tests/helpers/electron-helper.ts, tests/integration/entity-caching.spec.ts*
