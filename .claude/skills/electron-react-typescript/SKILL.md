---
name: electron-react-typescript
description: Write robust, testable Electron + React + TypeScript code that behaves identically in dev, test, and production environments.
---

# Electron + React + TypeScript Coding Rules

You are writing code for an Electron application using React and TypeScript.

Your code MUST work under:
- Electron CSP restrictions
- file:// URLs
- Playwright E2E testing
- packaged production builds

---

## Core rules (non-negotiable)

1. **Assume CSP is strict**
   - No remote scripts
   - No remote styles
   - No inline scripts unless explicitly allowed
   - No `unsafe-eval`

2. **All third-party libraries must be bundled**
   - Monaco Editor MUST be bundled locally
   - Workers MUST be explicitly wired
   - No CDN dependencies, ever

3. **file:// compatibility**
   - Do not assume `http://localhost`
   - All assets must resolve correctly under `file://`
   - Avoid dynamic import paths that rely on network resolution

---

## React architecture rules

1. **Explicit readiness states**
   - Components with async setup MUST expose:
     - `loading`
     - `ready`
     - `error`
   - Never leave a component stuck in “Loading…” on failure

2. **Testability is a first-class concern**
   - All major UI regions MUST have a stable wrapper:
     - `data-testid="card-palette"`
     - `data-testid="canvas"`
     - `data-testid="properties-panel"`
   - Interactive surfaces MUST be directly selectable

3. **Do not rely on UI library internals**
   - Ant Design class names are unstable
   - React Grid Layout class names are not interaction-safe
   - Prefer semantic HTML + test IDs

---

## Monaco Editor rules (mandatory)

- Import Monaco via ESM (`monaco-editor`)
- Explicitly define `MonacoEnvironment.getWorker`
- Use local workers only
- Never inject `vs/loader.js`
- Handle initialization failure and surface errors in UI

Example (required pattern):

```ts
(self as any).MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'yaml') return new YamlWorker();
    return new EditorWorker();
  },
};
