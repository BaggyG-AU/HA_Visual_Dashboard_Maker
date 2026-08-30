# COMMISSION — STRAT-D7 scoped follow-up 6: revision 7, and a change to what you are asked to produce

Author: Claude Opus 5 (1M context) — plan author and repair author; interested party
Reviewer: OpenAI Codex / GPT-5.6 Sol — **the same reviewer** (OA §3.4)
Owner gate: micah / BaggyG-AU. This document decides nothing on its own.

⚠ **THE OWNER IS NOT A DEVELOPER.** Anything you route to them must be judgable by
a non-developer: what it protects, what goes wrong in plain words, the options and
their costs, and a recommendation with its reason. Do not ask the owner to
classify a diff or apply developer instinct.

---

## ⭐⭐⭐ WHAT IS NEW IN THIS COMMISSION: YOU MAY NOW SUPPLY THE SPECIFICATION TEXT YOU WOULD ACCEPT

The owner ruled on 2026-08-31, after being shown that **of the twenty findings
raised after round 1, nineteen were defects introduced by the previous round's own
repairs**, that you should be asked to **design**, not only to identify — as a
**NON-BINDING APPENDIX**.

**What that means concretely.** For any finding you raise, you may append the
specification text you would accept. The author may **adopt it** or **reject it
with reasons**, and **any rejection becomes a named item in the next round's
commission, so you get to attack the rejection.**

⚠⚠ **THE TRADE, STATED HONESTLY, BECAUSE IT IS REAL: A REVIEWER CANNOT
ADVERSARIALLY REVIEW ITS OWN SPECIFICATION.** The appendix is deliberately
**non-binding** precisely so you remain unbound to your own text and can still
attack it next round. ⓘ This project has been here before: option B was your own
round-3 recommendation before it became the owner-ruled mechanism, and the round-4
commission had to name that conflict explicitly. **If you think a design you
supplied is the weakest part of a later revision, say so — that is the behaviour
this ruling is betting on.**

⭐ **Your findings are still the deliverable. The appendix is optional per finding,
and a finding with no appendix is not a lesser finding.**

---

## WHAT REVISION 7 CHANGED

**SP-25 — the plan's promise is NARROWED, by owner ruling, not by code.** You
showed that when the requested **and** foreign controls both already show the
wanted value, a wrong-control click changes nothing and both P4 assertions pass.
**The author verified it at source and then MEASURED it in the real Electron
renderer (§4.2, M9b), with a mirroring control leg (M9c) that failed as it must.**
M9a also widened your premise: it is not only `spacing-margin-mode` — a fresh card
renders **all four** spacing Selects pre-satisfied, modes and presets alike. The
owner ruled **option (a)**: P4 detects wrong-control **mutation**; **prevention is
P1's, by construction**. The header promise, §3 items 2 and 6, §4.1's P4 row and
the P4 prose are corrected, §8 carries the consequence as its first weak claim,
and **leg 5b pins the known-open boundary as a passing assertion**.
⚠ **Your option (b) — an independent association/event oracle — was put to the
owner and NOT taken.** No mechanism is invented for it. If you think the narrowing
is the wrong call, attack the FACTS it rests on; the ruling itself is owner
judgment and not reviewable above SEV 4.

**SP-26 — repaired as you specified.** A shared `snapshotOtherHalf` returns a
**keyed record**, used by both the pre-gesture snapshot and the post-gesture poll
so the two shapes cannot drift; the poll carries a custom message naming the
requested test id and both guarded ids; §4.1's P4 row states both parts; and leg 5
must record the exact failure message and exit code, as leg 6 already did.

**SP-22 — repaired mechanically rather than declaratively.** The totals live once,
in §7.5; every other site is a pointer carrying no figure.

---

## ⚠⚠⚠ THE THING MOST WORTH YOUR TIME: THE CHECKER CERTIFIED THE DEFECT AS CLEAN

Your round-6 parenthetical was right and worse than you knew. **Run against
revision 6, `checkPlan` returned ZERO findings** while three contradictions were
live. Reproduced by execution, not inferred. Three defects caused it:

- **C3 read only the specification** — `tally(spec, …)` at both call sites, with
  `history` never passed — so drift **across the split** was invisible, which is
  the drift the split created.
- **C3 was anchored on two exact phrasings**, so "produced 24 findings" and "the
  fourth review round" did not register.
- ⚠ **C3 could not parse a hyphenated number, and that is a FALSE ACCEPT, not a
  miss.** `twenty-four` parsed as **4**, so a stray "four findings, none false"
  would have AGREED with it.

**You can inspect it this time, and you should.** Branch
`feature/plan-consistency-checker`, commit `1f6650a`, pushed, PR #154 —
`tests/support/planConsistency.ts` and `tests/unit/planConsistency.spec.ts`.
⚠ **STATE ITS CHECK SET FROM THE MODULE, NOT FROM THIS DOCUMENT** — see A1 below
for why that instruction exists.

---

## ⚠⚠ TWO AUTHOR-FOUND DEFECTS YOU SHOULD JUDGE, NUMBERED A1 AND A2

Numbered outside the `SP-*` sequence on purpose, so the running tally in §7.5 keeps
counting reviewer findings only. **Both are recorded in the history file's round-6
section. Judge whether that record is honest and complete.**

- **A1 — the round-6 commission overstated the checker to YOU.** It told you the
  checker has **five** checks, naming a "C5 falsified-claim-resurrection". **C5 has
  never existed.** You then reasoned about "C1–C5" four times, **including your
  central G3 answer**. ⭐ **Judge what that did to round 6's G3, and say plainly
  whether your G3 answer stands.** The author's view is that it does — your answer
  named a class no _count_ of checks would have caught — but that is the author's
  view of your work, which is exactly the thing you should not take on trust.
- **A2 — the hyphen false accept above**, found after your review, on a module you
  were not able to read.

---

## Expected state — STOP and tell the owner if any of this is untrue

- Branch `feature/spacing-helper-preset-plan`, off `main` = `08a9544`; **docs-only**:

  ```bash
  git log --oneline main..HEAD
  git diff --name-only main..HEAD | grep -vE '^docs/.*\.md$' || echo "docs-only: CONFIRMED"
  ```

- ⚠ This tracked record pins **no head and no counts**. The reviewed commit is in
  `prompts/codex/spacing-helper-preset-plan-followup6.md`.
- Manifest on `main`: 7 `expectedFailures`, 10 `expectedFlaky`, 21 `expectedSkips`;
  the spacing identity is on none.
- **No code exists on this branch and none may be written until a round returns
  ACCEPTS-REVISION.** The spec-before-code tripwire holds.

## ⚠⚠ EVERYTHING HEADLESS — QUOTED VERBATIM BECAUSE YOU INHERIT NONE OF THIS PROJECT'S RULES

**Standing rule #1: `bash tools/test-headless.sh <spec…>
--project=electron-e2e|electron-integration --workers=1`.** ⚠⚠ **THIS APPLIES TO
AN AD-HOC PROBE, NOT ONLY TO THE SUITES.** A previous review round launched
`electron.launch` head-ful and put app windows on the owner's desktop mid-session.
If you build a probe, it runs headless.

## Settled and NOT in scope

The owner's rulings — remove the pre-wait; retain a bounded ownership-gated retry;
fix lane; the **option-B mechanism**; the **2026-08-31 structural ruling**; and now
the **SP-25 option (a) narrowing** and the **non-binding design appendix** — are
owner judgment calls, **not reviewable above SEV 4**. Attack the facts they rest
on, never the authority. Your round-6 clearances stand unless revision 7 disturbed
them.

## The questions

**G1 — dispose of SP-25 and SP-26 by name**, and confirm or overturn the round-6
dispositions of SP-20…SP-24 that revision 7 records. Verify against the finding,
not against the plan's summary of it.

**G2 — ⭐⭐ DID THE NARROWING GO TOO FAR, OR NOT FAR ENOUGH?** The plan now claims
prevention by construction (P1) plus detection of anything that moves a value (P4).
**Is there any OTHER claim left in the document that still assumes the stronger
guarantee?** The author swept for this; treat that as a claim. ⭐ And the harder
half: **with P4 narrowed, is P1 actually strong enough to carry it alone?** M7
measured class placement and uniqueness in **jsdom only** and the class has never
been observed in the Electron renderer.

**G3 — ⭐ THE M9 MEASUREMENT.** It is the load-bearing new evidence and the author
ran it. **Is its control leg (M9c) genuinely bidirectional, or does it prove less
than claimed?** What would you have measured that the author did not? ⚠ M9 measures
the **value space** only and says so; judge whether that limit is stated honestly
enough or whether the plan leans on it beyond its reach.

**G4 — ⭐⭐ THE CHECKER, WHICH YOU CAN NOW READ.** Its checks are named in the
module; take them from there rather than from this document. **Prove or refute
what revision 7 actually claims**, which is narrower than "it catches count
drift": that against revision 6 it reports **8 review-round sites and 2 finding
sites**, that it reports **nothing** against revision 7, and that it stays silent
on historical prose such as "Option A survived two review rounds".
⚠⚠ **C3 IS AN ENUMERATED FRAME LIST AND THE MODULE SAYS SO — SO THE INTERESTING
QUESTION IS WHAT IT STRUCTURALLY CANNOT SEE.** The author's own sweep found one
while writing this commission: a ratio written as "the 17-of-18 number" matches no
frame at all, and neither would a total phrased any other new way. **Find more, and
say whether a frame list is the right shape for this job or whether the convention
should change instead** (for example, requiring every running total to be written
in one marked form the check can enumerate exhaustively). ⭐ This is a good
candidate for your design appendix. **Name a defect class none of the checks would
catch** — and say whether your round-6 answer to that question still stands after
A1.

**G5 — did the repairs over-reach?** SP-26's repair adds a private method and
changes a return type. SP-25's repair changes what the document PROMISES, in four
places. Check that none of them changed more than its finding required.

**G6 — the fifth interaction, again.** Every round has produced an interaction
between two individually correct pieces — SP-8, SP-12, SP-15, SP-20, SP-25. Look
for the sixth. ⚠ And: **which load-bearing claim in revision 7 is about what the
app DOES rather than what its source SAYS, and has anyone run it?**

## What the author already ran

**This commission was executed against this revision before it was sent, and it
caught a merge-blocker.** Running G2's sweep — "is there any other claim left that
still assumes the stronger guarantee?" — found that **§7.6 still asserted that
moving the record out means "an edit to the history can no longer contradict the
specification"**, which is the very claim your round 6 measured as CONTRADICTED,
and which the repaired history preamble now denies. **One fact in two places with
opposite values, in the revision whose headline repair is one fact in one place.**
It is fixed, and it is reported here rather than quietly corrected, because a
commission that is written and not run is this project's most-repeated failure.
⚠ **C3 could not have caught it** — it is a semantic contradiction, not a count.

Also run: every round-6 finding re-verified at source with `path:line`; the M9
probe (three legs, bidirectional, deleted afterwards with bounds re-verified —
`git status --porcelain` empty, `src/` and `tests/` byte-identical to `HEAD`); the
repaired checker run against revisions 4, 5, 6 and 7; C1's and C4's founding
known-bad controls re-proved unregressed; and a deletion audit over revision 7's
own diff — 107 removed lines across 38 blocks, every one accounted for — which is
how two stale `SpacingControls.tsx:104-112` citations were found and corrected.
⚠ **The deletion audit also produced a false alarm worth recording: legs 1–9 first
appeared to have vanished from a table, and the defect was in the AUTHOR'S GREP,
which required exactly one space where prettier had re-padded the cells.** The
instrument was wrong, not the document.

⚠⚠ **Treat that as a claim, not clearance.** The same self-check, run six times
before, missed three blockers, then four, then four, then five, then five, then
two — including several it created itself.

## Deliverable

**`docs/reviews/spacing-helper-preset-plan-codex-followup6-review.md`**, committed
and **pushed**, **prettier-clean**, adding only your own document.

**Verdict first:** ACCEPTS-REVISION / CHANGES-REQUIRED / SEV-1-BLOCKED — a hard
gate. Then a RESOLVED / PARTIALLY RESOLVED / REGRESSED table; confidence and
method; your evidence boundary; a claim ledger tagged MEASURED / INFERRED /
JUDGEMENT closing with your own weakest claims; new findings numbered **SP-27
onward**, with the class swept per finding; and, per the new ruling, an optional
**design appendix** per finding.

**Severity (STRAT-D18, binding):** SEV 1 blocks and needs the three-part proof;
missing any part → at most SEV 2. SEV 2 goes to the owner as a six-field brief.
SEV 3/4 recorded. Owner judgment calls are not reviewable above SEV 4.

Close with a `MemPalace drawer candidates` section, or an explicit "none".
