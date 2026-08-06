Author: Claude Opus
Reviewer: OpenAI Codex (GPT-5), independent reviewer; did not author the artifact
Owner gate: BaggyG-AU reads the spec and this review together; only the owner signs off and merges PR #132

# Independent Artifact Review — F5 Sections Palette-Drop Insertion Contract

## Scope and starting state

Reviewed commit `9450553` and only
`docs/features/F5_SECTIONS_PALETTE_DROP_SPEC.md`, against the owner-supplied
verbatim ARB-R7, VIEWS-04, tester-note, and review-pipeline authority, plus the
committed authorities and unchanged base implementation.

The tripwire passed before review work began:

- branch `feature/f5-spec-insertion-contract` at `9450553`;
- local `main` and the merge base at `de568c5`;
- exactly one commit over that base;
- exactly one added file, 655 insertions and no deletions; and
- PR #132 open, non-draft, and unmerged, with the required head and base.

No implementation, test, or source change exists on the branch. I did not edit
the spec, run e2e/integration tests, merge, approve, or otherwise mutate PR #132.

## Overall assessment

The spec covers ARB-R7's three named subjects: palette payload shape (§7.1),
target-section resolution including the effect of "+ Add section" (§7.4), and
insertion semantics (§7.3/§7.6). The quoted R7 and tester text is faithful. The
three central source mechanisms also mostly withstand falsification:

1. "+ Add section" calls `onSectionAdd` without an index
   (`src/components/SectionsCanvas.tsx:346-360`), and `handleSectionAdd` appends
   then writes the new last index with no selected card
   (`src/App.tsx:1741-1757`; `src/store/dashboardStore.ts:282-294`). This does
   reconcile the tester's last-section observation with the existing fallback
   in `handleCardAdd` (`src/App.tsx:1131-1153`).
2. `section-empty-${si}` is a child of the section body and has no event handler
   (`src/components/SectionsCanvas.tsx:675-688`), while the body owns the current
   `onDragOver`/`onDrop` (`:390-415`), so the empty-section event does bubble to
   the body. `sections-canvas-empty` instead sits under the grid and canvas root
   (`:691-700`), neither of which is currently a drop target, so the proposed
   no-sections placeholder needs its own handler if the canvas root remains a
   deliberate non-target.
3. The HTML drag data store is protected during `dragover`: formats remain
   enumerable but `getData()` returns an empty string. The proposed custom MIME
   is therefore a justified discriminator, and adding it leaves the existing
   `text/plain` entry intact (`src/components/CardPalette.tsx:143-147`). See the
   [WHATWG HTML drag-and-drop standard](https://html.spec.whatwg.org/multipage/dnd.html#the-drag-data-store).

Those confirmations do not cure the contract and proof gaps below.

## Major findings

### M1 — The fresh-load target premise is false, leaving a common target-resolution state undecided

**Location:** §7.4, especially lines 329-369 and the row at lines 332-339; §9.2
L8 at line 538; MUST NOT 4 at lines 141-145.

**What is wrong:** The spec says `selectedSectionIndex` is `null` for "a freshly
loaded dashboard" and cites only the initial-state value. Initial store state is
indeed `null` (`src/store/dashboardStore.ts:102-117`), but a successful
`loadDashboard` resets `selectedViewIndex`, `selectedCardIndex`,
`selectedCardIndices`, and the anchor while omitting `selectedSectionIndex`
(`src/store/dashboardStore.ts:122-178`). Because that store update is partial,
a section index selected in the previous document survives a later successful
load. If that inherited index exists in the new view, today's add path treats it
as valid (`src/App.tsx:1131-1138`), and the proposed resolver does the same.

**Why it matters:** ARB-R7 specifically requires complete target-section
resolution. A cross-document load can target a retained section rather than
section 0, yet §7.4 says the opposite and L8 proves only a fresh-process initial
state. MUST NOT 4 simultaneously forbids changing reset semantics, so an
implementer cannot infer whether retention is intentional or an omitted reset.

**Concrete correction:** State the actual successful-load behavior and obtain an
owner-level decision: either (a) preserve a still-valid inherited index and make
that an explicit resolver rule with a reload-between-documents leg, or (b) add
the successful-load reset to scope, carve it out of MUST NOT 4, and test it.
Add this decision to §10 until resolved. Do not continue calling every loaded
dashboard a no-selection state.

### M2 — §9.6 conditionally abandons the exact MIME discriminator required by §7.1

**Location:** §7.1 lines 194-201 and 211-216; §7.3 lines 279-282; §9.2 lines
520-527; §9.6 item 2, lines 598-603.

**What is wrong:** §7.1 correctly says accepting `text/plain` during `dragover`
would accept unrelated text drags and that the marker MIME makes the decision
exact. §9.6 then says that if Playwright's gesture does not expose the marker in
`dataTransfer.types`, production discrimination "must fall back to
`text/plain`". That is the behavior §7.1 rejects: section targets would accept
any text drag, only to parse/warn/no-op at `drop`. The background non-target does
not protect section bodies, toolbars, or card wrappers from that broadening.

The current palette sets only `text/plain` (`src/components/CardPalette.tsx:143-147`),
the flat canvas unconditionally accepts dragover (`src/components/GridCanvas.tsx:243-289`),
and the existing real-gesture precedent uses `dragTo`
(`tests/e2e/canvas-resize-and-nesting.spec.ts:117-145`). The local dispatched
drag helper can also carry an explicit `DataTransfer`
(`tests/e2e/sections-canvas.spec.ts:193-211`). A harness observation therefore
must not silently rewrite the product contract.

**Why it matters:** This is an internal contradiction in the load-bearing
payload mechanism and a silent broadening of accepted gestures. It also makes
approval ambiguous: the owner cannot know whether they are signing the exact
marker contract or the text/plain fallback.

**Concrete correction:** Keep marker-MIME membership as the only palette branch
at `dragover`. If `dragTo` cannot carry it in this environment, retain a bounded
real-gesture probe and use an explicitly populated `DataTransfer` for the
deterministic contract legs, as §9.2 already permits. If the real application
(not merely the test harness) cannot expose the marker, stop and amend the spec;
do not weaken the product behavior to make a test pass.

### M3 — `insertCardIntoSectionAt` has a valid behavioral red leg

**Location:** §9.5 lines 568-585.

**What is wrong:** The blanket claim that neither helper has a valid red leg
rests on both being "brand-new exports". That is not the governing test. The
documented exception concerns absence of a behavioral seam, with import failure
only as the symptom; the controlling rule is whether a behavioral red leg
exists (`docs/governance/OPERATING_AGREEMENT.md:66-73`).

For `insertCardIntoSectionAt`, one does exist. The existing production helper
always appends (`src/utils/sectionsLayout.ts:114-124`), while the proposed unit
cases require insertion at 0 and in the middle (§9.5 lines 570-572). A temporary
historical-behavior implementation of the new export that delegates to
`addCardToSection` will import successfully and fail those cases on behavior,
not naming. It also models the exact pre-F5 palette-add semantics in
`src/App.tsx:1140-1150`.

`resolveTargetSectionIndex` is different: its proposed cases characterize the
existing inline decision (`src/App.tsx:1131-1138`), including the no-sections
early return, so no behavior change exists for its pure extraction to refute.
That can honestly use alternative evidence, but "new export" is not the reason.

**Why it matters:** The current text invokes the exception by symbol novelty,
the exact shortcut §2 forbids, and would waive a genuine red-before-green proof
for the new insertion behavior.

**Concrete correction:** Split the two helpers. For
`insertCardIntoSectionAt`, require a historical-behavior red leg: first expose
it with append semantics, run the 0/middle tests and observe behavioral failure,
then implement insert-at-index and rerun. Keep a no-valid-red explanation only
for the behavior-preserving resolver extraction, with its alternative evidence
named precisely.

### M4 — The container-nesting question blocks more contract than §10 admits

**Location:** §10 lines 624-638, especially the claim that only the card-wrapper
sub-clause is blocked and all of §7.2 and §7.4-§7.7 are unaffected.

**What is wrong:** The question is genuinely owner-level, but its stated blast
radius is too narrow. If the owner chooses nesting, the §7.2 callback docblock
can no longer promise that `to.cardIndex` is the index the new card takes; the
§7.6 write path cannot always call `insertCardIntoSectionAt`; selection semantics
must say whether the top-level container or a nested child is selected; AC 3
needs a container exception; and the test plan needs a sections-container leg.
The flat precedent detects a container from the addressed card and takes a
different callback/write path (`src/components/GridCanvas.tsx:256-275`;
`src/App.tsx:1207-1235`). The current sections selection model is top-level
`(sectionIndex, cardIndex)` (`src/components/SectionsCanvas.tsx:16-20,478-550`).

**Why it matters:** The template requires open questions to block every affected
section. An owner answer of "nest" would invalidate normative text the spec says
is already settled.

**Concrete correction:** Either obtain the owner's recommended "defer" decision
and make sections-container nesting explicitly out of scope, or mark at least
§7.2, the card-wrapper row of §7.3, §7.6, AC 3/7/15 as applicable, and the
corresponding test legs blocked, then revise them after the decision.

### M5 — Several normative behaviors and AC clauses are not proved by the named legs

**Location:** §7.1 lines 211-216; §7.3 line 249; §8 AC 1, 10, 15, and 16; §9.2
L1, L9, and L11; §9.5.

**What is wrong:** The AC/leg mapping is incomplete in several falsifiable
places:

- The malformed, empty, and unknown-card payload behavior in §7.1 has no AC and
  no named test leg.
- The section-body contract says a populated-body drop appends, but AC 1 and L1
  assert only counts/target section. `dragTo` at a section locator's default
  point may also hit a child card or toolbar, whose event then follows a
  different row (`src/components/SectionsCanvas.tsx:390-420,478-509`).
- AC 15 includes both absence of layout keys and `entities`/`glance` default-title
  parity. L11 names only the layout-key half, even though the current
  double-click title behavior is distinct code
  (`src/App.tsx:1140-1143`).
- AC 16 has unit-test prose but no named leg/AC mapping.
- L9 asserts the derived marker but does not directly pin
  `selection-debug-state[data-selected-section]`, although that debug surface
  exists (`src/App.tsx:3575-3597`) and Fable §3.7 specifically asked the fix's
  test to pin what "+ Add section" stores.

**Why it matters:** A future implementation can satisfy the named tests while
violating the approved payload validation, append index, title, helper, or
selection-state contract. That fails the requested agreement among §7, §8, and
§9.

**Concrete correction:** Add named, AC-mapped legs for invalid/unknown payloads;
make L1 hit a known bare section-body area and assert the new card is last; make
L11 use `entities` or `glance` and assert both title and absence of layout keys;
name the helper legs (for example U1/U2) and map AC 16; and add the direct
selected-section debug assertion to L9. Classify each leg's real base outcome
without calling a no-write assertion red merely because base refuses every
drop.

## Minor findings

### m1 — The file inventory omits the promised card-correction write

**Location:** §4 lines 109-110; §6 lines 154-165; §9.4 lines 556-566.

**What is wrong:** §9.4 requires a new VIEWS-04 entry in
`docs/testing/uat/CARD_CORRECTIONS.md`, but §6 does not list that file. Instead,
the `tests/e2e/sections-canvas.spec.ts` row calls §9.4 a "citation repair," even
though the correction register is the file that carries the repair. The
register is the committed, append-only mechanism for future-round wording
(`docs/testing/uat/CARD_CORRECTIONS.md:1-6,49-62`).

**Why it matters:** The implementation file list can omit a promised governed
documentation change or encourage editing the already-run UAT plan.

**Concrete correction:** Add `docs/testing/uat/CARD_CORRECTIONS.md` to §6 with
the VIEWS-04 entry, and limit the e2e row to fixtures/legs. Keep the r3 plan and
verdict untouched.

### m2 — The insertion guard's notification and no-op behavior are misstated

**Location:** §7.6 steps 1, 3, and 4, lines 397-415.

**What is wrong:** Step 1 says every failed precondition produces
`message.error`, supposedly matching `handleCardAdd`. The current handler uses a
warning for missing config and missing selected view, and an error only for an
unknown card type (`src/App.tsx:1101-1117`). Separately, step 3 promises a
reference-equal result for an invalid section, but step 4 unconditionally calls
`updateConfig`; unlike existing App section handlers, it does not say to return
when `nextView === currentView` (`src/App.tsx:1693-1703,1741-1749`).

**Why it matters:** Two conforming implementations could surface different UX,
and the latter could create a junk undo entry for a defensive no-op.

**Concrete correction:** Specify warning/error parity per precondition and add a
reference-equal early return before `updateConfig`.

### m3 — Optional callback behavior is unspecified at dragover

**Location:** §7.2 lines 218-239 and §7.3 lines 247-254.

**What is wrong:** `onPaletteCardDrop` is optional so read-only callers behave
as before, but the target table unconditionally accepts a marker drag. The spec
does not say whether a mounted `SectionsCanvas` without the callback should
`preventDefault()` and then silently no-op, or preserve today's refusal. The
current component's other authoring callbacks are optional
(`src/components/SectionsCanvas.tsx:22-49`), and `GridCanvas` checks its optional
drop callback before doing work (`src/components/GridCanvas.tsx:243-249`).

**Why it matters:** Unconditional acceptance with no writer recreates the
silent-gesture failure the feature is meant to remove.

**Concrete correction:** Gate palette acceptance on the callback being present,
or make the prop required along every authoring path and document the read-only
behavior explicitly.

### m4 — Array/DOM order is not guaranteed to be the visible dense-grid position

**Location:** §7.6 lines 424-430 and the "card appears under the cursor" premise
at lines 420-422.

**What is wrong:** The source comment establishes only that DOM order remains
array order while the canvas uses `gridAutoFlow: 'row dense'`
(`src/components/SectionsCanvas.tsx:396-405`). Dense placement can backfill an
earlier hole with a later, smaller item, so array index is not necessarily the
same as visual position. The [CSS Grid specification](https://www.w3.org/TR/css-grid/#grid-auto-flow-property)
explicitly notes that dense packing can make items appear out of order.

**Why it matters:** Insert-at-`ci` is a valid logical/YAML contract, but the
rationale overpromises a pixel landing point and uses that promise to justify no
feedback.

**Concrete correction:** Describe `ci` as logical array/DOM order, not a
guaranteed visible slot. Keep the selected-card affordance as the landing proof,
and add a varied-span case if exact visible placement is intended.

### m5 — The MUST-NOT list does not protect the toolbar controls from the new marker

**Location:** §5 lines 126-152; §7.5 lines 375-393.

**What is wrong:** The list protects the requested flat-drop, internal-drag,
selection-store, and snapshot boundaries, but the proposed "Cards add here"
label is inserted into the existing section toolbar. That toolbar already
contains a drag handle, title input, and delete button in a non-wrapping flex row
(`src/components/SectionsCanvas.tsx:419-477`). No guard or AC requires those
controls to remain visible and usable in a narrow one-column section.

**Why it matters:** F5 could regress the same VIEWS-04 section-authoring controls
whose defect sequence it is repairing, without changing any protected source
mechanism or snapshot.

**Concrete correction:** Add a MUST-NOT/AC that the marker cannot obscure,
displace beyond reach, or disable reorder/rename/delete controls, and name a
narrow-section verification leg or specify a layout-neutral marker treatment.

## Finding-coverage and guard-rail result

The §3 rows genuinely point to sections that discuss each quoted authority or
finding. I found no omitted authority row and no transcription drift in the
owner-supplied text. Supporting design for zero sections, undo, and post-drop
selection reasonably belongs under ARB-R7 insertion semantics rather than
needing separate authority rows. The substantive unproved validation and
append behaviors are captured in M5; the promised correction-file omission is
m1. Apart from m5, the MUST-NOT list covers the specifically requested flat
GridCanvas/PROPS-06 path, additive `text/plain` compatibility, internal
card/section drag machinery, selection reducers, and snapshot boundary.

## Confidence and limits

**CONFIDENCE: HIGH.** I read the complete spec and the relevant committed
governance, UAT, adversarial-review, component, store, utility, DSL, and test
paths. I resolved cited symbols rather than trusting line numbers, checked the
full branch delta, and verified PR #132's state.

I could not inspect the cited MemPalace drawers; this review treats the user's
verbatim quotations as the authoritative drawer text. Per the hard constraint,
I did not run e2e or integration tests, so I could not observe C5, actual Electron
`dragTo` MIME delivery, warning capture, or visual marker layout. I also did not
run the unit/e2e baseline counts quoted from `[STATE]`; those remain
implementation-time measurements. No implementation exists to review.

**CHANGES-REQUIRED**
