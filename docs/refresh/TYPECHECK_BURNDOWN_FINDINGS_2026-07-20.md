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

Every API drift therefore became a _silently-ignored prop_ rather than a compile
error. None of these produced a crash, a console error, or a failing test; they
just quietly stopped doing anything.

---

## Confirmed latent bugs found and fixed

| #   | Where                                     | What was actually broken                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `services/templateService.ts`             | `electronAPI.readFile` returns a `{success, content?, error?}` envelope; both call sites treated it as a raw string. `JSON.parse(<object>)` threw every time, so `loadMetadata()` always fell into its catch and returned **empty metadata — the template library silently listed nothing**. `loadTemplate()` returned the envelope instead of YAML. `getTemplatePath` was exposed by the preload bridge but missing from the `ElectronAPI` interface. |
| 2   | `cards/ApexChartsCardRenderer.tsx`        | The trailing `...normalized.apex_config` spread sat _after_ the composed `chart` and `stroke` blocks and overwrote both wholesale — the preview guardrails (transparent background, hidden toolbar, disabled animations) were discarded on every chart.                                                                                                                                                                                                |
| 3   | `cards/MushroomCardRenderer.tsx`          | `card.layout` collides: upstream Mushroom's `layout` is a **string** option, HAVDM's `BaseCard.layout` is the react-grid-layout **position object**. `layout === 'horizontal'` could never be true — horizontal Mushroom cards always rendered vertically.                                                                                                                                                                                             |
| 4   | `EntityRemappingModal.tsx`                | `justify="space-between"` was passed to antd `Space`, which has never supported it in any antd version. Two header rows were never justified.                                                                                                                                                                                                                                                                                                          |
| 5   | `cards/GaugeCardRenderer.tsx`             | `paddingX: '8px'` is not a CSS property — the min/max range row never had its intended horizontal padding.                                                                                                                                                                                                                                                                                                                                             |
| 6   | `cards/ApexChartsCardRenderer.tsx`        | ApexCharts v4 renamed legend marker `width`/`height` → `size`; the 8px markers were being dropped.                                                                                                                                                                                                                                                                                                                                                     |
| 7   | `SplitViewEditor.tsx`                     | `onLayoutChange` was a stale `(layout: unknown[]) => void` placeholder matching neither its `GridCanvas` consumer nor `App`'s handler.                                                                                                                                                                                                                                                                                                                 |
| 8   | `utils/layoutCardExporter.ts`             | react-grid-layout v2 made `Layout` the whole (readonly) array rather than one item, so three `Layout[]` params were arrays-of-arrays and every `item.x/.y/.w/.h` read was untyped.                                                                                                                                                                                                                                                                     |
| 9   | `features/carousel/SwiperCarousel.tsx`    | Autoplay options were read via `?.` off a `CarouselAutoplayConfig \| false` union — `?.` does not narrow away `false`.                                                                                                                                                                                                                                                                                                                                 |
| 10  | `store/dashboardStore.ts`                 | `loadDashboard` was typed `filePath: string` while three call sites pass `null` and the store's own initial state is `null`.                                                                                                                                                                                                                                                                                                                           |
| 11  | `PropertiesPanel.tsx`                     | `handleInsertEntity` used `editor.getSelection()` with **no null fallback** (a null selection is not a valid monaco edit range). `YamlEditorDialog` had a fallback; `PropertiesPanel` did not.                                                                                                                                                                                                                                                         |
| 12  | `GridCanvas.tsx`, `HADashboardIframe.tsx` | react-grid-layout v2 reads grid geometry **only** from `gridConfig`; the v1 flat props both files passed were silently ignored, so the canvas had been rendering on the library's defaults (`rowHeight: 150`) instead of the app's configured `56`. See the section below.                                                                                                                                                                             |

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

## react-grid-layout: the canvas was running on library defaults

> **Correction.** An earlier revision of this document claimed the 3
> `layout.visual.spec.ts` failures were "pre-existing, caused by antd v6 metric
> drift" and needed re-baselining. **That was wrong on both counts.** The real
> cause is below; the snapshots were correct all along and now pass unchanged.

`main` renders the canvas through react-grid-layout's **v1 flat props**
(`cols` / `rowHeight` / `margin` / `containerPadding`). rgl v2 — already in
`package.json` on `main` as `^2.2.2`, bumped back in Phase 4 — reads geometry
**only** from `gridConfig` and silently ignores those props.

So the canvas had been rendering on rgl's own defaults (`rowHeight: 150`,
`margin: [10, 10]`, `containerPadding: null`) rather than the app's configured
`56` / `[16, 16]` / `[0, 0]`. Nothing failed loudly; the configuration was just
being dropped.

The arithmetic confirms it, predicting every observed dimension exactly:

| Geometry in effect                   | colWidth | width (w=6) | height (h=4)          |
| ------------------------------------ | -------- | ----------- | --------------------- |
| `main` — rgl defaults ignored config | 89.17    | **585**     | 630 → clamped **440** |
| branch — config actually honoured    | 85.33    | **592**     | **272**               |

The 440px ceiling in the screenshot helper (`min(max(260, h), 440)`) is what hid
the 630px blow-up. The branch had swapped to the `react-grid-layout/legacy` shim,
which _does_ honour `rowHeight: 56` — so cards suddenly rendered at 272px, content
overflowed, and the fixed-size icon circles squashed into ellipses. That is what
the 3 "stale snapshot" failures actually were.

**Resolution** (commit `ee7b927`): both call sites migrated to the real v2
composable API, with geometry pinned to rgl's defaults — i.e. what the canvas has
genuinely been rendering — so it stays pixel-identical for users while the
configuration becomes real instead of ignored. All 3 visual specs pass unchanged;
no re-baselining was needed.

Deliberately **not** the 56px row that `cardSizingContract.ts` documents
("1 row = 56px in HA sections grid"). Honouring 56 is the correct end state for
Home-Assistant-Sections parity, but it makes every card ~2.7× shorter and needs
the card `h` heuristics re-tuned first. Constraint is documented at the call site
in `GridCanvas.tsx`.

Full canvas suite at `ee7b927`: **19/19 e2e green** across
`dashboard-operations`, `card-palette`, `layout` and `layout.visual`.

### Method note — how the wrong diagnosis happened

Both wrong calls came from the same mistake: **bisecting across working copies on
different filesystems.** `layout.spec.ts:62` and several `dashboard-operations`
tests fail in the WSL-mounted checkout and pass consistently in a `/tmp` worktree
at _identical_ commits — the antd Select option detaches between `toBeVisible()`
and `.evaluate()`, and the flake rate tracks machine speed. Comparing a `/tmp`
worktree against the WSL checkout therefore measured the filesystem, not the code,
and produced a confident but fabricated culprit.

**Rule:** to test whether a failure is a regression, run the pre-branch source in
the **same** working copy —
`git checkout <base> -- src tsconfig.json`, rebuild, run, then
`git checkout HEAD -- src tsconfig.json`. Only compare across worktrees once the
baseline is shown to be stable in that worktree too. Matches the known
"Ant Design Select in Playwright" pattern in `TESTING_STANDARDS.md`.

---

## Still open

- **Production dependency vulnerabilities.** The headline `npm audit` figure
  (53 / 3 critical / 36 high) is misleading: 45 are electron-forge and vitest
  build tooling, mostly with no fix available. Scoped to what ships,
  `npm audit --omit=dev` reports **8** — of which **6 are cleanly fixable**,
  including the one critical: `swiper` prototype pollution (a real production
  dependency powering the carousel card). `dompurify` / `monaco-editor` need a
  semver-major. This is a small, well-scoped batch, not a security project.
- ESLint 8 → 9 flat config + `@typescript-eslint` 5 → 8 + Prettier.
- **Home-Assistant-Sections parity for the canvas**: move `GridCanvas`'s
  `GRID_CONFIG` to the documented 56px row, which requires re-tuning the
  `cardSizingContract` `h` heuristics (content clips at that scale) and adding
  `flex-shrink: 0` to the fixed-size icon circles — the same pattern appears in
  ~7 card renderers. Will require re-baselining `layout.visual.spec.ts`.
- **e2e flakiness**: fix the antd-Select detach in `tests/support/dsl/layout.ts`
  (`selectOptionByText`) so results stop depending on working-copy speed. This is
  the prerequisite for making Playwright a blocking check.
- Phase 7: the bulk multi-select undo-granularity `test.fixme` in
  `tests/integration/bulk-operations.spec.ts` is still registered despite a
  commit claiming it was fixed.
