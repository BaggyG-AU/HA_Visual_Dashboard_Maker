# Commission — independent implementation review of the spacing DSL Select-targeting repair

Author: Claude Opus 5 (1M context)
Reviewer: Claude Sonnet 5
Owner gate: micah / BaggyG-AU

**This is the ONE FULL INDEPENDENT REVIEW BEFORE MERGE** required by
[`docs/governance/OPERATING_AGREEMENT.md`](../governance/OPERATING_AGREEMENT.md)
§3 class (d). It is not a follow-up and not a spot check.

⚠ **This document pins no commit and states no counts.** Both go stale on the next
push. The paste prompt the owner sends carries the head; every count you need,
regenerate.

---

## 0. Why you hold this seat, and who is disqualified

§3.6's **Stage-8 rule is binding: the implementation reviewer must have authored
none of the spec, the prompt, or the implementation.**

- **Claude Opus 5 is disqualified.** It wrote the plan, every review commission on
  this branch, the implementation, and this document.
- **OpenAI Codex / GPT-5.6 Sol is disqualified for this round.** §10 of the plan —
  the binding implementation contract the code was built against — is Sol's own
  text, reproduced verbatim, and its wording is in the shipped helper's comments. It
  cannot adversarially review its own specification. **The owner ruled this on
  2026-08-31 after it was put to them as an open question rather than decided.**
- **You have authored nothing here.** That is why the seat is yours.

ⓘ §3.6's watch instrumentation adds a **Sol cross-check of the first two Sonnet
implementation reviews** — of the review, not the code. Expect your review to be
read adversarially; that is the design, not a signal of distrust.

---

## 1. The owner's profile — write for the reader who actually rules

**Standing line (STRAT-D15 / strategy correction C6): the owner gate is held by a
NON-DEVELOPER.** Anything you route to the owner uses the **Owner Decision Brief**
form: what this protects in product terms · what is going wrong, plainly · is the
product affected, Yes / No / Unknown, with honest evidence status · options with
costs · your recommendation and why · what happens if nothing is done. **Never
require the owner to classify a diff or apply developer instinct.**

---

## 2. Execution rules — EVERYTHING HEADLESS

Quoted **verbatim** from the standing-rules record
(`drawer_havdm_governance_b282610792b253fee5c09b40`); the numbering is that
record's own:

> 1\. ⚠⚠ **EVERYTHING HEADLESS:** `bash tools/test-headless.sh <spec…>
--project=electron-e2e|electron-integration --workers=1`. MULTIPLE SPECS IN ONE
> INVOCATION WORK. 2. **INTEGRATION IS A SEPARATE PROJECT — run SEQUENTIALLY.** 3. **DO NOT RUN THE UNIT SUITE WHILE AN ELECTRON SUITE IS LIVE.** 4. **TO SEE THE
> APP: `npm run start:wsl`.** 6. **LIVE HA: `HAVDM_LIVE=1 npx playwright test
--project=live-ha`.**

⚠⚠ **THIS APPLIES TO AN AD-HOC PROBE OF YOUR OWN, NOT ONLY TO THE SUITES.** A past
round on this project built its own `electron.launch` probe with no `xvfb-run`, no
`Xvfb` and no `DISPLAY` override, and put application windows on the owner's
desktop while they were typing. The root cause was recorded as a **commission
omission** — the prompt quoted fourteen practice rules and left this one out. It is
not left out here. **A suite or probe you cannot run headless is declared UNRUN. It
is never launched headed.** `xvfb-run -a` is the fallback where the helper script
does not fit.

**Other write-restrictions, acknowledged in advance:** no `[STATE]` drawer update;
no UAT card marked or re-scored; no `src/` change; **no merge**; `ha.home.local` is
**read-only** (`ha-test.home.local` is the writable one). Proposed changes go in
your review document, nowhere else.

⚠ **Do not change** `tests/baseline/expected-failures.json`, any snapshot,
`tests/support/dsl/tabs.ts`, `tests/support/dsl/popup.ts` or
`BackgroundCustomizer` — the fifth of the five conditions the owner accepted.

---

## 3. Where your MemPalace notes go (ruling MP-LEASE)

If MemPalace is absent, **or present with the write refused by the per-palace
writer lease** — the normal case when author and reviewer run concurrently — record
them in a `MemPalace drawer candidates` section at the **end of your own committed
review file**, not in the PR body. The write-enabled author files them with
`added_by="claude-sonnet"`. ⚠ **Never kill a process to free the lease and never set
`MEMPALACE_MCP_ALLOW_PEER_WRITER`.**

---

## 4. The §3.1 header your review must carry

Quoted verbatim from
[`docs/governance/OPERATING_AGREEMENT.md`](../governance/OPERATING_AGREEMENT.md)
§3.1:

> Every governed artifact — an R7-class spec or remediation plan, a triage
> document, a governance change, or a review of one of these — opens with three
> separate lines: `Author:`, `Reviewer:`, `Owner gate:`. This header is the
> invariant's entire enforcement mechanism — it makes author ≠ reviewer auditable at
> a glance.
>
> ⭐ **Headers name the exact model** (e.g. "Claude Fable 5", "GPT-5.6 Sol"), never
> only the vendor or family — the §3.6 watch instrumentation attributes escaped
> defects to seat + model, and that attribution is only as good as the header.

So your review opens with, adjusted for whoever cross-checks you:

```
Author: Claude Sonnet 5
Reviewer: OpenAI Codex (GPT-5.6 Sol) — §3.6 watch cross-check
Owner gate: micah / BaggyG-AU
```

---

## 5. Working practice this review is held to

These are the cross-project `practice`-wing rules that bear hardest on this round.
**They are quoted, not cited, because a cited rule reaches a reviewer not at all —
you judge against exactly what this prompt supplies.** The full template subset is
in [`docs/templates/ADVERSARIAL_REVIEW.md`](../templates/ADVERSARIAL_REVIEW.md) §0
and applies in addition; a commission may add requirements, never subtract them.

1. **A check is evidence only for the property it exercises — and so is a
   reviewer's clearance.** Before writing "verified", state the exact claim, state
   what you ran, then answer one question: **if this claim were false, would what I
   ran have failed?** If the answer is no, or "not necessarily", you have not
   verified it. Apply the same question to every clearance you **receive** — a
   narrower check plus the word "RESOLVED" reads as clearance of the wider claim.
2. **Writing a check down is not running it.** Every "check whether X" you write is
   a prediction of a finding. Run it. On this project that rule has been broken four
   times, most recently by an author who put the round's merge-blocking question
   into his own commission and never executed it.
3. **Prove a check FIRES on known-bad input before trusting a pass.** An empty
   extraction succeeds on everything; a command that errors prints nothing on stdout
   and is indistinguishable from a clean result. **A check that cannot fail is worse
   than no check, because it is reported as evidence.**
4. **A finding is a sample, not the population — and a mechanical sweep is only as
   good as the key it is keyed on.** State the class as a **behaviour** before
   choosing a search key, use at least two keys with disjoint vocabulary, and
   corroborate a token grep by reading the surface end to end. ⚠ **A deletion leaves
   no token to grep for**: sweeping for what should not be there never asks what is
   missing.
5. **No unverified universals.** "Only", "every", "all", "none" or any count is a
   measurement and needs the enumeration that backs it, published beside the claim.
   Name the **population source** first; "from memory" is not one — that is NOT
   CHECKED.
6. **Acceptance evidence is commit-addressed.** Before crediting any run to any fix,
   compare the run's head commit with the commit carrying the change. A green run at
   an earlier commit is characterisation, not acceptance. **A retry launders a
   failure into a pass** — where the property under test is stability, the
   per-attempt list is the measurement.
7. **A finding is a hypothesis, not a defect report.** Verify it against the source
   and against the register of deliberate decisions before asserting it. A finding
   you cannot locate is a question and should be written as one.
8. **Silence is not a result.** State "no issue found" explicitly for every heading
   you were asked to cover. Zero findings is a PASS — never manufacture one.

---

## 6. What is under review

The branch `feature/spacing-helper-preset-plan`, in full. It deliberately uses the
**governed-artifact packaging exception**: the plan, its review documents, its
commissions and the implementation are on one branch so the review chain stays
readable against what each reviewer actually saw.

**Regenerate the file list rather than trusting a list here:**

```
git diff --name-only main..HEAD
git diff --name-only main..HEAD | grep -vE '^docs/.*\.md$'
```

The second command is the whole implementation. Two files.

**Read, in this order:**

1. [`docs/testing/SPACING_HELPER_PRESET_PLAN.md`](../testing/SPACING_HELPER_PRESET_PLAN.md)
   — **§10 is BINDING and is the previous reviewer's own text, verbatim.** §6 is the
   leg table. §8 is the live weak-claims list. **The plan-review track is CLOSED
   under the owner's stop rule; you are not being asked to revise the plan.**
2. [`docs/testing/SPACING_HELPER_HARNESS_RESULTS.md`](../testing/SPACING_HELPER_HARNESS_RESULTS.md)
   — the acceptance evidence. This is the document most likely to be wrong.
3. `src/components/SpacingControls.tsx` and `tests/support/dsl/spacing.ts` — the
   implementation.
4. [`docs/testing/SPACING_HELPER_PRESET_PLAN_HISTORY.md`](../testing/SPACING_HELPER_PRESET_PLAN_HISTORY.md)
   — the per-round dispositions, if you need to check whether something you have
   found was already ruled on.

---

## 7. The questions this round exists to answer

Answer each explicitly, including the ones you find clean.

**Q1 — Does the implementation match §10's binding contract, clause by clause?**
Walk §10's bullets and the five accepted conditions against the two changed files.
Name any clause that is unimplemented, partially implemented, or implemented
differently.

**Q2 — Is the acceptance evidence actually acceptance evidence?** The plan's §6 says
acceptance comes only from FAIL-OLD/PASS-NEW and GUARD-REMOVAL legs, and that legs
0 and 10–12 can veto a repair but never establish one. For each leg the results
document calls acceptance evidence, ask rule 1 of §5 above: **if the repair were
NOT what fixed this, would that leg have failed?**

**Q3 — Were the SCOPE-ONLY and P4-ONLY variants really the weakenings §10
specifies?** They were generated from the shipped helper by asserted string
substitution, and the substitutions are published in the results document. Check
that what was removed is what §10 says to remove, and — the harder question —
**that nothing else was removed with it.**

**Q4 — Attack the leg-3 disposition by name.** §10 says leg 3 "must silently
succeed"; it also defines SCOPE-ONLY as retaining wired P4, and P4 fires whenever
the requested control did not move. The measured result was: the scope guard passed
silently, the wrong-control click landed and moved a value, and P4 then fired. **The
owner ruled it PASS on the guard reading.** Is that reading defensible, or does the
tension in §10 mean the discriminator did not decide what it claims to decide? ⚠
This is an owner ruling on a contract tension, not an authority question — attack
the facts it rests on freely.

**Q5 — Attack leg 1 and leg 1b.** Leg 1 as §10 constructs it ran, observed
`max >= 2`, and its FAIL-OLD half did **not** reproduce; leg 1b established the state
differently and it did. Is leg 1b a legitimate establishment of the state §10 names,
or has the harness chosen the condition under which the defect appears and then
reported the defect? **What would falsify leg 1b?**

**Q6 — Is anything the harness measured a property of the harness rather than of the
app?** Three legs were built wrong first and are recorded in §5 of the results
document. Look for a fourth. In particular: legs 2, 3, 5 and 5b establish the
foreign-only state by suppressing the requested Select's opening from the page, and
nothing shows how CI reaches that state.

**Q7 — Is the product change safe?** Two lines in
`src/components/SpacingControls.tsx` add popup classes. Ask what else in the app
could select on `.ant-select-dropdown` by class, what CSS could match the new names,
and whether the `classNames.popup.root` form is correct for the antd version this
repository actually resolves — **read the version from the lockfile or
`node_modules`, do not assume it.**

**Q8 — Is P4's narrowed promise stated consistently everywhere it appears?** The
owner ruled that **P4 is a MUTATION alarm, not an identity proof**; prevention is
P1's, by construction. Leg 5b passes by design and pins that limit. Sweep for any
surviving sentence — in the helper's comments, the plan, the results document or
the pull request body — that still claims more. ⚠ Sweep by **role**, not by
vocabulary: the last sweep of this exact class failed because it was keyed on the
words the author happened to choose.

**Q9 — The pull request body.** It is the canonical **ungated** surface on this
project and has produced findings in five separate rounds. Check every claim in it
against the branch, and check that it states no running total that is not also in
the plan's §7.5 `plan-running-totals` block.

**Q10 — Anything else.** Your own case list is a floor, never a ceiling. The list
above is shorter than the population by construction.

---

## 8. The author's weakest claims, handed over unweakened

Attack these by name. A finding against any of them is welcome and expected.

- **Leg 5b's misattached class is simulated.** It shows what happens if a foreign
  popup carries the requested class; it says nothing about whether that can occur.
  **P1 stands alone in the double-pre-satisfied state and there is no detector
  there.** This remains the sharpest attack on the whole design.
- **Leg 1b pre-mounts both popups to open the window.** The order mirrors the real
  failing spec and is published, but the harness still chose the condition.
- **The suppression construction is test-side.** It reaches the foreign-only state
  reliably and explains nothing about how CI reaches it. The plan declines to
  explain that route deliberately; this harness does not close it either.
- **Wall times and the 1500 ms / 5000 ms budgets are characterisation.** Nothing
  measures that they are the right values.
- **The `_hitTargetInterceptor` question is answered only for these
  constructions** — an observation over these legs, not a general claim about
  Playwright.
- **The results document is the newest artifact here and has been reviewed by
  nobody.**

---

## 9. Verdict form

Use [`docs/templates/ADVERSARIAL_REVIEW.md`](../templates/ADVERSARIAL_REVIEW.md) in
full: verdict first, confidence and method, claim ledger tagged MEASURED / INFERRED
/ JUDGEMENT with a **weakest claims** close, then findings ranked most severe first
under the **SEV 1–4 severity contract**, each with evidence at `path:line`, the
problem, a concrete fix, what must **not** change, and **class swept**.

Commit your review to
`docs/reviews/spacing-helper-implementation-sonnet-review.md` on the branch. ⚠ Two
mechanical requirements that have gone wrong on this branch before: **push the
commit**, and **run `npx prettier --write` on the file before committing it** — an
unformatted review commit has taken this repository's gate red once already.
