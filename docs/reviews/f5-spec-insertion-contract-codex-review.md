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

---

## Round 2 — response verification (2026-08-06)

| Round-1 finding | Resolution             | Verification                                                                                                                                                                                                              |
| --------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1              | **RESOLVED**           | §7.4 now reports the measured partial-merge retention accurately, the owner-ratified reset is a single named carve-out, and AC 20/L14 cover it. The separate overbroad sentence introduced in rev 2 is N1 below.          |
| M2              | **RESOLVED**           | §7.1 makes the marker MIME the sole palette `dragover` discriminator, while §9.6 now changes only the harness strategy if `dragTo` cannot expose it and requires a stop-and-amend if the real application cannot.         |
| M3              | **RESOLVED**           | §9.5 U1 supplies a behavioral red leg against the historical append semantics; U2 bases its no-valid-red treatment on behavior-preserving extraction and names alternative evidence.                                      |
| M4              | **REGRESSED**          | Rev 1 added the requested blast-radius table, but rev 2 added AC 21/L15 without adding them to that table and retained the now-false claim that every unlisted AC and leg is unaffected.                                  |
| M5              | **PARTIALLY RESOLVED** | The revised ACs and most named legs close the original gaps, but L12's base outcome is still misclassified, C6 is still called a control despite being red on base, and AC 19 has no mandatory named leg.                 |
| m1              | **RESOLVED**           | §6 now names `docs/testing/uat/CARD_CORRECTIONS.md`, and §9.4 assigns the VIEWS-04 citation correction there while preserving the r3 evidence.                                                                            |
| m2              | **RESOLVED**           | §7.6 now gives warning/warning/error parity with `handleCardAdd` and requires the reference-equal early return before `updateConfig`.                                                                                     |
| m3              | **RESOLVED**           | §7.2 and §7.3 condition both palette `dragover` acceptance and `drop` handling on `onPaletteCardDrop` being present; AC 19 states the refusal contract. Its missing proof is tracked under M5, not this contract finding. |
| m4              | **RESOLVED**           | §7.6 defines `ci` as logical array/DOM order, expressly disclaims a pixel-order promise under dense packing, and uses selection as landing feedback.                                                                      |
| m5              | **RESOLVED**           | MUST NOT 8 and §7.5 put the marker on its own `gridColumn: '1 / -1'` row outside the toolbar flex context, with AC 18/L13 protecting the controls.                                                                        |

### Tripwire and delta result

The round-2 tripwire passed before any write. The branch and local/remote/live
head were `feature/f5-spec-insertion-contract` at
`9a707a17f91ff81379a5589bc25939480dae1dc5`; local `main` and the merge base were
`de568c50ba3a88d84c44573eae93c08d8de43dc8`. The four required commits were
present in the required order. The full branch delta was exactly the two named
documentation files and 1,300 insertions, with no `src/` or `tests/` delta.
Commits `9450553` and `76cf6d4` retained their original object IDs. PR #132 was
open, non-draft, unmerged, based on `main`, and reported the same head OID.

I reviewed both author fix commits as patches as well as the resulting 966-line
spec. Commit `09e4325` changed only the spec by +363/-129; commit `9a707a1`
changed only the spec by +165/-88. I did not edit the spec or any source/test
file.

### Ruling-transcription and new-code-claim result

The settled rulings are transcribed faithfully at the implementation boundary.
Q1 is recorded as **deferred**, with sibling insertion left normative and a
named follow-up that is not unilaterally inserted into the remediation order
(spec §5, lines 128-135; §10, lines 841-870). Q2 is confined to one new
`selectedSectionIndex: null` line in `loadDashboard`'s success `set` (spec §5,
lines 159-167; §6, line 192; §10, lines 888-922). That placement is genuinely
unconditional: the current four selection writes precede the mode-conditional
`past`/`future`/`isDirty` spread
(`src/store/dashboardStore.ts:135-177`), and the YAML editor is the caller that
passes `mode: 'edit'` (`src/App.tsx:2352-2361`). The cited FILE-04 comment really
does document previous-document undo history surviving a load
(`src/store/dashboardStore.ts:145-165`).

The other added mechanism claims checked out. `handleCardAdd` has the stated
warning/warning/error preconditions and its sections branch supplies the title,
append, selection, and success-message precedent (`src/App.tsx:1101-1117`,
`:1127-1153`). Existing section mutation handlers return on a reference-equal
helper result before `updateConfig` (`src/App.tsx:1693-1703`, `:1741-1749`,
`:1760-1767`, `:1775-1782`, `:1788-1795`). The toolbar is a non-wrapping flex
row inside a full-width grid item (`src/components/SectionsCanvas.tsx:419-477`),
so §7.5's proposed separate full-width marker row uses an existing layout
device rather than entering that flex row. Finally, L14's
`selection-debug-state[data-selected-section]` seam is present on base
(`src/App.tsx:3575-3597` at `de568c5`), so that test can survive the stated
source-only stash technique.

### Unresolved or regressed round-1 findings

#### M4 — REGRESSED: the Q1 blast-radius audit excludes the rev-2 ruling pins

**Location:** Spec §10 Q1, lines 872-886; AC 21, lines 628-631; L15, line 701.

**What is wrong:** The retained table calls itself the audit record of everything
a future "nest" ruling would invalidate. It lists AC 3, AC 7, AC 15 and describes
L3 plus an unnamed new container leg, then says every unlisted AC and leg is
unaffected. Rev 2, however, added AC 21's explicit sibling-not-child contract
and L15 to prove it. Those are the first AC and leg a future nesting decision
would invalidate, yet neither is named in the retained table and both fall under
its false "all remaining" sentence.

**Why it matters:** The operative deferral is correct, but the audit trail now
misstates its own blast radius. A later owner or implementer following §10 could
change nesting while overlooking the exact rev-2 regression pin created for
that decision.

**Concrete correction:** Add AC 21 and L15 explicitly to the table (and replace
the generic "new sections-container leg" wording with L15), then narrow the
"all remaining" sentence accordingly.

#### M5 — PARTIALLY RESOLVED: the test matrix still overclaims its base evidence

**Location:** Spec §9.2 L12 and its explanation, lines 698-707; AC 19 and its
proof paragraph, lines 622-623 and 709-713; §9.3 C6, lines 715-727.

**What is wrong:** Three traceability errors remain.

1. L12 is wholly **green on base**, not split. A real palette gesture is refused
   because palette drag-start currently sets only `text/plain`
   (`src/components/CardPalette.tsx:143-146`), while section targets call
   `preventDefault()` only for an internal `dragInProgress`
   (`src/components/SectionsCanvas.tsx:181-182`, `:411-414`, `:502-508`). Even if
   L12 dispatches `drop` directly, today's `dropOn` only clears the internal drag
   state and exits when no internal source/callback exists
   (`src/components/SectionsCanvas.tsx:184-204`). It performs no config write,
   selection write, undo push, or UI message. Therefore **all** of L12's no-card,
   no-message, no-undo, and unchanged-selection assertions pass on base. Their
   ability to detect over-broadening after implementation makes L12 a valuable
   branch control; it does not make any assertion red on base.
2. C6 sits under “control legs — must pass on base and on the branch,” yet its
   own note says its marker half is red on base. Its landing half is not a
   documented base control either: `loadDashboard` currently omits
   `selectedSectionIndex` (`src/store/dashboardStore.ts:135-143`), and the add
   path honors a retained index when it is valid in dashboard B
   (`src/App.tsx:1131-1150`). Whether that assertion is red therefore depends on
   B's unstated section count. C6 is not a control leg merely because L14 asserts
   the reset one step earlier.
3. AC 19 still has no named, mandatory leg. Lines 709-713 leave its proof as a
   future choice between a component assertion and code inspection. Component
   rendering is practical in this repository—the existing unit suite uses
   Testing Library rendering and event dispatch
   (`tests/unit/card-context-menu.spec.tsx:22-37`)—so the fallback does not
   establish the promised AC-to-leg trace.

**Why it matters:** The Operating Agreement makes observed red behavior, not a
test's eventual usefulness, the controlling evidence
(`docs/governance/OPERATING_AGREEMENT.md:66-73`). These classifications could
record green-on-base behavior as a successful red leg, while the optional
callback guard could ship without a committed test at all.

**Concrete correction:** Reclassify L12 as a green-on-base, branch-discriminating
control. Remove C6 from the control table and either fold its assertions into
L14 or give it a red-leg ID and classification. Add a named, mandatory component
leg for AC 19 (for example U3), classify it green on base and branch, and update
§6/§9.7 if that requires a new unit file or changes the file-count baseline.

### New finding

#### N1 (minor) — the Q2 result overstates section-0 resolution for zero-section documents

**Location:** Spec §7.4, lines 422-427, especially “every document opens with the
target resolved to section 0”; compare §7.4 lines 455-458 and AC 12/AC 16,
lines 600-614.

**What is wrong:** Resetting `selectedSectionIndex` to `null` does not make
section 0 exist. The same contract says the resolver returns `null` when a view
has no sections, and the current add path warns and returns when `sections` is
empty (`src/App.tsx:1131-1138`). Thus “every document” contradicts the
zero-sections branch and also sweeps in non-sections documents, for which this
sections target is inapplicable.

**Why it matters:** This is a normative target-resolution section implementing
an owner ruling. The universal wording silently broadens the ruling's derived
effect even though the resolver and ACs specify the correct boundary elsewhere.

**Concrete correction:** Replace that clause with “every successfully loaded
sections view with at least one section opens with the add target resolved to
section 0”; state that zero-section views resolve to `null` and retain the AC 12
warning behavior.

### Confidence and limits — round 2

**CONFIDENCE: HIGH.** I read the unchanged round-1 review, both complete author
patches, the complete resulting spec, and the governing in-repo files. I traced
the added source claims by symbol rather than trusting cited line numbers and
checked every AC-to-leg mapping. I also independently verified the complete
local and live PR tripwire.

I still cannot inspect the cited MemPalace drawers; I treated the owner's exact
words and the operative recommendation supplied in the review prompt as the
authority. Per the hard constraint, I did not run e2e or integration tests, so I
could not observe C5, Electron `dragTo` MIME delivery, warning timing, or the
proposed marker layout. I did not run the quoted baseline suite counts. No F5
implementation exists, so this remains a review of the contract and planned
proof, not code.

**CHANGES-REQUIRED**

---

## Round 3 — rev-3 closure and regression review (2026-08-06)

| Round-2 finding | Resolution                 | Verification |
| --------------- | -------------------------- | ------------ |
| M4              | **RESOLVED**               | §10 now names AC 21 and L15 explicitly, replaces the generic future-leg wording, narrows the residual inventory accurately, and adds the promised maintenance rule (`docs/features/F5_SECTIONS_PALETTE_DROP_SPEC.md:933-949`). |
| M5.1            | **PARTIALLY RESOLVED**     | L12 is correctly green on base in every assertion and AC 17 now explicitly has no valid red leg (`docs/features/F5_SECTIONS_PALETTE_DROP_SPEC.md:707,718-731`), consistent with the governing rule (`docs/governance/OPERATING_AGREEMENT.md:66-73`). The new claim that L9 is the only split leg is false; see P1. |
| M5.2            | **RESOLVED**               | C6 is gone as an operative leg, its removal is explicit, and L14 now states load-bearing two-section fixtures and folds in the landing/marker phase (`docs/features/F5_SECTIONS_PALETTE_DROP_SPEC.md:709,755-760`). With those fixtures, phase 1 and the landing assertion are red because load retains section 1 and the existing add path honors that still-valid index; the third assertion is red because base has no marker (`src/store/dashboardStore.ts:135-144`; `src/App.tsx:1131-1152`; `src/components/SectionsCanvas.tsx:390-477`). |
| M5.3            | **RESOLVED**               | U3 is mandatory, named, mapped to AC 19, assigned to the new component-spec file, and reflected in the 100 → 101 file baseline (`docs/features/F5_SECTIONS_PALETTE_DROP_SPEC.md:197,733-738,751,816-830,867-875`). Its green/green classification is correct: base accepts `dragover` only for an internal drag and a direct `drop` without an internal source returns before invoking a writer (`src/components/SectionsCanvas.tsx:181-204,411-414,502-508`). |
| N1              | **RESOLVED**               | §7.4 now limits section-0 resolution to successfully loaded sections views that contain a section, and separately states the zero-section `null` result and non-sections case (`docs/features/F5_SECTIONS_PALETTE_DROP_SPEC.md:426-436`). That agrees with the resolver contract and AC 12/AC 16 (`docs/features/F5_SECTIONS_PALETTE_DROP_SPEC.md:445-467,609-623`). |

### Tripwire, delta, and traceability result

The round-3 tripwire passed before any write. The branch, local tracking ref,
live remote ref, and PR #132 head were all
`97b83003ceb36cfc0ff7451b32eb57c1305a1427`; local `main` and the merge base were
`de568c50ba3a88d84c44573eae93c08d8de43dc8`. The six supplied commits were the
six commits over that base in the required order, with all five earlier object
IDs unchanged. PR #132 was open, non-draft, unmerged, based on `main`, and clean.
The full branch delta was exactly the two named documentation files, 1,557
insertions and no deletions; rev 3 changed only the spec by +154/-69. No source or
test file differs from base.

The L12/C6/L14/U3 churn leaves no traceability orphan. The resulting map is:
AC 1/6 → L1 (AC 6 also L3); AC 2 → L2; AC 3 → L3; AC 4 → L4; AC 5 → L5;
AC 7 → L6; AC 8 → L7; AC 9 → L8/L14; AC 10 → L9; AC 11 → C1; AC 12 →
L10; AC 13 → C2/C3/C5; AC 14 → C4; AC 15 → L11; AC 16 → U1/U2;
AC 17 → L12; AC 18 → L13; AC 19 → U3; AC 20 → L14; and AC 21 → L15
(`docs/features/F5_SECTIONS_PALETTE_DROP_SPEC.md:580-640,694-710,744-753,778-836`).
Every named L1-L15, C1-C5, and U1-U3 leg maps back to an existing AC. The only
remaining C6 mentions in the spec are explicit deletion/history notes, not a
scheduled leg (`docs/features/F5_SECTIONS_PALETTE_DROP_SPEC.md:103,755-760,874,1012-1015,1023-1033`).

The §3 finding-coverage additions point to sections that contain the described
changes (`docs/features/F5_SECTIONS_PALETTE_DROP_SPEC.md:102-104`). The rev-3
history accurately describes the substantive M4/M5/N1 edits
(`docs/features/F5_SECTIONS_PALETTE_DROP_SPEC.md:1000-1019`); its omission of the
header and coverage-table bookkeeping is not substantive drift.

### New findings

#### P1 — Rev 3's new “L9 is the only SPLIT leg” statement is false

**Location:** Spec §9.2, especially L8/L15 and the new universal statement
(`docs/features/F5_SECTIONS_PALETTE_DROP_SPEC.md:703,710,712-716`).

**What is wrong:** L9 is not the only leg mixing red and green base assertions
under the definition in the paragraph itself. L8 maps itself to AC 9, so it must
prove both halves of that AC: its marker assertion is red, but in a fresh process
the existing double-click path already adds to section 0 because the initial
section selection is `null` and `handleCardAdd` falls back to 0
(`src/store/dashboardStore.ts:102-113`; `src/App.tsx:1131-1152`). If L8 does not
assert that landing, its AC-9 mapping is incomplete instead. L15 likewise has a
red sibling-insertion assertion but a green “stack child count is unchanged”
assertion on base: the current palette supplies only `text/plain`, while section
targets accept `dragover` only during an internal drag, so no palette card or
nested child lands (`src/components/CardPalette.tsx:143-147`;
`src/components/SectionsCanvas.tsx:181-204,411-414,502-508`).

**Why it matters:** Rev 3 correctly stopped presenting L12's wholly green base
outcome as split, but the replacement universal repeats the same category of
per-assertion accounting error elsewhere. An implementation report following the
table could describe base-green assertions as part of an undifferentiated red
result, contrary to the spec's own reason for itemising split legs and the
red-before-green discipline (`docs/governance/OPERATING_AGREEMENT.md:66-73`).

**Concrete correction:** Remove the “only” claim and audit every multi-assertion
leg consistently. At minimum, classify L8 and L15 as SPLIT and state which
assertions are red versus green on base; alternatively, separate their
base-preserving assertions into named control legs. Keep L12 green/green and do
not change AC 17's no-valid-red statement.

#### P2 (minor) — U3's Testing Library precedent count is overstated

**Location:** Spec §9.5
(`docs/features/F5_SECTIONS_PALETTE_DROP_SPEC.md:832-836`).

**What is wrong:** There are eleven `tests/unit/*.spec.tsx` files, but only nine
import Testing Library and call `render`. The two exceptions import only Vitest
and utility helpers and render no component
(`tests/unit/BackgroundCustomizer.spec.tsx:1-9`;
`tests/unit/GradientEditor.spec.tsx:1-9`). The cited closest precedent is sound:
`card-context-menu.spec.tsx` imports Testing Library and renders through its
provider helper (`tests/unit/card-context-menu.spec.tsx:20-37`).

**Why it matters:** This does not undermine U3's feasibility, but it is a new,
quantified codebase claim and is factually inaccurate as written.

**Concrete correction:** Say “nine of the eleven `.spec.tsx` files render with
Testing Library,” or avoid the count and cite the existing component-render
precedent directly.

### Confidence and limits — round 3

**CONFIDENCE: HIGH.** I read the complete rev-3 patch and resulting spec, checked
the complete AC/leg inventory, resolved the new source and test claims by symbol,
and independently verified the complete local/remote/PR tripwire. The static unit
inventory matches the stated 100-file baseline and the proposed new U3 file would
move it to 101 (`vitest.config.ts:5-8`; `tests/unit/smoke.test.ts:1`).

I still cannot inspect the cited MemPalace drawer; I treated the owner's exact
words supplied for this round as authoritative. Per the hard constraint, I did
not run e2e or integration tests, so I could not observe C5, Electron `dragTo`
MIME delivery, or any future F5 behavior. I did not run the quoted unit baseline,
so 1316/1316 remains a recorded `[STATE]` value rather than a result of this
review. There is no F5 implementation or U3 file yet to execute. I did not edit
the spec, source, tests, PR, or remote branch.

**CHANGES-REQUIRED**
