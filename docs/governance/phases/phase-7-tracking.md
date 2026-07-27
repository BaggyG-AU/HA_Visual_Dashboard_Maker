Phase Name: Phase 7 – Ecosystem & Future Growth
Document Type: Phase Tracking (blueprint §18)
Blueprint: docs/governance/phases/phase-7-ecosystem-future-growth-blueprint.md
Amendments: docs/governance/phases/phase-7-ecosystem-future-growth-amendment-01.md,
docs/governance/phases/phase-7-ecosystem-future-growth-amendment-02.md
Last Updated: 2026-07-26
Package Version: 0.7.5-beta.10

# Phase 7 Tracking — Slice Status Board & Gate Evidence

This is the blueprint §18 tracking document. It is the input the Slice I Medium
Gate audits against (§19 requirement 2: "validate slice completion against
Section 12 and Section 13 prompts"; requirement 3: "validate required tests were
executed with evidence").

Slices A–D were executed February 2026 on branch
`feature/ecosystem-future-growth`, before the current one-commit-per-PR
discipline, and reached `main` together through PR #23 (`pre-migration-backup`,
merged 2026-02-26, merge commit `863a44c`). Slice F was executed July 2026 under
the current discipline as its own PR.

---

## 1) Slice Status Board

| Slice | Title                                     | Status                    | Commit    | Reached main via   | Date       |
| ----- | ----------------------------------------- | ------------------------- | --------- | ------------------ | ---------- |
| A     | Preset Marketplace foundations            | ✅ Delivered              | `8a3597e` | PR #23 (`863a44c`) | 2026-02-17 |
| B     | Theme Manager expansion                   | ✅ Delivered              | `536e3c1` | PR #23 (`863a44c`) | 2026-02-17 |
| C     | Card Duplication & Cloning                | ⚠ **PARTIALLY WITHDRAWN** | see §3    | amendment-02       | 2026-07-26 |
| D     | Bulk Operations & multi-select safety     | ✅ Delivered              | `f17be4d` | PR #23 (`863a44c`) | 2026-02-17 |
| E     | Version Control Integration boundaries    | ⚠ **READ-ONLY delivered** | see §3    | PR #83             | 2026-07-26 |
| F     | Import/Export Enhancements & hardening    | ✅ Delivered              | `7c1752d` | PR #80 (`128e8c4`) | 2026-07-26 |
| G     | Dashboard Analytics                       | 🚫 **WITHDRAWN**          | —         | amendment-01 §1.2  | 2026-07-26 |
| H     | Plugin System Architecture scaffold       | 🚫 **WITHDRAWN**          | —         | amendment-01 §1.3  | 2026-07-26 |
| I     | Medium Gate packaging & release readiness | ⬜ Not started            | —         | —                  | —          |

**Phase 7 Definition of Done is NOT met.** Outstanding: **Slice I (gate)** only.
Slice C was resolved 2026-07-26 by amendment-02 (action withdrawn, guarantee
delivered); Slice E landed read-only the same day, with `commitFiles` deferred as
a stated deferral (see §3).

---

## 2) Findings

### Finding 1 — Slice C was never implemented, and a commit mislabels Slice D as Slice C

**Severity: HIGH (scope integrity).** Surfaced 2026-07-26 while assembling this
document; not previously recorded anywhere.

Commit `f17be4d` is titled
`feat(phase-7 slices-c-d): add bulk selection operations and tie off undo-granularity gap`
and its body opens with "implement **Slice C** multi-select and bulk
operations". Per blueprint §12, multi-select and bulk operations are **Slice D**.
The commit labels its second half — the undo-granularity investigation — as the
"Slice D tie-off", but that was a sub-issue of the bulk-operations work, not a
slice.

What `f17be4d` actually contains: `src/utils/bulkSelection.ts`, batched
immutable store paths, and `tests/{unit,integration,e2e}/bulk-operations.spec.ts`.
That is Slice D, delivered.

**Slice C's deliverables do not exist.** Verified 2026-07-26 against `main`
(`128e8c4`):

- No duplicate/clone action anywhere in `src/`. A case-insensitive search for
  `duplicate|duplication|clone|cloning` across `src/**/*.{ts,tsx}` returns only:
  `duplicatePalette` (colour palettes — a different feature, `ColorPicker.tsx` /
  `useColorPalettes.ts` / `ColorPaletteManager.tsx`), `cloneConfig` (an internal
  deep-clone helper in `dashboardStore.ts`, not a user action), `cloneAndReplace`
  (`entityRemapping.ts`), and incidental comment prose.
- No clone utility under `src/utils/**` or `src/services/**` as the slice's
  Allowed Files anticipated.
- **No test coverage of any kind.** The Slice C prompt requires unit tests for
  the clone utility and copy isolation, integration tests for store history
  after duplicate/clone, and E2E coverage of duplicate and clone flows. None
  exist. `git log --all --diff-filter=A --name-only` finds no duplication or
  cloning spec ever added, on any branch in the repository's history.
- No DSL helper for duplication in `tests/support/dsl/` (only
  `colorPalettes.ts:duplicatePalette`).

**Partial functional overlap, delivered later by a different workstream.**
HAVDM has cut/copy/paste of cards, including across views and sections
(`handleCardCopy` / `handleCardPaste` / `copySectionCards` in `src/App.tsx`).
A user can copy a card and paste it to obtain a duplicate. But that work is
labelled in-source as **"Tier 4 slice 4.3a"** — WS4-A, July 2026 — and is a
different feature with different semantics (clipboard-mediated, geometry
dropped on paste, cross-section paste is copy-not-move by design). It is not
Slice C, it post-dates the Slice C claim by five months, and it does not supply
Slice C's required per-card duplicate action, cross-view clone action, clone
utility, or any of its three required test layers.

⚠ **CORRECTION (2026-07-26).** As first written, this section claimed "the
clipboard paste path already deep-copies". **That was wrong.** Both the copy
side (`.map((card) => ({ ...card }))`) and the paste side
(`{ ...cardWithoutLayout }`) were **shallow** spreads, and
`dashboardStore.updateConfig` stores the incoming config as-is — it deep-clones
only the _previous_ config onto the undo stack. So pasted cards shared their
nested branches by reference with their source. The error is recorded here
rather than silently overwritten, because it materially understated the case for
delivering Slice C's state-safety half.

**RESOLVED 2026-07-26 by amendment-02** — see
`docs/governance/phases/phase-7-ecosystem-future-growth-amendment-02.md`. The
disposition is a split, not a straight keep-or-drop:

- The **duplicate/clone UI action** is **WITHDRAWN** as redundant with the
  cut/copy/paste delivered by WS4-A Tier 4 slice 4.3a. A dedicated Duplicate
  button adds one keystroke over the existing path and would put a new
  persistent affordance on the card action surface, shifting the boundingBox
  clip `tests/e2e/layout.visual.spec.ts` captures.
- The **state-safety guarantee** ("avoid shared references", "deep-copy mutable
  nested configuration branches") is **DELIVERED** against the existing
  clipboard path: `src/utils/deepClone.ts` and `src/utils/cardClipboard.ts`
  (new), wired into all four clipboard sites in `src/App.tsx`, with
  `tests/unit/card-clone.spec.ts` (16 tests, the file name the slice prompt
  specifies).

⚠ Severity was and remains **an unguarded hazard, not a demonstrated bug**: no
in-place mutation of nested card config exists in `src/`, so the aliasing never
had to surface. No user-visible defect was reproduced and none is claimed.

### Finding 2 — `tools/checks` under-reported (fixed in this slice)

`./tools/checks` is the first verification command in the Slice I prompt and the
Medium Gate / Slow Gate command in `docs/testing/TESTING_STANDARDS.md`. It ran
lint → (typecheck commented out) → `npm ci` → unit. Corrected to mirror the
blocking CI job: lint → format:check → typecheck → unit. Detail in
amendment-01 §3.

### Finding 3 — version progression was inconsistent (resolved in this slice)

`package.json` `0.7.5-beta.10` vs blueprint `INITIATION_VERSION: 0.7.7-beta.0`
(never applied) vs refresh-plan WS3 "target v1.0.0 at close". Resolved:
`0.7.5-beta.10` → `1.0.0`, applied once, inside slice I, conditional on a GO.
Detail in amendment-01 §2.

---

## 3) Per-Slice Evidence

### Slice A — Preset Marketplace foundations ✅

- Commit `8a3597e` (2026-02-17), 12 files, +830/−94.
- Source: `src/services/presetService.ts`,
  `src/features/preset-marketplace/{PresetMarketplacePanel.tsx,catalog.ts,types.ts}`,
  `src/components/DashboardBrowser.tsx`, `src/App.tsx`.
- Tests: `tests/unit/preset-service.spec.ts`,
  `tests/integration/preset-marketplace.spec.ts`,
  `tests/e2e/preset-marketplace.spec.ts`, DSL
  `tests/support/dsl/presetMarketplace.ts`.
- All three required test layers present. ✅

### Slice B — Theme Manager expansion ✅

- Commit `536e3c1` (2026-02-17), 10 files, +1268/−158.
- Source: `src/features/theme-manager/{index.ts,storage.ts,types.ts}`,
  `src/services/themeService.ts`, `src/store/themeStore.ts`,
  `src/components/ThemeSettingsDialog.tsx`.
- Tests: `tests/unit/theme-service.spec.ts`,
  `tests/integration/theme-integration.spec.ts`,
  `tests/e2e/theme-manager.spec.ts`, DSL `tests/support/dsl/themeManager.ts`.
- All three required test layers present. ✅

### Slice C — Card Duplication & Cloning ⚠ PARTIALLY WITHDRAWN

Never implemented as scoped (see Finding 1). Resolved 2026-07-26 by
amendment-02: **action withdrawn, guarantee delivered.**

- Withdrawn: the per-card Duplicate action and cross-view Clone action —
  redundant with cut/copy/paste (WS4-A Tier 4 slice 4.3a).
- Delivered: the State Safety Rules half. `src/utils/deepClone.ts` (extracted
  from `dashboardStore`'s private `cloneConfig`, which now delegates to it) and
  `src/utils/cardClipboard.ts` (`cloneCardsForClipboard`,
  `prepareCardsForSectionPaste`, `prepareCardsForFlatPaste`, plus the
  `CardWithInternalLayout` type moved out of `App.tsx`). All four clipboard
  sites in `src/App.tsx` now route through them.
- Tests: `tests/unit/card-clone.spec.ts`, 16 tests. ⚠ **NOT red-before-green** —
  the transforms are new pure modules, so on base the spec fails with an
  unresolved import, not a behavioural failure. There was no pre-existing
  testable seam; the extraction _is_ the fix. The spec carries a
  characterisation block that pins the old shallow-spread semantics and
  demonstrates the aliasing, so the hazard is proven in the suite rather than
  only asserted in prose.
- Integration/E2E coverage of "duplicate and clone flows" does not attach: no
  such flow was built. The clipboard flows the change touches are covered by
  `tests/e2e/bulk-operations.spec.ts` and the existing view/sections specs.

### Slice D — Bulk Operations & multi-select mutation safety ✅

- Commit `f17be4d` (2026-02-17), 13 files, +967/−94. ⚠ Titled "slices-c-d" and
  self-described as "Slice C" — see Finding 1.
- Source: `src/utils/bulkSelection.ts`, `src/store/dashboardStore.ts`,
  `src/components/GridCanvas.tsx`, `src/components/PropertiesPanel.tsx`,
  `src/components/SplitViewEditor.tsx`, `src/App.tsx`.
- Tests: `tests/unit/bulk-operations.spec.ts`,
  `tests/integration/bulk-operations.spec.ts`,
  `tests/e2e/bulk-operations.spec.ts`, DSL updates to
  `tests/support/dsl/{app,canvas,propertiesPanel}.ts`.
- All three required test layers present. ✅
- **Known issue at ship time, since RESOLVED:** the commit marked
  `tests/integration/bulk-operations.spec.ts` "applies bulk property edit to
  selected cards and preserves undo granularity" as `test.fixme`, believing undo
  granularity was broken. Investigated 2026-07-20: the belief was wrong twice
  over. Undo granularity was never broken — the store already recorded one
  history entry per bulk edit. The real defect was a stale properties form,
  because antd's `form.setFieldsValue` **merges**, so a key the reverted card no
  longer has was never cleared. Fixed by computing the stale set from the live
  form store. The test is **unskipped and passing**. Recorded in
  `docs/testing/SKIPPED_TESTS_REGISTER.md` "Resolved" table.

### Slice E — Version Control Integration boundaries ⚠ READ-ONLY DELIVERED

Implemented against `docs/governance/phases/phase-7-slice-e-command-contract.md`,
which was narrowed and signed off BEFORE any code, as the slice's own Operator
Decision Tree requires ("if any IPC command scope is unclear, stop and narrow
command contract first").

**Scope delivered — six READ operations.** `isRepo`, `status`, `branch`, `log`,
`diffFile`, `showAtRev`, plus three repo-designation channels
(`listRepoRoots` / `designateRepoRoot` / `clearRepoRoots`).

⚠ **`commitFiles` (contract operation 7) is DEFERRED, not delivered** — the
contract's own §5 and §11 recommendation, accepted at sign-off: committing from a
dashboard editor is a meaningful escalation of blast radius, and a read-only
surface is useful on its own. Everything touching a remote or rewriting history
was out of scope by contract. **This is the only respect in which slice E is
narrower than blueprint §12's "safe additive git workflow integration"**, and it
is a stated deferral rather than a silent gap. Adding the write later is additive:
one channel, one argv builder, one confirmation surface.

- Source: `src/services/versionControlService.ts` (new — the PURE half: argv
  builders, validators, parsers; ⚠ must never import `electron`,
  `node:child_process` or `node:fs`, which is what makes the security logic
  testable without an Electron host), `src/main.ts` (the nine handlers and the
  execution envelope), `src/preload.ts` (nine typed members — one channel PER
  OPERATION, never a generic `vcs:exec`, so operation dispatch never crosses to
  the renderer's side of the boundary), `src/components/VersionControlDialog.tsx`
  (new — portal modal, mounted only while open), `src/menu.ts`,
  `src/services/settingsService.ts` (`vcsRepoRoots`).
- Tests, all three required layers: `tests/unit/version-control-service.spec.ts`
  (70), `tests/integration/version-control.spec.ts` (10),
  `tests/e2e/version-control.spec.ts` (4). Unit 801 → 871.
- ⚠ **Not red-before-green** — a new module has nothing to fail against on base.
  The coverage earns its place by asserting REJECTIONS: `HEAD~3`, `@{upstream}`,
  `a..b`, `^`, uppercase hex, a 41-char id, `../outside`, `/etc/passwd`,
  `C:\…`, a UNC path, `.git/config`, an embedded NUL, a sibling directory
  sharing the root's name prefix, and every `GIT_*` variable including one
  invented by the test. A validation layer is worth what its refusals are worth.
- ⭐ **The UI entry is a MENU item, not a toolbar button.** A persistent in-flow
  element above the canvas shifts the boundingBox clip
  `tests/e2e/layout.visual.spec.ts` captures; a native Electron menu is not in
  the DOM at all. `layout.visual` 3/3 confirms it.
- Security posture actually implemented: `execFile` with an argv array and no
  `shell` option anywhere; argv built only in main; `realpath` on both the root
  and the file before the containment check, so a symlink cannot escape the
  tree; user-supplied paths always after a `--` separator; `rev` restricted to
  hex-or-`HEAD`; every `GIT_*` key dropped from the child env with
  `GIT_TERMINAL_PROMPT=0` / `GIT_OPTIONAL_LOCKS=0` forced; 10 s timeout; 5 MB
  output cap; one git invocation in flight per repo root; git-absent reported as
  a first-class state rather than an error.
- ⚠ Repo designation is the gate that makes containment meaningful: without it,
  "is the file inside repoRoot?" is trivially satisfied by a renderer supplying
  both halves. Roots are set ONLY via the native directory dialog and stored
  realpath'd; the renderer cannot designate a path, only request the prompt.

### Slice F — Import/Export Enhancements & conversion hardening ✅

- Commit `7c1752d`, PR #80, merged `128e8c4` (2026-07-26), 5 files, +421/−56.
- Source: `src/services/yamlService.ts` (`cleanView` and `parseDashboard` both
  flipped to pass-through), `src/services/haExportContract.ts` (view-key
  contract + `_AllViewKeysClassified` compile-time guard),
  `src/services/exportSelfCheck.ts` (`scanViewLevelKeys`).
- Tests: +12 unit across `tests/unit/haExportContract.spec.ts` and
  `tests/unit/yaml-service.spec.ts` (773 → 785). Seven failed on base before
  implementation; three are documented in the PR as regression guards that pass
  on base rather than red-before-green.
- Integration compatibility baselines named by the slice prompt —
  `tests/integration/yaml-operations.spec.ts` and
  `tests/integration/service-layer.spec.ts` — both run and pass.
- **Scope deviation, stated not skipped:** the slice prompt lists "E2E coverage
  for enhanced import/export user flows" as a required test. The _flows_
  (JSON/UI-mode conversions, richer import sources) were explicitly scoped out
  as feature additions rather than conversion hardening, so that requirement
  does not attach to what shipped. Those remain open feature work.
- Inverse-risk verification: all 8 `tests/fixtures/*.yaml` exported on feature
  and on base (via `git stash push -- src/`) and diffed — identical as
  multisets, zero keys gained or lost. Only observable change is key _order_.

### Slice G — Dashboard Analytics 🚫 WITHDRAWN

Never started. Withdrawn by amendment-01 §1.2. No code to remove.

### Slice H — Plugin System Architecture scaffold 🚫 WITHDRAWN

Never started. Withdrawn by amendment-01 §1.3. No code to remove.

### Slice I — Medium Gate packaging & release readiness ⬜

Not started, and **no longer blocked** — Slice C (amendment-02) and Slice E
(read-only) both landed 2026-07-26. This is the last outstanding slice in the
phase. Its prep checklist is §5 below.

⚠ Two things slice I must record explicitly rather than trip over: the 8 known
e2e failures (accepted-known, not gate failures) and the load-sensitive
`tests/integration/entity-browser.spec.ts:380` flake. It must also carry the
`commitFiles` deferral into the Go/No-Go rationale, since blueprint §12 described
Slice E more broadly than what shipped.

---

## 4) Gate Baseline (verified 2026-07-26)

| Gate                   | Result                                   |
| ---------------------- | ---------------------------------------- |
| `npm run typecheck`    | 0 errors                                 |
| `npm run lint`         | 0 errors / 147 warnings                  |
| `npm run format:check` | clean                                    |
| `npm run test:unit`    | 871 passed (72 files)                    |
| `npm run package`      | OK                                       |
| `electron-e2e`         | 244 passed / 8 failed / 2 skipped (Xvfb) |
| `electron-integration` | 169 passed / 0 failed / 19 skipped       |

Unit count history: 773 (pre-slice-F) → 785 (slice F, `7c1752d`) → 801 (Slice C
state-safety, +16 in `tests/unit/card-clone.spec.ts`) → 871 (Slice E, +70 in
`tests/unit/version-control-service.spec.ts`). e2e 240 → 244 (+4 in
`tests/e2e/version-control.spec.ts`); integration 159 → 169 (+10 in
`tests/integration/version-control.spec.ts`).

⚠ **NEW known integration flake, first observed 2026-07-26** during the Slice C
state-safety run: `tests/integration/entity-browser.spec.ts:380` ("should insert
entity ID into Dashboard YAML editor") failed at 5.6 s under full-suite load
with `locator.check: Clicking the checkbox did not change its state` at
`tests/support/dsl/entityBrowser.ts:250` — an antd radio reporting the click
landed while the control's state did not change. **Passes isolated**: a targeted
`entity-browser.spec.ts` run gave 24 passed / 0 failed, with the specific test
green at 14.5 s. This is the documented antd-interaction flake family, not a
regression — the Slice C change touches the clipboard transforms, a deep-clone
helper and the store's history-snapshot delegate, none of which has a path to an
entity-browser table radio. The integration baseline remains **159 passed / 0
failed / 19 skipped when green**; this spec is now load-sensitive. Slice I should
expect it and re-run isolated rather than treating it as a gate failure.

The 8 e2e failures are the documented known set: 7 stable-known
(`advanced-slider.visual:16`, `apexcharts.visual:26`, `attribute-display:95`,
`calendar.spec:29`, `card-background.visual:8`, `popup.visual:20`,
`tabs.visual:33`) plus `multi-entity.spec:71` (timing/load-sensitive family).
Slice I must record these explicitly as accepted-known rather than as gate
failures, or resolve them.

Known unit flake: `DeployDialog.spec` "sends the sanitised config…" near-times
out under full-suite load (~5.2–5.7 s vs ~3.2 s isolated); passes 4/4 isolated.

**3 documented test skips** in `docs/testing/SKIPPED_TESTS_REGISTER.md`
(2 e2e + 1 integration `describe.skip`), each with a reason and revisit trigger.
Slice I must confirm the register is current at gate time.

### 4.1) Medium Gate run — executed 2026-07-27 on `main` = `6e63c2d`

Full results and the Go/No-Go are in
`docs/governance/phases/phase-7-ecosystem-future-growth-medium-gate.md`.

| Gate                   | Medium Gate result                                | vs baseline  |
| ---------------------- | ------------------------------------------------- | ------------ |
| `./tools/checks`       | exit 0                                            | held         |
| `npm run lint`         | 0 errors / 147 warnings                           | held         |
| `npm run format:check` | clean                                             | held         |
| `npm run typecheck`    | 0 errors                                          | held         |
| `npm run test:unit`    | 871 passed (72 files)                             | held         |
| `npm run package`      | OK                                                | held         |
| `electron-e2e`         | **245 passed / 7 failed / 2 skipped** (47.0 min)  | **improved** |
| `electron-integration` | **169 passed / 0 failed / 19 skipped** (27.8 min) | held         |

⭐ The e2e failing set was diffed line-for-line against the 7 stable-known and is
**identical**. `multi-entity.spec:71` (Family B) **passed** at 23.6 s, which is
precisely the 244 → 245 / 8 → 7 delta — load-sensitivity confirmed, not breakage.

⭐ The load-sensitive `tests/integration/entity-browser.spec.ts:380` **passed in
the full-suite run** at 11.8 s, so no isolated re-run was needed. It also did not
recur in the slice E run — two consecutive clean full-suite runs.

⚠ **The `DeployDialog.spec` unit flake changed character during this session.**
871/871 on both gate executions, then it failed 4 consecutive full-suite runs
once the machine had run both Electron suites and a package build — while passing
isolated 3/3 at 3050–3281 ms against its 5000 ms timeout. Proven not a
regression: reverting to a tree identical to `6e63c2d` in the same checkout still
reproduced it. Root cause is full-suite `environment` overhead rising ~15%
(163 s → 187 s) and eating the spec's ~1.8 s margin. **Follow-up work, not a gate
blocker** — see the Medium Gate report's Residual Risk.

**Result: GO** (technical readiness), confidence 88/100. ⚠ Per amendment-03 §3
this GO is **necessary but not sufficient** for v1.0.0 — an accepted UAT round
(slice J) is also required, and **this gate applies no version bump**.

---

## 5) Medium Gate Prep Checklist (blueprint §18 item 8)

- [x] Slice C disposition decided — amendment-02: action withdrawn, guarantee delivered
- [x] Slice E delivered with its three required test layers (read-only; `commitFiles` deferred — §3)
- [x] `tools/checks` corrected so the gate's first command checks what CI checks
- [x] Version progression resolved and recorded (amendment-01 §2)
- [x] Slice A–F evidence assembled (this document, §3)
- [ ] Full `electron-e2e` + `electron-integration` runs captured with artifact paths
- [ ] Known-failure set re-confirmed and explicitly accepted or resolved
- [ ] `docs/testing/SKIPPED_TESTS_REGISTER.md` confirmed current
- [ ] YAML round-trip and IPC/preload compatibility validated (§19 requirement 4)
- [ ] Go/No-Go decision written to
      `docs/governance/phases/phase-7-ecosystem-future-growth-medium-gate.md`
- [ ] Version bump to `1.0.0` applied — only on GO, only at the packaging milestone
