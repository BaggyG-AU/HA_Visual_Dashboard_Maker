# B7 product-backlog seeding — independent review, 2026-09-07

**Author:** OpenAI Codex / GPT-6 Astra — independent reviewer; author of none of the target document.

**Reviewer:** n/a — first-pass review; cross-check none.

**Owner gate:** micah / BaggyG-AU; findings and recommendations are inputs to the owner's decision, not dispositions or seeding authorisation.

**Owner profile:** the owner is a non-developer. The summary and decision briefs below are written for that reader.

**Scope:** rev 0 of docs/strategy/2026-09-07-product-backlog-seeding.md at 8f27d08892e858ac352824548668024912eb6dc9, on feature/b7-product-backlog; base main = eb5c91804a2057d4f62c49ff2564335fe7250960.

**Write restrictions:** this review file only in the repository. No target, source-code or governance-document edit; no Issue or board write; no push, merge, UAT marking, or [STATE] update. No new governance mechanism is proposed. Home Assistant was not contacted.

**Headless execution rules:** Electron work, if needed, uses bash tools/test-headless.sh with --project=electron-e2e or electron-integration and --workers=1; the projects run sequentially, never alongside the unit suite. No headed suite is permitted. This Markdown-only commission requires ./tools/checks; Electron, packaged-app and live-HA suites are not expected and were not run. Their behaviour remains UNVERIFIED.

BLOCKED-ON: §2 source population, S04.1

| Ref | What is wrong, in plain English                                                                                              | Severity | Blocks               | Fix complexity 1–5 | Recommendation         |
| --- | ---------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------- | ------------------ | ---------------------- |
| P1  | Recorded future product work is missing from a list presented as the complete starting point.                                | SEV 1    | §2 source population | 2                  | Fix now                |
| P2  | The plan says newer cards have no dedicated editing fields, although several already do.                                     | SEV 1    | S04.1                | 2                  | Fix now                |
| P3  | Some story descriptions change or add to the decisions cited as their source without saying so.                              | SEV 2    | None                 | 2                  | Fix now                |
| P4  | The dependency column mixes required prerequisites with preferred order and leaves the first three changes ambiguous.        | SEV 2    | None                 | 2                  | Fix now                |
| P5  | The two owner choices omit useful consequences, and the preview choice ties scheduling to grouping unnecessarily.            | SEV 2    | None                 | 2                  | Owner judgement needed |
| P6  | The document gives two different events for when it becomes frozen.                                                          | SEV 2    | None                 | 1                  | Fix now                |
| P7  | Signing the Windows build is presented as a guarantee that security warnings will stop, without evidence for that guarantee. | SEV 2    | None                 | 1                  | Fix now                |
| P8  | A few source summaries and effort descriptions misstate the records they summarise.                                          | SEV 3    | None                 | 1                  | Fix now                |

**Owner Decision Brief — P5, whether to show later work now**

- **What this protects:** a useful view of future work without making later features promises for the next release.
- **What goes wrong:** the question describes all ten later areas as large, and treats keeping an archived source document as though it necessarily creates a competing live plan.
- **Is the product affected? No by seeding alone.** MEASURED: the proposed action creates draft board items, with stories still awaiting briefs and approved specs. Delivery timing is an owner choice, not measured by this review.
- **Options and costs:** show the later areas now as unscheduled drafts, accepting more board entries; or hold them for a later seeding session, accepting another retrieval and reconciliation pass. Neither option authorises implementation. Bookkeeping time has not been estimated.
- **Recommendation and why:** show them now, after repairing the missing-source population, because this makes retained work visible. Keeping them in an existing epic or making an additional epic is a grouping choice for the author and owner.
- **If you do nothing:** no seeding is authorised by this review. The existing first product item remains the only product item observed on the board.

**Owner Decision Brief — P5, whether to schedule deeper preview fidelity**

- **What this protects:** an honest expectation of how closely HAVDM's preview will match Home Assistant.
- **What goes wrong:** the question does not state the recorded revisit trigger, and offers only “parked inside this area” or “active in its own area.” Scheduling and grouping are separate choices.
- **Is the product affected? Yes, with a limit on the evidence.** The history drawer records incomplete theme consumption and the delivered interim badge. This review did not measure current visual fidelity in the app or Home Assistant; its present extent is UNVERIFIED.
- **Options and costs:** keep the work parked in an existing or separate epic, retaining the current preview limitation; or schedule it in either grouping, paying for the product decision, brief, spec, implementation and visual validation before delivery. There is no current cost estimate.
- **Recommendation and why:** retain the parked status while recording the actual trigger. When the canvas-fidelity contract is scheduled, its spec session opens the choice of fidelity standard. Seeding a parked candidate need not schedule it.
- **If you do nothing:** the existing parked decision continues. Draft creation still needs roadmap approval; silence on this review is not approval.

## 2. Confidence and method

**Evidence convention.** B means the target file at the pinned review commit; B:161 means its original line 161. Other path-and-line citations refer to the same checkout; its production files are unchanged from main. Drawer identifiers below were copied from returned source records, not reconstructed from memory. MEASURED means a direct read or command observation; INFERRED means a source trace or interpretation without runtime confirmation; JUDGEMENT means grading, scope or recommendation.

**Starting stop gate — MEASURED, passed before review work.** Branch feature/b7-product-backlog; HEAD 8f27d08892e858ac352824548668024912eb6dc9; main eb5c91804a2057d4f62c49ff2564335fe7250960; clean tree; one commit ahead; main..HEAD changed exactly the target Markdown file, 325 insertions. ./tools/checks returned **REAL_EXIT=0, 4/4 steps**: lint, format:check, typecheck, unit. Lint: **0 errors / 145 warnings**. Unit: **1559 passed / 105 files**. The exit code came from the completed process, not a pipe to tail; the captured log contained each of the four command invocations.

**Review-file gate — MEASURED:** ./tools/checks on the formatted review returned **REAL_EXIT=0, 4/4 steps** (lint, format:check, typecheck, unit), with **0 lint errors / 145 warnings** and **1559 unit tests passed / 105 files**. Only the review file was present in git status --porcelain. No Electron suite was running. The result was taken from the completed process and its captured command/test summaries.

The commission, main's adversarial-review template, ai_rules.md, CLAUDE.md and the applicable review/claim practice drawers were read. The practice index was fetched by its prescribed ID before substantive work. MemPalace reads succeeded, including the live state, state index, named source drawers, governance pause, no-override ruling and product decisions listed in §3. A memory write was refused with “Peer MCP writer active”; the prescribed fallback is at the end of this file.

The review combined three passes:

1. **Source population:** file inventory and searches for retained, deferred, future and withdrawn work across docs/product, docs/refresh, docs/architecture, docs/features, Phase 7 blueprint/amendments/tracker and UAT reports, followed by reading relevant sections and several complete plans. This included the refresh and parity documents, render-fidelity plan, capability inventory and export-boundary designs, remediation plan, architecture roadmap, HACS alignment and advanced-features plans, theme release notes, F5 spec, feature-request register and the model/workflow strategy. Older project/update plans and narrower feature plans were inspected for status and deferred sections. A file listing was a discovery aid, never completeness evidence.
2. **Item/status reconciliation:** hand-enumerated S-A, S-C, S-E, S-F and S-H below; compared round-1/round-2 summary failure IDs with round 3, inspected retained notes, checked live Issues and board items, and verified the seven delivered remediation PRs through GitHub and git ancestry.
3. **Document and code traces:** read all 24 candidate story rows and the ten later epic rows for source fidelity, class and dependencies. Inspected the property branches, store history/reset, download handler, malformed-card conversion, capability availability and capture, and view conversion paths. These are source observations, not interaction tests.

**Boundary.** High confidence in the two narrow blocking factual findings and in the measured mappings; moderate confidence in proposed scope/dependency interpretations. This is not certification that every product intention anywhere in the repository or palace has been found. Older plans may contain delivered or superseded aspirations: absence from this backlog is measured; their present implementation status is not generally measured. No full code audit, new regression test, user interaction, screenshot comparison, Windows signing experiment, packaged build, live-HA access, new UAT acceptance, remote full-suite result or cost estimate was performed. Source searches cannot establish rendered correctness, data loss in a running app, or the absence of every alternate UI route. Existing green unit tests do not prove the roadmap's completeness.

## 3. Claim ledger and reconciliation

| Claim                                                                                                                                           | Tag                  | Evidence and limit                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The commissioned starting state matched, and its checks passed.                                                                                 | MEASURED             | Git branch/HEAD/base/status/diff and the actual ./tools/checks process; §2 records the results.                                                                                                                                             |
| The live board had one Kind=product item, #159, and the open Issue set was #159 and #145.                                                       | MEASURED             | gh project item-list 2 --owner BaggyG-AU --limit 1000 --format json returned 20 items; each item's Kind/status was inspected. gh issue list --state open --limit 1000 returned those two Issues. Snapshot on 2026-09-07, not board history. |
| Remediation items 1–7 have merged delivery evidence.                                                                                            | MEASURED             | PR/ancestry table below, plus history and ruling drawers. “Merged” does not independently prove every acceptance criterion.                                                                                                                 |
| The five required source populations have the mappings below.                                                                                   | MEASURED / INFERRED  | Entries are direct source reads; assigning a recorded need to an epic is a labelled hand reconciliation. Missing work is not inferred merely from absent keywords.                                                                          |
| The source population omits recorded product intentions, including a standing owner instruction to put HACS-popularity coverage on the roadmap. | MEASURED             | P1's source table and drawer quotations, compared with B §2 and all epic outcomes. Present implementation status of older candidates is separately bounded.                                                                                 |
| Six of the eleven named newer types already have editable, type-specific property fields in source.                                             | MEASURED             | P2's complete eleven-type enumeration; source existence only, not field completeness or runtime correctness.                                                                                                                                |
| A second source path converts sections to masonry, so “no in-app way” is insufficiently qualified.                                              | INFERRED             | src/App.tsx:1988 and src/utils/sectionsLayout.ts:480; no UI reproduction. The scaffold defect is separately visible in the conversion source.                                                                                               |
| Some descriptions and dependencies go beyond what the cited rulings establish.                                                                  | MEASURED / INFERRED  | P3/P4 distinguish literal source differences from their possible planning effect. Neither is treated as a demonstrated implementation failure.                                                                                              |
| Draft epics containing candidate stories fit D11; this artifact remains in the strategy seat.                                                   | JUDGEMENT            | B:55, B:62, B:262, B:270; strategy D11 at line 255; no implementation file list, acceptance matrix or authority to code is supplied.                                                                                                        |
| The proposed classes have no demonstrated wrong routing at this level of detail.                                                                | JUDGEMENT            | Class reconciliation below; B:102 explicitly requires reclassification at spec time.                                                                                                                                                        |
| The owner questions lack relevant evidence/options; freezing has two stated triggers; signing's promised outcome is unverified.                 | MEASURED / JUDGEMENT | P5–P7. The freeze wording is graded as ambiguity, not a proved impossible lifecycle.                                                                                                                                                        |
| Two components meet the document SEV 1 contract; other findings are nonblocking.                                                                | JUDGEMENT            | P1/P2 supply the four-part proof. The owner's ordering authority and merge decision are unchanged.                                                                                                                                          |

### Required source-item reconciliation

**S-A — remediation order.** Authority: drawer_havdm_decisions_6e8d4788d9513ccce593c378, including the R5 staged remainder; split/order update: drawer_havdm_decisions_bdef071e2ead9ed0a5ff8d9c.

| Order item | Recorded work                                                                                                | Target mapping / disposition                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| 8, F8      | Rows rendering, state propagation with its own red leg, template marking; owner-approved split first         | S03.1–S03.3, B6 prerequisite; template wording concern P3                                                    |
| 9, F9      | One capability object for layout-card and card-mod; sections-first translation; dead view_layout cleanup     | S01.1–S01.2; split retained, scope/order concerns P3/P4                                                      |
| 10, F6     | Empty-canvas context menu                                                                                    | S02.1                                                                                                        |
| 11, F10    | Diagnostic disclosure becomes an in-place control and badge; card correction separately; no severity re-mark | S02.2; B:256 retains plan-generation correction                                                              |
| 12, F11    | Canvas stress evidence; no production fix before a reproduced failure                                        | S07.1                                                                                                        |
| 13, F12    | Filesystem threat/scoping and Windows signing, separately formal ship gates                                  | S06.1–S06.2                                                                                                  |
| 1–7        | Delivered immediate remedies                                                                                 | PR table below; F3 deep work retained as S03.4. R5's post-1.0 in-app Recent Files remainder is missing (P1). |

**Delivered checks — MEASURED.** gh pr view for each number returned MERGED and the following merge commit. git merge-base --is-ancestor for each commit against the pinned main returned 0 individually.

| Order item | Delivered slice                        | PR   | Merge commit                             |
| ---------- | -------------------------------------- | ---- | ---------------------------------------- |
| 1          | FR-04 known-good dashboard             | #123 | 320dff86e5acfe892918d65f9c7a7b85b98f5c81 |
| 2          | F1 deploy validation                   | #125 | 1e96f3d689881b5b0141cb8bfda3e7f5fde1f2ea |
| 3          | F7 recent-file registration/menu paths | #126 | 2a6fa987d82169e92dae7a91270d415db17c9a42 |
| 4          | F2 theme restoration                   | #127 | e2e50abf64fa3194b9b2bd76320c94e246bea933 |
| 5          | F4 capability surfacing                | #129 | b0dc622b343f9e2b4a1564897969af3c0afa7da4 |
| 6          | F5 sections palette insertion          | #137 | a6ce103c560ac45331321c8956bb445c789fa9d0 |
| 7          | F3 interim theme badge                 | #142 | 143f8c93aac8983592e0d1cdcbf14ccb49a0f9dc |

**S-C — thirteen round-3 failures.** Authority: drawer_havdm_testing_ad358a7d31912bba2419205d; cross-read with docs/testing/uat/reports/uat_summary_v1.0.0-r3_2026-08-03.md and its triage. Status below means recorded remediation status, not a reviewer-assigned UAT verdict.

| Card      | Mapping or delivered exclusion                                                                                   |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| FILE-06   | F7/#126 delivered; deferred in-app surface is a separate R5 remainder                                            |
| CANVAS-03 | S07.1 stress/instrumentation; recorded snap-back was not reproduced, no invented production fix                  |
| CLIP-01   | S02.1                                                                                                            |
| PROPS-03  | S02.2 plus plan-generation card correction; Medium and the light-domain probe remain unchanged                   |
| VIEWS-04  | F5/#137 delivered for the approved insertion contract; nested-container follow-up remains separate               |
| EXPORT-04 | F4/#129 delivered for propagation/notice/placed-card marking                                                     |
| THEME-01  | Restoration delivered by F2/#127; remaining contrast audit S02.4                                                 |
| THEME-02  | Restoration delivered by F2/#127; theme authoring remains a distinct post-release candidate in the release notes |
| HA-03     | S03.1–S03.3; prior core/orphan renderers do not discharge rows/state/templates                                   |
| HA-04     | S02.3 manual way forward; correct auto-map refusal is not a defect to reverse                                    |
| HA-07     | F1/#125 delivered                                                                                                |
| HA-09     | S01.1–S01.3; preserve the corrected distinction between HA accepting output and HAVDM's strict reopen path       |
| HA-06     | F3/#142 interim delivered; S03.4 deep consumption parked; cached themes retained after disconnect                |

**Earlier-round cross-check.** The round-1 summary failure population was SHELL-03, FILE-01/02/03/05/06, CANVAS-04/06/07, CLIP-01/02/03/04, PROPS-01/03/04/05/06, VIEWS-04/06/08, YAML-04/05, EXPORT-01/04, HA-03/04/06. The round-2 population was FILE-04, CLIP-02/04, PROPS-03, VIEWS-05, THEME-01/02, VCS-02, HA-02/03/04/07/08. Mechanical ID reconciliation found each in the round-3 results: either pass or in the failure table above. No additional unmapped failed-card ID was found. This does not discharge retained notes: the theme-editor candidate is P1, and the repeated File Close request is already S05.1. Sources: the sibling summary files dated 2026-07-27 and 2026-07-31.

**S-E — full STILL OPEN list, not “six editor defects.”** Authority: drawer_havdm_src_3488d55dd69286718dfaddce. The following enumerates the ten entries as written; it does not certify their current implementation status.

| Source entry                                           | Mapping / disposition and present evidence                                                                                                            |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| No type-specific forms for eleven new cards            | S04.1; false blanket baseline, P2                                                                                                                     |
| Entities cards cannot host the three row types         | S03.1; HA-03, so it does have a UAT origin                                                                                                            |
| icon_color_mode default injection                      | S04.2; assignment directly observed at src/components/PropertiesPanel.tsx:914; end-to-end persistence UNVERIFIED                                      |
| asCardRecord silently drops malformed cards            | S04.5; null-return and filtering read at src/services/yamlConversionService.ts:193 and :820; no runtime import probe                                  |
| Filesystem read/write accepts arbitrary absolute paths | S06.1; retained formal gate per R6; present exploitability not tested                                                                                 |
| Undo/redo omit filePath                                | S04.3; src/store/dashboardStore.ts:478 and :495 omit it from the restored state                                                                       |
| Dashboard download has no dirty guard                  | S04.4; source trace through src/App.tsx:2273 to loadDashboard at :2299; no data-loss reproduction                                                     |
| Approximately 25 live-preview/deploy placeholders      | No explicit row/exclusion; test debt, not a missing product epic. Keep its non-product disposition explicit; count/status UNVERIFIED                  |
| Code signing                                           | S06.2; formal release gate, not an editor defect                                                                                                      |
| Shell tools lack a gate                                | No explicit row/exclusion; governance/tooling debt under the pause, not proposed product work. Current shell-tool population/gate coverage UNVERIFIED |

**S-F — feature requests.** docs/testing/uat/FEATURE_REQUESTS.md: FR-01 → S05.1; FR-02 → S05.2; FR-03 → S05.3; FR-04 → delivered #123. No issue found in request coverage. FR-01's path/dirty-state design note at line 87 does not itself prescribe fixing undo history before Close.

**S-H — opportunities A–J.** docs/refresh/PROJECT_REFRESH_PLAN_2026-07.md §4.4, starting at line 114, and WS4 ordering: A → E09 (Large), B → E10 (Medium), C → E11 (Medium), D → E12 (Large), E → E14 (Medium), F → E15 (Small each), G → E13 (Medium), H → E17 (Large), I → E16 (Medium), J → E18 (Ongoing). Target order A, B, C, D, G, E, F, I, H, J matches WS4. No issue found in this enumeration or copied table estimates; estimates remain historical, not re-estimated. S-I's referenced parity set includes more than the parenthetical examples in E09, so those examples alone were not treated as a lost commitment.

### Classification and dependency reconciliation

**Class proposals — JUDGEMENT, no demonstrated misclassification.** Checked all 24 rows, grouped below. STRAT-D6 is at docs/strategy/2026-08-18-model-roles-and-workflow-adoption.md:212; B:102 makes these proposals, with final classification at spec time.

| Candidate rows | Proposed class    | Assessment                                                                                                                                                                             |
| -------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S01.1–S01.3    | capability        | Shared export/conversion behaviour: consistent                                                                                                                                         |
| S02.1–S02.4    | content           | Canvas menu, entity disclosure, dialog and contrast surfaces: plausible; a later shared-framework change would require reassessment                                                    |
| S03.1–S03.4    | capability        | Cross-card rendering/state/theme machinery: consistent                                                                                                                                 |
| S04.1–S04.2    | content           | Individual property editing: plausible despite P2's false baseline                                                                                                                     |
| S04.3          | capability        | Shared store/history: consistent                                                                                                                                                       |
| S04.4          | content           | Download-flow guard: plausible if existing guard/store mechanisms suffice                                                                                                              |
| S04.5          | capability        | Shared YAML/import conversion: consistent                                                                                                                                              |
| S05.1–S05.2    | content           | Existing document/editor surfaces: plausible; P4 challenges prerequisite, not class                                                                                                    |
| S05.3          | docs              | Describes existing focus behaviour: consistent                                                                                                                                         |
| S06.1          | capability        | Shared IPC boundary: consistent                                                                                                                                                        |
| S06.2 / S06.3  | release / process | Explicitly not product code; legitimate homes for the existing ship/UAT obligations                                                                                                    |
| S07.1          | test-only         | No production change proposed. If it changes shared test DSL or CI machinery, D6 still applies; “test-only” cannot decide review depth by itself. No such diff exists to classify here |
| S08.1          | capability        | New write-capable version-control service/IPC flow: consistent                                                                                                                         |

**Dependencies — hand trace, not an implementation design.**

| Relationship examined      | Result                                                                                                                                                                                                                                              |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S01.2 ← S01.1              | Plausible: both export decisions consume the same captured capability object. Split ruling supports doing threading first. No issue found                                                                                                           |
| S01.3 ← S01.2              | Not established as a technical prerequisite: type/scaffold conversion is already in src/utils/sectionsLayout.ts:452 and :480. Common export validation may justify an order, but no “must land first” proof is supplied                             |
| S03.1–S03.3 ← B6           | Required by R7; live B6 existed in Todo. No issue found                                                                                                                                                                                             |
| S03.4 / whole E03 ← B6     | The row says no dependency and PARKED; §5 says E03 waits on B6. R7 governs the three HA-03 parts, not automatically the distinct HA-06 contract                                                                                                     |
| S05.1 ← S04.3              | FR-01 names an interaction, not that landing order. Existing clearDashboard resets initialState, including the path; redesigning undo history is not shown necessary to close a document                                                            |
| E09 ← E01                  | Faithful export is relevant product reasoning. Native sections conversion already exists; the record does not prove the entire export epic must land before any sections-parity work can start                                                      |
| S06.3 ← E01–E02 “as ruled” | Incomplete as a full prerequisite statement: docs/testing/UAT_STRATEGY.md:65 requires all milestone fix PRs merged, suite evidence and a package. Remaining HA-03 work and stress evidence cannot silently disappear from that readiness assessment |
| Other empty cells          | No additional binding prerequisite demonstrated in this review. “Can start any time” must still respect declared parking, owner-approved specs and release readiness; it is not implementation authorisation                                        |

### Commission coverage

| Attack heading                | Result                                                                                                                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Source population          | P1; bounded discovery, no global completeness clearance                                                                                                                                           |
| 2. Within-source completeness | Enumerations above; P1/P2/P8. No issue found in FR-01..04, A–J or mapping the thirteen failed-card IDs                                                                                            |
| 3. Rulings                    | P3/P4/P5. No issue found in preserving sections-first preference, R4's two channels and no re-mark, separate R6 gates, B6 before HA-03 code, or Phase 7 before WS4                                |
| 4. Standing / D8–D11 / C1     | No issue found in draft epics with candidate tables or stable identities; P6 concerns freeze timing only                                                                                          |
| 5. Seat                       | No issue found: candidate outcomes and source facts do not constitute an executable spec. P3 is source fidelity, not a recurrence of the withdrawn F9a spec                                       |
| 6. Classes                    | No demonstrated misclassification; full row reconciliation above                                                                                                                                  |
| 7. Dependencies/order         | P4; no challenge to the owner's authority to choose epic priority                                                                                                                                 |
| 8. Owner questions            | P5. No additional owner permission is needed merely to carry forward an already recorded intention; withdrawing one would be a separate explicit choice                                           |
| 9. Counts/universals          | P1/P2/P3/P8. The current one-product-item claim and table populations were measured. Historic “has carried no stories since adoption” is UNVERIFIED; the live snapshot alone cannot prove history |
| 10. Anything else             | P7. No additional blocking issue found within the stated evidence boundary                                                                                                                        |

**Weakest claims, for the cross-checker.** The assignment of omitted older intentions to possible epics is JUDGEMENT, not a demand to revive every old plan. Current status of the older renderer spike, strict-fidelity schema, capability follow-ups and advanced popup alignment is UNVERIFIED; P1 requires reconciliation, not an assumption that each needs implementation. The class proposals and dependency conclusions lack future specs. The sections-to-masonry counterpath is a source trace, not a successful UI exercise. P1's SEV 1 rests on the explicit missing source/owner-directed roadmap work, not on claiming all prospective stories must already be enumerated: B §8 explicitly says they need not be. P6 is intentionally capped at SEV 2 because the text does not state that merge and seeding must occur in a contradictory order.

## 4. Findings

### P1 — Recorded product intent is lost from the asserted source population

**SEV 1. Blocks: §2 source population.** Complexity 2: reconcile sources and retained scope in this document; no implementation or new planning machinery is needed.

**Class swept:** recorded product work that can disappear when an old source or a delivered parent slice is excluded. Swept S-A–S-J item content, indexed product rulings, current state/Issues/board, earlier UAT summaries, and deferred/product-intent sections discovered in the document families listed in §2. The additions below are positive source evidence, not a claim that this sweep found the entire universe.

| Source absent from §2, or retained part lost inside a listed source                                                    | What it adds and why the existing mapping does not establish coverage                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| drawer_havdm_decisions_c620dc788ac8d47d7911a6ee, “beyond HA-03” standing workstream                                    | HACS-popularity-ranked card coverage, demonstrable with offline fixtures. It explicitly says this “should be written down as a roadmap item rather than rediscovered.” E15 is new native cards; E03 fixes imported rows/state/templates. Neither records this broader custom-card programme                                                                                                    |
| S-A, R5                                                                                                                | Post-1.0 in-app Recent Files with real tooltips, tracked alongside FR-01. Excluding delivered F7 loses its staged remainder; File Close itself is not that surface                                                                                                                                                                                                                             |
| docs/features/F5_SECTIONS_PALETTE_DROP_SPEC.md:931                                                                     | Owner-deferred sections-container nesting, including nested-child addressing at line 945. Delivered F5 is not a withdrawal of this expressly retained follow-up                                                                                                                                                                                                                                |
| docs/releases/RELEASE_NOTES_v1.0.0.md:30 and :58                                                                       | Theme-value editor as a post-1.0 candidate, separately from full theme application. S03.4 consumes themes; it does not author their values. THEME-02 restoration being delivered does not decide this feature                                                                                                                                                                                  |
| docs/features/RENDER_FIDELITY_PLAN.md:202, :227, :239 and :267; drawer_havdm_decisions_0f9619ea3f92e3bcf04a531f        | Canvas geometry accuracy; security hardening including shell:openExternal; a post-1.0 isolated-rendering decision spike; conditional real-card rendering and offline cache. S06.1 covers filesystem scoping, and S03.4 covers theme consumption, not this whole programme. Present delivery status needs reconciliation; preserve the third-party-JS isolation boundary and conditional nature |
| docs/refresh/HA_CAPABILITY_INVENTORY_DESIGN_2026-07.md:168                                                             | I5 built-in version matrix and I6 reconnect diff/notification. Captured-profile export wiring does not by itself deliver either. src/services/capability/cardAvailability.ts:26 explicitly leaves version quirks to I5; runtime completeness of I6 was not tested                                                                                                                              |
| docs/refresh/HA_EXPORT_BOUNDARY_DESIGN_2026-07.md:357 and :387                                                         | The retained strict HA-fidelity schema/two-schema direction. E01's concrete candidates do not record this separate later deliverable. Whether later work superseded or delivered it needs an explicit source-backed disposition                                                                                                                                                                |
| docs/features/HACS_CARD_ALIGNMENT_REFACTOR_PLAN.md:331 and docs/features/HAVDM_ADVANCED_FEATURES_PHASES_SUMMARY.md:360 | Later popup/Bubble alignment and advanced-feature plans are additional product-intent sources to reconcile. Their age and the later product-vision boundary prevent treating their old implementation designs as current orders                                                                                                                                                                |

Architecture/product plans also contain wider parity and nonfunctional intentions. The deprecated PROJECT_PLAN.md is legitimately excluded; old architecture/iframe proposals must be reconciled against the later render-fidelity and product-vision decisions, not imported wholesale. This review does not assert that every old unchecked box is open work.

**Four-part proof:**

1. **Claim broken:** B:20 calls this the list of everything known, gathered from every place; B:72 explicitly says an unlisted source's content is absent. The source set is presented as the seeding population.
2. **Violated source:** the HACS-popularity owner drawer above explicitly directs a standing roadmap workstream. Its subsequent eleven-card scope ruling, drawer_havdm_decisions_01d44adf92567391b79a2a4d, says the seven palette orphans are **not** that popularity backlog. Reviewing all epic outcomes found no corresponding custom-card coverage workstream.
3. **No recorded mitigation covers this:** B:301 permits an incomplete story list and later source re-enumeration within an epic; it does not list this missing source or assign its distinct workstream to an epic. Deferred Phase 8 epics are included elsewhere, so “post-1.0” is not a general exclusion. No withdrawal was found in the inspected indexed product rulings.
4. **Reachability:** approve rev 0's asserted source population today and use B §6 to seed from it. That existing document omits this recorded workstream. The failure is present in the seeding input; no hypothetical application failure is required.

**Direction:** add the missing sources and give retained intentions a visible epic home or an evidenced delivered/withdrawn/non-product disposition. Preserve deferred and conditional statuses. R5 can be added under an existing epic; the broad omitted-source problem cannot be discharged by asserting that an unnamed future brief will rediscover it.

**Must not change:** do not reopen delivered PRs, expand the immediate HA-03 fix into the HACS breadth programme, execute third-party card JavaScript in the main renderer, turn every historical aspiration into approved work, or create a new ledger/checker/board procedure.

### P2 — The “eleven cards have no forms” baseline is demonstrably false

**SEV 1. Blocks: S04.1.** Complexity 2: replace a blanket absence claim with an accurate per-type gap scope.

**Class swept:** candidate baseline statements that describe existing editor functionality as absent. Read all story rows for such statements, then traced the complete eleven-type population named by the source owner ruling, plus S01.3's conversion claim and S04's neighbouring code-map claims. The population comes from drawer_havdm_decisions_01d44adf92567391b79a2a4d: four core cards and seven palette orphans.

| Type                       | Current source evidence in src/components/PropertiesPanel.tsx                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| tile                       | No dedicated type branch found; completeness of its editing experience UNVERIFIED              |
| heading                    | No dedicated type branch found; same boundary                                                  |
| entity                     | No dedicated type branch found; same boundary                                                  |
| statistics-graph           | No dedicated type branch found; same boundary                                                  |
| custom:mini-media-player   | Editable entity/name/icon and further fields, branch at line 6138                              |
| custom:slider-entity-row   | Editable entity/name/min/max/step fields, line 6215                                            |
| custom:battery-state-card  | Editable title/entities/sort/collapse fields, line 6275                                        |
| custom:simple-swipe-card   | Editable title in a shared container branch, line 6389; nested contents still directed to YAML |
| custom:multiple-entity-row | Editable entity/name/secondary information, line 6446                                          |
| custom:fold-entity-row     | Dedicated guidance/example branch at line 6499, not an editable row form                       |
| custom:decluttering-card   | Editable template name, line 6532; variables still directed to YAML                            |

These are six positive observations of editable fields, not a claim that six complete forms have been delivered. Token-search absence for the four core types is a narrower observation than proving they have no useful generic controls.

**Four-part proof:**

1. **Claim broken:** B:161 bases S04.1 on “NO type-specific property forms for the eleven new cards” and proposes giving all eleven their own forms instead of the generic one.
2. **Violated fact:** the source branches above already define dedicated editable fields for six members of that exact population.
3. **No recorded mitigation covers this:** B:304 dates the inherited claim but does not label it stale or qualify it as incomplete fields. B:301 allows more candidate stories; it does not turn an existing false baseline into a true one. A later spec check is valuable, but the owner is judging scope from this roadmap now.
4. **Reachability:** select, for example, a mini-media-player card of a type already in the approved population; the source's matching property branch contains its editable fields. The review proves the existence of that branch, not successful runtime editing. S04.1's blanket source-baseline claim is already false in this checkout.

**Related, nonblocking construction:** B:124 repeats “there is no in-app way to make a real masonry view.” src/App.tsx:1988 routes a sections-to-masonry change through flattenSectionsView, which sets the requested type at src/utils/sectionsLayout.ts:480. A native sections input without a scaffold marker is a source-level counterpath worth checking. The original scaffold-to-normalised-masonry problem can still be real, and convertViewToSections at line 452 does preserve the scaffold marker. Since the UI route was not exercised, this broader absence claim is INFERRED/SEV 2 evidence only and adds no blocking scope.

**Direction:** name missing controls or unsupported types after reconciling the current panel; narrow the masonry baseline to the proven input/path. Do not equate “has a field” with full configuration support.

**Must not change:** do not delete working controls, declare all eleven complete, or close any UAT result on this source inspection.

### P3 — Candidate outcomes silently change the scope their sources establish

**SEV 2. Blocks: None.** Complexity 2: distinguish inherited scope from proposed additions and unresolved choices.

**Class swept:** the 24 candidate stories' claimed source relationships, checked against S-A–S-G and their binding updates; the ten Phase 8 outcomes were separately reconciled above.

- **B:122, S01.1:** the F9a ruling requires one captured capability object for **both** card-mod and layout-card. The candidate states only card-mod strip/warn. This is an incomplete paraphrase, not evidence that the later spec will omit the second flag.
- **B:123, S01.2:** R3 includes the alternative “or explicit user opt-in”; the candidate and later split summary use installed-only wording. The record should make the treatment of that exception explicit before a brief relies on the compressed summary.
- **B:150, S03.3:** R7 names **template marking** as the third split part; the candidate promises templates rendered as values. The broader vision may motivate that outcome, but evaluating arbitrary templates is not established merely by the ruling to stop displaying misleading literal content. B6/owner sign-off mitigates immediate implementation risk.
- **B:134, S02.1:** paste follows the reported empty-canvas problem; the specific add-card/view-settings menu entries are design choices beyond the quoted defect. They may be reasonable, but “nothing here is my invention” at B:23 overstates their provenance.

No issue found in R4: S02.2 retains the in-place control and badge, while B:256 deliberately leaves the card correction to round generation; no re-mark or light-probe replacement is proposed. No issue found in the two separate R6 gate homes or in treating the roadmap as strategy work.

**Direction:** restore the full F9a capability scope; quote or explicitly qualify the R3 exception; leave the template remedy for B6's owner-approved split; label menu contents as candidates.

**Must not change:** do not merge F9a and F9b, pre-author a template engine spec, or treat a candidate outcome as permission to implement. Those later approval steps are why this is capped at SEV 2.

### P4 — Required prerequisites and preferred sequencing are conflated

**SEV 2. Blocks: None.** Complexity 2: correct dependency wording and state the already ruled first three stories.

**Class swept:** every Depends on cell in the 24 story rows, all seven §5 ordering reasons, and the Phase 8 order; full reconciliation is in §3.

**Evidence:** B:104 defines a dependency as “must land first,” and an empty cell as “can start any time.” Yet S01.3 ← S01.2, S05.1 ← S04.3 and the whole-E01 justification for E09 lack a demonstrated mandatory landing dependency. The File Close case is concrete: docs/testing/uat/FEATURE_REQUESTS.md:87 requires a dirty guard and avoiding stale paths, while src/store/dashboardStore.ts:470 already resets initialState; its separate undo/redo omission at line 478 does not prove Close must wait.

Conversely, B:188 labels UAT readiness “E01–E02 as ruled,” while docs/testing/UAT_STRATEGY.md:65 also requires milestone fixes, captured suites and packaging. B:243 applies B6 to all of E03, although its fourth story is separately parked HA-06 work. B:236 says “E01 first” because of the F9a → F6 → F10 ruling, but E01 also contains later F9b and conversion work. Completing an epic is not the same thing as landing its first story.

The split drawer explicitly rules the **first three product PRs** F9a, F6, F10. An epic-level priority list does not necessarily instruct exhausting each epic, so this review does **not** claim a proven contrary order. It identifies an avoidable ambiguity at the point the board is seeded.

**Direction:** carry the already ruled first three stories explicitly, distinguish technical prerequisites from sequencing preferences, scope B6 to its three parts, and refer UAT readiness to its existing full prerequisites. Reconsider the questioned dependencies in the briefs without inventing a new gate.

**Must not change:** the owner chooses priorities; B6 remains mandatory for HA-03; faithful export remains relevant to sections parity; fixing these descriptions does not itself schedule work or remove existing release checks.

### P5 — The two owner questions omit evidence and combine independent choices

**SEV 2. Blocks: None.** Complexity 2: make the existing decisions judgeable with the evidence already available. Recommendation is the two six-field briefs immediately after the summary.

**Class swept:** both questions, their option rows, recommendations, costs, defaults and cited authority.

**Q1, B:280:** the options are understandable, but the cons misdescribe the copied sizes (P8) and imply an archived input is necessarily a competing live planning surface. C1 prohibits a **live** roadmap beside the board; it does not prohibit keeping an unscheduled reference document. “Next few months” at B:285 has no capacity or effort estimate behind it.

**Q2, B:292:** “the trigger has not fired” omits what the trigger is and its evidence. The precise published trigger at docs/strategy/2026-08-18-model-roles-and-workflow-adoption.md:410 concerns the **fidelity oracle**: when the canvas-fidelity contract is scheduled, open the fidelity-standard choice at its spec session. This is related to, but not identical with, scheduling the contract itself. The inspected state retains parking; it is not a substitute for naming the trigger. Grouping and scheduling are also independent: work can stay parked in its own epic or be scheduled inside E03.

**Direction:** supply the consequences and trigger; distinguish recording a parked item from scheduling it. No third owner decision is needed merely to preserve previously recorded work in P1. If the author wants to withdraw or narrow that work, that would need an explicit owner choice with its product consequence.

**Must not change:** silence is not roadmap approval, and this review does not unpark the contract or choose a fidelity standard.

### P6 — Freeze timing has two triggers

**SEV 2. Blocks: None.** Complexity 1: one lifecycle wording repair.

**Class swept:** freeze/approval/seeding statements in B §0, §1, §6, §7, §8 and §10, compared with D8/D9/D11 and correction C1.

**Evidence:** B:33 and B:272 freeze the document once it seeds the board, matching strategy C1 at line 542. B:325 instead says the owner's merge freezes it. The commission authorises seeding on approval, so merge and seed completion are not inherently the same event. The author and owner could reasonably take different freeze points from these statements.

**Why not SEV 1:** neither clause explicitly says it is the exclusive freeze event, and the text does not require a particular merge/seeding order that makes compliance impossible. This is an unmitigated ambiguity, not a demonstrated contradiction with all four blocking proof parts.

**Direction:** use the existing C1 trigger consistently and describe approval, merge and seed completion without conflating them.

**Must not change:** keep the board as the live plan, stable identities, draft epics, owner-controlled Issue creation and stories becoming Issues at spec approval. No issue found in that D11 reading.

### P7 — Signing is given an unsupported security-warning guarantee

**SEV 2. Blocks: None.** Complexity 1: narrow the claimed outcome.

**Class swept:** E06's outcome and three release/UAT rows, compared with R6 and the cited Acronis incident.

**Evidence:** B:187 promises the build is signed “so security software stops flagging it.” R6 establishes a separate signing gate needing owner credentials and policy. The observed alert motivates that gate; it is not evidence that signing guarantees no future alert. This review neither tested a signed installer nor assessed a security product's behaviour.

**Direction:** state the ruled deliverable—an appropriately signed Windows distribution under the owner's credentials/policy—and leave actual alert behaviour to evidence. Do not promise its disappearance.

**Must not change:** signing remains a formal release gate separate from filesystem-IPC scoping. No new release procedure or security checklist is proposed.

### P8 — Source summaries and size language misstate their records

**SEV 3. Blocks: None.** Complexity 1: correct record descriptions; these constructions do not independently change a product outcome.

**Class swept:** all ten §2 source summaries, §5 exclusions and both owner-question cons against the enumerations and dated amendments.

- **B:81:** S-E is described as six editor defects with no UAT card. Its actual ten-entry list mixes editor, HA-03, filesystem, signing, test and tooling debts (§3). This also leaves its two non-product entries without an explicit disposition.
- **B:83 and B:255:** Slice C is grouped with wholly withdrawn G/H. docs/governance/phases/phase-7-tracking.md:186 says “action withdrawn, guarantee delivered”; amendment-02 replaces the user action with the deep-clone guarantee. The resulting exclusion may stand, but the reason is incomplete.
- **B:80:** the August 3 live-HA write question is carried as open without amendment-04's later answer: a separate writable test instance, while the original instance remains read-only outside the UAT envelope. See docs/governance/phases/phase-7-ecosystem-future-growth-amendment-04.md:63. This is not permission to write to either host in this review.
- **B:284:** “Ten large items” disagrees with the actual copied table: three Large, five Medium, one Small each, one Ongoing. B:299 disclaims fresh estimation, so these should remain attributed historical sizes, not a new aggregate estimate.

**Direction:** correct these records in place and explicitly exclude the non-product debt without reviving it during the governance pause.

**Must not change:** no UAT verdict, host permission, delivered scope or release priority changes follow from these record repairs.

## 5. Directions for the author — advisory

Repair the two blocking components narrowly: reconcile the source population and replace the false property-form baseline. Then clarify source paraphrases, prerequisite/order wording and the two questions using the existing rulings. Keep retained post-release work deferred and conditional work conditional; choosing its epic home is not authorisation to build it.

The existing brief/spec chain can refine candidate stories and recheck classification when actual changes are known. It cannot serve as evidence that the current source inventory is complete. Conversely, the roadmap does not need implementation file lists, acceptance matrices or a new governance mechanism to resolve these findings.

Use the already commissioned disposition process. The reviewer has made no author repair, board update, Issue change or owner decision. Nonblocking governance cleanup, if any is identified during repair, remains subject to the existing pause and cleanup item.

## 6. Explicit disagreements with rev 0

- **I disagree** that listing S-A–S-J establishes the recorded product population. The positively identified missing sources and retained intentions in P1 refute that claim.
- **I disagree** with using the inherited “eleven forms absent” statement as current scope. Existing editable fields refute the blanket baseline.
- **I disagree** that epic order alone makes the first-three-PR ruling clear, or that every stated dependency has been shown mandatory.
- **I disagree** with the unqualified “nothing here is my invention,” unnamed unfired trigger and guaranteed disappearance of security alerts.
- **I do not disagree** with seeding candidate tables inside draft epics, keeping the board live after seeding, retaining stable IDs, the strategy-seat authorship, or the copied A–J order. No issue found in those choices within this review's boundary.
- **I do not certify** product behaviour, release readiness, source-universe completeness or current effort estimates. Those are not properties this document review exercised.

## MemPalace drawer candidates

The write attempt returned “Peer MCP writer active.” No process was stopped, no lease override was set, and no [STATE] drawer was edited. Per the commission's MP-LEASE fallback, the write-enabled author may file this with added_by="codex", wing="havdm", room="investigations", source_file="docs/reviews/b7-product-backlog-codex-review.md", and pair it with the normal diary entry.

**Candidate — B7 first-pass review, not an owner disposition.** OpenAI Codex / GPT-6 Astra independently reviewed rev 0 at 8f27d08892e858ac352824548668024912eb6dc9 against main eb5c91804a2057d4f62c49ff2564335fe7250960. Verdict: BLOCKED-ON: §2 source population, S04.1. P1 identifies omitted recorded product work, particularly the owner-directed HACS-popularity roadmap workstream; P2 demonstrates existing editable property fields for six of the eleven types the roadmap describes as having none. P3–P7 are nonblocking scope, dependency, owner-question, freeze and signing-evidence findings; P8 corrects source/size records. Draft epic candidate tables and strategy-seat authorship received explicit no-issue findings. Delivered remediation PRs #123/#125/#126/#127/#129/#137/#142 were verified merged and ancestral to main. The review does not validate UI behaviour, live HA, release readiness or exhaustive product intent. Only the review file is authorised to change; next step is owner disposition and author repair, with no seeding, Issue change, push or merge performed by the reviewer. Gate evidence is recorded in §2 of this file.
