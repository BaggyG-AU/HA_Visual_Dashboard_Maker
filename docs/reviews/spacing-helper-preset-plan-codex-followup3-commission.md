# COMMISSION — STRAT-D7 scoped follow-up 3: revision 4, and a mechanism replaced TWICE

Author: Claude Opus 5 (1M context) — plan author and repair author; interested party
Reviewer: OpenAI Codex / GPT-5.6 Sol — **the same reviewer** (OA §3.4)
Owner gate: micah / BaggyG-AU. This document decides nothing on its own.

⚠⚠ **THIS IS NOT AN ORDINARY REPAIR ROUND, FOR THE SECOND TIME RUNNING.** Besides
repairing SP-11…SP-14, this revision **replaces the ownership mechanism you
reviewed in round 3** — because a probe falsified it. **§4.1's P1, §4.2's M5–M7,
§4.3, §4.4, §5.1a, §6's leg table, §7.4's re-examination and §7.5 are new work no
review has seen.** Treat them as a first review, not a follow-up.

⭐⭐ **AND ONE THING YOU SHOULD KNOW BEFORE YOU START, BECAUSE IT CHANGES WHAT
INDEPENDENCE MEANS THIS ROUND: THE MECHANISM NOW PROPOSED IS THE ONE YOU
RECOMMENDED.** You recorded option B as your own engineering preference at SEV 4
in round 3, declining to push it above the binding cap on owner judgment. A
measurement then falsified option D and the owner ruled option B. **You are
therefore reviewing your own recommendation, and the ordinary adversarial posture
is harder to hold.** Say so if you find yourself agreeing easily, and **attack
option B at least as hard as you attacked option D** — the plan's §8 names four
specific ways it could still be wrong, and the author would rather you broke it
now than in CI.

**NO CODE HAS BEEN WRITTEN AND NONE MAY BE UNTIL A ROUND RETURNS
ACCEPTS-REVISION.** That is the tripwire, and it still holds.

---

## What changed since you last looked, and why

**You inferred a construction; the author ran it instead.** SP-13 named
rc-select's immediate-open / deferred-close asymmetry and said a transient
two-popup state was **plausible but not measured**, filing SEV 2 and a three-option
brief about how to word the claim. Under the owner's narrow tripwire exception
(harness code only: untracked, deleted after, `src/` + `tests/` verified
byte-identical, `git status --porcelain` empty) a probe measured it directly.

**Three results, three runs of three, in §4.2 as M5–M7:**

1. **M3 IS FALSE.** Two popups are simultaneously Playwright-visible for
   **350.6 / 353.0 / 359.9 ms** on the ordinary path, both on-screen. Route (a) is
   **restored** and harness **leg 1 with it**.
2. ⚠⚠ **M6 — AND THIS IS THE ONE THAT MATTERS.** For **45.4 / 60.9 / 66.8 ms**
   there are frames in which the **requested** Select reports `aria-expanded="true"`
   **and** exactly **one** popup is visible **and that popup is the FOREIGN one**.
   **Option D's P1 and P2 therefore both PASS on the wrong popup, so the break the
   plan promised would be "loud" does not happen at all.**
3. **M7 de-risks the replacement before proposing it:** antd 6.1.4's
   `classNames.popup.root` lands on the `.ant-select-dropdown` root, and with both
   popups mounted each class matched **exactly one** — neither carried the other's.

**The owner re-ruled option B** on 2026-08-27, superseding the option-D ruling of
the same day, under the standing rule that a measurement refuting an
authorisation's premise sends the decision back rather than being executed to the
letter.

⚠⚠ **YOUR ROUND-3 CLEARANCE OF OPTION D AGAINST SILENT SUCCESS IS EXPLICITLY
REOPENED — AND THE AUTHOR DOES NOT REGARD IT AS YOUR ERROR.** You wrote that you
found "no source-backed path by which its ordinary steady-state flow can silently
report the requested value after selecting a foreign option", and you named as
your own weakest inference that you had found no actor able to replace the
singleton between the P1 read and the option query. **The actor exists, it is the
asymmetry you yourself surfaced one finding earlier, and your declared evidence
boundary — static source — is exactly why you could not reach it.** The clearance
was correct for the property it exercised and false for the claim it appeared to
clear. **Re-derive rather than re-affirm.**

## Expected state — STOP and tell the owner if untrue

- Branch `feature/spacing-helper-preset-plan`, off `main` = `08a9544`.
- ⚠⚠ **NO LONGER DOCS-ONLY IN INTENT, BUT STILL DOCS-ONLY ON DISK.** The plan now
  proposes a two-line `src/` change; **no code has been written**, so the branch
  is still every-file-under-`docs/`. **Regenerate:**

  ```bash
  git log --oneline main..HEAD
  git diff --name-status main..HEAD
  git diff --name-only main..HEAD | grep -vE '^docs/.*\.md$' || echo "docs-only: CONFIRMED"
  ```

  **If that returns anything outside `docs/`, the tripwire has been broken — stop
  and say so.**

- ⚠ This tracked record pins **no head and no counts** — a document committed to a
  branch cannot pin that branch's head from inside itself. The reviewed commit is
  in the untracked paste prompt
  `prompts/codex/spacing-helper-preset-plan-followup3.md`.
- Manifest on `main`: 7 `expectedFailures`, 10 `expectedFlaky`, 21 `expectedSkips`;
  the spacing identity is on none.

## Settled and NOT in scope

Round-1 Q4 (the two-file consumer population; the
`canvas-resize-and-nesting.spec.ts:23` docblock correction) and your round-2
clearances of the `Escape` removal and the no-force / no-`evaluate` guard rails
stand. The owner's rulings — remove the pre-wait; retain a bounded retry; fix
lane; **and the option-B mechanism itself** — are owner judgment calls and are
**not reviewable above SEV 4**; attack the facts they rest on, never the
authority. The 2026-08-26 fix-don't-allowlist ruling is settled and was re-offered
to the owner twice and declined both times (§7.5).

⚠ **§5.1's blast-radius clearance is NOT carried forward unchanged**, because the
change is no longer test-only. **§5.1a is new surface you have not seen.**

## Working practice you are held to

Unchanged and quoted: (1) a finding is a sample, not the population — name the
class and sweep it, and **a mechanical sweep is only as good as the key it is
keyed on**; (2) no unverified universals; (3) **a check is evidence only for the
property it exercises — and so is a reviewer's clearance**, which this arc has now
demonstrated three times; (4) verify each finding against source, quote
`path:line`; (5) silence is not a result — answer each question explicitly;
(6) declare your evidence boundary, and **say which questions your boundary cannot
decide** rather than answering them from inside it; (7) **an attack that FAILED is
not a proof of safety** — the attack most likely to fail is the one whose
magnitude is wrong; (8) **the fix round is unreviewed new work** — check each
repair for under-reach AND over-reach.

---

## The questions

**G1 — dispose of SP-11…SP-14 by name: RESOLVED / PARTIALLY RESOLVED / REGRESSED.**
§9 claims all four resolved. Verify against the finding, not the plan's summary.
**SP-11**: is the false TOCTOU mechanism gone from all five sites you named, and
did the author's widened sweep (`hit.target`, `displaced`, `moved target`) miss a
sixth phrasing? **SP-12**: is leg 5's **P4-ONLY** variant now genuinely
constructible, and is the per-leg **KIND** table an honest narrowing rather than a
way to retire an inconvenient universal? **SP-13**: see G2. **SP-14**: does the
absolute deadline actually bound the resolver now, including the throw paths?

**G2 — ⭐ THE NEW MECHANISM (§4.1 P1, §4.2 M5–M7, §4.3, §4.4). This is the round's
centre, and it is your own recommendation.**

- **Verify M5–M7 against the recorded measurements** and say plainly which you can
  and cannot check without running the app.
- ⚠ **M7 IS jsdom, NOT THE ELECTRON RENDERER.** It decides class placement and
  uniqueness. **Nothing has yet watched this class on a popup in the running app**
  — the exact gap that killed options A and D. Is the plan's disclosure of that
  sufficient, or should leg 1 be required to assert it before anything else runs?
- **Attack the naming rule.** The popup class is `<data-testid>-popup`, a
  convention enforced by nothing: if `src/` and the DSL drift, the DSL looks for a
  class nobody renders. The §5.1a grep finds collisions, not omissions. **Should
  this plan pin it, and with what?**
- **Attack the product hook.** Nothing in the app reads the class, so nothing in
  the app protects it; a future refactor can delete it and no test fails at the
  moment of deletion. Is that acceptable, and is `BackgroundCustomizer.tsx`'s
  five-instance precedent actually reassuring or merely older?
- **Is there a silent-wrong-control path left?** The author claims there is none
  by construction. **Try to build one** — and note that `resolveOwnedDropdown`
  waits for the class to be **visible**, while rc-trigger keeps closed popups in
  the DOM.

**G3 — scope and regression.** Did any repair reach further than its finding? The
mechanism replacement is owner-ruled, so the question is whether §4.4 changed
anything **beyond** what option B requires — and whether the deletions (the
singleton assertion, the `:visible` locator, the `Math.max` floor) took anything
load-bearing with them.

**G4 — did the previously-clean areas stay clean?** §5.2's class statement, P2–P4,
`.ant-select-content-value`, and **§5.1 re-asked against §5.1a's new `src/`
surface**.

**G5 — the lane, and the cost.** §7.4 **re-examines** its own ruling because
"test-only" was a fact it rested on and is now false; the author's judgement is
that the lane turns on the **subject** of the work, not the file extensions. You
read `OPERATING_AGREEMENT.md` §3.7 differently in round 1. **Say whether the
re-examination is honest reasoning or a rationalisation**, and whether a two-line
`src/` change alters your §3.7 reading. Separately: is §7.5's cost statement
complete, or does it flatter the process?

**G6 — anything the author could not predict.** Your case list is a floor. ⭐ Round
2's SP-8 and round 3's SP-12 were both **interactions between two individually
correct repairs**; look for the equivalent here. ⚠ And ask the question this arc
keeps answering the hard way: **which load-bearing claim in revision 4 is about
what the app DOES rather than what its source SAYS, and has anyone run it?**

## What the author already ran

G1's SP-11 sweep was executed against the finished file — widened past its own
vocabulary to `hit.target`, `displaced` and `moved target`, because a token sweep
is only as good as its key. Four hits survive and each was read in place. The
§5.1a collision grep and the `renderSection(` enumeration were run. **Both probes
carried control legs and neither result was trusted until its control fired**: the
two-popup sampler was proved able to report 2, and the option-B class selector was
proved to match 0 before any popup existed. §10 records what the run did **not**
establish — leg 1's state entry with the helper running, anything in the Electron
renderer about M7, and the legs-2/3 interceptor question.

⚠⚠ **Treat that as a claim, not clearance.** The same self-check, run three times
before, missed three blockers, then four, then four again.

## Deliverable

A committed document on this branch:
**`docs/reviews/spacing-helper-preset-plan-codex-followup3-review.md`**.

⚠⚠ **TWO MECHANICAL THINGS THAT HAVE GONE WRONG ON THIS BRANCH AND COST A GATE
CYCLE:** run **`npx prettier --write`** on your review file before committing —
round 2's landed unformatted and took the branch gate red — and **push your
commit**; rounds 2 and 3 both left it local-only.

**Verdict first:** **ACCEPTS-REVISION / CHANGES-REQUIRED / SEV-1-BLOCKED** — a hard
gate; implementation begins only on ACCEPTS-REVISION. Then a **RESOLVED /
PARTIALLY RESOLVED / REGRESSED table for SP-11…SP-14**; confidence and method;
your evidence boundary; a claim ledger tagged MEASURED / INFERRED / JUDGEMENT
closing with your own weakest claims; and new findings numbered **SP-15 onward**,
with **class swept** per finding.

**Severity (STRAT-D18, binding):** SEV 1 blocks and needs the three-part proof —
the decision or claim broken, the violated fact at `path:line`, why no recorded
mitigation covers it; missing any part → at most SEV 2. SEV 2 does not block and
goes to the owner as a six-field brief. SEV 3/4 recorded. Owner judgment calls are
not reviewable above SEV 4. The model governs what **blocks**, never what may be
**reported**.

Close with a `MemPalace drawer candidates` section, or an explicit "none". ⓘ Your
round-1, round-2 and round-3 candidates were filed on your behalf under MP-LEASE
as `drawer_havdm_review_ba8a734f85f6e6cf2deceb33`,
`drawer_havdm_review_446c3aa851fad9f6e0ebcfe3` and
`drawer_havdm_review_222ba0e3255e24c8180bf088` — the mechanism works, so use it.
