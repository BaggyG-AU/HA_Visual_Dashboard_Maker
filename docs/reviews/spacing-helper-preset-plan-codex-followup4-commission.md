# COMMISSION — STRAT-D7 scoped follow-up 4: revision 5, a pure repair round

Author: Claude Opus 5 (1M context) — plan author and repair author; interested party
Reviewer: OpenAI Codex / GPT-5.6 Sol — **the same reviewer** (OA §3.4)
Owner gate: micah / BaggyG-AU. This document decides nothing on its own.

⭐ **THIS ROUND IS DIFFERENT FROM THE LAST THREE: NOTHING WAS REDESIGNED.** Option
B stands, no owner decision was reopened, no mechanism was replaced, and no new
measurement was taken. **Revision 5 repairs SP-15…SP-19 and nothing else.** If you
find yourself reviewing a redesign, the author has over-reached and that is itself
the finding.

**NO CODE HAS BEEN WRITTEN AND NONE MAY BE UNTIL A ROUND RETURNS
ACCEPTS-REVISION.** That is the tripwire, and it still holds.

---

## What changed, and the one thing you should be most suspicious of

**All five findings were re-verified at source and accepted — nineteen for
nineteen across four rounds.** Two of them deserve your attention before the rest:

**SP-15 was the author's own defect, and the worst kind: a repair that deleted
something load-bearing.** Revision 4 replaced §4.4 by line range and silently
carried away the caller block — the block containing the only call to
`expectSelectShows`. P4 survived as a definition, an inventory row and a harness
leg, and nothing invoked it. ⚠⚠ **The same wholesale-replacement technique
produced revision 5's repairs, so the honest question to put to this revision is
not "are the repairs correct?" but "what did THEY delete?"**

The author's answer, and you should treat it as a claim: revision 4 replaced two
blocks wholesale (§4.4 and §6's leg section); both were diffed against revision 3
via `git show a39aad3`; §4.4's eighteen identifiers and four structural items are
all present, and §6's twenty-three content probes are all present. ⚠ **That check
is keyed on identifiers and named items. A deleted sentence introducing neither
would not appear in it, and keying differently is exactly what an independent
reviewer can do that the author cannot.**

**SP-18 is the one where your attack on your own recommendation landed**, and the
correction went further than the finding: the `BackgroundCustomizer` classes are
product CSS surface (`src/index.css:26-40`) whose DSL falls back to a
document-global popup and force-clicks. ⭐ It also produced an unexpected
dividend — that CSS comment, _"hide leave-transition remnants to prevent visible
merged menus"_, is **independent corroboration of M5 from another component in
this repository**. Check whether the author has drawn more from that than it
supports.

**The rest:** SP-16 the deadline now reads its remainder once per stage and throws
on non-positive (and the plan now records that `timeout: 0` disables Playwright's
timer entirely, making the revision-4 hole worse than the floor it replaced);
SP-17 the KIND rule is scoped to mechanism legs 1–9 with a second table covering
0/10/11/12 and a narrowed acceptance rule, and §7's stale sequence is rewritten;
SP-19 both universals now state their measured population.

## Expected state — STOP and tell the owner if untrue

- Branch `feature/spacing-helper-preset-plan`, off `main` = `08a9544`.
- **Still docs-only on disk. No code exists.** Regenerate:

  ```bash
  git log --oneline main..HEAD
  git diff --name-status main..HEAD
  git diff --name-only main..HEAD | grep -vE '^docs/.*\.md$' || echo "docs-only: CONFIRMED"
  ```

  **If that returns anything outside `docs/`, the tripwire has been broken — stop
  and say so.**

- ⚠ This tracked record pins **no head and no counts**. The reviewed commit is in
  the untracked paste prompt
  `prompts/codex/spacing-helper-preset-plan-followup4.md`.
- Manifest on `main`: 7 `expectedFailures`, 10 `expectedFlaky`, 21 `expectedSkips`;
  the spacing identity is on none.

## Settled and NOT in scope

The owner's rulings — remove the pre-wait; retain a bounded retry; fix lane; and
the **option-B mechanism** — are owner judgment calls, **not reviewable above
SEV 4**. Your round-4 G5 reading that the literal §3.7 text still favours slice
lane is recorded in the plan at SEV 4 / JUDGEMENT and the owner's case-specific
ruling controls; do not re-litigate it unless a NEW fact bears on it. Your
round-4 clearances of §5.2, P2, P3, `.ant-select-content-value` and the
no-force/no-evaluate/Escape guard rails stand unless revision 5 disturbed them.

## Working practice you are held to

Unchanged and quoted: (1) a finding is a sample, not the population — and **a
mechanical sweep is only as good as the key it is keyed on**, which is this
round's central risk; (2) no unverified universals; (3) **a check is evidence only
for the property it exercises — and so is a reviewer's clearance**; (4) verify
each finding against source, quote `path:line`; (5) silence is not a result;
(6) declare your evidence boundary and say what it cannot decide; (7) **an attack
that FAILED is not a proof of safety**; (8) **the fix round is unreviewed new
work** — under-reach AND over-reach both bite, and SP-15 was an over-reach that
deleted rather than added.

---

## The questions

**G1 — dispose of SP-15…SP-19 by name: RESOLVED / PARTIALLY RESOLVED / REGRESSED.**
Verify against the finding, not the plan's summary. **SP-15**: are all three
internal callers now specified, does each call `selectOptionByText` exactly once
without separately opening the Select, and does each reach `expectSelectShows`
with the same pattern? **SP-16**: does `budgetFor` actually guarantee a positive
timeout at every wait, and does throwing (rather than flooring) change the retry
behaviour in a way the plan has not thought through? **SP-17**: does the 0/10/11/12
table plus the narrowed acceptance rule cover the real population? **SP-18**: is
the correction accurate and does anything still lean on the old overstatement?
**SP-19**: are the universals gone everywhere, not just at the two sites you cited?

**G2 — ⭐ THE ROUND'S CENTRE: WHAT DID THE REPAIRS DELETE?** SP-15 proved this
author's block-replacement technique loses content silently. **Key your own sweep
differently from the author's** — he keyed on identifiers and named items. Diff
revision 4 against revision 5 directly and account for every removed line.

**G3 — is P4 actually load-bearing now, and is that safe?** P4 is the only thing
between option B and a correctly-formed-but-misattached class. It is wired but
never run. Leg 5 must now run through the wired caller rather than invoking
`expectSelectShows` directly (§6). **Is that sufficient, and is there a state where
P4 passes while the wrong control was operated?**

**G4 — did the previously-clean areas stay clean?** §5.1/§5.1a, §5.2, P1–P3, and
the guard rails. ⚠ §4.2, §4.3, §5.1a, §5.3 and §7.4 all changed for SP-18 — check
those edits did not soften anything else while correcting the precedent.

**G5 — evidence language.** §7.5's cost inventory was extended after your round-4
judgement that it flattered the process. Is it now complete, or has the author
swapped one incomplete list for another? And does §10's new
"diff-the-replaced-block" rule overclaim what it actually buys?

**G6 — anything the author could not predict.** Your case list is a floor. ⭐ Every
round so far has produced an interaction between two individually correct pieces —
SP-8, SP-12, SP-15. Look for the fourth. ⚠ And ask again: **which load-bearing
claim in revision 5 is about what the app DOES rather than what its source SAYS,
and has anyone run it?** The answer should still be M7-in-Electron and P4's drift
case, both of which the plan discloses.

## What the author already ran

`git show a39aad3` and a structural diff of **both** wholesale-replaced blocks
(§4.4: eighteen identifiers, four structural items; §6: twenty-three probes) —
run this time rather than written down and handed over, which is the failure §10
records. `playwright-core/lib/server/progress.js:67-75` re-read for SP-16. The
five `bg-*-dropdown` tokens enumerated across `src/`, `tests/`, `tools/`, then
`src/index.css:26-40` and the DSL's `??` fallback read in place.
`grep -rn "<SpacingControls" src/` → one consumer.

⚠⚠ **Treat that as a claim, not clearance.** The same self-check, run four times
before, missed three blockers, then four, then four, then five — including one it
created itself.

## Deliverable

A committed document on this branch:
**`docs/reviews/spacing-helper-preset-plan-codex-followup4-review.md`**.

⭐ Round 4 was the first round with nothing mechanical to fix — pushed, prettier
clean, own document only. Please keep that: `npx prettier --write` before
committing, and verify `git rev-parse HEAD origin/feature/spacing-helper-preset-plan`
agree afterwards.

**Verdict first:** **ACCEPTS-REVISION / CHANGES-REQUIRED / SEV-1-BLOCKED** — a hard
gate; implementation begins only on ACCEPTS-REVISION. Then a **RESOLVED /
PARTIALLY RESOLVED / REGRESSED table for SP-15…SP-19**; confidence and method;
your evidence boundary; a claim ledger tagged MEASURED / INFERRED / JUDGEMENT
closing with your own weakest claims; and new findings numbered **SP-20 onward**,
with **class swept** per finding.

**Severity (STRAT-D18, binding):** SEV 1 blocks and needs the three-part proof —
the decision or claim broken, the violated fact at `path:line`, why no recorded
mitigation covers it; missing any part → at most SEV 2. SEV 2 does not block and
goes to the owner as a six-field brief. SEV 3/4 recorded. Owner judgment calls are
not reviewable above SEV 4. The model governs what **blocks**, never what may be
**reported**.

Close with a `MemPalace drawer candidates` section, or an explicit "none". ⓘ Your
round-1 to round-4 candidates were filed on your behalf under MP-LEASE; the
mechanism works, so use it.
