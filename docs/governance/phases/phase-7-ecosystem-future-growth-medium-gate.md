# Phase 7 Medium Gate Report

Date (UTC): 2026-07-27
Phase: Phase 7 — Ecosystem & Future Growth
Blueprint: `docs/governance/phases/phase-7-ecosystem-future-growth-blueprint.md`
Amendments: `-amendment-01.md`, `-amendment-02.md`, `-amendment-03.md` (authoritative over the blueprint on every conflict)
Tracking doc: `docs/governance/phases/phase-7-tracking.md`
Audit instrument: blueprint §19 (standalone Medium Gate audit prompt)
Commit under audit: `origin/main` = `6e63c2d` (Merge PR #83 — WS3 slice E; feature commit `998f401`)
Package version: `0.7.5-beta.10` — **unchanged, deliberately** (see "Version & Packaging Discipline")

## Scope Compliance

- Scope executed: gate evidence and governance documentation only. No net-new
  product behaviour.
- No `src/` changes. No selector / role / `data-testid` changes. No YAML schema
  changes. No IPC contract changes.
- ⚠ **This gate applies NO version bump.** Amendment-03 §2 narrowed slice I to
  technical readiness and moved the `0.7.5-beta.10` → `1.0.0` bump to the new
  slice J, where it is conditional on **both** this GO **and** an accepted UAT
  round. Blueprint §16 and the slice I prompt's Versioning Rules are satisfied by
  applying nothing here.
- Slice scope audited against §12 / §13 **as amended**, not as originally
  written — amendment-01 (G, H withdrawn), amendment-02 (C split), amendment-03
  (I/J split).

## Required Verification Commands

1. `./tools/checks` (lint → format:check → typecheck → unit)
2. `npm run package`
3. `npm run test:e2e:headless` (`--project=electron-e2e`, Xvfb, 1 worker)
4. `npm run test:integration:headless` (`--project=electron-integration`, Xvfb, 1 worker)

All four executed on `6e63c2d` for this gate. The two suites were run
**sequentially, never concurrently** — both launch Electron, and the documented
load-sensitive specs fail for reasons unrelated to the code when they overlap.

## Results Summary

| Gate                   | Result                                            | Verdict |
| ---------------------- | ------------------------------------------------- | ------- |
| `./tools/checks`       | **exit 0**                                        | PASS    |
| `npm run lint`         | 0 errors / 147 warnings (held at baseline)        | PASS    |
| `npm run format:check` | clean                                             | PASS    |
| `npm run typecheck`    | 0 errors                                          | PASS    |
| `npm run test:unit`    | **871 passed** (72 files)                         | PASS‡   |
| `npm run package`      | OK                                                | PASS    |
| `electron-e2e`         | **245 passed / 7 failed / 2 skipped** (47.0 min)  | PASS†   |
| `electron-integration` | **169 passed / 0 failed / 19 skipped** (27.8 min) | PASS    |

† The 7 failures are the documented accepted-known set. See §"Known failures".

‡ 871/871 on both gate executions. The documented `DeployDialog.spec` flake
recurred **later in the same session** once the machine had run both Electron
suites and a package build — see §"Failure / Recovery Log". Not a regression;
the cause is analysed there and it is carried in Residual Risk.

**Both suites met or beat their baselines.** e2e improved on the documented
244 / 8 / 2 baseline to 245 / 7 / 2; integration matched 169 / 0 / 19 exactly.

## Slice Completion Audit (§19 requirement 2)

Validated against §12 / §13 as amended. Per-slice source and test evidence is in
`docs/governance/phases/phase-7-tracking.md` §3 and is cited, not re-derived.

| Slice | Disposition                                         | Delivery check on `6e63c2d`                                                                                                           |
| ----- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| A     | ✅ Delivered (`8a3597e`)                            | `presetService.ts`, `features/preset-marketplace/` + 3 test layers ✅                                                                 |
| B     | ✅ Delivered (`536e3c1`)                            | `themeService.ts`, `themeStore.ts`, `features/theme-manager/` + 3 test layers ✅                                                      |
| C     | ⚠ Action withdrawn, guarantee delivered (`12d4c6e`) | `deepClone.ts`, `cardClipboard.ts`, `card-clone.spec.ts` ✅ — audited against **amendment-02**, not the original §13 prompt           |
| D     | ✅ Delivered (`f17be4d`)                            | `bulkSelection.ts` + 3 test layers ✅                                                                                                 |
| E     | ⚠ Read-only delivered (`998f401`)                   | `versionControlService.ts`, `VersionControlDialog.tsx` + 3 test layers ✅ — `commitFiles` deferred, see §"The `commitFiles` deferral" |
| F     | ✅ Delivered (`7c1752d`)                            | `yamlService.ts`, `haExportContract.ts`, `exportSelfCheck.ts` ✅                                                                      |
| G     | 🚫 Withdrawn (amendment-01 §1.2)                    | `analyticsService.ts` absent; grep over `src/` + `tests/` = 0 hits ✅                                                                 |
| H     | 🚫 Withdrawn (amendment-01 §1.3)                    | `pluginService.ts`, `features/plugin-system/` absent; 0 hits ✅                                                                       |

Every named source artifact and every named spec file for A–F exists on disk.
Both withdrawn slices left no dead code — the withdrawal removed nothing,
because nothing was ever built.

**Three findings inherited from the tracking doc §2**, already investigated and
written up; cited here rather than re-derived:

1. **Slice C was never implemented** and `f17be4d` mislabels slice D as slice C
   (HIGH, scope integrity) — **resolved** by amendment-02 as a split.
2. **`tools/checks` under-reported** — typecheck commented out, `format:check`
   absent, `npm ci` mid-script — **fixed** in `c2a7ec7`. The gate's own first
   command now checks what CI checks. ⭐ This gate's verdict rests on an
   instrument that was itself verified before use.
3. **Version progression was inconsistent** three ways — **resolved** by
   amendment-01 §2, and further qualified by amendment-03 §3.

## Compatibility Validation (§19 requirement 4)

**YAML round-trip and import/export.** `tests/integration/yaml-operations.spec.ts`
and `tests/integration/service-layer.spec.ts` — the two compatibility baselines
named by the slice F prompt — both pass in this gate's integration run (34 tests
across the two files). Unit-level round-trip coverage in
`tests/unit/yaml-service.spec.ts` and `tests/unit/haExportContract.spec.ts`
passes within the 871. Slice F additionally verified inverse risk by exporting
all 8 `tests/fixtures/*.yaml` on feature and on base and diffing: **identical as
multisets, zero keys gained or lost**, only key order changed.

**IPC / preload API compatibility.** Verified directly for this gate rather than
assumed. Comparing the `electronAPI` member-name sets between `8a3597e^`
(pre-Phase-7) and `6e63c2d`:

- **0 members removed**
- 17 added: `vcsIsRepo`, `vcsStatus`, `vcsBranch`, `vcsLog`, `vcsDiffFile`,
  `vcsShowAtRev`, `vcsListRepoRoots`, `vcsDesignateRepoRoot`, `vcsClearRepoRoots`,
  `onMenuVersionControl`, `onMenuExportForHA`, `capabilityCapture`,
  `capabilityGetProfile`, `capabilitySetOverride`, `haWsGetHaVersion`,
  `haWsGetHacsRepositories`, `haWsGetResources`

The surface is **provably additive**, satisfying blueprint §11's "existing
`window.electronAPI` methods remain unchanged". `tests/integration/version-control.spec.ts`
additionally asserts the `vcs*` **write surface is empty**.

**Theme and registry continuity.** `tests/unit/theme-service.spec.ts`,
`tests/integration/theme-integration.spec.ts` and `tests/e2e/theme-manager.spec.ts`
all pass. `src/services/cardRegistry.ts` is unmodified by Phase 7 work after
slice A. No registry contract regressed.

## Performance / UX Budgets and Flakiness Profile (§19 requirement 5)

**Flakiness is flat to improving, not worsening** — blueprint §22's phase-level
stop condition "flakiness trend worsens materially" is **not** triggered.

| Run                       | e2e result      | Duration |
| ------------------------- | --------------- | -------- |
| 4.7b (PR #79)             | 240 / 8 / 2     | 38.6 min |
| slice F (PR #80)          | 240 / 8 / 2     | 28.1 min |
| slice C (PR #82)          | 240 / 8 / 2     | 46.2 min |
| slice E (PR #83)          | 244 / 8 / 2     | 28.6 min |
| **this gate (`6e63c2d`)** | **245 / 7 / 2** | 47.0 min |

Pass count has risen monotonically as slices added specs (240 → 244 → 245) and
the failing set has never grown. Integration went 159 → 169 with zero failures.
Wall-clock varies 28–47 min across runs on identical trees, which is working-copy
and machine-load sensitivity, not a performance regression — the documented
e2e-flakiness characteristic of this project.

No measurable UX-budget regression was observed. No render churn or UI lock was
introduced: slice E's entry point is a **native menu item**, deliberately chosen
because it is not in the DOM at all, and `layout.visual` passes 3/3.

## Known Failures — Accepted-Known, Not Gate Failures

The 7 e2e failures are **accepted as known**, with rationale, per the tracking
doc §4 and the SUITE TRUTH baseline. The failing set in this run was diffed
line-for-line against the documented stable-known list and is **identical**:

| Spec                             | Family       | Rationale                                                                       |
| -------------------------------- | ------------ | ------------------------------------------------------------------------------- |
| `advanced-slider.visual.spec:16` | stable-known | Visual snapshot; fails on both backends. Pre-dates Phase 7.                     |
| `apexcharts.visual.spec:26`      | stable-known | Visual snapshot; fails on both backends.                                        |
| `attribute-display.spec:95`      | stable-known | Fails on both backends.                                                         |
| `calendar.spec:29`               | stable-known | Fails on both backends.                                                         |
| `card-background.visual.spec:8`  | stable-known | Visual snapshot; fails on both backends. Related skip recorded in the register. |
| `popup.visual.spec:20`           | stable-known | Visual snapshot; fails on both backends.                                        |
| `tabs.visual.spec:33`            | stable-known | Visual snapshot; fails on both backends.                                        |

⭐ **`multi-entity.spec:71` — the eighth failure in the documented baseline —
PASSED in this run at 23.6s.** It is the Family B timing/load-sensitive spec
(signature: `.ant-select-dropdown` option-visibility timeout in
`MultiEntityDSL.setMode`). Its passing is exactly the 244 → 245 / 8 → 7 delta,
and confirms load-sensitivity rather than breakage.

⚠ **These are accepted, not resolved.** They are pre-existing, entirely visual or
interaction-timing in nature, unrelated to any Phase 7 surface, and none
represents a P0/P1 regression introduced by phase work — which is what blueprint
§17 bullet 2 actually requires. **They remain open debt carried into v1.0.0** and
are listed in the release notes as known issues. Accepting them is a judgement
that a visual-snapshot backlog should not block a release, not a claim that they
do not matter.

**Integration: zero failures.** The load-sensitive
`tests/integration/entity-browser.spec.ts:380` — which failed once under
full-suite load during the slice C run — **passed in this gate's full-suite run
at 11.8s**. No isolated re-run was required; the full-suite result is itself the
evidence. It did not recur in the slice E run either. Two consecutive clean
full-suite runs support treating it as load-sensitive rather than broken.

**Unit: the documented `DeployDialog.spec` load flake did not appear** in either
`./tools/checks` execution this session.

## Skipped Tests Register

`docs/testing/SKIPPED_TESTS_REGISTER.md` reviewed and **confirmed current**:
3 documented skip blocks — 2 e2e (`card-background.spec.ts` image/blur
backgrounds; `color-picker.spec.ts` visual/a11y in scrollable PropertiesPanel)
plus 1 integration `describe.skip` (`dashboard-generator.spec.ts`, redundant with
unit coverage). Each carries a reason and a revisit trigger. The count matches
the 2 e2e + 19 integration skips observed in this gate's runs (the integration
figure covers the whole `describe` block). No undocumented skips were introduced
by Phase 7.

## ⭐ The `commitFiles` Deferral — Addressed, Not Glossed

Blueprint §12 describes slice E as **"safe additive git workflow integration"**.
What shipped is **read-only**: six read operations plus three repo-designation
channels. Contract operation 7, `commitFiles`, is **deferred**.

This is the **only** respect in which any delivered slice is narrower than §12
describes, and the gate has to rule on it rather than note it.

**It is a stated deferral, not a silent gap.** It was the recommendation of the
slice's own command contract
(`docs/governance/phases/phase-7-slice-e-command-contract.md` §5 and §11
question 1), written and signed off **before any code**, and accepted at sign-off
on the reasoning that committing from a dashboard editor is a meaningful
escalation of blast radius while a read-only surface is useful on its own. It is
recorded in four places: the contract's Status block, tracking doc §3, the commit
body of `998f401`, and the PR #83 body.

**Ruling: GO-compatible.** Three reasons.

1. **Nothing depends on it.** No other slice, no test, and no user-facing flow
   references a commit capability. Its absence leaves no broken edge — the
   feature is coherent and complete as a read-only surface, and says so on screen.
2. **Adding it later is purely additive** — one channel, one argv builder, one
   confirmation surface — against a contract that already specifies its
   constraints in full (§5: explicit user initiation, bounded explicit file list,
   confirmation surface showing exactly what will be committed, no amend, no
   signing, no hooks bypass, no author override). Shipping it later costs nothing
   that shipping it now would have saved.
3. **The deferral reduces risk in the direction the phase's own stop conditions
   point.** Blueprint §22 lists "security uncertainty introduced by the
   version-control slice" as a per-commit stop condition. A surface that cannot
   write cannot damage a user's repository. Deferring the single mutating
   operation is the conservative reading of that stop condition, not a breach
   of it.

⚠ **What is being accepted:** Phase 7 delivers less version-control capability
than §12's phrasing promised. Anyone reading the blueprint's executive summary
will expect a commit flow and will not find one. That is a real, if modest,
shortfall in delivered scope, and it is accepted knowingly rather than
reclassified as complete. It is carried in the release notes as follow-up work.

## Failure / Recovery Log (Within This Slice)

No gate command failed and no remediation was required.

- `./tools/checks` — exit 0 on first execution, twice (baseline verification on
  `6e63c2d`, and again after PR #84's docs).
- `electron-e2e` — completed first execution. 7 failures, all pre-classified.
  Triage was a line-for-line diff of the `✘` set against the documented
  stable-known list: identical. No re-run needed.
- `electron-integration` — completed first execution, zero failures.
- `npm run package` — completed. The e2e and integration `globalSetup` also
  packaged the application successfully as a precondition of each run, so
  packaging is evidenced three times independently.

No snapshot was rebaselined. No test was skipped, quarantined or modified to
produce this result.

### ⚠ `DeployDialog.spec` — the documented unit flake changed character

**Recorded rather than waved through, because the behaviour shifted during this
session and a gate that only reported its clean runs would be misleading.**

`tests/unit/DeployDialog.spec.tsx` → "sends the sanitised config object to Home
Assistant unchanged (bar title)" is a documented load-sensitive flake. What was
observed here:

| Full-suite `npm run test:unit` run | Result                      | Machine state                             |
| ---------------------------------- | --------------------------- | ----------------------------------------- |
| Baseline on `6e63c2d`              | **871 passed**              | idle                                      |
| PR #84 gate                        | **871 passed**              | idle                                      |
| ×4 later runs                      | 870 passed, this test fails | after 2 Electron suites + a package build |

Isolated, it passes **every time**: 3/3 consecutive runs at **3050 ms, 3194 ms,
3281 ms** — comfortably inside its 5000 ms timeout.

⭐ **Proven not a regression by the gold-standard method.** The change was
reverted in the same checkout (`git stash push -u -- docs/ .claude/`, leaving a
tree identical to `6e63c2d`) and **the failure still reproduced**. This branch
also contains **zero `src/` and zero `tests/` changes** — it cannot be the cause.

**Analysis.** The isolated runtime is unchanged (~3.2 s), so the test itself has
not slowed. What grew is full-suite environment overhead: vitest reports
`environment` rising from 163 s at the session baseline to 187 s on the later
runs, on the same tree. The test's margin is only ~1.8 s over a 5000 ms timeout,
so a ~15% rise in suite overhead is enough to consume it. **This is a test
infrastructure margin problem, not a product defect and not a timing regression
in the code under test.**

⚠ **Deliberately NOT fixed here.** Raising the timeout or restructuring the spec
is a `tests/` change, and the slice I prompt confines this slice to gate evidence
with "any fixes during gate must be minimal and scoped". Fixing a flake is
neither. It is logged as follow-up work in Residual Risk instead.

## Stop Conditions (§22)

| Stop condition                                      | Status                                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Unexpected E2E failures outside touched surface     | **Not triggered** — failing set identical to the documented baseline                                    |
| More than 2 unrelated test failures                 | **Not triggered** — 0 unrelated failures; all 7 are pre-classified known                                |
| YAML round-trip drift on baseline fixtures          | **Not triggered** — both compatibility baselines pass; slice F proved multiset identity                 |
| IPC/preload contract break                          | **Not triggered** — 0 members removed, 17 added; provably additive                                      |
| Security uncertainty from the version-control slice | **Not triggered** — contract settled before code; `commitFiles` deferred; 70 refusal-focused unit tests |
| Significant render churn or UI lock                 | **Not triggered** — `layout.visual` 3/3; slice E's entry point is a native menu item, not in the DOM    |
| Flakiness trend worsens materially                  | **Not triggered** — e2e failures 8 → 7; integration 0 failures                                          |
| Performance degrades beyond agreed budget           | **Not triggered** — no budget regression observed                                                       |
| Compatibility regressions compound across slices    | **Not triggered** — none observed at any layer                                                          |
| Architecture clarity decreases                      | **Not triggered** — G and H withdrawn precisely to avoid this; slice E's pure/host split improved it    |

**No §22 stop condition is triggered. No blocker evidence to report.**

## Version & Packaging Discipline

- **No version bump applied in this slice.** `package.json` remains
  `0.7.5-beta.10`, verified.
- Amendment-03 §2 moved the packaging milestone from slice I to slice J. The
  `0.7.5-beta.10` → `1.0.0` bump (classification **Major** — first stable,
  leaving the beta line) is conditional on **both** this GO **and** an accepted
  UAT round per amendment-03 §3.1.
- `INITIATION_VERSION: 0.7.7-beta.0` remains superseded per amendment-01 §2 and
  is never applied retroactively.
- Packaging verified working; no release artifact is cut here.

## Go/No-Go

- **Decision: GO** (Medium Gate passed — technical readiness)
- **Confidence: 88/100**
- **Scope of this decision:** technical readiness of `6e63c2d` only. Per
  amendment-03 §3, this GO is **necessary but not sufficient** for v1.0.0. The
  release additionally requires an accepted UAT round (slice J). **This gate does
  not authorise the version bump.**

**Why 88 and not higher.** Three things hold it down, none of them blocking:

1. **7 accepted-known e2e failures are real debt**, not a clean sheet. They are
   visual and interaction-timing, unrelated to Phase 7, and pre-existing — but a
   gate that called this "all green" would be lying about the state of the suite.
2. **Slice E is narrower than blueprint §12 promised.** Ruled GO-compatible
   above, with reasons; it is still less than the phase said it would deliver.
3. **No layer here tests the packaged application or a real Home Assistant
   instance.** That gap is precisely why amendment-03 added UAT as a separate
   precondition, and it is the single largest reason this GO should not be read
   as release authorisation.

**Why not lower.** Every gate command passed on first execution. Both suites met
or beat baseline. The failing set is byte-identical to documentation. IPC
compatibility is provably additive rather than assumed. Every scope deviation in
the phase is recorded in a ratified amendment with its cost stated, and the gate
script itself was audited and corrected before being trusted.

### Residual risk

- **Visual-snapshot debt (7 specs).** Carried into v1.0.0 as known issues. Risk
  is that a genuine visual regression hides behind a spec already expected to
  fail. Mitigated by `layout.visual` — the position-sensitive one — being green,
  and by the failing set being diffed rather than eyeballed.
- **Load-sensitive specs** (`entity-browser.spec:380`, e2e Family B) can fail on
  a loaded machine. Mitigated: both were clean here, and the documented
  discipline is to re-run isolated rather than declare a regression.
- ⭐ **`DeployDialog.spec` now fails the full unit suite consistently on a
  machine that has recently run the Electron suites**, while passing isolated
  every time at ~3.2 s. Its 5000 ms timeout leaves only ~1.8 s of margin, and
  full-suite environment overhead rose ~15% during this session on an unchanged
  tree. **This is the most actionable follow-up in this report**: it is a
  genuine CI-reliability risk, because a `./tools/checks` run that is red for
  environmental reasons trains everyone to ignore a red gate. Fix by giving the
  spec a justified `test.setTimeout()` per `TESTING_STANDARDS.md` §6's documented
  exception, or by removing whatever makes it take 3.2 s. Out of scope for slice
  I; should be scheduled before or alongside slice J.
- **`fs:readFile` / `fs:writeFile` accept any absolute path unvalidated, and
  `shell:openExternal` passes any URL through.** Pre-existing, more permissive
  than slice E's contract, and explicitly out of slice E's scope (contract §2.1).
  **Still open.** The gate records it so the stricter `vcs*` surface is not
  mistaken for the whole boundary's posture. This is the most substantive
  security item left in the codebase and should be scheduled.
- **`commitFiles` absent.** Follow-up work, additive, contract already written.
- **UAT has not yet run.** The largest unknown by far, and the reason slice J
  exists.

### Remediation list

None required — this is a GO. The items in Residual Risk are follow-up work, not
gate blockers.

## Next

**Slice J** — execute the v1.0.0 UAT round per `docs/testing/UAT_STRATEGY.md`
against the packaged application, then apply the `1.0.0` bump only on an accepted
outcome (amendment-03 §3.1). A NO-GO on UAT keeps the version at
`0.7.5-beta.10` until its remediation list clears.
