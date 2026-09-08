# B7 product-backlog repair — scoped follow-up, 2026-09-08

**Author:** OpenAI Codex / GPT-6 Astra — same independent reviewer as the first pass; author of none of the roadmap or repair.

**Reviewer:** n/a — follow-up; cross-check none.

**Owner gate:** micah / BaggyG-AU. This review supplies findings, not owner dispositions or seeding authorisation. The commission requires reviewer clearance and owner approval before seeding.

**Owner profile:** the owner is a non-developer. The summary and decision brief below are written for that reader.

**Scope:** rev 0 to rev 1 of docs/strategy/2026-09-07-product-backlog-seeding.md, 8f27d08892e858ac352824548668024912eb6dc9 → 29a43c633dcd37b2e43aa81dee5387a8d5daf3e6, plus the declared radius in Round 2 of docs/reviews/b7-product-backlog-repair-dispositions.md. Reviewed at af8db5bc2915f2cf08f5b0892c03460b50b0c64a on feature/b7-product-backlog.

**Write restrictions:** this follow-up file only. No roadmap, dispositions, first-review, production-code, test or governance edit; no Issue/board write, UAT marking, [STATE] update, push or merge. The governance pause remains in force; no new rule, gate, checker, ledger or board mechanism is proposed.

**Headless execution:** the Markdown-only gate is ./tools/checks. No Electron, integration, packaged-app or live-HA suite is expected or was run. Any Electron work would use bash tools/test-headless.sh with the appropriate project and --workers=1; projects run sequentially and never alongside the unit suite. No headed application was launched. The small Node probes below execute existing predicates/helpers in memory, not the application.

BLOCKED-ON: S04.1

| Ref | What remains wrong, in plain English                                                                                                 | Severity | Blocks | Fix complexity 1–5 | Recommendation |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------ | ------------------ | -------------- |
| P1  | Some retained work still lacks a disposition, and several reasons for leaving work out are not established by their sources.         | SEV 2    | None   | 2                  | Fix now        |
| P2  | The revised plan reverses which cards receive the missing-editor message. Its claim about every layout conversion is also too broad. | SEV 1    | S04.1  | 1                  | Fix now        |
| P3  | A new link restriction is presented as inherited scope, and the isolated-rendering summary omits important limits from its source.   | SEV 2    | None   | 2                  | Fix now        |
| P4  | The new rendering proposal names only part of its source's prerequisite security work.                                               | SEV 2    | None   | 1                  | Fix now        |
| P8  | The later-work summary says no estimate was made, although the new table calls its investigation small.                              | SEV 3    | None   | 1                  | Fix now        |

**Owner Decision Brief — P1, the meaning of the exclusions**

- **What this protects:** retaining an accurate account of which future improvements you chose to leave out, and why.
- **What goes wrong:** some old documents explicitly defer product improvements. The repair groups them under a claim that newer plans superseded them, without establishing that historical claim. A release note also retains a layout improvement with no recorded home or exclusion.
- **Is the product affected? No immediate code change.** MEASURED: this branch changes documents. The effect is on what future work is retained and on the facts supporting your choices; present delivery status of these older ideas is not established by this review.
- **Options and costs:** keep the approved exclusions and describe them accurately as present choices, with the old status retained; or reconsider particular excluded ideas after seeing that corrected history. The former is a documentation repair; the latter adds planning work and possibly later delivery work. No implementation estimate is available.
- **Recommendation and why:** correct the history and supply the missing disposition first. Your recorded approval of P1 is not being revoked, and it need not be requested again merely to correct a source description.
- **If you do nothing:** the exclusions retain a misleading rationale and the newly identified layout intention remains unreconciled. The separate blocking property-story finding still needs repair.

P5 is **RESOLVED**: the three recorded choices match the commission and the repository ruling record. P6 is **RESOLVED**: freezing consistently occurs on seeding. P7 is **RESOLVED**: signing is a formal gate, without the previous alert guarantee. Detailed dispositions for all eight findings follow in §4.

## 2. Confidence and method

**Citation convention:** B:208 means line 208 of the repaired roadmap at 29a43c6. D:289 means line 289 of the dispositions file at af8db5b. Other path-and-line references are to that unchanged checkout. MEASURED identifies direct reads, actual command results or executed predicates/helpers; INFERRED identifies a source trace or conclusion not observed in the app; JUDGEMENT identifies grading or interpretation.

**Starting stop gate — MEASURED, matched.** Branch feature/b7-product-backlog; clean tree; HEAD af8db5bc2915f2cf08f5b0892c03460b50b0c64a; main and origin/main both eb5c91804a2057d4f62c49ff2564335fe7250960. The five commits ahead, in order, were 8f27d08, ffa0416, 9f64e4e, 29a43c6 and af8db5b. ./tools/checks returned **REAL_EXIT=0, 4/4 steps**: eslint, prettier --check, tsc --noEmit, vitest run. **0 lint errors / 145 warnings; 1559 tests passed / 105 files.** The completed process supplied the exit code; the captured log supplied the four command entries and totals.

**Follow-up-file gate — MEASURED:** ./tools/checks returned **REAL_EXIT=0, 4/4 steps**, with **0 lint errors / 145 warnings** and **1559 tests passed / 105 files**. The exit code was read from the completed process, and every step was present in its captured output. Only this follow-up file was changed.

The follow-up commission, both disposition rounds, the repair diff, the repaired roadmap and the first review were read. The governing template and repository rules are unchanged from the first pass. The practice index was requested by its prescribed ID before substantive review work, but both that call and MemPalace status returned **Transport closed**.

**Memory boundary:** previous drawer contents retained in this conversation were available for the remediation order, F9a split, card breadth, eleven-card scope, isolation, vision, strategy and code map. They are dated first-pass evidence, not fresh 2026-09-08 reads. The new ruling drawer, drawer_havdm_decisions_ad4c3da54687bd3904c17865, the filed first-pass drawer, drawer_havdm_investigations_16ae93e552da8f532c32612f, and the current [STATE] could not be re-fetched. The commission itself states the owner's latest choices, which D:269–279 records consistently. No lease workaround or direct palace-database access was attempted.

**The two published population commands — MEASURED.**

1. Executed `git ls-files 'docs/product/*.md' 'docs/refresh/*.md' 'docs/features/*.md' 'docs/architecture/*.md' 'docs/governance/phases/*.md' 'docs/releases/*.md'`, the six literal pathspecs from B:80. Result: **64 files**, matching B:81.
2. Executed `grep -liE "post-1\.0|post 1\.0|\bdeferred\b|phase 8|follow-up needing|revisit trigger|future release|post-release"`, the exact pattern from B:83. The published grep fragment supplies no filenames, so its input was constructed from `git ls-files 'docs/**/*.md'`, excluding docs/reviews/, docs/archive/, docs/testing/uat/sessions/ and docs/testing/uat/plans/ as the accompanying prose specifies. Result: **113 inputs, 38 matching paths, exit 0**.

This reproduces the path count and discovery search; it cannot reproduce or certify the author's claimed hand reading. The second search's product-bearing sections were inspected for retained work; governance/testing hits were distinguished from product intentions. Particular attention went to all nine recovered source rows and each entry in “reviewed and not carried.” The results and limits are in §3. The search remains a discovery aid, not proof of completeness.

**Discriminating probes — MEASURED, no files added.**

- Parsed the actual PropertiesPanel.tsx with the installed TypeScript parser, located the JSX expression containing the “not yet implemented” message, and evaluated its original left-hand predicate, including the leading negation, for the eleven source-named types. Separately enumerated matching type guards and their named Form.Item fields. This measures conditional eligibility and source fields, not an interactive editing experience.
- Loaded the existing TypeScript conversion helpers through an in-memory CommonJS transpilation hook. Applied them to a scaffold-marked view, preserving a markdown card as sample content. Exercised the sections, layout-card and ordinary type-change branches, including the indirect panel-to-masonry/sections paths. No helper was reimplemented and no Electron process was involved.
- Executed the real isGoverned export from tests/support/authorLedger.ts on the roadmap, with a governance-document positive control. It returned false for the roadmap and true for the control.
- Re-ran the source-history searches for the seven property branches, and the author's grep -rl fidelity src/. Compared old/new source, story and epic identities and inspected the changed meanings, not just their counts.
- Read GitHub Issue #159 with gh issue view. Its Process paragraph currently names E01 / S01.1, both still present.

**Evidence boundary:** no app UI, Home Assistant, Windows installer, signed build, full Electron suite or visual fidelity measurement was exercised. The real-helper probes do not prove an end-to-end user interaction. No wholesale re-review of unchanged delivered work, archive documents or unindexed memory was performed. Current [STATE] item 11 and fresh memory ruling text are **UNVERIFIED**. The global absence of other consumers or other product intentions is also **UNVERIFIED**. The verdict is high confidence for the narrow false predicate claim and bounded judgement for the nonblocking remainders.

## 3. Claim ledger, source reconciliation and radius

| Claim                                                                                                                                | Tag                   | Evidence / boundary                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | ---------------------------------------------------------------------------------------------------------- |
| The commissioned starting state and four-step gate matched.                                                                          | MEASURED              | Git state and completed ./tools/checks process, §2.                                                        |
| The two discovery operations returned 64 paths and 38 matching paths from 113 inputs.                                                | MEASURED              | Actual git and grep executions; counts measure paths, not recovered intentions or hand reading.            |
| The repair restores the nine source rows and the named post-release homes, but its exclusion reasoning is not uniformly established. | MEASURED / JUDGEMENT  | Complete source/exclusion reconciliation below; P1.                                                        |
| The notice guard is false for every one of the seven palette types and true for the four core types.                                 | MEASURED              | Executed source predicate beginning at PropertiesPanel.tsx:6645; eleven-result table in P2.                |
| Dedicated editable fields exist for six palette types; the remaining palette branch supplies guidance.                               | MEASURED              | AST enumeration of the seven branches, plus source reads. No claim of complete runtime forms.              |
| The marker survives the two sections helpers but is deleted by other conversion branches.                                            | MEASURED              | Real-helper outputs and viewsLayout.ts:256/:275; full branch-class sweep in P2.                            |
| The repaired old scope paraphrases are improved, but new candidates still add or omit source constraints.                            | MEASURED / JUDGEMENT  | Thirty story rows and twelve later epic outcomes hand-compared at their repaired/new seams; P3.            |
| The six nonempty dependency cells are justified; E20's separate prerequisite summary misses Phase C2.                                | MEASURED / INFERRED   | Dependency table below and RENDER_FIDELITY_PLAN.md:227–237; P4.                                            |
| The three owner choices, freeze event and signing repair match the available authority.                                              | MEASURED / JUDGEMENT  | Commission; D:269–279; strategy §8/C1; retained vision/R6 contents. Fresh memory verification unavailable. |
| Identity preservation and author-ledger exclusion hold within the measured scope.                                                    | MEASURED / JUDGEMENT  | Old/new definition enumeration, semantic diff, real isGoverned function and live #159 body.                |
| The current state-drawer update occurred as the author says.                                                                         | INFERRED — UNVERIFIED | D:304 is the author's claim; transport closed. No clearance of that update is implied.                     |
| P2 remains SEV 1 only on S04.1; P1/P3/P4/P8 retain lower-severity remainders.                                                        | JUDGEMENT             | Four-part blocking proof in §4; no other component is blocked by this verdict.                             |

### The nine recovered source rows — full hand reconciliation

| Source | Recorded intention and home                                                                                                                                                         | Result                                                                                                                                                                                                                                                                                                                                                            |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S-K    | Card breadth → E19; owner drawer drawer_havdm_decisions_c620dc788ac8d47d7911a6ee, distinguished from the already offered orphans by drawer_havdm_decisions_01d44adf92567391b79a2a4d | No issue found in the recovered goal: more core/custom support, HACS popularity, offline fixtures, post-1.0, and no third-party code in the main app. E19 is a candidate programme, not a spec.                                                                                                                                                                   |
| S-L    | R5's post-1.0 in-app Recent Files with real tooltips → S05.4 beside File Close                                                                                                      | No issue found. It is explicitly retained separately from delivered F7.                                                                                                                                                                                                                                                                                           |
| S-M    | Owner-deferred sections nesting, including nested-child addressing → E09 named candidate                                                                                            | No issue found. B:285 preserves deferral; docs/features/F5_SECTIONS_PALETTE_DROP_SPEC.md:931–951 supplies the reason and follow-up.                                                                                                                                                                                                                               |
| S-N    | Render-fidelity Phases B–E → beside S03.4, S06.1/S06.4 and E20                                                                                                                      | Homes restored. Phase B's post-1.0 status is visible; parking it with the family was proposed in D:75 and approved with P1. The added link policy and incomplete E20 constraints are P3/P4, not objections to grouping.                                                                                                                                           |
| S-O    | I5 version matrix and I6 reconnect diff/notification → S01.4/S01.5                                                                                                                  | No issue found in the candidate outcomes. docs/refresh/HA_CAPABILITY_INVENTORY_DESIGN_2026-07.md:168–169 names both. I3 is their original prerequisite and its captured-profile machinery already exists; an empty new landing-dependency cell need not revive delivered I3. I6's overall delivery status remains UNVERIFIED.                                     |
| S-P    | Later strict fidelity schema / two-schema split → S01.6                                                                                                                             | Home and proposed outcome match docs/refresh/HA_EXPORT_BOUNDARY_DESIGN_2026-07.md:357/:387 and vision answer 7. The “not delivered” proof is insufficient and its quoted search result is false; P1.                                                                                                                                                              |
| S-Q    | Post-1.0 theme editor and full theme application → E18                                                                                                                              | No issue found. docs/releases/RELEASE_NOTES_v1.0.0.md:30/:58 distinguishes authoring from consumption.                                                                                                                                                                                                                                                            |
| S-R    | February popup/Bubble alignment → explicitly not carried under Q3                                                                                                                   | No issue found in the recorded owner disposition. Vision answers 3 and 9 literally make the popup type canvas-only with a native placeholder on deploy. The later September 8 owner choice is the direct authority for not carrying this future programme; it is stronger evidence than assuming the July vision explicitly names and withdraws every older plan. |
| S-T    | Dashboard health scoring retained as a WS4 candidate → S01.7                                                                                                                        | No issue found in the recovered candidate. Amendment-01:139 names the existing signal surfaces; the rest of G is separately dropped. A content-class presentation is plausible unless its future spec adds shared scoring machinery.                                                                                                                              |

### Every “reviewed and not carried” entry

These are source/status checks, not instructions to reinstate everything.

| Entry at B:118–132                     | Assessment against its cited source and supposed successor                                                                                                                                                                                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UPDATE_PLAN.md                         | The January document is a component/version-update plan (lines 1–12). The claimed successor WS1 is engineering-discipline uplift—memory, skills, hooks and rule structure—at PROJECT_REFRESH_PLAN_2026-07.md:186–190. That does not substantiate wholesale succession of component-update intent. P1.         |
| SUPPORTED_VERSIONS.md                  | No issue found in classifying it as a version record and distinguishing its old Phase 8 naming. No claim made here that every old compatibility concern is currently solved.                                                                                                                                  |
| VERSION_COMPARISON.md                  | No issue found in classifying it as a dated comparison/research record. Its completed and deferred analyses are not a current delivery certificate.                                                                                                                                                           |
| ENTITY_TYPE_DASHBOARD_GENERATOR.md     | Lines 178–193 retain five planned and four deferred improvements. AI maps to E17; multi-category dashboards, custom categories and deduplication are not shown to have been withdrawn by the refresh or vision. P1 concerns the blanket supersession rationale, not the owner's right to exclude them.        |
| ADVANCED_YAML_EDITOR_IMPLEMENTATION.md | Line 372 explicitly defers code-only mode to a future release; line 373 explains why it was not the primary workflow. That is not a withdrawal. The same source also names future AST, schema, validation, diff and snippet work at lines 375–419. Present delivery status was not audited. P1.               |
| ARCHITECTURE_ROADMAP.md                | Its own line 3 calls it aspirational architecture and nonfunctional guidance. No issue found in excluding general standards from this product-epic seed. That classification does not prove the guidance was superseded: lines 246–341 also contain user-facing performance/accessibility targets.            |
| Phase 7 blueprint §20                  | Lines 1143–1147 explicitly defer broad architecture work. Excluding it from product candidates is consistent with this roadmap's scope. Amendment-01:141 still retains H's consumer-triggered revisit; “withdrawn slice” must not be mistaken for proof that every underlying idea was permanently cancelled. |
| BUBBLE_CARD_V3_1_RESEARCH.md           | No issue found in treating it as research; its completion/status section at line 585 also separates implemented work from deferred manual testing.                                                                                                                                                            |
| S-R / Q3                               | No issue found in the explicit current owner exclusion, subject to the memory boundary above.                                                                                                                                                                                                                 |

**Additional discovery results:** docs/releases/RELEASE_NOTES_v0.7.4-beta.5.md:49/:92 retains advanced multi-row alignment, align_content, beyond the Feature 4.5 MVP. It is one of the 64 first-command paths and one of the 38 grep hits, but is in neither source list nor exclusion list and has no explicit disposition. This is P1's additional same-class instance. Its current implementation status is UNVERIFIED; absence of source matches alone would not prove non-delivery.

The other older release hit, docs/releases/RELEASE_NOTES_v0.3.2-beta.1.md:513–522, reiterates editor follow-ups and adds concrete examples for the editor exclusion above. The advanced-features implementation summary's Phase 8 popup section duplicates the programme already handled by S-R/Q3; no additional unhomed intention is claimed from that duplicate. The v0.4.0-beta.1 release hit concerns testing/documentation history. No new product candidate was inferred merely from the governance/testing hits.

### Dependencies and declared radius

| Nonempty dependency cell               | Independent result                                                                                                                                                                                                                                                                           |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S01.2 ← S01.1                          | No issue found: the split ruling puts shared capability threading before later export translation.                                                                                                                                                                                           |
| S03.1 ← B6                             | No issue found: R7 requires the signed split before implementation.                                                                                                                                                                                                                          |
| S03.2 ← B6                             | No issue found: same ruling, with its state-propagation part.                                                                                                                                                                                                                                |
| S03.3 ← B6                             | No issue found: same ruling, with template marking.                                                                                                                                                                                                                                          |
| S06.2 ← owner credentials              | No issue found: R6's distribution gate explicitly requires credentials/policy.                                                                                                                                                                                                               |
| S06.3 ← UAT_STRATEGY §3.1 plus fix PRs | No issue found in the full reference. The authoritative section includes all milestone fix PRs merged to main and the current skipped-tests register, in addition to checks, full suites and packaging. Read the parenthetical as an abbreviation, not a replacement for that cited section. |

The removed S01.3 ← S01.2 and S05.1 ← S04.3 cells are now preferences in §5. B6 is correctly limited to S03.1–S03.3. B:295 states S01.1 → S02.1 → S02.2 as the first three product PRs; the other E01 work follows them. E09's export rationale is explicitly not a landing dependency. No issue found in these repairs. P4's remaining construction is E20's new separate summary.

**Radius — MEASURED / bounded JUDGEMENT.**

- The repair changes only the roadmap; no production, test, governance, template or rule file changed in the repair range. isGoverned at tests/support/authorLedger.ts:68–70 returns false for the roadmap; the governance positive control returns true. No issue found in excluding it from that fingerprint.
- Definition enumeration gives **18 → 20 epics**, retaining E01–E18 and adding E19/E20; **24 → 30 stories**, retaining the old set and adding S01.4–S01.7, S05.4 and S06.4. The source set retains S-A–S-J and adds S-K/S-L/S-M/S-N/S-O/S-P/S-Q/S-R/S-T. No ID was removed. Hand comparison found clarification/repair of the same old objectives, not reuse for unrelated work. No issue found under D8.
- The seeding procedure now carries twenty epics with E19/E20 last and ordinary Todo status. Source/story corrections still affect the content to be seeded; no new board mechanism appears.
- The live #159 Process paragraph names E01 and S01.1 in this roadmap. Both exist and still identify F9a. No issue found in that consumer reference; the rest of the Issue was not re-reviewed.
- No literal roadmap-path consumer was found in src, tests, tools, .github or package.json. This supports a bounded content-consumer conclusion; it does not prove D:298's universal “nothing reads ... programmatically.” Formatting tools naturally read Markdown. No functional missed consumer was demonstrated.
- The claimed [STATE] item 11 update is UNVERIFIED because the transport is closed. That is a verification limit, not evidence of a wrong update or a new finding against the radius.

### Commission coverage

| Requested heading               | Result                                                                                                                                                |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. P1–P8 closure                | §4 supplies all eight dispositions; five have remainders, three are resolved.                                                                         |
| 2. Recovered sources            | Nine-row table above; P1/P3/P4 identify limitations. No issue found in E19's recovered scope or the named Recent Files/nesting/theme/health homes.    |
| 3. Population/method/exclusions | Commands reproduced; P1 remains partly resolved. No completeness certification.                                                                       |
| 4. S04.1 and seat               | P2 contradicts the new notice assertion. No issue found in its strategy-seat status: a candidate complete-form outcome is not an implementation spec. |
| 5. Dependencies/order/UAT       | Six cells checked; old repairs hold. P4 concerns the new E20 dependency summary.                                                                      |
| 6. Q1–Q3                        | No issue found against the commission, D:269–279, the strategy trigger and retained vision text; fresh memory confirmation unavailable.               |
| 7. Freeze/signing               | No issue found; P6/P7 resolved.                                                                                                                       |
| 8. Records                      | Four original corrections hold; the new estimate inconsistency leaves P8 partly resolved.                                                             |
| 9. Radius                       | No demonstrated radius defect; fingerprint/IDs/#159 checked, [STATE] update unverified.                                                               |
| 10. Other diff content          | P2's conversion statement and P3's link-policy addition are covered below. No additional behaviour class found; no new finding ID is allocated.       |

**Weakest claims.** Whether each older idea is currently implemented remains unverified; this review challenges the recorded dispositions and evidence, not asserting that every old idea requires code. The status of the live memory records could not be checked. The actual UI paths were hand-traced, not run; only their existing helper outputs and the notice predicate were executed. P4's grading treats the cited Phase C prerequisite as not explicitly superseded by general approval of a condensed roadmap. P3's boundary omissions are capped at SEV 2 because the roadmap retains the isolated-window concept, links its authority and still requires approved specs. No source-universe completeness claim is made.

## 4. Dispositions of P1–P8

### P1 — PARTIALLY RESOLVED — SEV 2; Blocks: None

**Class swept:** recorded product intentions that lose an accurate home/status when a source or delivered parent is excluded. Swept every recovered S-K…S-T row, each “not carried” entry, the published 64-path population and the product-bearing portions of the 38 discovery hits. The full hand reconciliation is in §3; archive/unindexed memory and present implementation status were not exhaustively swept.

**What closed:** the formerly missing HACS-breadth programme now has E19; the other first-pass recovered intentions have named homes or an explicit Q3 disposition. The universal “every place” assertion is gone. These repairs remove the first pass's SEV 1 basis.

**What remains:** B:118–132 treats several deferred aspirations as superseded without identifying a later decision that actually says so. WS1 is not the component-update successor claimed at B:121. The newly identified layout release-note intention remains absent from both lists despite falling inside the published discovery population. These are nonblocking reconciliation/evidence problems under the now-bounded population statement.

**Status evidence also needs correction:** B:107 says the strict schema is “not delivered” because grep -rl fidelity src/ returns theme files only. The actual command returns four paths: src/features/theme-manager/themeOptions.ts, src/components/ThemeNoEffectBadge.tsx, src/services/canvasKeyStripper.ts and src/services/yamlConversionService.ts. The latter two are not theme files. More fundamentally, a word search cannot establish whether a schema contract is delivered. The design supplies a valid later candidate; the global implementation-status conclusion remains UNVERIFIED. I6 was explicitly labelled INFERRED in D:77, and the observed capture handler at src/App.tsx:2129 logs and refreshes the profile; that does not constitute an exhaustive delivery audit either.

**Direction:** reconcile the missing layout intention, correct the successor/supersession explanations, and label unverified status honestly. If the owner-approved exclusions stand, record them as the present choices without inventing a past withdrawal. No additional epic is mandated by this finding.

**Must not change:** do not revive every old plan, reopen Q3, treat archaeology as implementation authorisation, or introduce a new planning mechanism. **Complexity 2:** source and disposition wording within this document.

### P2 — PARTIALLY RESOLVED — SEV 1; Blocks: S04.1

**Class swept:** current editor behaviour incorrectly described as absent or defective. Re-measured all eleven property types, the exact notice guard, the seven branch histories, and the complete view-type conversion branch family reached from the repaired S01.3 claim.

**What closed:** six editable property branches and one guidance branch are now acknowledged. The historical source searches independently return eaa9efa, 2025-12-26, for each palette branch, supporting the correction of the old blanket absence claim.

**The replacement factual error:** B:208 says the panel displays “not yet implemented” for all seven palette cards. D:133–137 and D:289 make the same claim. The predicate starts with **negation** at src/components/PropertiesPanel.tsx:6645, then tests membership at :6715. Those seven names are exclusions from the notice.

| Type                       | Dedicated branch / fields observed                   | Actual notice predicate |
| -------------------------- | ---------------------------------------------------- | ----------------------- |
| tile                       | No dedicated type guard found                        | true                    |
| heading                    | No dedicated type guard found                        | true                    |
| entity                     | No dedicated type guard found                        | true                    |
| statistics-graph           | No dedicated type guard found                        | true                    |
| custom:mini-media-player   | :6138; entity, name, icon, hide_source, hide_volume  | false                   |
| custom:slider-entity-row   | :6215; entity, name, min, max, step                  | false                   |
| custom:battery-state-card  | :6275; title, entities, sort_by_level, collapse      | false                   |
| custom:simple-swipe-card   | :6389; shared container title field                  | false                   |
| custom:multiple-entity-row | :6446; entity, name, secondary_info                  | false                   |
| custom:fold-entity-row     | :6499; guidance/example, no named editable Form.Item | false                   |
| custom:decluttering-card   | :6532; template field                                | false                   |

**Four-part blocking proof:**

1. **Claim broken:** S04.1's current factual baseline says all seven existing palette forms also show a missing-editor notice.
2. **Violated fact:** executing the original JSX guard, not a reconstructed membership check, returns false for all seven. Source: PropertiesPanel.tsx:6645–6718; results above.
3. **No recorded mitigation covers it:** the source cell calls this a fresh measurement; the row contains no uncertainty or alternate meaning for the notice claim. A future spec may refine completeness, but it does not make this reversed predicate true. The in-memory evaluation directly distinguishes the author's claim from actual eligibility.
4. **Reachability:** the seven already named card types exist in this checkout's property branches. Selecting any of those types makes this particular predicate false, regardless of other UI state. This is a present document-baseline defect, not a prediction about future code or an assertion that a GUI test was run.

**Same-class S01.3 remainder — SEV 2, no additional block.** B:167 says the scaffold marker survives “every conversion.” Real-helper results:

| Input operation                               | Resulting type     | Scaffold marker |
| --------------------------------------------- | ------------------ | --------------- |
| convertViewToSections(scaffold)               | sections           | retained        |
| flattenSectionsView(previous result, masonry) | masonry            | retained        |
| convertViewToLayoutCard(scaffold)             | custom:grid-layout | removed         |
| setViewType(scaffold, panel)                  | panel              | removed         |
| setViewType(previous panel result, masonry)   | masonry            | absent          |
| convertViewToSections(previous panel result)  | sections           | absent          |

The four branches are visible at src/App.tsx:1988–2000; viewsLayout.ts:271 and :287 delete the marker. ViewSettingsDialog.tsx:120 offers the corresponding types, and App.tsx:2015/store/dashboardStore.ts:225 store the resulting config. This is a source trace plus real-helper measurement, not an exercised UI route. The direct normalised-masonry no-op and the two retaining sections helpers remain valid concerns; their accurate source note mitigates the overbroad shorthand enough to keep this construction nonblocking.

**Direction:** remove the inverted notice assertion and scope S01.3 to the affected direct operations. Preserve the real remaining form gaps.

**Must not change:** do not alter the application to manufacture the claimed notice, remove working controls, or declare complete editing support from these probes. **Complexity 1:** correct the factual wording.

### P3 — PARTIALLY RESOLVED — SEV 2; Blocks: None

**Class swept:** candidate outcomes that silently add to or omit their cited source's scope. Compared all thirty story rows and twelve later epic outcomes at the repair's affected seams, including every new story and E19/E20.

**What closed:** S01.1 now carries both capability flags; S01.2 restores explicit opt-in; S03.3 returns to template marking under B6; S02.1 distinguishes further menu entries as candidates; S04.5 labels its proposed remedy. No issue found in those source-fidelity repairs or in the candidate outcomes S01.4–S01.7 and S05.4.

**What remains/new within this class:**

- **S06.4, B:238:** the source says “Tighten shell:openExternal” (RENDER_FIDELITY_PLAN.md:236). The candidate instead selects an exact policy: accept only links the app itself produced. src/main.ts:205 proves the current unchecked forwarding, not that the chosen restriction was already ruled. The policy may be suitable; its provenance must be labelled as a proposal, like the repaired menu entries.
- **E20, B:282:** isolation, no preload and a conditional spike are present. But this standalone outcome does not carry the explicit no-third-party-JS-in-main-renderer boundary or the separate owner trust decision from drawer_havdm_decisions_0f9619ea3f92e3bcf04a531f. E19's wording and the linked S-N authority mitigate the risk; they do not make those limits explicit in the E20 body that §6 will seed. The source's spike yields an evidence-backed recommendation, not permission to dispense with the owner's trust decision.

**Direction:** identify the link restriction as candidate policy or leave its choice to the brief; carry E20's existing boundary and owner trust condition in its own outcome. No issue found in strategy-seat fidelity: naming outcomes and inherited constraints here need not become a spec or a file-level design.

**Must not change:** preserve the first-three-PR split, the main-renderer prohibition, additive rendering/never-connected fallback, and later owner-approved specs. No new security regime is proposed. **Complexity 2:** source-labelled outcome corrections.

### P4 — PARTIALLY RESOLVED — SEV 2; Blocks: None

**Class swept:** dependencies that misstate required prerequisites as preferences or lose prerequisites when condensed. Swept all thirty dependency cells, all seven §5 reasons and both new programme rows. The six nonempty cells and original repairs are explicitly cleared in §3.

**What remains:** E20 names S06.1 alone at B:282 and B:318. Its own source, docs/features/RENDER_FIDELITY_PLAN.md:227–237, calls **Phase C** a prerequisite for D/E. Phase C includes both filesystem scoping and tightening the external-link bridge; the repair itself maps these to S06.1 and S06.4. The summary therefore omits its second named prerequisite.

B:318 applies S06.1 to E20 as a whole, so no separate finding is made that the filesystem prerequisite applies only after the spike. The linked source and future approved spec mitigate immediate execution risk; no app change or unsafe execution occurred in this review. The author/owner may deliberately revise the older prerequisite, but no such explicit change is recorded here.

**Direction:** carry the source's full Phase C prerequisite for the spike and conditional rendering, or accurately record an explicit superseding decision. The owner trust condition is covered under P3.

**Must not change:** retain the correctly repaired first-three-story order, B6 scope, preference distinction and full UAT_STRATEGY §3.1 reference. **Complexity 1:** dependency wording using existing sources.

### P5 — RESOLVED — no current severity; Blocks: None

**Class swept:** Q1–Q3's options, recorded choices, consequences, presentation and trigger references.

B:359–361 matches the commissioned owner choice to seed later work as bottom-of-order Todo drafts without a new status. B:363–374 separates grouping from scheduling and gives the strategy's actual oracle trigger: scheduling the contract opens the fidelity-standard choice at its spec session. B:376–382 records the explicit current Q3 exclusion; the retained vision text supports the stated current canvas-only/placeholder behaviour.

No issue found. These are completed owner choices; this review does not ask to reopen them. Fresh access to the ruling drawer is unavailable, so the closure is against the commission, repository ruling record and retained source contents, not a claim of a new memory read. The estimate discrepancy in Q1's con is handled under P8.

### P6 — RESOLVED — no current severity; Blocks: None

**Class swept:** every freeze/frozen occurrence in the repaired document, including its header, explanatory prose, seeding steps, exclusion/reference text, revision history and sign-off chain.

B:344 and B:413–415 now use seeding as the freeze event, consistent with C1 at docs/strategy/2026-08-18-model-roles-and-workflow-adoption.md:542. The references to other frozen documents do not assert a different event for this roadmap. No issue found.

### P7 — RESOLVED — no current severity; Blocks: None

**Class swept:** E06's outcome and its release/UAT rows, including S06.2's explanatory note.

B:236 states signing under the owner's credentials and policy, and explicitly leaves alert behaviour to measurement. That matches R6 without promising that warnings disappear. No issue found; no signing outcome or Windows test is claimed.

### P8 — PARTIALLY RESOLVED — SEV 3; Blocks: None

**Class swept:** all source-summary corrections, §5 exclusions, size cells for E09–E20, Q1's count/cons and §8's estimate disclaimer; also the author's corresponding Round 2 verification.

The four original corrections hold: S-E enumerates ten entries with the two non-product exclusions; Slice C is partially withdrawn with its guarantee delivered; amendment-04's separate-host write boundary replaces the old unanswered question; the original A–J sizes are no longer all called Large. G's health work is also correctly distinguished from telemetry. No issue found in those repairs.

**Remaining record inconsistency:** B:282 calls E20's spike **small**. B:356 describes the two added programmes as not estimated; B:386 says the document makes no estimates beyond the refresh plan's E09–E18 sizes. D:310–312 expressly asserts that E19/E20 both carry “not estimated,” overlooking “Spike small; feature not estimated.” The source at RENDER_FIDELITY_PLAN.md:239 calls the spike time-boxed but supplies no small-size estimate.

**Direction:** remove the added estimate or identify it honestly as a new estimate and reconcile the summaries. This is record accuracy, not a challenge to the owner's choice to retain E20.

**Must not change:** preserve the corrected A–J sizes, host boundaries and delivered/withdrawn distinctions. **Complexity 1:** consistent size wording.

**New findings from P9:** none allocated. The remaining constructions belong to the same behaviours as existing P1/P2/P3/P4/P8, whose full current classes were swept and re-graded above.

## 5. Directions — advisory

Correct S04.1's reversed condition first; that is the remaining blocking component. The accurate existing-form enumeration can stay. Resolve the lower-severity remainders through the existing per-Ref process, with the owner's current choices preserved and any changed factual basis made visible.

This does not require application changes, additional governance machinery or reopening the first-pass scope wholesale. The source tables and existing outcome/dependency text can hold the repairs. The already ruled Q1–Q3 decisions, seeding freeze event, signing gate and stable identities do not need another permission request merely to retain them.

## 6. Explicit disagreements

- **I disagree** with the author's unconditional RESOLVED rows for P1, P2, P3, P4 and P8. Each has the bounded remainder described above.
- **I disagree** with the assertion that all seven palette types display the missing-editor notice. The source predicate produces the opposite result.
- **I disagree** that the marker survives every conversion, that the fidelity search returns theme files only, or that a search establishes global non-delivery.
- **I disagree** with treating a deferred idea as historically superseded without evidence, and with describing the new spike as both small and unestimated.
- **I agree** that P5, P6 and P7 are resolved against the available authority, and that the repair preserves the examined identities, stays outside the author-ledger fingerprint and remains strategy-seat work.
- **I do not dispute** the owner's decisions to seed the later epics, park the fidelity contract inside E03 or exclude the popup-alignment programme. No new implementation, seeding or merge authorisation is supplied by this review.

## MemPalace drawer candidates

MemPalace reads returned **Transport closed**. No write was attempted through the unavailable transport, no process was stopped, no direct database workaround was used and no [STATE] update occurred. This is the independent-reviewer fallback, not a successful palace write or a newly observed writer-lease rejection.

**Candidate — B7 scoped follow-up; reviewer evidence, not owner dispositions.** File with added_by="codex", wing="havdm", room="investigations", source_file="docs/reviews/b7-product-backlog-codex-review-followup.md", and the normal paired diary entry. GPT-6 Astra reviewed repair 8f27d08 → 29a43c6 and the Round 2 radius at af8db5b. Verdict: BLOCKED-ON: S04.1. P1/P2/P3/P4/P8 PARTIALLY RESOLVED, current severities 2/1/2/2/3; P5/P6/P7 RESOLVED. Critical new measurement: PropertiesPanel.tsx:6645 negates the list containing the seven palette types; the original notice predicate evaluates false for all seven and true for the four core types. Six editable palette branches and one guidance branch remain. Existing conversion helpers also disprove the literal every-conversion marker assertion. Recovered source mapping improved, but missing layout intent and unsupported supersession/status claims remain; S06.4/E20 scope and prerequisite summaries need repair; “Spike small” conflicts with the no-estimate summary. Author-ledger exclusion, stable IDs and live Issue #159's E01/S01.1 references checked; current [STATE]/new ruling drawer unavailable. Gates and boundaries are in §2. Next step: owner dispositions and author repair; the reviewer changed only this follow-up, with no board/Issue write, push or merge.
