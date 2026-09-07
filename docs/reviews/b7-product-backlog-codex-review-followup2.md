# B7 product-backlog repair — second scoped follow-up, 2026-09-08

**Author:** OpenAI Codex / GPT-6 Astra — same independent reviewer as the first pass and first follow-up; author of none of the roadmap or its repairs.

**Reviewer:** n/a — follow-up; cross-check none.

**Owner gate:** micah / BaggyG-AU. Reviewer clearance and owner approval of the reviewed document are both required before seeding. This review supplies clearance with a nonblocking finding; it does not supply owner approval or seed anything.

**Owner profile:** the owner is a non-developer. The summary and decision brief below are written for that reader.

**Scope:** rev 1 → rev 2 of `docs/strategy/2026-09-07-product-backlog-seeding.md`, `29a43c633dcd37b2e43aa81dee5387a8d5daf3e6` → `224ec8a22d706c6a72d1b9a27c791bd081c1f9ba`, plus Round 3's declared radius in `docs/reviews/b7-product-backlog-repair-dispositions.md`. Reviewed at `dc17c204cb67b227458ea1a923cff79388e22e22` on `feature/b7-product-backlog`.

**Write restrictions:** this review file only. No roadmap, dispositions, earlier-review, source, test or governance edit; no Issue/board write, UAT marking, memory-state update, push or merge. The governance pause remains in force; no new rule, gate, checker, template, ledger or board procedure is proposed.

**Headless execution:** `./tools/checks` is the whole Markdown-only gate. No Electron, integration, packaged-app or live-HA suite is expected or was run. Any Electron work would use `bash tools/test-headless.sh` with the appropriate project and `--workers=1`, projects sequentially and never alongside the unit suite. No headed application was launched. The Node probes execute existing predicates/helpers in memory.

CLEAR-WITH-FINDINGS

| Ref | Result, in plain English                                                                                                                                       | Severity now | Blocks | Fix complexity (1–5) | Recommendation |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------ | -------------------- | -------------- |
| P1  | Future work now has a recorded home or an explicit choice to leave it out. Three descriptions of the supporting evidence still need small wording corrections. | SEV 3        | None   | 1                    | Fix now        |
| P2  | Resolved: the plan now correctly describes the missing-editor message and which layout conversions still cause export problems.                                | None         | None   | 1                    | Accept as-is   |
| P3  | Resolved: proposed link restrictions are labelled as proposals, and real-card rendering carries the existing isolation and trust limits.                       | None         | None   | 1                    | Accept as-is   |
| P4  | Resolved: the rendering proposal now names both prerequisite security changes.                                                                                 | None         | None   | 1                    | Accept as-is   |
| P5  | Resolved: the three owner choices remain accurately recorded.                                                                                                  | None         | None   | 1                    | Accept as-is   |
| P6  | Resolved: the document freezes when it seeds the board.                                                                                                        | None         | None   | 1                    | Accept as-is   |
| P7  | Resolved: signing remains a release requirement without a promise that security alerts disappear.                                                              | None         | None   | 1                    | Accept as-is   |
| P8  | Resolved: the later-work table and its estimate summaries now agree.                                                                                           | None         | None   | 1                    | Accept as-is   |

For closed rows, **Accept as-is** means retain the repaired text, not accept a residual defect. Complexity 1 is the table's minimum: no further repair is needed for those rows. No deferred or accepted-residual disposition is inferred from this review.

**Owner Decision Brief — P1, remaining record wording**

- **What this protects:** an accurate account of the evidence behind your plan, including the earlier status of work you chose to leave out.
- **What goes wrong:** one search result is misdescribed; planned generator improvements are also called deferred; and withdrawing a mistaken successor claim has become a broader claim that no successor exists.
- **Is the product affected? No by this repair.** MEASURED: the repair changes only the roadmap. These remaining descriptions change neither app behaviour nor your explicit choice about what to carry. This is not a fresh audit of whether the older features have been delivered.
- **Options and costs:** correct the three descriptions with local wording edits, or keep the document with this review recording the inaccuracies. Neither option requires implementation work or changes the epic selection.
- **Recommendation and why:** fix the wording under the existing P1 fix-now ruling. The correction preserves your choices and avoids passing inaccurate history to later briefs.
- **If you do nothing:** the review remains nonblocking, but the document retains the three record problems below. Owner approval is still required before seeding.

## 2. Confidence and method

**Citation convention:** B:108 means line 108 of the roadmap at `224ec8a`; D:321 means line 321 of the dispositions file at `dc17c20`. Other source anchors refer to the unchanged checkout. Line anchors were read from the files, not copied blindly from Round 3.

**Starting stop gate — MEASURED, matched before substantive review.** Branch `feature/b7-product-backlog`; clean tree; HEAD `dc17c204cb67b227458ea1a923cff79388e22e22`; `main` and `origin/main` both `eb5c91804a2057d4f62c49ff2564335fe7250960`. The eight commits ahead, in order, were `8f27d08`, `ffa0416`, `9f64e4e`, `29a43c6`, `af8db5b`, `244020a`, `224ec8a`, `dc17c20`. The completed `./tools/checks` process returned **REAL_EXIT=0, 4/4 steps**: `eslint`, `prettier --check`, `tsc --noEmit`, `vitest run`. **0 lint errors / 145 warnings; 1559 tests passed / 105 files.** The exit came from the completed process; its captured output contained each step and the totals.

**Review-file gate — MEASURED:** the completed `./tools/checks` process returned **REAL_EXIT=0, 4/4 steps**, with **0 lint errors / 145 warnings; 1559 tests passed / 105 files**. The exit was read from the completed process and the four steps/totals from its captured output. Only this review file was added. The final source-radius wording and this result entry were followed by a final gate on the completed review file.

**Method — MEASURED.** Read the whole second-follow-up commission, Round 3, the repair diff and the revised text alongside the first follow-up's dispositions. Compared every semantic change after removing Markdown table padding for inspection. Repository rules and the governing review template are unchanged from the previous pass. Re-executed the real notice predicate, conversion helpers and `isGoverned`; repeated the requested searches and identity enumeration; read live Issue #159. The results below distinguish executed behaviour from source traces and judgement.

**Memory boundary.** Before substantive work, the prescribed practice-index read by ID and MemPalace status both returned **Transport closed**. Earlier drawer contents retained in this conversation were available for the remediation order, F9a split, card breadth, eleven-card scope, isolation, vision and strategy. They are retained September 7 evidence, not fresh September 8 memory reads. The commission directly supplies the latest owner rulings, and Round 3 records the same choices. Round 3 points to a new decision drawer via its session message and current `[STATE]` rather than printing its ID; neither that drawer nor current `[STATE]` could be fetched here. The claimed state update remains **UNVERIFIED**. No process termination, lease override or direct palace-database access was attempted.

**Repeated population — MEASURED.** Executed the six literal pathspecs from B:81:

```sh
git ls-files 'docs/product/*.md' 'docs/refresh/*.md' 'docs/features/*.md' 'docs/architecture/*.md' 'docs/governance/phases/*.md' 'docs/releases/*.md'
```

Result: **64 paths**. Repeated the published discovery fragment:

```sh
grep -liE "post-1\.0|post 1\.0|\bdeferred\b|phase 8|follow-up needing|revisit trigger|future release|post-release"
```

Its filename input was constructed from `git ls-files 'docs/**/*.md'`, excluding `docs/reviews/`, `docs/archive/`, `docs/testing/uat/sessions/` and `docs/testing/uat/plans/` as the accompanying prose specifies: **113 inputs, 38 matching paths, exit 0**. These reproduce the previous review's populations. Git comparison against `244020a` found only the roadmap changed among those paths. Reconciled the previous hand inventory again against rev 2, re-reading affected source passages and each exclusion's status. No additional unhomed product intention was found in that bounded reconciliation. This does not certify the author's reading or the completeness of the discovery instrument.

**Discriminating probes — MEASURED.** The installed TypeScript parser located the JSX expression containing the actual missing-editor message; Node evaluated its original left-hand predicate, including negation, for the eleven named types. Separate AST enumeration read matching type guards and named `Form.Item` fields. Existing conversion helpers and the ledger export were loaded through an in-memory TypeScript/CommonJS hook; neither helper nor predicate was reimplemented. Assertions checked the reported outputs and exited 0. No probe file or test was added. These probes would contradict the old notice and universal conversion claims; the ordinary unit gate alone would not decide those document claims.

**Limits and confidence.** High confidence in the measured predicate, helper, identity and wording results; bounded judgement on source reconciliation and strategy-seat fidelity. The UI route was hand-traced, not run. No Home Assistant, Windows installer, signed build, full Electron suite, visual-fidelity measurement, archive-wide discovery or unindexed-memory sweep was performed. Present delivery status of older intentions and the absence of consumers using another name remain **UNVERIFIED**. No release readiness or global backlog completeness is certified.

## 3. Claim ledger and reconciliation

| Claim                                                                                                           | Tag                  | Evidence / boundary                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The commissioned starting state and four-step gate matched.                                                     | MEASURED             | Git state and completed process, §2.                                                                                                                                                                               |
| Rev 2's notice statement matches both named card populations.                                                   | MEASURED             | Original predicate at `src/components/PropertiesPanel.tsx:6645`, closing membership test at `:6715`; eleven-result table below.                                                                                    |
| The two sections helpers retain an existing marker; direct layout-card, panel and sidebar conversions clear it. | MEASURED             | Actual helper outputs below; `sectionsLayout.ts:452/:480`, `viewsLayout.ts:256/:275`.                                                                                                                              |
| Selecting masonry on the normalized scaffold skips type conversion.                                             | INFERRED             | Hand trace: `ViewSettingsDialog.tsx:120` → `App.tsx:1984/:1988` → `viewsLayout.ts:157`; no UI run.                                                                                                                 |
| P1's missing layout intention now has a home, and the exclusions have a present-choice basis.                   | MEASURED / JUDGEMENT | B:112, B:120–141, B:293–299; commission's explicit owner placement. Three record remainders survive, §4.                                                                                                           |
| S06.4 distinguishes inherited hardening from candidate policy.                                                  | MEASURED             | B:247; `RENDER_FIDELITY_PLAN.md:236` says “Tighten”; `src/main.ts:205` forwards the URL.                                                                                                                           |
| E20 carries the inherited rendering limits and the whole named prerequisite.                                    | MEASURED / JUDGEMENT | B:291/:327–330; source Phases C–E and retained isolation ruling `drawer_havdm_decisions_0f9619ea3f92e3bcf04a531f`. Fresh drawer confirmation unavailable.                                                          |
| The rendering boundary remains strategy rather than a new implementation spec.                                  | JUDGEMENT            | Existing constraints, conditional spike and owner trust call are summarized; B:67–71 and B:293 still require later briefs/specs. No new mechanism or acceptance-test design is supplied.                           |
| The size summaries now agree.                                                                                   | MEASURED             | Enumerated E09–E20 cells: three Large, five Medium, one Small each, one Ongoing, two Not estimated; B:368/:398.                                                                                                    |
| The bounded radius checks support stable references and exclusion from the author-ledger fingerprint.           | MEASURED             | Actual grep, `isGoverned`, definition comparison and live Issue read below. This does not prove no programmatic consumer exists.                                                                                   |
| The previous blocker is closed; the remaining P1 descriptions are SEV 3 record accuracy.                        | JUDGEMENT            | Direct counterchecks close P2; B:121–124 independently grounds exclusions in the owner's choice, and B:108 explicitly leaves delivery unverified. Remaining wording changes alter neither selection nor behaviour. |

### Notice predicate and forms: the eleven named types

**MEASURED:** true means the actual notice condition is eligible to render within the panel; this is not a mounted-UI observation. The population comes from the retained scope ruling `drawer_havdm_decisions_01d44adf92567391b79a2a4d` and is the same eleven reviewed previously.

| Type                         | Notice predicate | Dedicated source branch / named fields                |
| ---------------------------- | ---------------- | ----------------------------------------------------- |
| `tile`                       | true             | No matching dedicated type guard                      |
| `heading`                    | true             | No matching dedicated type guard                      |
| `entity`                     | true             | No matching dedicated type guard                      |
| `statistics-graph`           | true             | No matching dedicated type guard                      |
| `custom:mini-media-player`   | false            | `:6138`; entity, name, icon, hide_source, hide_volume |
| `custom:slider-entity-row`   | false            | `:6215`; entity, name, min, max, step                 |
| `custom:battery-state-card`  | false            | `:6275`; title, entities, sort_by_level, collapse     |
| `custom:simple-swipe-card`   | false            | Shared branch `:6389`; title                          |
| `custom:multiple-entity-row` | false            | `:6446`; entity, name, secondary_info                 |
| `custom:fold-entity-row`     | false            | `:6499`; guidance/example, no named editable field    |
| `custom:decluttering-card`   | false            | `:6532`; template                                     |

B:217 now describes this result. The four core types have the generic fallback and notice; six palette types have partial dedicated forms; fold-entity-row has guidance; the notice predicate is false for the seven palette types. No issue found. No field-completeness spec or runtime form-usability certification is implied.

### Conversion helpers and caller

**MEASURED:** input was a `custom:grid-layout` view with `_havdm_scaffold: true`, grid layout metadata and one markdown card. Executed the actual exports:

| Path                         | Helper                    | Result type        | Marker   |
| ---------------------------- | ------------------------- | ------------------ | -------- |
| Scaffold → sections          | `convertViewToSections`   | sections           | retained |
| That sections view → masonry | `flattenSectionsView`     | masonry            | retained |
| Scaffold → layout-card grid  | `convertViewToLayoutCard` | custom:grid-layout | absent   |
| Scaffold → panel             | `setViewType`             | panel              | absent   |
| Scaffold → sidebar           | `setViewType`             | sidebar            | absent   |
| That panel → masonry         | `setViewType`             | masonry            | absent   |
| That panel → sections        | `convertViewToSections`   | sections           | absent   |

`normalizeViewType(input)` also returned masonry. **INFERRED, hand trace:** `App.tsx:1988` performs a type change only when the selected type differs from that normalized value. The sections branches at `:1989–1992` retain an inherited marker; direct layout-card and ordinary type changes use the clearing helpers at `:1993–2000`. `updateConfig` at `src/store/dashboardStore.ts:225` stores the supplied config; it does not reinsert the marker. B:176 expressly limits the defect to the keeping/no-op paths and says “Source trace, no UI run.” No issue found. The two sections helpers preserve an existing marker; they do not create one on an already unmarked view.

### Source population and exclusions

**Class reconciled:** recorded product intentions whose home or historical status can be lost when a source or delivered parent is excluded. Reconciled the 64-path/38-hit population from the previous review, S-A–S-R/S-T/S-U, every “reviewed and not carried” entry, and the changed summaries. S-S remains an intentional gap. The following groups account for the product-bearing material implicated by this repair; unchanged source readings remain available from the preceding review and were checked against the unchanged-file comparison.

| Source / intention group                                                                                                | Rev 2 reconciliation                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S-A–S-J: remediation, F9a split, UAT history/register, code map, Phase 7, refresh opportunities, parity, existing Issue | Homes and owner-ruled first three stories retained. No semantic source-row change in this group. P2 checks the repaired property/conversion descriptions separately. No additional unhomed intention found.                                                                                                                                                                                                                 |
| S-K–S-O: breadth, Recent Files, nesting, rendering Phases B–E, capability I5/I6                                         | E19, S05.4, E09 named candidate, S03.4/S06.1/S06.4/E20, S01.4/S01.5 retained. No issue found in their homes. The broad card programme still differs from repairing already offered palette cards.                                                                                                                                                                                                                           |
| S-P: strict export schema                                                                                               | S01.6 retained; delivery now explicitly UNVERIFIED. `HA_EXPORT_BOUNDARY_DESIGN_2026-07.md:357/:387` supplies the later schema contract. The search's four paths are correct, but its description of one comment is not; P1.                                                                                                                                                                                                 |
| S-Q: theme authoring/application                                                                                        | E18 named candidate retained; release notes v1.0.0 `:30/:58` explicitly distinguish it from existing theme consumption. No issue found.                                                                                                                                                                                                                                                                                     |
| S-R and duplicate popup/Bubble programme in advanced-feature summaries                                                  | Explicit Q3 owner exclusion retained. No issue found; the September 8 ruling supplies the choice without requiring an inferred wholesale historical withdrawal.                                                                                                                                                                                                                                                             |
| S-T: health scoring                                                                                                     | Source row is semantically unchanged and still maps amendment-01 `:139` to S01.7. Telemetry is separately dropped. No issue found.                                                                                                                                                                                                                                                                                          |
| S-U: advanced multi-row alignment                                                                                       | Release notes v0.7.4-beta.5 `:49/:92` name the deferral; B:112 quotes it faithfully and B:296–298 places it under E12 by owner ruling. Per-element Design editing at B:283 is compatible with this candidate. No issue found; a short epic outcome need not enumerate each candidate. Current implementation remains UNVERIFIED beyond the empty search.                                                                    |
| January update plan and version records                                                                                 | Present-choice exclusion now governs. WS1 is correctly identified as engineering-discipline uplift at `PROJECT_REFRESH_PLAN_2026-07.md:186–190`. The new blanket absence-of-successor clause goes beyond that correction; P1. Version-record classification remains appropriate to their dated status.                                                                                                                      |
| Generator and advanced editor; release v0.3.2-beta.1 follow-ups                                                         | Explicit present exclusion, with generator AI still in E17. The generator source distinguishes five Planned from four Deferred entries; B:132 conflates them, P1. The editor's code-only deferral and future AST/schema/validation/diff/snippet work remain visible; the release's additional examples, including multi-cursor editing, are covered by its explicit file-level exclusion. No additional missing home found. |
| Architecture roadmap, blueprint §20 and plugin H                                                                        | Architecture source calls itself aspirational at `:3`; blueprint `:1143–1147` expressly defers its three broad architecture items. Amendment-01 `:141` retains H's consumer-triggered revisit despite the withdrawn Phase 7 slice. Present exclusion does not cancel those records. No issue found in that scope choice.                                                                                                    |
| Bubble research, deprecated project plan and non-product hits                                                           | Research completion and deferred manual testing are distinct at `BUBBLE_CARD_V3_1_RESEARCH.md:585–610`. Deprecated plan, test wording, governance and test-infrastructure material remain explicitly outside this product seed. No additional product intention was inferred from those hits.                                                                                                                               |

The full historical source universe cannot be swept here: archives and unindexed drawers are outside the published population, and fresh memory is unavailable. No claim is made that an unknown later successor cannot exist. The old broad supersession premise is no longer needed for the current exclusion choice.

### Every semantic change and the declared radius

**MEASURED / JUDGEMENT:** padding-normalized comparison found exactly five changed existing definition rows: S-P, S01.3, S04.1, S06.4 and E20; S-U is new. S-T and the other rows whose table padding changed retain their text. Re-read those five, S-T/S-U, the exclusion paragraph, named candidates, §5 item 7, status header and revision history. No regression found beyond P1's source-record wording. The revision log's broad “true grep result” / source-status account inherits that same P1 limitation; it is not a separate finding.

- **Identity measurement:** 20 → 20 epic definitions (E01–E20), 30 → 30 story definitions, 19 → 20 source definitions. Existing IDs retained; S-U alone added; no duplicate definition. Hand comparison of the changed outcomes found no ID reused for unrelated work. E19/E20 remain last in the seeding order.
- **Literal consumer search:** `grep -rl "product-backlog-seeding" src tests tools .github package.json` returned no output, exit 1, no errors. Round 3 now correctly describes a bounded negative search. A differently named or indirect consumer is not ruled out.
- **Ledger:** the real `isGoverned` export at `tests/support/authorLedger.ts:70` returned false for the roadmap and this review, and true for `docs/governance/OPERATING_AGREEMENT.md`. Its governed set is declared at `:68`; no fingerprint inclusion was inferred from filename search alone.
- **Live downstream reference:** `gh issue view 159 --repo BaggyG-AU/HA_Visual_Dashboard_Maker --json number,title,body,url,state` returned the open F9a Issue. Its Process paragraph still names E01 / S01.1 and the roadmap path. No issue found in this reference; the rest of the Issue was not re-reviewed. [Issue #159](https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker/issues/159).
- **Other downstream state:** §6 still seeds twenty epics as ordinary Todo drafts, with existing #159 referenced rather than duplicated. The claimed `[STATE]` item 11 update is UNVERIFIED because transport is closed. No evidence of a wrong update was obtained.
- **Change boundary:** the unrestricted `git diff --name-only 29a43c6 224ec8a` names the roadmap, the intervening first-follow-up review and the dispositions record. The rev 2 content commit alone (`git diff --name-only 224ec8a^ 224ec8a`) changes only the roadmap; `224ec8a` → `dc17c20` changes only the dispositions record. No production, test, rule, template or governance change was present in the declared repair radius.

### Commission coverage

| Requested heading            | Explicit result                                                                                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. P2 closure                | No issue found. Both populations and the keeping/clearing conversion paths match the executed probes and labelled caller trace.                          |
| 2. P1 closure                | Homes and present exclusions repaired; P1 retains three SEV 3 record constructions. No additional unhomed intention found in the repeated bounded sweep. |
| 3. P3 closure                | No issue found. Candidate policy is labelled; E20 carries the five requested limits/conditions. The inherited boundary remains strategy.                 |
| 4. P4 closure                | No issue found. E20's row and §5 item 7 carry both named Phase C prerequisites and the trust decision.                                                   |
| 5. P8 closure                | No issue found. The table, Q1 con and estimate disclaimer agree.                                                                                         |
| 6. Regression sweep          | P1's record remainder is the exception described above. No other issue found across the semantic changes and padding-only rows.                          |
| 7. Radius                    | No issue found in the measurable bounded claim, ledger result, identities or live Issue reference. Fresh `[STATE]` verification remains unavailable.     |
| 8. Anything else in the diff | No additional issue found. Status/revision updates preserve the review sequence; no new finding class or P9 is allocated.                                |

**Weakest claims, including the author's five named claims.** (i) The author did not independently execute the conversion helpers; this review did, so closure rests on their actual outputs plus the labelled caller trace, not repetition of the earlier review. UI execution remains unverified. (ii) E12's compatibility with the new alignment candidate is judgement; placement is expressly owner-ruled and visible in the adjacent named-candidates paragraph, despite the unchanged short outcome. (iii) E20's “no file bridge and no IPC” is read as the inherited boundary of what card code may reach, not a freshly verified security guarantee or a specification of host internals. (iv) A reader might dislike the exclusion heading, but that is no demonstrated defect in the explicit present-choice framing; the actual source-description remainders are P1. (v) Literal path search cannot find an aliased consumer; the radius is cleared only at its stated bounds. Fresh memory, historical delivery and completeness of the wider intent universe remain the review's weakest evidence boundaries.

## 4. Dispositions of P1–P8

### P1 — PARTIALLY RESOLVED — SEV 3; Blocks: None

**Class swept:** descriptions that change or overstate a source's status/evidence while assigning or excluding its product intention. Reconciled every source row and exclusion entry within the repeated 64-path/38-hit population, including the changed summaries; inspected every one of the four `fidelity` matches and both generator status groups. Full historical successor absence is unsweepable with the declared population and unavailable fresh memory. That limit is stated before reporting the absence claim.

**Closed:** the additional alignment intention has its owner-placed E12 home; the exclusion paragraph now grounds the choice in the owner's present ruling; WS1 is no longer misidentified as component-update work; S-P and S-U explicitly leave delivery UNVERIFIED. No selection decision still depends on a missing home or the old blanket supersession premise.

**Remaining constructions — SEV 3 each, record accuracy only:**

1. **Search description, B:108.** The actual four matching paths are `src/features/theme-manager/themeOptions.ts`, `src/services/canvasKeyStripper.ts`, `src/services/yamlConversionService.ts` and `src/components/ThemeNoEffectBadge.tsx`. B:108 calls the non-theme matches “two comments naming the remediation plan.” `canvasKeyStripper.ts:2–4` does name that plan; `yamlConversionService.ts:176` instead says the exporter warns “so the fidelity loss is honest.” It does not name the plan. `rg -n 'fidelity'` across the four returned files enumerates those four matches. **Fix:** describe them as two theme files and two service comments mentioning fidelity, or list the paths. Retain delivery UNVERIFIED; the search cannot decide delivery.
2. **Source status, B:130–132.** The entry first correctly counts “five planned and four deferred,” then says, after mapping AI to E17, “the rest stay deferred as that document says.” `ENTITY_TYPE_DASHBOARD_GENERATOR.md:180–186` labels five items **Planned**; `:188–193` labels four **Deferred**, one being AI. The remaining eight therefore comprise five planned and three deferred, not eight source-deferred items. **Fix:** say the remaining items retain their source's planned/deferred status and are not carried by the owner's present choice.
3. **Successor absence, B:126.** “No later document is its successor” is broader than the measured correction that WS1 concerns engineering discipline. The source search for `UPDATE_PLAN`, component-update-plan wording and `successor` in the six published trees found references to the old plan, not an exhaustive historical absence proof; inaccessible/unindexed records remain outside the instrument. This review has **not found a counterexample** and does not claim a successor exists. **Fix:** withdraw the specific WS1-successor claim, or say no successor was established in the reviewed sources, without asserting global absence.

**Why now SEV 3, not the previous SEV 2:** the owner's explicit present choice at B:121–124 independently governs exclusion, and S-P now disclaims any delivery conclusion from the search. Correcting these records changes no selection, dependency or app behaviour. There is no remaining four-part SEV 1 case. The generator/source-search descriptions are inaccurate; the successor wording is an unsupported historical absolute, now ancillary to the choice rather than its premise.

**Direction and guard rails:** local wording corrections at B:108/:126/:130–132; keep the owner's exclusions, E12 placement and honest UNVERIFIED labels. Do not expand product scope or commission implementation work. **Complexity 1:** three local wording edits. This is the existing P1 seam, not a new P9.

### P2 — RESOLVED — remaining severity: None; Blocks: None

**Class swept:** source-backed descriptions of which named card types receive a form/notice and which scaffold-conversion branches preserve internal status. Swept the eleven types, the four conversion helpers, the standard outgoing choices and the caller's no-change branch; §3 reports each measured result and the UI limit.

B:217 now matches the negated notice predicate for both populations. B:176 correctly scopes the keeping paths and distinguishes clearing paths. Round 3's explicit correction to its earlier notice reading is consistent with the executable source and preserves the earlier rounds as history. **No issue found.** The S04.1 block is removed. Retain the repaired text; no further fix complexity applies.

### P3 — RESOLVED — remaining severity: None; Blocks: None

**Class swept:** candidate outcomes that can silently turn source intent into selected policy or omit inherited limits. Compared the touched S06.4/E20 outcomes and rechecked their interaction with S01.1/S01.2, S02.1, S03.3, S04.5, S01.4–S01.7, S05.4 and E19, whose previously corrected text is unchanged.

B:247 labels the exact link restriction as the author's candidate and attributes only “tighten” to the source. B:291 includes no file bridge/IPC reachable by card code, no third-party code in the main app, retained never-connected renderers, explicit owner trust and a spike-first conditional programme. These match the retained isolation ruling and `RENDER_FIDELITY_PLAN.md:239–277`. **No issue found**, including strategy-seat fidelity: carrying an existing boundary is not designing its implementation. Retain the repaired text; no further repair needed.

### P4 — RESOLVED — remaining severity: None; Blocks: None

**Class swept:** condensed dependencies that omit a required prerequisite or turn a preference into one. Compared the thirty story dependency cells, both post-1.0 programme rows and all seven §5 reasons with rev 1 and the retained source reconciliation. Existing nonempty cells remain S01.2 ← S01.1; S03.1–S03.3 ← B6; S06.2 ← owner credentials; S06.3 ← the full cited UAT prerequisites/fix PRs. No dependency-cell text changed in rev 2.

E20's row and B:327–330 now carry S06.1 **and** S06.4, plus trust. `RENDER_FIDELITY_PLAN.md:229–237` makes Phase C prerequisite to D/E, including its test work; the two named stories summarize C1/C2 rather than discard C3 verification. §5 applies the wait to E20 as a whole, including the spike. First-three-PR ordering and the two stated preferences are unchanged. **No issue found.** Retain the repair; no further repair needed.

### P5 — RESOLVED — remaining severity: None; Blocks: None

**Class swept:** the three recorded owner choices and their appearances in the summary, programme order, seeding procedure and Q1–Q3. These retain the first follow-up's cleared meanings: ordinary Todo seeding, parked fidelity with scheduling trigger, explicit popup-programme exclusion. E20's extra trust prerequisite does not purport to supply the trust decision. **No issue found.** No fresh memory read is claimed; the commission and in-repository rulings supply the current authority. No further repair needed.

### P6 — RESOLVED — remaining severity: None; Blocks: None

**Class swept:** document-freeze timing at B:32–41, §6 step 5 and the sign-off chain. These are unchanged: seeding freezes the document, and subsequent priority changes live on the board. **No issue found.** No further repair needed.

### P7 — RESOLVED — remaining severity: None; Blocks: None

**Class swept:** signing/distribution claims in S06.2, E06 and §5 item 5. The repaired signing row is semantically unchanged and requires measurement of security-software response after signing. It promises no alert-free result. **No issue found.** No signed build was tested. No further repair needed.

### P8 — RESOLVED — remaining severity: None; Blocks: None

**Class swept:** effort attribution across the twelve E09–E20 size cells, §7 Q1's con and §8's estimate disclaimer, plus the earlier cleared source-count/status constructions as carried into rev 2. The earlier S-E, S-G and S-D corrections remain unchanged; source-status wording already reported under P1 is not counted again here.

E20 now says **Not estimated**, consistent with E19, the measured Q1 size tally and B:398's limit to the refresh plan's estimates. The source's time-boxed spike at `RENDER_FIDELITY_PLAN.md:239` is not turned into a size. **No issue found.** No further repair needed.

**New findings:** none; P9 remains the next available identifier. The verdict derives from the one nonterminal SEV 3 disposition above.

## 5. Directions

The previous S04.1 blocker is closed. P1's remaining work is a local source-record correction; the existing owner fix-now ruling is recorded by the commission and Round 3. This reviewer has not edited the author's artifact. A wording repair should retain the explicit present choices, the new alignment home, the isolated-rendering boundaries and both prerequisite stories.

No implementation, new test, new governance mechanism or broader planning exercise follows from this finding. No further review round is owed solely by SEV 3 under the template. The owner may approve the reviewed document with this nonblocking record or have the author finish those wording corrections first; this review does neither on the owner's behalf. Seeding and merge remain outside this commission.

## 6. Disagreements

- **Round 3's P1 RESOLVED claim:** partly disagreed. The missing-home and decision-basis repairs hold; the three source-record constructions above prevent complete closure. This is not a challenge to the owner's right to exclude work or place alignment under E12.
- **Round 3's P2–P8 closure claims:** no disagreement within the stated evidence boundary. P2 was independently re-executed; P3/P4 inherited constraints and P8 estimates now agree with their sources. Prior P5–P7 closures survive the diff.
- **Author's concern about the long E20 outcome and exclusion heading:** no demonstrated defect in their strategy-seat status or present-choice meaning. No stylistic finding is manufactured.
- **Radius:** no disagreement with the revised bounded statement. The literal search cannot establish global consumer absence, and the memory-state update remains UNVERIFIED rather than accepted or contradicted.

## MemPalace drawer candidates

Transport remained closed. No drawer or state update was written. Under MP-LEASE, the write-enabled author may file this project-specific candidate with `added_by="codex"`; the review file is its canonical evidence.

**Candidate — havdm / investigations:** `[REVIEW] B7 second scoped follow-up, rev 1 29a43c6 → rev 2 224ec8a, reviewed at dc17c20 on 2026-09-08. Verdict CLEAR-WITH-FINDINGS. P2–P8 RESOLVED; S04.1 block removed after re-executing the eleven-type notice predicate and scaffold conversion helpers. P1 PARTIALLY RESOLVED, SEV 3 only: S-P misdescribes yamlConversionService.ts:176 as naming the remediation plan; the generator entry merges five Planned items into the Deferred status; the corrected WS1 clause overstates absence of any successor. Explicit owner exclusions, E12 alignment placement, candidate link policy, E20 isolation/trust/whole-Phase-C prerequisite, and Not estimated size all retained. Identity comparison: 20 epics and 30 stories unchanged; S-U alone added to 19 existing source definitions. Radius grep and real isGoverned checked; live #159 still names E01/S01.1. Starting and review-file gate results are recorded in §2. No app UI, Electron or live-HA run; fresh memory/state unverified because transport closed. Review only; no source, board, Issue, push or merge action. See docs/reviews/b7-product-backlog-codex-review-followup2.md.`
