# COMMISSION — STRAT-D7 scoped follow-up: the round-1 repairs

Author: Claude Opus 5 (1M context) — plan author and repair author; an
interested party
Reviewer: OpenAI Codex / GPT-5.6 Sol — **the same reviewer**, per
`docs/governance/OPERATING_AGREEMENT.md` §3.4's same-reviewer rule
Owner gate: micah / BaggyG-AU. This document decides nothing on its own.

This is the scoped follow-up **STRAT-D7 requires** for the repairs of SP-1…SP-6
from `docs/reviews/spacing-helper-preset-plan-codex-review.md` (commit
`6694a61`, verdict **SEV-1-BLOCKED**). D7 is universal — a follow-up exists
because a repair exists — but **depth is proportional and you decide it inside
this round**. ⚠ **This is not the minimal case.** Two SEV-1 repairs changed the
proposed helper's contract, not just its prose, and the fix round introduced new
machinery and three new harness legs. **The fix round is unreviewed new work.**

**⚠⚠ NO CODE HAS BEEN WRITTEN AND NONE WILL BE UNTIL A ROUND RETURNS
ACCEPTS-REVISION.** That is the tripwire.

---

## The owner's profile — write for the reader who actually rules

**The owner gate is held by a NON-DEVELOPER.** Never require the owner to
classify a diff or apply developer instinct. Anything routed to the owner uses
the **Owner Decision Brief** in six fields: what this protects in product terms;
what is going wrong plainly; is the product affected (Yes/No/Unknown, with honest
evidence status); options with costs; recommendation and why; what happens if you
do nothing.

## Reviewer write-restrictions (please acknowledge)

No `[STATE]` drawer update; no UAT card marked or re-scored; no `src/` change; no
merge; `ha.home.local` is READ-ONLY. Proposed changes go in your review document,
nowhere else — never by amending the plan, never by amending an existing commit.

**MemPalace (ruling MP-LEASE).** ⓘ Round 1's candidate was filed on your behalf
with `added_by="codex"` as `drawer_havdm_review_ba8a734f85f6e6cf2deceb33` — the
mechanism works, so use it again: put candidates in a `MemPalace drawer
candidates` section at the end of your review. ⚠ Never kill a process to free the
lease and never set `MEMPALACE_MCP_ALLOW_PEER_WRITER`.

**EVERYTHING HEADLESS** if you run anything:
`bash tools/test-headless.sh <spec…> --project=electron-e2e|electron-integration --workers=1`.
⚠ **You are not required to run any suite** — the branch is still plan-only.

## Working practice you are held to

Unchanged from round 1, and quoted rather than cited because you judge against
exactly what this prompt supplies:

1. **A finding is a sample, not the population** — name the CLASS, sweep it, say
   which members you checked. A mechanical sweep is only as good as its key.
2. **No unverified universals** — "only/every/all/none" or any count needs the
   enumeration attached. Source-text search + runtime-behaviour claim = STOP.
3. **A check is evidence only for the property it exercises** — if this claim
   were false, would what I ran have failed? Apply it to every clearance you
   GIVE.
4. **Verify each finding against the source** before reporting it; quote
   `path:line`. A finding you cannot locate is a question.
5. **Silence is not a result** — state "no issue found" explicitly per question.
6. **Declare your evidence boundary.**
7. **An attack that FAILED is not a proof of safety**, and the attack most likely
   to fail is the one whose MAGNITUDE is wrong. ⭐ This one earned its keep in
   round 1: the author attacked his own pre-wait on the `opacity: 0` ground, it
   refuted, he stopped — and you then produced the stable-open-foreign-Select
   case he could not reach.
8. ⭐ **NEW, and it is the round-1 lesson made binding: THE FIX ROUND IS
   UNREVIEWED NEW WORK, and under-reach and over-reach both bite.** Check each
   repair against the finding it cites: did it fix less than the finding
   required, or more than the finding asked?

---

## Expected state — STOP and tell the owner if untrue

- Branch `feature/spacing-helper-preset-plan`, off `main` = `08a9544`.
- **PLAN ONLY.** No `src/`, no `tests/`, no `tests/baseline/expected-failures.json`.
- ⚠ **This tracked record pins NO head and states no file or commit count** — a
  document committed to a branch cannot pin that branch's head from inside
  itself. The reviewed commit is in the untracked paste prompt
  `prompts/codex/spacing-helper-preset-plan-followup.md`. **Regenerate:**

  ```bash
  git log --oneline main..HEAD
  git diff --name-status main..HEAD
  git diff --name-only main..HEAD | grep -vE '^docs/.*\.md$' || echo "docs-only: CONFIRMED"
  ```

- Manifest on `main` unchanged: 7 `expectedFailures`, 10 `expectedFlaky`, 21
  `expectedSkips`; the spacing identity is on none.

## What is settled and NOT in scope

Your round-1 answers to **Q2** (the seven DOM authority claims — no issue found,
plus your own finding that `src/App.tsx:2960-2964` supplies no
virtual/popup-width override) and **Q4** (the two-file consumer population, the
alias searches, the `canvas-resize-and-nesting.spec.ts:23` docblock correction)
are accepted and **not reopened**. Nor is the diagnosis, the owner's
fix-not-allowlist ruling, or the four properties P1–P4.

**The three owner decisions are RULED and are not reviewable above SEV 4** —
attack the facts they rest on, never the authority to make them:
SP-1 → remove the pre-wait entirely; SP-2 → retain a bounded retry re-gated on
ownership; SP-4/§7.4 → **fix lane**. ⓘ Your contrary reading of
`OPERATING_AGREEMENT.md` §3.7 is recorded verbatim inside §7.4's brief rather
than resolved away, and the ruling explicitly does not amend §3.7.

---

## What you review

**The diff from `6694a61` to the reviewed head**, one file:
`docs/testing/SPACING_HELPER_PRESET_PLAN.md`, revision 2.

### The questions

**F1 — dispose of SP-1…SP-6 by name: RESOLVED / PARTIALLY RESOLVED / REGRESSED.**
§9 claims all six RESOLVED. Verify each against the finding it cites, not against
the plan's summary of it. In particular:

- **SP-1.** The pre-wait is gone from `openSelectDropdown` and the trailing
  document-global wait in `selectOptionByText` is replaced by a scoped
  `aria-controls` post-condition. **Does removal actually restore legs 1/2/5?**
  Does anything else in the proposed helper still consume foreign state? New legs
  7 (stable foreign popup) and 8 (owned popup mid-leave) were added as you
  directed — are they the right two, and is leg 8 constructible at all?
- **SP-2.** The causal claim is retracted in §2.3, §4.4, §9, §10's SR-5 and the
  §8 bullet. **Is the retraction complete and is the corrected account right?**
  §2.3 now asserts a Playwright time-of-check/time-of-use dispatch race as the
  route-(b) mechanism, labelled INFERRED and decided by no leg. **Is that
  substitute mechanism sound, or has the author replaced one invented mechanism
  with another?** That is the single most important question in this round.
- **SP-3.** Legs 2/3 now specify `mousedown`, capture phase, one-shot,
  self-removing, plus three post-gesture assertions. Is the event, phase and
  removal correct against `SelectInput/index.js:117,138,185`? Will
  `stopPropagation()` in capture actually prevent `toggleOpen()`, given the
  handler is a React prop rather than a native listener?

**F2 — the fix round's NEW machinery, which no finding asked for.**

- **`ownsOpenPopup`** was added on the author's own re-trace (§10, RT-1) to stop
  the retry toggling an already-open popup shut. **Is RT-1's hazard real, and is
  this the right repair?** It returns a boolean and cannot fail loudly — a false
  `true` silently skips the click. Is there a state where `aria-controls` is set
  but the popup is unusable?
- **The asymmetric retry budget** (1500 ms then 5000 ms) is a JUDGEMENT from no
  measurement. **Attack the numbers**, per rule 7 — is 1500 ms the comfortable
  choice or the cruel one?
- **The scoped post-condition.** §10 RT-2 argues `aria-controls` clears at the
  React commit (`Input.js:188`), so it is faster than the wait it replaces.
  Verify that. And is `not.toHaveAttribute(name, /./)` the right assertion form
  for an **absent** attribute?
- **New leg 9** (first click fails, second succeeds) has **no specified
  mechanism** — the plan admits this in §8. Is that an acceptable gap for this
  round, or does it need specifying before ACCEPTS-REVISION?

**F3 — scope and regression.** Did any repair reach further than its finding?
§4.4 now also deletes the `Escape` presses; RT-1 says removing them is how the
toggle hazard got in. **Is the `Escape` removal safe, or was it over-reach that
the author then had to patch with new machinery?**

**F4 — did the previously-clean areas stay clean?** §4.2's DOM chain, §5.1's
blast radius, and P1–P4 were cleared in round 1. Re-check that revision 2 did not
disturb them.

**F5 — the owner-facing surface.** §0 now says three decisions; §7.4 is a
six-field brief carrying your contrary §3.7 reading and the owner's ruling. Is it
faithful to what you actually argued, or does it soften it?

**F6 — anything the author could not predict.** Your own case list is a floor.

---

## What the author already ran

F1–F5 were executed against revision 2 before this commission was handed over.
⭐ **And round 1's lesson was applied as a new rule: every control flow and
library binding the load-bearing claims rest on was RE-TRACED, not re-argued.**
That immediately produced **RT-1** — the re-gated retry would have toggled an
already-open popup shut, making the retained retry worse than no retry — and
**RT-2**, which closed an open §8 worry from source. Both are recorded in §10.

⚠⚠ **Treat that as a claim, not clearance.** Round 1's self-check ran fourteen
items, was handed over unweakened, and missed all three blockers — two of them
decidable from files the author already had open. **The new discipline is one
round old and has never been independently tested.**

---

## Deliverable

A committed document on this branch:
**`docs/reviews/spacing-helper-preset-plan-codex-followup-review.md`** — never a
chat reply, never an amendment to the plan or an existing commit.

**Verdict first:** **ACCEPTS-REVISION / CHANGES-REQUIRED / SEV-1-BLOCKED**. It is
a hard gate — implementation begins only on ACCEPTS-REVISION.

Then: a **RESOLVED / PARTIALLY RESOLVED / REGRESSED table for SP-1…SP-6**; a
scope-and-regression note for F3/F4; confidence and method; your evidence
boundary; a claim ledger tagged MEASURED / INFERRED / JUDGEMENT closing with your
own weakest claims; and any new finding numbered **SP-7 onward**, with **class
swept** per finding.

**Severity contract (STRAT-D18, binding):** SEV 1 blocks and needs the three-part
proof — the decision or claim broken, the violated fact at `path:line`, why no
recorded mitigation covers it; missing any part → at most SEV 2. SEV 2 does not
block and goes to the owner as a six-field brief. SEV 3/4 recorded, no
round-trip. Owner judgment calls are not reviewable defects above SEV 4. The
model governs what **blocks**, never what may be **reported**.

Close with a `MemPalace drawer candidates` section, or an explicit "none".
