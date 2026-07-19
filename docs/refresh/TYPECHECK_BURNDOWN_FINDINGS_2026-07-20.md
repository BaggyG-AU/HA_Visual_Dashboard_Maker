# Typecheck Burndown — Findings (2026-07-20)

Companion to [`PROJECT_REFRESH_PLAN_2026-07.md`](PROJECT_REFRESH_PLAN_2026-07.md), WS2.

**Result:** `npm run typecheck` went from **279 errors to 0**, `strictNullChecks`
is on, and typecheck/unit/build are now **blocking in CI** (`.github/workflows/ci.yml`).

Branch `chore/project-refresh-2026-07`, commits `e467f83` → `d5921f4`.

---

## Root cause

Dependencies were upgraded during the Node 22 reinstall (**antd v5 → v6.1.4**,
**ApexCharts v4**, **react-grid-layout v2**, **monaco-yaml v5**) but the call
sites were never migrated — and `npm run typecheck` was **not in blocking CI**.

Every API drift therefore became a *silently-ignored prop* rather than a compile
error. None of these produced a crash, a console error, or a failing test; they
just quietly stopped doing anything.

---

## Confirmed latent bugs found and fixed

| # | Where | What was actually broken |
|---|---|---|
| 1 | `services/templateService.ts` | `electronAPI.readFile` returns a `{success, content?, error?}` envelope; both call sites treated it as a raw string. `JSON.parse(<object>)` threw every time, so `loadMetadata()` always fell into its catch and returned **empty metadata — the template library silently listed nothing**. `loadTemplate()` returned the envelope instead of YAML. `getTemplatePath` was exposed by the preload bridge but missing from the `ElectronAPI` interface. |
| 2 | `cards/ApexChartsCardRenderer.tsx` | The trailing `...normalized.apex_config` spread sat *after* the composed `chart` and `stroke` blocks and overwrote both wholesale — the preview guardrails (transparent background, hidden toolbar, disabled animations) were discarded on every chart. |
| 3 | `cards/MushroomCardRenderer.tsx` | `card.layout` collides: upstream Mushroom's `layout` is a **string** option, HAVDM's `BaseCard.layout` is the react-grid-layout **position object**. `layout === 'horizontal'` could never be true — horizontal Mushroom cards always rendered vertically. |
| 4 | `EntityRemappingModal.tsx` | `justify="space-between"` was passed to antd `Space`, which has never supported it in any antd version. Two header rows were never justified. |
| 5 | `cards/GaugeCardRenderer.tsx` | `paddingX: '8px'` is not a CSS property — the min/max range row never had its intended horizontal padding. |
| 6 | `cards/ApexChartsCardRenderer.tsx` | ApexCharts v4 renamed legend marker `width`/`height` → `size`; the 8px markers were being dropped. |
| 7 | `SplitViewEditor.tsx` | `onLayoutChange` was a stale `(layout: unknown[]) => void` placeholder matching neither its `GridCanvas` consumer nor `App`'s handler. |
| 8 | `utils/layoutCardExporter.ts` | react-grid-layout v2 made `Layout` the whole (readonly) array rather than one item, so three `Layout[]` params were arrays-of-arrays and every `item.x/.y/.w/.h` read was untyped. |
| 9 | `features/carousel/SwiperCarousel.tsx` | Autoplay options were read via `?.` off a `CarouselAutoplayConfig \| false` union — `?.` does not narrow away `false`. |
| 10 | `store/dashboardStore.ts` | `loadDashboard` was typed `filePath: string` while three call sites pass `null` and the store's own initial state is `null`. |
| 11 | `PropertiesPanel.tsx` | `handleInsertEntity` used `editor.getSelection()` with **no null fallback** (a null selection is not a valid monaco edit range). `YamlEditorDialog` had a fallback; `PropertiesPanel` did not. |

---

## antd v5 → v6 migration map (reusable)

- `Steps.Step` children removed → `items` prop; item `description` → `content`.
- `Select`: `styles.dropdown` → `styles.popup.root`.
  Semantic names: `root | prefix | suffix | input | placeholder | content | item | itemContent | itemRemove | clear`;
  popup: `root | list | listItem`.
- `Modal`: `styles.content` → `styles.container`.
  Semantic names: `root | header | body | footer | container | title | wrapper | mask`.
- `Slider` / `Radio.Group` no longer forward arbitrary DOM handlers (`onKeyDown`
  etc.) — wrap in a span and rely on bubbling.
- `Space` has `align`, never `justify` — use `Flex`.
- `Slider` `onChange` params are no longer inferred at some call sites; annotate `(val: number)`.

Adjacent gotchas found along the way:

- `electron-store`'s `Options` explicitly `Except`s `projectName` and never reads
  it at runtime (cwd comes from `app.getPath('userData')`) — passing it was a no-op.
- `window.electronAPI` is declared **non-optional**, so `if (window.electronAPI?.fn)`
  is always true (TS2774). Use `typeof window.electronAPI?.fn === 'function'`.

---

## react-grid-layout legacy-shim smoke test

The v2 migration routed through the `react-grid-layout/legacy` compat shim, which
changed the drag/resize canvas component. Smoke-tested at `d5921f4`:

- **16 e2e tests pass** (`dashboard-operations`, `card-palette`, `layout`) — the
  canvas renders and operates correctly.
- **3 `layout.visual.spec.ts` snapshot failures are pre-existing**, not caused by
  the burndown: the same 3 fail at `72a67cf` (pre-session). antd v6 changed
  component metrics (e.g. 585×440 → 592×272). **These snapshots need re-baselining
  — tracked separately.**
- `layout.spec.ts:62` is a **pre-existing flake**, not a regression: the antd
  Select option detaches between `toBeVisible()` and `.evaluate()`. It fails 2/3
  on the *pre-branch baseline* in the WSL-mounted checkout and passes 3/3 in a
  `/tmp` worktree — it is environment-speed sensitive. Matches the known
  "Ant Design Select in Playwright" pattern in `TESTING_STANDARDS.md`.

---

## Still open

- 53 `npm audit` vulnerabilities (3 critical / 36 high) from the Node 22 reinstall.
- ESLint 8 → 9 flat config + `@typescript-eslint` 5 → 8 + Prettier.
- Re-baseline the 3 `layout.visual.spec.ts` snapshots for antd v6.
- Phase 7: the bulk multi-select undo-granularity `test.fixme` in
  `tests/integration/bulk-operations.spec.ts` is still registered despite a
  commit claiming it was fixed.
