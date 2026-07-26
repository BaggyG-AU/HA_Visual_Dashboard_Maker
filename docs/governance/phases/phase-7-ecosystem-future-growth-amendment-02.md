Phase Name: Phase 7 – Ecosystem & Future Growth
Amendment: 02
Amends: docs/governance/phases/phase-7-ecosystem-future-growth-blueprint.md
Supersedes-in-part: docs/governance/phases/phase-7-ecosystem-future-growth-amendment-01.md (§1.7 warning box; the Slice C question it left open is answered here)
Date: 2026-07-26
CURRENT_VERSION: 0.7.5-beta.10
Governance Mode: HARD MODE++
Authority: `docs/governance/PHASE_WORKFLOW.md` Step 2 — "If blueprint must change: create amendment file"
References:

- ai_rules.md
- docs/governance/PHASE_ORCHESTRATION_FRAMEWORK.md
- docs/governance/phases/phase-7-tracking.md

# Phase 7 Amendment 02 — Slice C: Withdraw the Action, Deliver the Guarantee

## 0) Summary

Amendment-01 withdrew slices G and H and recorded that **Slice C (Card
Duplication & Cloning) had never been implemented** — commit `f17be4d`, titled
"slices-c-d", actually delivered Slice D and labelled it Slice C. It left the
disposition of Slice C open as a project-owner decision.

This amendment answers it, and the answer is a split rather than a straight
keep-or-drop:

| Half of Slice C                                                                       | Disposition                                         |
| ------------------------------------------------------------------------------------- | --------------------------------------------------- |
| The **duplicate/clone UI action** (per-card Duplicate, cross-view Clone)              | **WITHDRAWN** — redundant                           |
| The **state-safety guarantee** ("avoid shared references", deep-copy nested branches) | **DELIVERED** — against the existing clipboard path |

The reasoning is that these two halves had very different standing. The action
was largely redundant with cut/copy/paste. The guarantee was not redundant with
anything: it was **measurably absent**, and it is the half the slice's own stop
conditions were written around.

---

## 1) Why the action is withdrawn

HAVDM already ships cut / copy / paste of cards, within a view, across views,
and across sections — `handleCardCut` / `handleCardCopy` / `handleCardPaste` /
`copySectionCards` in `src/App.tsx`, delivered as WS4-A Tier 4 slice 4.3a. A
user who wants a second copy of a card selects it, copies, and pastes.

Against Slice C's stated objective — "add duplicate/clone actions that preserve
config correctness, avoid shared references, and integrate with selection
history" — what a dedicated Duplicate button would add over the existing path is
one keystroke's convenience. That does not justify:

- a new persistent affordance on the card action surface in
  `src/components/GridCanvas.tsx`, which would shift the boundingBox clip that
  `tests/e2e/layout.visual.spec.ts` captures and require a visual rebaseline for
  a cosmetic reason; or
- a second code path doing what the clipboard path already does, which is how
  the two-mechanisms-for-one-job problem starts.

⚠ **Stated cost.** This is a real reduction: a one-step Duplicate is a
recognised convenience in dashboard builders and its absence is a small,
permanent papercut. If it is later wanted, it should be added as a thin
affordance that calls the same clipboard transforms this amendment introduces —
not as the parallel clone path Slice C originally described.

## 2) Why the guarantee is delivered

Slice C's State Safety Rules say duplicate/clone "must deep-copy mutable nested
configuration branches"; its stop conditions name "clone causes cross-card
unintended edits". The existing clipboard path did not meet that bar.

**The defect, verified against `main` (`a7bb317`) before this slice:**

- `src/App.tsx` copy side (`handleCardCopy`, `copySectionCards`) used
  `.map((card) => ({ ...card }))` — a shallow spread.
- `src/App.tsx` paste side (both the sections branch and the flat-grid branch)
  used `{ ...cardWithoutLayout }` — also shallow.
- `src/store/dashboardStore.ts` `updateConfig` stores the **incoming** config
  object as-is. `cloneConfig` (which does deep-clone, via `structuredClone`) is
  applied only to the _previous_ config as it goes onto the undo stack.

Net effect: a pasted card shared every nested branch — `style`, `tap_action`,
`card_mod`, nested `cards[]`, `entities[]` — by reference with the card it was
copied from, and with every other card pasted from the same clipboard entry. No
test asserted otherwise; there was no copy-isolation coverage anywhere in the
repository.

⚠ **Severity, stated honestly: an unguarded hazard, not a demonstrated bug.**
Shared references only corrupt data if some code path mutates nested card config
in place. A search for in-place nested mutation across `src/` found none — the
edit path (`handleCardUpdate` → `applyBulkCardUpdate`, `updateSectionCard`)
builds new objects throughout, per `ai_rules.md` §7. **No user-visible bug was
reproduced, and none is claimed here.** What is claimed is that the invariant
was undefended and untested, one in-place mutation away from silent cross-card
corruption — which the product vision ("never silently destroy user data")
forbids outright, and which Phase 7 had already written a slice to prevent.

## 3) What shipped

- **`src/utils/deepClone.ts`** (new) — `deepClone<T>`, `structuredClone` with a
  JSON round-trip fallback. Extracted from the private `cloneConfig` helper in
  `src/store/dashboardStore.ts` rather than reimplemented (`ai_rules.md` §1,
  Immutable Reuse Rule); `cloneConfig` now delegates to it, behaviour unchanged.
- **`src/utils/cardClipboard.ts`** (new) — the clipboard transforms, extracted
  from inline logic in `src/App.tsx` and made pure:
  `cloneCardsForClipboard`, `prepareCardsForSectionPaste`,
  `prepareCardsForFlatPaste`, plus the `CardWithInternalLayout` type that
  previously lived as a local alias in `App.tsx`. Purity is the point — the
  isolation guarantee is now unit-testable, where inline in a 6700-line
  component it was not.
- **`src/App.tsx`** — all four clipboard sites call the transforms. Semantics
  are otherwise unchanged: sections paste still drops geometry, flat paste still
  re-homes to `y: Infinity` keeping width/height, cut still removes the
  originals.
- **`tests/unit/card-clone.spec.ts`** (new, the file name the Slice C prompt
  specifies) — 16 tests.

### 3.1 Test honesty

⚠ **These tests are NOT red-before-green, and are not presented as such.** The
transforms are new pure modules; on base the spec fails with
`Failed to resolve import "../../src/utils/cardClipboard"` — a module-not-found,
not a behavioural failure. There was no pre-existing testable seam: the logic
was inline in `App.tsx` and the extraction _is_ the fix. Manufacturing a
red-before-green here would have meant faking one.

What makes the coverage meaningful rather than decorative is the
**characterisation block**, which pins the old semantics directly: it constructs
the same `{ ...card }` shallow spread the code used, asserts that nested
branches are reference-identical to the source, and demonstrates that an
in-place edit of the copy reaches the original — then asserts the new transform
contains the same edit. The hazard is therefore demonstrated in the test suite
rather than merely asserted in a document.

The remaining tests cover: deep isolation at one and two levels of nesting;
content equality; geometry dropped on section paste; geometry re-homed with
size preserved on flat paste; the default footprint fallback; the clipboard
entry not being mutated by a paste; and pasting one clipboard entry twice
yielding two independent cards.

## 4) Consequential edits

- **§17 Definition of Done** — amendment-01 restated the first bullet as "all
  six scoped Phase 7 feature slices (A–F)". That stands, with Slice C now read
  as: **Slice C's state-safety requirement is delivered; its duplicate/clone
  action is withdrawn.** Amendment-01 §1.7's warning box ("A–F is the amended
  scope, not a claim that A–F are all delivered") is discharged for Slice C.
- **§12 Ordered Feature Slice Plan** — Slice C annotated `PARTIALLY WITHDRAWN —
see amendment-02`.
- **§21 Packaging Plan** — commit sequence item 3
  (`feat(phase-7): implement card duplication and cross-view cloning`) is
  replaced by `fix(clipboard): deep-clone cards at the clipboard boundary`.
- **§13 Slice C prompt** — retained as historical record. Its Required Tests
  entry for integration and E2E coverage of "duplicate and clone flows" does not
  attach to what shipped, because no duplicate/clone flow was built; the
  clipboard flows it touches are already covered by
  `tests/e2e/bulk-operations.spec.ts` and the existing view/sections specs.
- **`docs/governance/phases/phase-7-tracking.md`** — Slice C status updated, and
  ⚠ a factual error corrected: the tracking doc as first written stated "the
  clipboard paste path already deep-copies". That was wrong — it was a shallow
  spread. The error was found while scoping this amendment and is recorded
  rather than quietly overwritten.

## 5) Remaining Phase 7 work

**E** (version-control integration — implement against
`docs/governance/phases/phase-7-slice-e-command-contract.md`, which is
`DESIGN ONLY` and requires its own sign-off) → **I** (Medium Gate, then the
`1.0.0` bump on a GO only, per amendment-01 §2).
