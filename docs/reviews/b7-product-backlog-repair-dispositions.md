Author: Claude Fable 5.1
Reviewer: OpenAI Codex (GPT-6 Astra)
Owner gate: micah / BaggyG-AU

# Repair dispositions — B7 product-backlog seeding roadmap

One dated section per round, appended and never rewritten (OA §3.4). On this
branch a "repair" is a revision of `docs/strategy/2026-09-07-product-backlog-seeding.md`;
no governance document, no `src/` file, no board item and no Issue is edited by a
repair. The document is a strategy artifact (Fable's seat, OA §3.6), not a spec.

## Round 1 — 2026-09-08, answering `b7-product-backlog-codex-review.md` (`ffa0416`, `BLOCKED-ON: §2 source population, S04.1`, P1–P8)

**Method.** Every finding was treated as a hypothesis and reproduced at the
source it cites before any row below was written: the path and line, or the
drawer, was read fresh on 2026-09-08 at `ffa0416` (tree clean; `main` =
`origin/main` = `eb5c918`). For each finding the CLASS it belongs to was swept
and the sweep is named in its section. Tags: MEASURED = read or ran directly;
INFERRED = a source trace without runtime confirmation; JUDGEMENT = grading or
recommendation. `B:NN` means the document's line NN at `8f27d08`.

**Gate at `ffa0416` — MEASURED, re-run by the author (a gate result is pinned
to a tree):** `./tools/checks` REAL_EXIT=0, 4/4 steps (eslint, prettier
--check, tsc --noEmit, vitest run), lint 0 errors / 145 warnings, unit 1559
passed / 105 files. Docs-only branch: no Electron, integration or live-HA suite
is owed, and none was run.

**Standing ruling carried into this round.** The owner ruled the document's §7
Q1 on 2026-09-07, before the review landed: **seed the Phase 8 epics E09–E18
now, at the bottom of the order (Option A, as recommended).** It is recorded
here and is applied to the document's §7 and revision log at repair. Astra's P5
brief may refine HOW those epics are shown; it does not reopen WHETHER.

**Owner rulings, by Ref.** NONE YET. Every SEV 2 and SEV 3 row is **OPEN**
awaiting the owner's fix-now / defer / accept-residual decision (OA §3.4, SEV-CAL-2
ruling 6); no repair for any of them is committed. The two SEV 1 rows carry the
author's verification result and the proposed repair; a SEV 1 leaves OPEN only
as RESOLVED or by an owner ruling recorded in its row. The owner's brief is in
the session message that accompanies this commit; the rulings are recorded in
Round 2.

| Ref | Sev | Verified                    | Disposition | Result and proposed repair                                                                                                                                                                                                                                                                                                                                         |
| --- | --- | --------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P1  | 1   | HOLDS — MEASURED            | OPEN        | Eight sources named by the review reproduce; one more found by the author (A1). Repair: add each as a §2 row with an evidenced disposition (epic home / delivered / superseded / non-product), restate the population as what was enumerated and how, drop the "every place" and "nothing here is my invention" universals                                         |
| P2  | 1   | HOLDS — MEASURED, refined   | OPEN        | Seven of the eleven types have a `card.type ===` branch in the properties panel; the four core types have none; the same seven are ALSO listed under the panel's own "not yet implemented" notice (A2). Repair: S04.1 restated per type from measurement, and its source cell labels the code-map claim stale                                                      |
| P3  | 2   | HOLDS — MEASURED (4 rows)   | OPEN        | S01.1 narrows the F9a ruling (omits layout-card); S01.2 omits R3's "or explicit user opt-in"; S03.3 widens R7's "template marking" to "render as values"; S02.1 adds menu items the source does not name. Twenty other rows faithful; one borderline (A3). Proposed: fix now, complexity 2                                                                         |
| P4  | 2   | HOLDS — MEASURED / INFERRED | OPEN        | S01.3←S01.2 and S05.1←S04.3 are preferences, not "must land first"; S06.3's prerequisite omits UAT_STRATEGY §3.1; §5 item 3 applies B6 to all of E03 while S03.4 says none; §5 item 1 says "E01 first" where the ruling is three PRs (F9a, F6, F10). Proposed: fix now, complexity 2                                                                               |
| P5  | 2   | HOLDS — JUDGEMENT           | OPEN        | Q1 already ruled (above); its cons misstate sizes (P8) and treat a frozen reference as a live surface. Q2 does not name the recorded trigger (strategy §8: the fidelity-oracle choice opens when the contract is scheduled) and couples grouping to scheduling. Proposed: owner rules Q2 on the two briefs; the document then records both rulings and the trigger |
| P6  | 2   | HOLDS — MEASURED            | OPEN        | B:33 and B:272 freeze on seeding (C1); B:324–325 freeze on merge. Proposed: fix now, complexity 1 — C1's event everywhere                                                                                                                                                                                                                                          |
| P7  | 2   | HOLDS — MEASURED            | OPEN        | B:187 "so security software stops flagging it" is a guarantee R6b does not make. Proposed: fix now, complexity 1 — state the ruled gate, not the outcome                                                                                                                                                                                                           |
| P8  | 3   | HOLDS — MEASURED (4 of 4)   | OPEN        | S-E is ten entries, not "six editor defects"; slice C is partially withdrawn (guarantee delivered); the live-HA write question was answered by amendment-04; "ten large items" is three Large / five Medium / one Small each / one Ongoing. Proposed: fix now, complexity 1, in the same revision                                                                  |

### P1 — verification and class sweep

**Class swept:** every tracked Markdown file under `docs/product/`,
`docs/refresh/`, `docs/features/`, `docs/architecture/`,
`docs/governance/phases/` and `docs/releases/` — enumerated by
`git ls-files 'docs/product/*.md' 'docs/refresh/*.md' 'docs/features/*.md' 'docs/architecture/*.md' 'docs/governance/phases/*.md' 'docs/releases/*.md'`
(64 files) — plus every tracked `docs/**/*.md` outside `docs/reviews/` and the
UAT session/plan folders that matches
`grep -liE "post-1\.0|post 1\.0|\bdeferred\b|phase 8|follow-up needing|revisit trigger|future release|post-release"`
(the hit list was then read by hand at each hit), plus every DECISIONS entry of
the `havdm`-wing drawer index `drawer_havdm_state_29d3ff6a697fbbcccaa521a9`.
The grep is a discovery aid, not completeness evidence: a document can record
product intent without any of those words. What was NOT swept: `docs/archive/`
(retired by construction), `docs/reviews/`, and drawers not listed in the index
or in `[STATE]`.

| Source named by the review                                                         | Reproduced at                                                                                                                                                                                                                          | Tag      | Proposed disposition in the document                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `drawer_havdm_decisions_c620dc788ac8d47d7911a6ee` — HACS-popularity card-coverage  | "A PRIORITISED CARD-COVERAGE BACKLOG RANKED BY HACS POPULARITY … SHOULD BE WRITTEN DOWN AS A ROADMAP ITEM RATHER THAN REDISCOVERED"; `drawer_havdm_decisions_01d44adf92567391b79a2a4d` confirms the seven orphans are NOT that backlog | MEASURED | New epic, bottom of the Phase 8 order (the drawer itself says post-1.0), outcome: support for more core and HACS cards, ranked by popularity, each provable with an offline fixture; security boundary unchanged                        |
| S-A ruling R5, post-1.0 remainder                                                  | R5: "POST-1.0: an in-app Recent Files surface with real tooltips, tracked alongside FR-01"                                                                                                                                             | MEASURED | Candidate story under E05, beside S05.1 (R5 says tracked alongside FR-01)                                                                                                                                                               |
| `docs/features/F5_SECTIONS_PALETTE_DROP_SPEC.md:931–935`                           | "Sections-container nesting is explicitly out of scope (§5) and is recorded as a deferred follow-up needing the owner's scheduling; it is **not** silently dropped"                                                                    | MEASURED | Candidate story under E09 (sections grid), marked deferred-by-owner 2026-08-06                                                                                                                                                          |
| `docs/releases/RELEASE_NOTES_v1.0.0.md:30`, `:58`                                  | "there is no theme editor … A theme editor and full theme application are candidates for a post-1.0 release"                                                                                                                           | MEASURED | Candidate story under E18 (styling / HA theme variables), post-1.0                                                                                                                                                                      |
| `docs/features/RENDER_FIDELITY_PLAN.md:202`, `:227`, `:239`, `:267`                | Phase B canvas accuracy (post-1.0, owner 2026-07-31); Phase C2 tighten `shell:openExternal` (`src/main.ts:205` still passes the URL straight through); Phase D spike; Phase E real-card rendering, conditional on D                    | MEASURED | Phase B → recorded beside S03.4 (same canvas-fidelity family, parked); C2 → candidate story under E06 beside S06.1; D and E → new post-1.0 epic "real-card rendering in an isolated window — spike first, conditional", bottom of order |
| `drawer_havdm_decisions_0f9619ea3f92e3bcf04a531f`                                  | Third-party card JS never runs in the main renderer; isolated preload-less window remains an open option gated on the owner's trust call AND on tightening `fs:readFile`/`fs:writeFile` first                                          | MEASURED | Source row for the epic above; the boundary is carried into its outcome sentence                                                                                                                                                        |
| `docs/refresh/HA_CAPABILITY_INVENTORY_DESIGN_2026-07.md:168`                       | Slices I5 (HA-version built-in matrix) and I6 (reconnect diff + notification); `src/services/capability/cardAvailability.ts:26` still says "HA-version quirks are slice I5, not presence"                                              | MEASURED | Two candidate stories under E01 (the capability profile is E01's machinery); I6 delivery status INFERRED undelivered — no reconnect-diff code found under `src/services/capability*`                                                    |
| `docs/refresh/HA_EXPORT_BOUNDARY_DESIGN_2026-07.md:357`, `:387`                    | "Later: a strict HA-fidelity schema"; "Decision (ratified 2026-07-21): two-schema split" = vision answer 7                                                                                                                             | MEASURED | Candidate story under E01; delivery status INFERRED undelivered (`grep -rl fidelity src/` returns theme files only)                                                                                                                     |
| `docs/features/HACS_CARD_ALIGNMENT_REFACTOR_PLAN.md:331`; `…PHASES_SUMMARY.md:360` | "Phase R5: Popup Alignment (Decision: Align with Bubble Card — Phase 8)", status "In Progress" dated 2026-02-14                                                                                                                        | MEASURED | Listed as a reviewed source with disposition "not carried unless the owner revives it": the 2026-07-21 vision (answers 3 and 9) made `custom:popup-card` canvas-only with a placeholder on deploy. **Owner question Q3**                |

**A1 — author-found, same class.**
`docs/governance/phases/phase-7-ecosystem-future-growth-amendment-01.md:139`
keeps "Dashboard health scoring (the valuable half of G)" as a **WS4
candidate** — "a user-facing surface over the existing `exportSelfCheck.ts` /
`exportWarnings.ts` / `capabilityProfileService.ts` signals" — while the
document's S-G row and §5 exclusions say slice G was withdrawn. MEASURED.
Proposed: candidate story under E01 (an export-honesty surface), and the S-G
row corrected to "G's telemetry half dropped, its health-scoring half retained".

**Reviewed and proposed as NOT sources, with the reason recorded in §2:** the
pre-refresh plans `docs/product/UPDATE_PLAN.md` (January 2026 component-update
plan; WS1 of the refresh plan is its successor), `docs/product/SUPPORTED_VERSIONS.md`
and `docs/product/VERSION_COMPARISON.md` (version records; their "Phase 8" is the
January advanced-features plan's phase, not the refresh plan's — a naming
collision the document should name), `docs/features/ENTITY_TYPE_DASHBOARD_GENERATOR.md:188`
(four deferred generator ideas, one of which — AI-suggested layouts — is E17),
`docs/features/ADVANCED_YAML_EDITOR_IMPLEMENTATION.md:372` (code-only editor mode,
deferred by the owner's own workflow choice), `docs/architecture/ARCHITECTURE_ROADMAP.md`
(non-functional and code-organisation targets), the Phase 7 blueprint's §20
"explicitly deferred" items (renderer-wide state rewrite, canvas architecture
replacement, plugin runtime — architecture, not product; H is withdrawn per
amendment-01), and `docs/research/BUBBLE_CARD_V3_1_RESEARCH.md` (research). The
owner may revive any of these by ruling; listing them is what makes the
population statement honest. JUDGEMENT on each exclusion.

### P2 — verification and class sweep

**Class swept:** the eleven-type population from
`drawer_havdm_decisions_01d44adf92567391b79a2a4d` (four core: `tile`, `heading`,
`entity`, `statistics-graph`; seven palette orphans), each checked by
`grep -n "<type>" src/components/PropertiesPanel.tsx`; plus every story row that
describes existing editor behaviour as absent (S01.3 — see A4; S04.2–S04.5 —
faithful to the code map and re-observed by the review at `PropertiesPanel.tsx:914`,
`yamlConversionService.ts:193`/`:820`, `dashboardStore.ts:478`/`:495`,
`App.tsx:2273`→`:2299`).

| Type                         | `card.type ===` branch | What it renders                                                     | Also in the "not yet implemented" list (`:6708–6714`) |
| ---------------------------- | ---------------------- | ------------------------------------------------------------------- | ----------------------------------------------------- |
| `tile`                       | none                   | generic fallback only                                               | no                                                    |
| `heading`                    | none                   | generic fallback only                                               | no                                                    |
| `entity`                     | none                   | generic fallback only                                               | no                                                    |
| `statistics-graph`           | none                   | generic fallback only                                               | no                                                    |
| `custom:mini-media-player`   | `:6138`                | editable entity / name / icon and further fields                    | yes                                                   |
| `custom:slider-entity-row`   | `:6215`                | editable entity / name / min / max / step                           | yes                                                   |
| `custom:battery-state-card`  | `:6275`                | editable title / entities / sort / collapse                         | yes                                                   |
| `custom:simple-swipe-card`   | `:6390` (shared)       | title only, in a branch shared with `custom:vertical-stack-in-card` | yes                                                   |
| `custom:multiple-entity-row` | `:6446`                | editable entity / name / secondary information                      | yes                                                   |
| `custom:fold-entity-row`     | `:6499`                | two `Alert`s — guidance and an example; no editable field           | yes                                                   |
| `custom:decluttering-card`   | `:6532`                | editable template name; variables directed to YAML                  | yes                                                   |

MEASURED, source existence only; no card was opened in the running app.

**A2 — refinement the review did not state.** `PropertiesPanel.tsx:6716–6718`
renders "Property editor for {card.type} cards is not yet implemented. Edit the
YAML file directly" for a list that includes all seven orphans (`:6708–6714`).
So for six of them the panel shows a partial form AND a notice saying there is
none — the panel contradicts itself, which is the truthful shape of S04.1.
`git log -S"card.type === '<type>'" -- src/components/PropertiesPanel.tsx`
returns `eaa9efa` (2025-12-26) as the first commit for all seven: the code map's
2026-08-07 sentence was already false for six of them when it was written, not
made false afterwards.

**A4 — S01.3's absence claim, narrowed (the review's nonblocking construction).**
`src/App.tsx:1988–1992` routes a sections→masonry change through
`flattenSectionsView` (`src/utils/sectionsLayout.ts:480`), so "no in-app way to
make a real masonry view" is too wide. What remains true from source: a scaffold
view normalises to `masonry` (`src/utils/viewsLayout.ts:157–162`), so choosing
masonry on it is a no-op; `convertViewToSections` (`:452`) and
`flattenSectionsView` both spread `...view`, so `_havdm_scaffold` survives both
conversions; and `isHavdmScaffoldView` decides on that marker alone. INFERRED —
no UI route exercised. Proposed: S01.3 restated as "a scaffold view cannot become
a real masonry or sections view; the marker survives every conversion".

### P3 — verification and class sweep

**Class swept:** all 24 candidate-story rows (S01.1–S08.1) against the source
each names; traced by hand, row by row. Four rows drift from their source, as the
review says:

- **S01.1** (B:122) omits the layout-card flag. `drawer_havdm_decisions_bdef071e2ead9ed0a5ff8d9c`
  ruling 1: "`cardModAvailable` (and the layout-card flag — ONE capability object
  for BOTH …)". MEASURED — narrowing.
- **S01.2** (B:123) omits "or explicit user opt-in". R3: "`custom:grid-layout`
  ONLY when sections cannot hold the geometry AND the capability profile shows
  layout-card installed (or explicit user opt-in)". MEASURED — narrowing.
- **S03.3** (B:150) promises templates "render as values". R7 names the third
  split part "template marking". MEASURED — widening; the remedy belongs to the
  B6 split plan.
- **S02.1** (B:134) lists "paste, add card, view settings". The triage
  (`uat_triage_v1.0.0-r3_2026-08-03.md:249–251`) recommends "Paste (and only what
  makes sense with no card under the cursor)". MEASURED — two of three items are
  the author's.

Twenty rows are faithful (S02.2–S02.4, S03.1–S03.2, S03.4, S04.2–S04.4,
S05.1–S05.3, S06.1, S06.3, S07.1, S08.1, and E09–E18's ten outcome rows, which the
review reconciled to §4.4 A–J and WS4 with no issue). **A3 — borderline, labelled:**
S04.5's "the user is told what was skipped and why" states a remedy where the code
map records only "`asCardRecord` SILENT DROP"; it follows the vision's "never
silently destroy user data" but is the author's outcome, not the source's.
JUDGEMENT. Proposed: labelled as a candidate outcome in the row.

### P4 — verification

**Class swept:** every `Depends on` cell (24) and the seven §5 reasons.

- **S01.3 ← S01.2:** the conversion code exists today (A4); nothing in S01.2
  must land first. INFERRED. Preference, not prerequisite.
- **S05.1 ← S04.3:** `FEATURE_REQUESTS.md:87–91` records an interaction to
  design for ("Close and re-open must not leave a stale path behind"), not an
  order; `dashboardStore.ts:470–472` `clearDashboard` sets `initialState`, whose
  `filePath` is `null` (`:104`). MEASURED. Preference, not prerequisite.
- **S06.3 "E01–E02 as ruled":** `docs/testing/UAT_STRATEGY.md:65–70` lists the
  round prerequisites (gate, captured full suites triaged, packaged app launches).
  MEASURED. Incomplete.
- **§5 item 3 vs S03.4:** B:243 "E03 waits on B6"; S03.4's cell is empty and the
  row is PARKED. MEASURED. Internal inconsistency.
- **§5 item 1:** B:236 "E01 first because the owner ruled F9a → F6 → F10", but
  the ruling (`drawer_havdm_decisions_bdef071e2ead9ed0a5ff8d9c` ruling 2) orders
  the first THREE PRODUCT PRs — S01.1, then S02.1, then S02.2 — not the epics.
  MEASURED. Ambiguity at seeding.
- **E09 ← E01:** product reasoning, not a landing dependency. JUDGEMENT; the
  review does not claim otherwise.

### P5 — verification

**Q1:** ruled 2026-09-07 (above). The con "Ten large items" is P8's fourth
instance. The Option B con treats the refresh plan as "a second surface"; C1
(`2026-08-18-model-roles-and-workflow-adoption.md:542–544`) forbids a LIVE
roadmap beside the board, not an unscheduled reference. MEASURED on the text;
the reading is JUDGEMENT. On this board the only statuses are Todo / In Progress /
Done and the only Kinds product / process / watch (`gh project field-list 2`), so
"unscheduled drafts" would need a new field or status — a new board mechanism,
which the PAUSE forbids; bottom-of-order Todo items are the available form.

**Q2:** the strategy's §8 (`:409–415`) parks "the canvas fidelity ORACLE
(arbitration point 5)" with "Revisit trigger: when the canvas-fidelity contract
work is scheduled, its spec session opens with that decision". So the trigger
fires by SCHEDULING the contract; B:294 "the trigger has not fired" is true but
unexplained, and grouping (inside E03 or its own epic) is separate from
scheduling. MEASURED on the text. Q2 is not yet ruled.

### P6 — verification

B:33–34 "not edited after it seeds the board"; B:272 "After seeding, this
document is **frozen** (C1)"; B:324–325 "The owner's merge of this branch
freezes the document." MEASURED. C1's event is seeding. The practical sequence
under §6 is approval → seeding → merge of the already-frozen record.

### P7 — verification

B:187 "The Windows build is code-signed so security software stops flagging
it." R6b (`drawer_havdm_decisions_6e8d4788d9513ccce593c378`): "Windows code
signing becomes a formal 1.0 release/distribution gate needing the owner's
credentials + policy (CLIP-02's Acronis alert is the evidence it recurs on user
machines)"; the CLIP-02 ruling (`drawer_havdm_decisions_13af4bb6f0a430763a2aeec3`)
calls it "a packaging/signing concern". Neither promises the alerts stop.
MEASURED.

### P8 — verification

- B:81 "Six known editor defects": the STILL-OPEN list in
  `drawer_havdm_src_3488d55dd69286718dfaddce` has ten entries; the document maps
  eight (five to E04, one each to S03.1, S06.1, S06.2) and leaves the ~25
  live-preview placeholders and the ungated `tools/*.sh` without a disposition.
  MEASURED.
- B:83 / B:255 slice C "withdrawn": `phase-7-tracking.md:183–186` "PARTIALLY
  WITHDRAWN … action withdrawn, guarantee delivered". MEASURED.
- B:80 "live-HA write scope" open: `phase-7-ecosystem-future-growth-amendment-04.md:67–68`
  makes the test instance writable and the reference instance read-only outside
  the UAT envelope. MEASURED.
- B:284 "Ten large items": the §4 table reads Large ×3, Medium ×5, Small each ×1,
  Ongoing ×1. MEASURED.

### Records

- Astra's `MemPalace drawer candidates` section was filed by the author under
  MP-LEASE with `added_by="codex"`: `drawer_havdm_investigations_16ae93e552da8f532c32612f`
  (read back from the tool result).
- The review file `ffa0416` is not edited. No board item, Issue, governance
  document or `src/` file changed in this round.

**What this round does NOT establish.** No repair has been made. Whether P1–P8
close is decided by the owner's rulings (Round 2) and then by Astra's scoped
follow-up on the repair diff, not by this table, which is the author's
verification claim.

## Round 2 — 2026-09-08, the owner's rulings and the rev 1 repair (`29a43c6`)

**Owner rulings, 2026-09-08, by Ref.** Every finding was put to the owner on a
multiple-choice brief with the author's recommendation first, and the owner
chose the recommendation on every question ("as recommended"): **P1 and P2
approved as proposed** (the alternative "no new epics" was offered and not
chosen); **P3, P4, P6, P7, P8 fix now**; **P5** — Q1 stands as ruled 2026-09-07,
its presentation ruled as bottom-of-order Todo items with no new board status,
and **Q2 ruled: the canvas-fidelity contract stays parked inside E03 with its
trigger named**; **Q3 (new) ruled: the 2026-02 popup / Bubble Card alignment
intent is not carried, superseded by the vision**. DEFERRED: none.
ACCEPTED-RESIDUAL: none. The cleanup-sweep item stays empty. Record:
`drawer_havdm_decisions_ad4c3da54687bd3904c17865`.

The repair is ONE content commit, `29a43c6`, on
`docs/strategy/2026-09-07-product-backlog-seeding.md` (rev 1; 205 insertions,
115 deletions by `git diff --stat 9f64e4e 29a43c6`). Line numbers below are rev
1's, read back by `grep -n` after the commit.

| Ref | Sev | Disposition | What changed in rev 1                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --- | --- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | 1   | RESOLVED    | §2 intro (`:76`) states how the population was enumerated (the two commands, the hand-read boundary, what was not swept); sources S-K…S-T added (`:102–110`) each with an evidenced home; "Reviewed and not carried" list (`:118`); new epics E19 (`:281`) and E20 (`:282`) at the bottom; new stories S01.4–S01.7, S05.4, S06.4; named E09/E18 candidates; §0's "every place" and "nothing here is my invention" removed; §8 no longer implies a complete universe |
| P2  | 1   | RESOLVED    | S04.1 (`:208`) restated per type from the 2026-09-08 measurement, naming the four core cards' generic fallback, six partial forms, one guidance-only branch, and the panel's own "not yet implemented" notice; its source cell dates the code-map claim as false when written; S-E row corrected to match                                                                                                                                                           |
| P3  | 2   | RESOLVED    | S01.1 (`:165`) quotes the F9a ruling's ONE object for BOTH flags; S01.2 restores R3's "(or the user explicitly opts in)"; S03.3 (`:197`) returns to R7's "template marking" and leaves the remedy to B6; S02.1 (`:181`) offers Paste and labels further entries as candidates; S04.5's outcome labelled the author's (A3)                                                                                                                                           |
| P4  | 2   | RESOLVED    | §3 redefines "Depends on" as a ruling or code fact only; S01.3 (`:167`) and S05.1 cells emptied with the preference moved to §5; S06.3 (`:237`) cites `UAT_STRATEGY.md` §3.1's prerequisites; §5 item 1 (`:295`) states the ruled first three product PRs S01.1 → S02.1 → S02.2 and calls E09←E01 a reason, not a dependency; §5 item 3 scopes B6 to S03.1–S03.3 with S03.4 parked                                                                                  |
| P5  | 2   | RESOLVED    | §7 Q1 marked RULED with corrected cons (the table's own sizes; the refresh plan as a frozen reference) and the presentation ruling; Q2 marked RULED with the strategy §8 trigger written out and grouping separated from scheduling; Q3 added and marked RULED (`:376`); S03.4 row carries the trigger                                                                                                                                                              |
| P6  | 2   | RESOLVED    | §10 step 3 (`:413`): seeding freezes the document (C1, §6 step 5); the merge lands the frozen record. §0 and §6 already said seeding; no other freeze statement remains (`grep -n freez`)                                                                                                                                                                                                                                                                           |
| P7  | 2   | RESOLVED    | S06.2 (`:236`): a signed Windows build under the owner's credentials and policy, the formal 1.0 distribution gate; alert behaviour "measured after signing, not promised"; E06's outcome unchanged                                                                                                                                                                                                                                                                  |
| P8  | 3   | RESOLVED    | S-E row: ten entries with the two non-product entries excluded explicitly; S-G row and §5 exclusions: slice C partially withdrawn, G split; S-D row: the live-HA write question answered by amendment-04; Q1 con: three Large / five Medium / one Small each / one Ongoing / two not estimated                                                                                                                                                                      |

**Blast radius (OA §3.4).** Upstream: nothing reads the strategy document
programmatically — it is outside the author ledger's governed set
(`tests/support/authorLedger.ts` covers `docs/governance/**`, `docs/templates/**`,
`ai_rules.md`, `CLAUDE.md`), so no fingerprint moves. Downstream consumers of
its content: (1) the board seeding in §6 — now twenty epics, E19/E20 last, no new
status; (2) Issue #159's corrected Process paragraph, which names "E01 / S01.1"
— both IDs unchanged by rev 1 (D8: no ID recycled; the new IDs are appended);
(3) `[STATE]` item 11, bumped in the same session; (4) Astra's scoped
follow-up, which reviews this diff and this radius. Non-regression: docs-only
branch; `./tools/checks` at `29a43c6` REAL_EXIT=0, 4/4 steps, lint 0 errors /
145 warnings, unit 1559 passed / 105 files. No `src/`, `tests/`, governance or
board change.

**Author-found in the reading pass, recorded so the follow-up sees them.** A5:
the §8 line "It does not estimate effort beyond the refresh plan's own sizes
for E09–E18" is still true (E19/E20 carry "not estimated") and was left as is.
A6: rev 1 grew the document from 325 to 415 lines; nothing was removed except
the four universals and the superseded wording named above.

**What this round does NOT establish.** Whether P1–P8 are closed is decided by
Astra's scoped follow-up on `29a43c6` (findings from P9), not by this table.
The population statement is now honest about its method; it is still not a
proof of completeness, and §2 says so.

## Round 3 — 2026-09-08, answering `b7-product-backlog-codex-review-followup.md` (`244020a`, `BLOCKED-ON: S04.1`; P2 PARTIALLY RESOLVED at SEV 1, P1/P3/P4 at SEV 2, P8 at SEV 3; P5–P7 RESOLVED; no new Ref allocated) — verification, the owner's rulings, and the rev 2 repair (`224ec8a`)

**Verification first, as hypotheses.** Every remainder was reproduced at its
source on 2026-09-08 before the owner was briefed:

- **P2 — HOLDS, MEASURED, and it is the author's error.** `src/components/PropertiesPanel.tsx:6645`
  opens the guard with `{![` — a NEGATED membership test — and `:6715` closes it
  with `].includes(card.type) && (`; the list between them (`:6646–6714`)
  contains all seven palette types and none of the four core types. So the
  "not yet implemented" notice (`:6718`) renders for `tile`, `heading`,
  `entity` and `statistics-graph` and NOT for the seven. Round 1's A2 and Round
  2's P2 row said the reverse: the author read the list and the `.includes`
  without reading the operator in front of it. **Correction to Round 1 (A2) and
  Round 2 (P2 row):** both are wrong on this point and are not rewritten; this
  line records it. The S01.3 remainder also HOLDS, MEASURED: `viewsLayout.ts:271`
  (`convertViewToLayoutCard`) and `:287` (`setViewType`) delete
  `_havdm_scaffold`; only the two sections helpers keep it. "Every conversion"
  was an unverified universal.
- **P1 — HOLDS, MEASURED / JUDGEMENT.** `PROJECT_REFRESH_PLAN_2026-07.md:186`:
  "WS1 — Engineering-discipline uplift (promptmi port)" — not a successor to the
  January component-update plan; the "superseded" framing of the exclusions had
  no record behind it; `grep -rl fidelity src/` returns four paths, two of them
  comments about the remediation plan (`canvasKeyStripper.ts:2`,
  `yamlConversionService.ts:176`), not "theme files only"; and
  `RELEASE_NOTES_v0.7.4-beta.5.md:49` / `:92` records `align_content`
  "intentionally deferred beyond Feature 4.5 MVP" with no home or exclusion in
  rev 1 (`grep -rn align_content src/` returns nothing).
- **P3 — HOLDS, MEASURED.** `RENDER_FIDELITY_PLAN.md:236` says only "Tighten
  `shell:openExternal`"; rev 1's S06.4 chose a policy. Rev 1's E20 row carried
  no boundary and no trust decision, both of which the isolation ruling
  (`drawer_havdm_decisions_0f9619ea3f92e3bcf04a531f`) makes explicit.
- **P4 — HOLDS, MEASURED.** `RENDER_FIDELITY_PLAN.md:228–231`: Phase C is "a
  **prerequisite**" for D and E; Phase C is C1 and C2, mapped by rev 1 itself to
  S06.1 and S06.4; rev 1 named S06.1 alone.
- **P8 — HOLDS, MEASURED.** Rev 1 E20 size cell "Spike small; feature not
  estimated" against §7's "two not estimated" and §8's no-estimate line; the
  source (`:239`) says time-boxed, no size.
- **P5, P6, P7 — RESOLVED by the reviewer;** the author's re-read of the
  cited closures found nothing to reopen.
- **Gate at `244020a` re-run by the author:** REAL_EXIT=0, 4/4 steps, lint 0
  errors / 145 warnings, unit 1559 passed / 105 files — matches the review's §2.

**Owner rulings, 2026-09-08, by Ref** (multiple-choice brief, the
recommendation first; every answer "as recommended"): **P2** both corrections
approved; **P1** fix now, `align_content` homed as a named candidate under E12;
**P3 and P4** fix all three now; **P8** fix now, "Not estimated". DEFERRED: none.
ACCEPTED-RESIDUAL: none. Record: the `[DECISION]` drawer filed this session
(ID in the session message and `[STATE]`).

The repair is ONE content commit, `224ec8a` (rev 2; 92 insertions, 79
deletions by `git diff --stat 244020a 224ec8a`). Line numbers are rev 2's,
read back by `grep -n` after the commit.

| Ref | Sev | Disposition | What changed in rev 2                                                                                                                                                                                                                                                                                                                                                                                             |
| --- | --- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | 2   | RESOLVED    | "Reviewed and not carried" (`:120`) reframed as the owner's present choice with each source's own status and no supersession claim; the WS1 successor claim withdrawn; the generator and YAML-editor entries now quote their sources' own deferrals; S-P (`:107`) states the true grep result and marks delivery UNVERIFIED; new S-U (`:112`) homes `align_content` under E12 (named-candidates paragraph `:293`) |
| P2  | 1   | RESOLVED    | S04.1 (`:217`): the four core cards get the generic fallback AND the notice; none of the seven palette cards is shown it; the source cell names the negated guard at `:6645` and records that rev 1 stated the reverse. S01.3 (`:176`): scoped to the two sections helpers and the masonry no-op; the two marker-clearing paths named as not the defect                                                           |
| P3  | 2   | RESOLVED    | S06.4 (`:247`): "tightened", with the restriction labelled the author's candidate for the brief. E20 (`:291`): reaches no file bridge and no IPC; third-party card code never runs in the main app; HAVDM's renderers stay the never-connected fallback; rendering only on the owner's explicit trust decision                                                                                                    |
| P4  | 2   | RESOLVED    | E20 (`:291`) and §5 item 7 (`:330`): prerequisite is the whole of Phase C — S06.1 AND S06.4 — plus the trust decision; source cell now cites Phases C–E                                                                                                                                                                                                                                                           |
| P8  | 3   | RESOLVED    | E20 size cell "Not estimated"; §7 Q1's "two not estimated" and §8's no-estimate line are now true of the table                                                                                                                                                                                                                                                                                                    |
| P5  | —   | RESOLVED    | Closed by the follow-up; unchanged in rev 2                                                                                                                                                                                                                                                                                                                                                                       |
| P6  | —   | RESOLVED    | Closed by the follow-up; unchanged in rev 2                                                                                                                                                                                                                                                                                                                                                                       |
| P7  | —   | RESOLVED    | Closed by the follow-up; unchanged in rev 2                                                                                                                                                                                                                                                                                                                                                                       |

**Blast radius (OA §3.4).** Unchanged in kind from Round 2 and re-stated
without the universal the follow-up flagged: no consumer of the document's path
was found in `src/`, `tests/`, `tools/`, `.github/` or `package.json`
(`grep -rl "product-backlog-seeding"` over those trees returns nothing — a
bounded search, not a proof); the document is outside the author ledger's
governed set (`tests/support/authorLedger.ts:68`). Downstream: the §6 seeding
(still twenty epics, E19/E20 last); Issue #159's "E01 / S01.1" (both IDs
unchanged; S-U and no other ID added, none removed or renamed); `[STATE]` item
11 (bumped this session); Astra's second scoped follow-up. Non-regression:
docs-only; `./tools/checks` at `224ec8a` REAL_EXIT=0, 4/4 steps, lint 0
errors / 145 warnings, unit 1559 passed / 105 files.

**Reviewer's drawer candidate** filed under MP-LEASE with `added_by="codex"`:
`drawer_havdm_investigations_b4c27652e9e3de7e4185cdac` (read back from the tool
result).

**What this round does NOT establish.** Whether the five remainders are closed
is decided by Astra's second scoped follow-up on `224ec8a`, not by this table.
The population statement remains honest about its method and is still not a
completeness proof.

## Round 4 — 2026-09-08, answering `b7-product-backlog-codex-review-followup2.md` (`b3541c3`, `CLEAR-WITH-FINDINGS`; P2–P8 RESOLVED; P1 PARTIALLY RESOLVED at SEV 3 with three record-wording constructions; no new Ref) — verification, the owner's rulings, and the rev 3 repair (`4224b03`)

**Verification first, as hypotheses.** All three constructions HOLD, MEASURED:
(1) `src/services/yamlConversionService.ts:176` reads "WARNED about here so the
fidelity loss is honest" — it does not name the remediation plan; only
`src/services/canvasKeyStripper.ts:2–4` does. Rev 2's S-P said "two comments
naming the remediation plan". (2) `docs/features/ENTITY_TYPE_DASHBOARD_GENERATOR.md:180–186`
lists five items under **Planned** and `:188–193` four under **Deferred**; rev
2's entry said "the rest stay deferred". (3) Rev 2's "no later document is its
successor" is a global absence a source search cannot decide. **Gate at
`b3541c3` re-run by the author:** REAL_EXIT=0, 4/4 steps, lint 0 errors / 145
warnings, unit 1559 passed / 105 files — matches the review's §2.

**Owner rulings, 2026-09-08, by Ref** (multiple-choice brief, recommendation
first): **P1 — fix now**, accepting that the repair receives one more scoped
follow-up (the alternative, accept-residual and seed with the three
inaccuracies recorded, was offered and not chosen). **And a second ruling:
approval of the reviewed document for seeding is GIVEN NOW, CONDITIONAL on the
third scoped follow-up returning `CLEAR` or `CLEAR-WITH-FINDINGS` with nothing
above SEV 3;** anything above SEV 3 returns to the owner before any item is
created. DEFERRED: none. ACCEPTED-RESIDUAL: none.

The repair is ONE content commit, `4224b03` (rev 3; 30 insertions, 28
deletions by `git diff --stat b3541c3 4224b03`, of which three are the wording
units, one the header, one the revision log). Line numbers are rev 3's, read
back by `grep -n` after the commit.

| Ref                                                                                                                         | Sev | Disposition | What changed in rev 3                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------- | --- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1                                                                                                                          | 3   | RESOLVED    | S-P (`:110`) lists the four `fidelity` paths and says what each is; the generator entry (`:133`) keeps its source's own Planned / Deferred split and states the present-choice exclusion; the WS1 clause (`:128 |
| 416`) claims only that no successor was established in the reviewed sources. Header (`:6`) records the conditional approval |
| P2–P8                                                                                                                       | —   | RESOLVED    | Closed by the second follow-up; unchanged in rev 3                                                                                                                                                              |

**Blast radius (OA §3.4).** Three wording units in §2 plus the header and the
revision log; no ID, row, epic, story, order, dependency or ruling changed
(`git diff b3541c3 4224b03` touches S-P, one exclusion sentence, one exclusion
clause, the Status line and §9). Same consumers as Round 3: the §6 seeding
(unchanged content to seed), Issue #159's "E01 / S01.1" (unchanged),
`[STATE]` item 11 (bumped this session), and the third scoped follow-up.
Outside the author ledger's governed set. Non-regression: docs-only;
`./tools/checks` at `4224b03` REAL_EXIT=0, 4/4 steps, lint 0 errors / 145
warnings, unit 1559 passed / 105 files.

**Reviewer's drawer candidate** filed under MP-LEASE with `added_by="codex"`:
`drawer_havdm_investigations_3fd6c409d8df37c8bc55af7a` (read back from the tool
result).

**What this round does NOT establish.** Closure of P1 is decided by the third
scoped follow-up on `4224b03`. Seeding is authorised by the owner's conditional
approval above only once that follow-up meets its condition; until then no
board item is created.
