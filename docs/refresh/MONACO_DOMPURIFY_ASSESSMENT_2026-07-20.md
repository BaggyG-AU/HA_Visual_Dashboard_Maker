# monaco-editor / dompurify — production vulnerability assessment

**Date:** 2026-07-20
**Scope:** the two remaining findings in `npm audit --omit=dev`
**Verdict:** **take no dependency action.** Both available "fixes" are illusory.
Track the exposure instead.

---

## The finding

`npm audit --omit=dev` reports 2 vulnerabilities (1 low, 1 moderate). Both come
from a single package:

```
dompurify  <=3.4.10   (16 advisories: XSS, prototype pollution, sanitiser bypasses)
  └─ monaco-editor  0.54.0-dev … 0.56.0-dev
       └─ depends on a vulnerable version of dompurify
```

npm's remedy: `npm audit fix --force` → **installs monaco-editor 0.53.0**, a
semver-major _downgrade_ from the 0.55.1 in use.

---

## What is actually true

### 1. monaco-editor 0.55.1 is already the latest release

```
$ npm view monaco-editor version
0.55.1
```

There is no forward upgrade. The advisory has no fixed version to move to.

### 2. monaco 0.53.0 is not a fix — it simply predates the dependency

| version | dependencies                                          |
| ------- | ----------------------------------------------------- |
| 0.53.0  | `@types/trusted-types` only — **no dompurify at all** |
| 0.54.0  | `marked@14.0.0`, `dompurify@3.1.7`                    |
| 0.55.0  | `marked@14.0.0`, `dompurify@3.2.7`                    |
| 0.55.1  | `marked@14.0.0`, `dompurify@3.2.7`                    |

`audit fix --force` clears the finding by removing the sanitiser, not by fixing
it. Two minor versions of editor-core drift, for zero real security gain, in a
project where `monaco-yaml` v5 has already removed `setDiagnosticsOptions` once
and silently broke YAML validation. Rejected.

### 3. monaco **vendors** DOMPurify — so an npm `overrides` entry does nothing

This is the decisive point. monaco does not resolve the bare `dompurify`
specifier at runtime. It ships its own copy and imports it by relative path:

```
node_modules/monaco-editor/esm/vs/base/browser/domSanitize.js:3
  import purify from './dompurify/dompurify.js';
```

```
$ grep -rn "from 'dompurify'" node_modules/monaco-editor/esm/
(no matches)
```

`node_modules/monaco-editor/esm/vs/base/browser/dompurify/dompurify.js` is a
stock copy of DOMPurify **3.2.7** (its license banner names the version). The
hoisted `node_modules/dompurify` is, for the ESM build this app consumes,
effectively unused.

**Verified empirically.** Adding `"overrides": { "dompurify": "^3.4.12" }`,
reinstalling and rebuilding:

|                                     | result                      |
| ----------------------------------- | --------------------------- |
| `npm audit --omit=dev`              | **0 vulnerabilities**       |
| `node_modules/dompurify`            | 3.4.12                      |
| **rebuilt `.vite/renderer` bundle** | **still `DOMPurify 3.2.7`** |

The bundle's own license banner after the override:

```
DOMPurify 3.2.7 | (c) Cure53 … DOMPurify/blob/3.2.7/LICENSE
```

So the override is a pure audit-silencer: the report goes green while the
vulnerable code ships byte-for-byte unchanged. That is strictly worse than
doing nothing, because it destroys the signal that would tell us when a real
fix becomes available. **Do not add it.**

---

## Exposure

DOMPurify is reached through monaco's markdown renderer
(`base/browser/markdownRenderer.js` → `domSanitize.js`), which backs hover
widgets, suggest-widget details, parameter hints and inlay-hint hovers. Hovers
are enabled in this app (`src/monaco-setup.ts`: `hover: true`).

The markdown fed to those widgets is first-party: JSON-schema descriptions via
`monaco-yaml`, and the static completion items defined in
`src/components/YamlEditor.tsx`. That is not attacker-controlled in the way the
advisories contemplate, and the app is a local Electron tool rather than a
multi-tenant web surface.

**This exposure review is not exhaustive** — every path that can reach
`renderMarkdown` was not enumerated, so treat "not reachable" as _unproven_
rather than established.

---

## Recommendation

1. **Do nothing to the dependency tree.** Stay on monaco-editor 0.55.1.
2. **Do not add a `dompurify` override.** Proven above to change nothing that
   ships while zeroing the audit signal.
3. **Keep tracking `npm audit --omit=dev`,** not the misleading full-audit
   headline (most of which is electron-forge / vitest tooling).
4. **Re-check on each monaco release** for a refreshed vendored copy. The
   vendored file is stock upstream DOMPurify, so monaco bumping it is the clean
   fix.
5. If exposure is later judged material before upstream moves, the only
   _real_ remediation is patching the vendored file itself (e.g. `patch-package`
   swapping in DOMPurify 3.4.12's `purify.es.mjs`). That carries its own
   maintenance and behaviour risk across 3.2.7 → 3.4.x and should not be done
   speculatively.
