# Render Fidelity Plan — closing the gap between HAVDM's canvas and Home Assistant

**Status:** Plan of record. Owner-signed-off 2026-07-31.
**Baseline:** `main` = `565875a`, version `0.7.5-beta.10`.
**Supersedes:** nothing. **Superseded by:** nothing.

---

## 1. The problem, measured

HAVDM's canvas does not show what Home Assistant will render. This was reported
by the project owner during UAT round 2 and then measured directly: the live
`control-panel` dashboard (3 masonry views) was read read-only over the HA
WebSocket API, screenshotted from Home Assistant's own frontend, and loaded
into HAVDM. Both renders were measured at a 1280×720 viewport.

**Home Assistant:** view area 1024 px wide, 3 columns at 339 px, cards 331 px
wide, **total view height 857 px — the whole view fits one screen.**

**HAVDM canvas:** 1142 px wide, 12-column grid, every card `w=6` → 585 px
except the `horizontal-stack` at `w=12` → 1180 px, so **two cards per row, not
three. Grid height 2890 px.**

| Card                                                            | HA         | HAVDM        | Height error |
| --------------------------------------------------------------- | ---------- | ------------ | ------------ |
| `custom:power-flow-card-plus` "Energy Flow"                     | 331×374    | 585×790      | 2.11×        |
| `custom:apexcharts-card` "Energy — PV · Load · Import · Export" | 331×394    | 585×790      | 2.01×        |
| `custom:apexcharts-card` "Daily Energy — …"                     | 331×462    | 585×790      | 1.71×        |
| `entities` "Amber Import/Export Price"                          | 331×174    | 585×470      | 2.70×        |
| `custom:apexcharts-card` "Amber — Import & Feed-in Price"       | 331×276    | 585×630      | 2.28×        |
| `custom:apexcharts-card` "Grid Import & Export Energy"          | 331×276    | 585×630      | 2.28×        |
| `horizontal-stack` (Import Limit + Import Control)              | 331×**57** | 1180×**630** | **11.05×**   |

Total: **857 px of Home Assistant becomes 2890 px of HAVDM — 3.37×.**

These numbers are the reference oracle for the tests in this plan. They were
captured on 2026-07-31 against HA 2026.7.4.

### 1.1 Four root causes

1. **The flat canvas row height is 150 px where the project's own contract says 56.** `src/components/GridCanvas.tsx` sets `rowHeight: 150`;
   `src/utils/cardSizingContract.ts` computes every `h` in 56 px rows. The
   producer and the consumer disagree on the unit. **150 / 56 = 2.68×, which is
   the measured inflation range almost exactly** — this cause alone explains six
   of the seven cards. The comment above `GRID_CONFIG` already documents the
   divergence and names its blockers (content clipping, missing
   `flex-shrink: 0` on fixed-size icon circles).

2. **No column-count parity.** Home Assistant derives its column count from
   available width. HAVDM uses a fixed 12-column grid whose per-card default is
   `w: 6`, so a wide canvas always yields two cards per row. This is the 1.77×
   width error, and it also lays every embedded chart out at the wrong aspect
   ratio.

3. **Heights are type-based heuristics, not measurements**, and four of the
   seven cards are `custom:` types the heuristic has never seen. The
   `horizontal-stack` case proves heuristics are the wrong _shape_ of solution:
   Home Assistant sizes that card to its children (57 px) and no per-type
   constant can produce that. The answer is a measurement.

4. **Structural — for a masonry view, HAVDM's canvas geometry is not data.**
   Measured across the whole live config: `view_layout` 0 occurrences,
   `grid_options` 0, `layout_options` 0, `column_span` 0. **Home Assistant
   masonry stores no position and no size for any card.** Order in the `cards`
   array plus each card's intrinsic content height is the entire layout model.
   `src/services/haExportContract.ts` classifies `_havdm_layout` as `'strip'`
   and states it plainly: per-card geometry is removed at the export boundary.

### 1.2 What survives a deploy, and what does not

|                      | Masonry view  | Sections view                                     |
| -------------------- | ------------- | ------------------------------------------------- |
| Card type and config | survives      | survives                                          |
| Card order           | survives      | survives                                          |
| Position / size      | **discarded** | **survives** as `grid_options: { columns, rows }` |

`grid_options` is listed in `HaNativeKey` in `src/services/haExportContract.ts`
— "deliberately NOT classified — they cross the boundary unchanged" — and
HAVDM already writes it from `src/utils/sectionsLayout.ts` via
`onSectionCardResize`.

Two further facts follow, both verified:

- **Order is not a position either.** Home Assistant chooses which column each
  card lands in by its own balancing. Measured on `control-panel` view 0, config
  order 0–6 produced columns `[0, 1, 6]`, `[2, 3]`, `[4, 5]` — cards 0 and 1
  sharing a column while two columns were still empty. Reordering cannot place a
  card. Column _count_ is HA's too, derived from viewport width.
- **HAVDM already ships two canvases with different row heights.**
  `src/utils/sectionsLayout.ts` documents and uses HA's true 56 px cell, while
  `GridCanvas` renders the flat canvas at 150 px. **The 2.68× inflation is a
  flat-canvas-only defect; the sections canvas is already dimensionally
  correct.**

### 1.3 Live Preview is the only truthful render

`handleEnterLivePreview` in `src/App.tsx` sends `yamlService.sanitizeForHA(config)`
— the stripped config — to `haWsCreateTempDashboard`, and the preview is an
iframe onto a real Home Assistant temporary dashboard. **Live Preview is
therefore always correct and will always disagree with the canvas beside it.**

This promotes Live Preview from a convenience to a load-bearing feature, and
with it three items that were previously rated lower:

- **UAT HA-08** (the preview URL is hidden under cards and cannot be copied) is
  obstructing the only honest view, not merely inconvenient.
- **Temporary dashboards are leaking.** Three remain on the reference instance:
  `temp-dashboard-editor-1766729930446`, `temp-dashboard-editor-1785488482593`
  and `temp-dashboard-editor-1785488513912`. The latter two are from the round-2
  session and carry `control-panel`'s exact shape, which indicates Close is not
  deleting them. Per `UAT_STRATEGY.md` §4 teardown is the tester's, so these are
  reported here rather than removed.
- **`tests/e2e/live-preview-deploy.spec.ts` is still a pure placeholder.**

---

## 2. The security decision that bounds the solution space

Home Assistant's rendering _can_ be executed rather than re-implemented — a
Lovelace card is a custom element, and the whole technique is
`createElement(tag)`, `setConfig(config)`, `el.hass = hass`. Home Assistant's own
dashboard editor renders its live card preview exactly that way.

Verified against the reference instance: `{ type: 'lovelace/resources' }`
returns 11 registered resources, every one `type: module`, and they are served
**anonymously** — `curl` with no auth header returns HTTP 200 for
`/hacsfiles/apexcharts-card/apexcharts-card.js` (1,627,706 bytes) and
`/hacsfiles/power-flow-card-plus/power-flow-card-plus.js` (311,603 bytes).

**Decision (owner, 2026-07-31): third-party card JavaScript must never execute
in HAVDM's main renderer, and the `script-src 'self'` CSP in `src/main.ts`
stays.** That renderer holds the user's long-lived Home Assistant token and
reaches a preload bridge whose `fs:readFile` / `fs:writeFile` accept any
absolute path unvalidated. `contextIsolation: true` and `nodeIntegration: false`
are correctly set and do not prevent remote code from calling the preload API
HAVDM itself exposes.

**This is not a decision that HAVDM will never render real Home Assistant
cards.** The objection is to the blast radius, not to the rendering. Rendering
real cards in an isolated, preload-less, sandboxed surface remains open — gated
on Phase C below.

**No container is required.** Electron 39.2.7 already provides the sandbox when
it is not weakened: a `BrowserWindow` with its own `session.fromPartition`,
**no `preload`**, `sandbox: true`, `contextIsolation: true`,
`nodeIntegration: false`, a `setPermissionRequestHandler` that denies
everything, and a `webRequest.onBeforeRequest` allow-list restricted to the HA
origin. Omitting the preload is the whole security argument: no preload means no
`window.electronAPI`, which means no filesystem and no IPC. A container would
additionally contain a Chromium sandbox escape, but that is a far higher bar
than the realistic threat — a malicious or compromised HACS card — and it would
require Docker on every end user's machine, which breaks the installer
distribution model.

**Offline independence is achievable; independence from ever connecting is not.**
The dependency is on the _code_, not the connection, and code can be cached
under `userData` and served from a local origin. But which cards exist is a
property of the user's own Home Assistant instance, so HAVDM can never ship
them — licensing, size, version drift, and above all the shipped set would not
match what the user actually has installed. **HAVDM's own card renderers
therefore remain the permanent never-connected fallback. Real-card rendering is
additive, never a replacement.**

---

## 3. The plan

Phases A, B and C are independent of one another. D and E are the only
sequential pair. **All of this runs behind the UAT round-2 remediation for
v1.0.0 purposes** — seven open High-severity defects, not render fidelity, are
what block the release.

### Phase A — Honesty (pre-1.0)

**A permanent fix, not a stop-gap.** Rendering fidelity changes what a card
_looks like_; it does not make a dragged position deployable, because masonry
has nowhere to store one. The disclosure below is correct forever and must not
be removed when later phases land.

- **A1.** On a masonry view, disclose that position and size are a working
  preview and will not deploy, that card order does carry across, and that
  converting the view to Sections is the route to layout that survives. Proposed
  copy:

  > This is a masonry view. Home Assistant places these cards itself and sizes
  > them to their content — the positions and sizes you set here are a working
  > preview and will not deploy. Card order does carry across. To control layout
  > that survives deployment, convert this view to Sections.

  The conversion route already exists and is tested: `describeSectionsConversion`
  and `handleConvertToSections` in `src/App.tsx`, View Settings → Type →
  Sections, helper `convertViewToSections` in `src/utils/sectionsLayout.ts`.

- **A2 (test).** Assert the disclosure is present on a masonry view and absent
  on a sections view.

This is the same defect class PR #107 closed three times — EXPORT-04, PROPS-05
and VIEWS-06 were all honesty defects, and the ruling on record reads: _the
defect was the silence; an unexplained default is indistinguishable from a
broken one._

### Phase B — Canvas accuracy (post-1.0, owner decision 2026-07-31)

No security decision, no HA connection, and it is the only phase that helps
built-in cards and never-connected users.

- **B1.** `GridCanvas` `rowHeight` 150 → 56, aligning the flat canvas with
  `sectionsLayout`'s existing 56 px cell. Blocked on the two issues the existing
  comment names: content clipping at the smaller row, and `flex-shrink: 0` on
  fixed-size icon circles. Re-tune the `cardSizingContract` `h` heuristics as
  part of the same change.
- **B2.** Derive the column count from canvas width the way Home Assistant does,
  instead of the fixed 12-column grid with a `w: 6` default.
- **B3 (test).** `render-fidelity.spec.ts` — load a **checked-in fixture**
  masonry config and assert per-card aspect ratios and total view height are
  within a stated tolerance of the §1 reference numbers. **Red today by
  2.1×–11×; write it before B1/B2 so it is a genuine control leg.** Use a
  fixture, never a live fetch — the live dashboard will drift and a test that
  reads it is not reproducible.
- **B4 (test).** Assert `GridCanvas`'s row height equals `sectionsLayout`'s
  56 px cell — a one-line guard against the two canvases drifting apart again.

**Regression gate: SLOW.** B1 moves nearly every visual baseline;
`TESTING_STANDARDS.md` Trigger Rule 2 (>5 consuming specs) applies on its face.
Escalating needs no ruling.

### Phase C — Security hardening (independent; do regardless)

Worth doing on its own merits whether or not Phases D and E ever happen, and a
**prerequisite** for them — the isolation argument in §2 is only true, rather
than asserted, once the bridge it isolates from is itself bounded.

- **C1.** Constrain `fs:readFile` / `fs:writeFile` to paths the user has chosen
  through a dialog, rather than any absolute path. Currently [STATE]'s top
  security item.
- **C2.** Tighten `shell:openExternal`.
- **C3 (test).** Assert a path outside the allowed set is refused.

### Phase D — Spike (post-1.0; output is a decision, not a feature)

Time-boxed. In an isolated, preload-less `BrowserWindow`: load one HACS module,
instantiate one real card, hand it a minimal read-only `hass`, and measure it.

**Must be proven against a packaged build.** The CSP in `src/main.ts` is applied
only when `MAIN_WINDOW_VITE_DEV_SERVER_URL` is unset, so this feature would work
in development and fail in the shipped application — the same trap UAT FILE-03
taught.

Known unknowns the spike must answer:

- How much of the `hass` object real cards actually require. Cards read
  `states`, `themes`, `locale`, `config`, `user`, `formatEntityState`,
  `callService`, `connection` and `localize` in varying subsets, discovered only
  by cards throwing. A card that calls `hass.callService` **must be neutered** —
  the canvas must never actuate a real device.
- Whether built-in cards are reachable at all. `apexcharts-card` is a
  self-contained module and is trivially loadable; `entities`, `thermostat`,
  `markdown` and `tile` live inside HA's application bundle with no stable
  standalone path, and HA's documented route is `window.loadCardHelpers()` →
  `createCardElement(config)`, which exists only inside the HA frontend app
  context. **A HACS-only spike would look like a breakthrough while covering the
  minority of cards** — say so explicitly in the spike's report.

**Exit criterion:** a go/no-go recommendation with measured evidence, not a
partial implementation.

### Phase E — Real-card rendering (only if D says go)

- **E1.** Module cache under `userData`, keyed on the `hacstag=` query parameter
  the resources list already carries — that tag is the version, so it is a free
  cache-invalidation key.
- **E2.** HA-origin network allow-list on the isolated session.
- **E3.** Editing chrome as an overlay — selection borders, drag handles,
  `data-card-index`, context menus. A real HA card is opaque, and overlay
  alignment is exactly what the current cross-origin `<iframe>` in
  `src/components/HADashboardIframe.tsx` cannot support.
- **E4.** HAVDM's own renderers retained as the never-connected fallback.
- **E5 (test).** Measure a fixture through the isolated window against the §1
  reference numbers, **then delete the temporary dashboard and assert it is
  gone** — closing the leak recorded in §1.3 in the same spec.

The same isolated window that renders a real card can measure it, so
"measure and cache" is not a separate workstream; it is Phase E's offline data
source.

---

## 4. Risks

| Risk                                                             | Mitigation                                                                            |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Phase A's disclosure is deleted when E lands                     | §3 Phase A states it is permanent. A2 fails if it is removed                          |
| B1 re-baselines visual snapshots inside a release window         | Owner decision 2026-07-31: Phase B is post-1.0                                        |
| Phase D is scoped as "delete the renderers"                      | E4 makes retention explicit; §2 states real-card rendering is additive                |
| The spike passes in dev and fails packaged                       | D requires a packaged-build proof                                                     |
| Cached third-party JS becomes stale or is itself a trust surface | E1 keys on `hacstag`; C1/C2 land first                                                |
| HA internals are not a stable API                                | Accepted. An HA upgrade can break E; the fallback in E4 is what makes that survivable |

## 5. Reference material

- Measurement method, HA-frontend screenshot recipe and shadow-DOM walker:
  MemPalace `drawer_havdm_investigations_2c0acc60ef2c99abd090102b`.
- What survives a deploy, and the two-canvas discovery:
  `drawer_havdm_investigations_db0214a3d99548fbccecd3a6`.
- Borrow-don't-mimic strategy: `drawer_havdm_decisions_061da971b7872181c7969190`.
- Capability correction (real cards are executable):
  `drawer_havdm_decisions_d1f96e9ee7b04e685959aa8b`.
- The security decision and the container answer:
  `drawer_havdm_decisions_0f9619ea3f92e3bcf04a531f`.
- UAT round 2 review and the theme/stack defects:
  `drawer_havdm_investigations_c50d8065652aa246b0edbe27`.
