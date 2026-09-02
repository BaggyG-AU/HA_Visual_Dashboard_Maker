# COMMISSION — STRAT-D7 scoped follow-up 5: revision 6, and a structural change

Author: Claude Opus 5 (1M context) — plan author and repair author; interested party
Reviewer: OpenAI Codex / GPT-5.6 Sol — **the same reviewer** (OA §3.4)
Owner gate: micah / BaggyG-AU. This document decides nothing on its own.

⚠⚠ **TWO THINGS CHANGED THAT ARE NOT ORDINARY REPAIRS, AND YOU SHOULD ATTACK BOTH.**

**1. The document was SPLIT.** The per-round disposition tables and the author's
self-check records now live in
`docs/testing/SPACING_HELPER_PRESET_PLAN_HISTORY.md`. **A wholesale move is the
operation that caused SP-15**, so verify it: every line of the pre-split plan must
appear in exactly one of the two files. The author's check says nothing was lost —
treat that as a claim.

**2. The plan is now gated by a consistency checker.** It is keyed on the classes
that actually bit and was proved to fire on known-bad input: run against revision 4
it reports `expectSelectShows is defined in a code block but never called`
(**SP-15**); against revision 5, `leg 1 is scheduled at step 2 but the repaired
helper it needs is only built at step 3` (**SP-20**). Revision 6 passes it.

**NO CODE HAS BEEN WRITTEN AND NONE MAY BE UNTIL A ROUND RETURNS
ACCEPTS-REVISION.** The tripwire holds. ⓘ The checker itself lands as its own
change off `main` — it is code, and putting it on this branch would break the
docs-only property you verify each round.

---

## Why the structure changed — the number that produced it

Across five rounds this plan produced 24 findings. **Seventeen of the eighteen
raised after round 1 were defects introduced by the previous round's own repairs.**
The owner was shown that on 2026-08-31 and ruled a structural change rather than a
promise of more care, because the measured cause was structural: **the plan was an
ungated surface.** `tools/checks` runs eslint, prettier, tsc and vitest; against
this document prettier checked its formatting and nothing checked its content.

⚠ **That is context, not an excuse, and it does not make revision 6 trustworthy.**
Four of round 5's five findings were mine. Attack accordingly.

## What revision 6 changed

**SP-21 is the one that mattered and it was a real design defect.** P4 read only
the requested control, so a wrong-control click was invisible whenever the
requested value was already correct — **measured (M8a) to occur on the first
action of a currently-passing test** (`tests/e2e/spacing.spec.ts:27`: a fresh card
renders `spacing-margin-mode` as "All Sides", so `setCardMargin(12)` →
`setMarginMode('all')` asks for the value already shown). P4 now also asserts the
**other half** is unchanged, and **that repair was measured safe before being
written** (M8b): driving one half moved only that half's control, with a mirroring
control leg. The guard is deliberately "the other half" and not "every other
Select", because within a half the two controls are coupled.

**SP-20** — the implementation order now has a **class smoke step (census kind,
explicitly not leg 1)** where revision 5 wrongly put leg 1, and leg 1 runs first
among the mechanism legs _after_ the helper exists. **SP-22** — counts stated once,
corrected, and the history file states none. **SP-23** — the budget-expiry cost is
stated as two branches with the second named UNMEASURED. **SP-24** — the
`index.css` comment is restated as a surface _consistent with_ the mechanism, not
a second measurement of M5.

## Expected state — STOP and tell the owner if untrue

- Branch `feature/spacing-helper-preset-plan`, off `main` = `08a9544`; **docs-only**:

  ```bash
  git log --oneline main..HEAD
  git diff --name-only main..HEAD | grep -vE '^docs/.*\.md$' || echo "docs-only: CONFIRMED"
  ```

- ⚠ This tracked record pins no head and no counts. The reviewed commit is in
  `prompts/codex/spacing-helper-preset-plan-followup5.md`.
- Manifest on `main`: 7 `expectedFailures`, 10 `expectedFlaky`, 21 `expectedSkips`;
  the spacing identity is on none.

## Settled and NOT in scope

The owner's rulings — remove the pre-wait; retain a bounded retry; fix lane; the
**option-B mechanism**; and the **2026-08-31 structural ruling** — are owner
judgment calls, **not reviewable above SEV 4**. Your round-5 clearances stand
unless revision 6 disturbed them.

## The questions

**G1 — dispose of SP-20…SP-24 by name.** Verify against the finding, not the
plan's summary. For **SP-21** specifically: does the other-half guard actually
close the pre-satisfied hole, and can you construct a wrong-control operation that
still passes it?

**G2 — ⭐ THE SPLIT.** Was anything lost, altered or orphaned by the move? Are
there now cross-file contradictions — a claim in the plan that the history
contradicts, or a dangling reference in either direction?

**G3 — ⭐ THE CHECKER, WHICH IS A CLAIM AND NOT A GUARANTEE.** Its five checks are
C1 orphaned-definition, C2 disposition-coverage, C3 count-drift, C4 leg-sequencing,
C5 falsified-claim-resurrection. **Name a defect class this arc has already
produced that NONE of them would catch.** ⚠ The author's own C1 was silently dead
for one iteration — it parsed nothing and reported a clean pass — and was caught
only by re-running it against known-bad input. **Assume the remaining checks may be
weaker than they look.**

**G4 — previously clean areas.** §5.1/§5.1a, §5.2, P1–P3, the guard rails, and the
harness legs not touched by SP-20.

**G5 — did the repairs over-reach?** Four of five were mine to fix; check none of
them changed more than its finding required. SP-21's helper change is the largest
and touches `selectOptionByText`'s return type.

**G6 — anything the author could not predict.** Every round has produced an
interaction between two individually correct pieces — SP-8, SP-12, SP-15, SP-20.
Look for the fifth. ⚠ And: **which load-bearing claim in revision 6 is about what
the app DOES rather than what its source SAYS, and has anyone run it?**

## What the author already ran

The consistency checker, against revisions 1–6, with its true positives re-proved
after every refinement (this is how the dead-C1 iteration was caught). The
line-accounting check on the split. Two probes under the harness exception for M8a
and M8b, the second carrying a mirroring control leg. `handlePresetChange` and
`handleModeChange` read at source to establish the within-half coupling.

⚠⚠ **Treat that as a claim, not clearance.** The same self-check, run five times
before, missed three blockers, then four, then four, then five, then five —
including two it created itself.

## Deliverable

**`docs/reviews/spacing-helper-preset-plan-codex-followup5-review.md`**, committed
and pushed, prettier-clean.

**Verdict first:** ACCEPTS-REVISION / CHANGES-REQUIRED / SEV-1-BLOCKED — a hard
gate. Then a RESOLVED / PARTIALLY RESOLVED / REGRESSED table for SP-20…SP-24;
confidence and method; your evidence boundary; a claim ledger tagged MEASURED /
INFERRED / JUDGEMENT closing with your own weakest claims; new findings numbered
**SP-25 onward**, with class swept per finding.

**Severity (STRAT-D18, binding):** SEV 1 blocks and needs the three-part proof;
missing any part → at most SEV 2. SEV 2 goes to the owner as a six-field brief.
SEV 3/4 recorded. Owner judgment calls are not reviewable above SEV 4.

Close with a `MemPalace drawer candidates` section, or an explicit "none".
