# Vite Config Fix - Externalizing Electron and Node Built-ins

## Problem

The app was failing to launch during tests with the error:
```
TypeError: Cannot read properties of undefined (reading 'handle')
    at Object.<anonymous> (c:\...\main.js:14756:18)
```

This resulted in:
- White screen when app launched
- `electronAPI.testSeedEntityCache` being undefined
- All tests failing with "Cannot read properties of undefined"

## Root Cause

The `vite.main.config.ts` file was not externalizing the `electron` module or Node.js built-in modules. Vite was trying to bundle them, which caused the `electron` import to be mangled and broken.

When Vite bundles Electron, it breaks the module structure and causes `electron.ipcMain` to become undefined because `electron` itself becomes undefined.

## Solution

Updated [vite.main.config.ts](vite.main.config.ts) to properly externalize:
1. The `electron` module
2. All Node.js built-in modules (both with and without `node:` prefix)
3. Optional peer dependencies

### Before:
```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        // Externalize optional peer dependencies only
        'bufferutil',
        'utf-8-validate',
      ],
    },
  },
});
```

### After:
```typescript
import { defineConfig } from 'vite';
import { builtinModules } from 'node:module';

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        // Externalize electron and all Node.js built-in modules
        'electron',
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
        // Externalize optional peer dependencies
        'bufferutil',
        'utf-8-validate',
      ],
    },
  },
});
```

## Verification

After the fix, the built `main.js` now correctly requires modules:
```javascript
const k=require("electron")
const K=require("node:path")
const ht=require("node:fs/promises")
// etc.
```

Instead of trying to bundle them inline, which was breaking everything.

## Impact

This fix allows:
- ✅ App to launch correctly with `NODE_ENV=test`
- ✅ Electron IPC handlers to be registered properly
- ✅ `electronAPI` to be exposed in the renderer with all methods
- ✅ Test seeding infrastructure to work
- ✅ All integration tests to have access to test IPC handlers

---

## Related Files

- [vite.main.config.ts](vite.main.config.ts) - Fixed Vite configuration
- [src/main.ts](src/main.ts) - Main process with IPC handlers
- [src/preload.ts](src/preload.ts) - Preload script exposing electronAPI
- [tests/helpers/electron-helper.ts](tests/helpers/electron-helper.ts) - Test helpers using IPC

---

*Fix applied: December 27, 2024*
