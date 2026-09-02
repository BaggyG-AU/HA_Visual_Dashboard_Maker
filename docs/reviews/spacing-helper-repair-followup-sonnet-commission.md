Author: Claude Opus 5 (1M context)
Reviewer: Claude Sonnet 5 (scoped follow-up, §3.4 — this document commissions it)
Owner gate: micah / BaggyG-AU

# Commission — §3.4 scoped follow-up on the spacing-helper repair rounds

This is the **mandatory same-reviewer scoped follow-up** required by
[`docs/governance/OPERATING_AGREEMENT.md`](../governance/OPERATING_AGREEMENT.md)
§3.4 (ruling STRAT-D7): _every post-review repair gets a same-reviewer scoped
follow-up._ It is **not** a second full independent review. Your full review has
already run and returned APPROVE / no SEV-1.

---

## 0. Why you hold this seat — and the thing you must know before you start

You held the class-(d) implementation-review seat for PR #155 and your review is
[`spacing-helper-implementation-sonnet-review.md`](spacing-helper-implementation-sonnet-review.md).
§3.4 sends the repair back to **the same reviewer**. That is you.

⚠⚠ **Now the awkward part, disclosed because you cannot judge this round without
it.**

The repair round that answered your findings — commit `86b897e`, "Round 1" — was
**executed under an incorrect model invocation. That session ran as Claude Sonnet
5**, the same model that holds your seat. The owner started it under the wrong
model by accident. The disposition file's header line claimed "Author: Claude Opus
5"; that was false, and `86b897e`'s own commit trailer already said
`Co-Authored-By: Claude Sonnet 5`.

That created exactly the conflict §3.6's Stage-8 reviewer-eligibility rule exists
to prevent — the rule turns on **model identity**, not session freshness, which is
why it disqualified Codex/Sol from your round for having authored plan §10.

**The remedy was not a relabel.** A genuinely fresh **Claude Opus 5** session
re-derived Round 1 from scratch, corrected what it found wrong, and adopted the
rest as its own — commit `d2829a0` and the round after it. So:

- The **prose** of Round 1 and of `SPACING_HELPER_HARNESS_RESULTS.md` §1.1 was
  physically composed by a Sonnet session.
- The **facts** were independently re-derived, and the **authorship and
  responsibility** are now Opus's.

⭐ **You are therefore reviewing a repair you did not author, which is what makes
this seat legitimate again. But you should decide that for yourself.** If you
judge that the adoption does not cure the conflict — that reviewing prose composed
by your own model remains compromised however it was re-derived — **say so as a
finding.** That question is explicitly in scope, and answering it "the arrangement
is still conflicted" is a legitimate outcome the owner wants to hear.

---

## 1. What is under review — the scope, and nothing wider

**Your scope is the commit range `1aa8b5f..HEAD`** — every commit added since the
head you reviewed. Enumerate it yourself rather than trusting a list here:

```
git log --oneline 1aa8b5f..HEAD
```

At the time this commission was written that range held: `86b897e` (Round 1 — the
repair answering F1, F2, F3), `d2829a0` (the attribution correction and
independent ratification), and a further commit adding two weakest-claims bullets
to `SPACING_HELPER_HARNESS_RESULTS.md` §6 plus this commission itself. **The
range, not this sentence, is authoritative** — if they disagree, the range wins and
the disagreement is itself worth reporting.

Read the whole diff:

```
git diff 1aa8b5f..HEAD
```

`1aa8b5f` is the head **you reviewed**. Everything after it is this round's
subject.

**Files touched across the whole range — verify this yourself, do not take it from
me:**

```
git diff --name-only 1aa8b5f..HEAD
```

⚠ **Out of scope, and the answer is "that was already reviewed":** the two-line
`src/components/SpacingControls.tsx` change, `tests/support/dsl/spacing.ts`, and
`docs/testing/SPACING_HELPER_PRESET_PLAN.md`. The plan-review track is **CLOSED**
under the owner's stop rule. If you believe the plan is wrong that is a finding
about the plan, reported — never an edit.

---

## 2. What a §3.4 follow-up must do — three things, not one

A fix round is **unreviewed new work** written under pressure to satisfy a critic,
and it fails in two opposite directions: **under-reach** (fixing the named
instance but not its class) and **over-reach** (asserting more than the finding
required). So:

1. **Dispose of each prior finding by name** — F1, F2, F3 — as **RESOLVED /
   PARTIALLY RESOLVED / REGRESSED / OPEN**. A per-finding table is the deliverable's
   spine.
2. **Sweep for regressions in areas that were previously clean.** A round that only
   re-reads the findings list cannot see what the fix broke. Your own review's
   "no issue found" list (Q1, Q7, Q8, legs 5/5c/6/8/9 and the §5 self-corrections)
   is the population to re-check.
3. **Check each fix stayed inside its own scope.** Did the repair change anything
   the finding did not ask about? If yes, it needs its own justification.

---

## 3. The questions this round exists to answer

**Q1 — Is F1 actually resolved?** `SPACING_HELPER_HARNESS_RESULTS.md` §1.1 and
§1.2 now claim to record the condition-2 class smoke. Does the recorded evidence
decide what it says it decides? Specifically: §1.1 records **counting**; §1.2
records a **functional** check. Ask of each — _if the claim were false, would what
was run have failed?_

**Q2 — Was the over-reach correctly identified, and correctly closed?** The Opus
round found that §1.1 originally cleared "no shared **or swapped** mapping" on the
union-size count alone, and argued counting cannot decide a swap. **Is that
argument right?** And is §1.2's functional check a genuine swap detector, or does
it too clear a wider claim than it tests? ⚠ Note §1.2's own controls (NEG-1,
POS-1) and decide whether they prove what they claim.

**Q3 — Is the `aria-controls` / `useId` trap recorded in §1.2 true?** The claim is
that `@rc-component/util`'s `useId` returns the literal `'test-id'` under
`NODE_ENV === 'test'`, so all four Selects emit `aria-controls="test-id_list"`.
⚠ **The "what" was measured; the "why" is partly inferred** — the Opus session did
**not** verify which build step sets `NODE_ENV=test` for the renderer bundle. Check
it.

**Q4 — Are F2's and F3's narrowed sentences faithful — no more and no less than
your own "Concrete fix" text asked for?** Under-reach and over-reach both count.

**Q5 — Did the repair rounds stay inside their declared blast radius?** Verify
independently that `src/components/SpacingControls.tsx` and
`tests/support/dsl/spacing.ts` are byte-identical across the range, that no
snapshot, `tests/baseline/expected-failures.json`, `tests/support/dsl/tabs.ts`,
`tests/support/dsl/popup.ts` or `BackgroundCustomizer` moved, and that no leg's
**measured result** was altered — only surrounding prose.

**Q6 — Is `SPACING_HELPER_HARNESS_RESULTS.md` still internally coherent** after two
subsections and two weakest-claims bullets were inserted into it? Section
numbering, cross-references, the §6 register, and any line-number citation that
inserting ~100 lines could have invalidated. (One such citation was already found
stale and fixed during the Opus round; assume there are others and look.)

**Q7 — The seat question from §0.** Does an Opus re-derivation cure the conflict
created by a Sonnet-composed repair, for the purpose of you reviewing it?

**Q8 — The PR body.** It is this project's canonical **ungated** surface and has
carried findings before. Does it now describe what actually landed?

---

## 4. The author's weakest claims, handed over unweakened

Attack these by name. They are the Opus round's own, published so that a finding
against them is cheap to make.

1. ⚠⚠ **Neither §1.1 nor §1.2 reproduces condition 2's literal sequencing.**
   Condition 2 says add _only_ the two class hooks, _then_ run the smoke. Both
   records were taken **at the shipped head**, with the whole repair in place. They
   re-measure the property; they do not reproduce the ordering, and **no artifact on
   this branch does.** What the original ordering established rests on commit
   `82c0e49`'s message — which is F1's original complaint, arguably only partly
   answered. **This is the weakest thing in the round and the most likely SEV-2.**
2. ⚠ **§1.2's swap check is n=1**, in a fixed Select order, against state left by
   its own Part A rather than a pristine panel. The justification offered is that a
   render-time class binding is not a timing property. That justification is a
   **judgement**, not a measurement.
3. ⚠ **"Independent" is doing careful work in §1.2.** Round 1's probe no longer
   exists and was not re-run, but §1.1's published figures **had been read** before
   the new probe ran. The claim is independent _construction_ and an independent
   _run_ — not blind measurement. Decide whether the word survives that.
4. ⚠ **The Opus round did not re-run the e2e spacing specs.** It is a docs-only
   round and only `./tools/checks` was run. If you think a docs round that rewrites
   acceptance evidence owes an e2e re-run, that is a finding.
5. ⚠ **`[STATE]` was deliberately not bumped**, on the reasoning that it predates
   this branch, names no PR #155 head, and would need a split-before-add. If you
   think that leaves the record wrong, say so.

---

## 5. Working practice this review is held to

Quoted, not cited — **a cited rule reaches you not at all; you judge against
exactly what this document supplies.**
[`docs/templates/ADVERSARIAL_REVIEW.md`](../templates/ADVERSARIAL_REVIEW.md) §0
applies in addition; a commission may add requirements, never subtract them.

1. **A check is evidence only for the property it exercises — and so is a
   reviewer's clearance.** State the claim, state what you ran, then answer: **if
   this claim were false, would what I ran have failed?** If the answer is no, or
   "not necessarily", you have not verified it. Apply it to every clearance you
   **receive**, including the Opus round's own "REPRODUCED EXACTLY".
2. **Writing a check down is not running it.** Every "check whether X" is a
   prediction of a finding. Run it.
3. **Prove a check FIRES on known-bad input before trusting a pass.** A check that
   cannot fail is worse than no check, because it is reported as evidence.
4. **The fix round is unreviewed new work** — scope it to the finding, check it
   against the authority it cites, and open with a RESOLVED / PARTIALLY RESOLVED /
   REGRESSED / OPEN table plus a regression sweep of previously-clean areas.
5. **A finding is a sample, not the population** — and a mechanical sweep is only
   as good as the key it is keyed on. State the class as a **behaviour** before
   choosing a search key.
6. **No unverified universals.** "Only", "every", "all", "none" or any count needs
   the enumeration that backs it, published beside it. Name the population source;
   "from memory" is not one — that is NOT CHECKED.
7. **Acceptance evidence is commit-addressed.** Compare a run's head commit with
   the commit carrying the change. **A retry launders a failure into a pass.**
8. **A finding is a hypothesis, not a defect report.** Verify it against the source
   before asserting it. A finding you cannot locate is a question — write it as one.
9. **Silence is not a result.** State "no issue found" explicitly for every
   question above. **Zero findings is a PASS — never manufacture one.**

---

## 6. Execution rules — EVERYTHING HEADLESS

Quoted verbatim from the project's standing rules:

> 1. ⚠⚠ **EVERYTHING HEADLESS:** `bash tools/test-headless.sh <spec…>
--project=electron-e2e|electron-integration --workers=1`. MULTIPLE SPECS IN ONE
>    INVOCATION WORK. 2. **INTEGRATION IS A SEPARATE PROJECT — run SEQUENTIALLY.** 3. **DO NOT RUN THE UNIT SUITE WHILE AN ELECTRON SUITE IS LIVE.**

⚠⚠ **THIS APPLIES TO ANY AD-HOC PROBE YOU BUILD, NOT ONLY TO THE SUITES.** A
previous round on this project launched a headed Electron probe and put windows on
the owner's desktop while they were working; the root cause was recorded as a
**commission omission**, so it is stated here deliberately. **A probe you cannot
run headless is declared UNRUN. It is never launched headed.** `xvfb-run -a` is the
fallback where the helper script does not fit. Any probe you build is **untracked,
`--retries=0`, and deleted afterwards**, with `git status --porcelain` empty and
`sha256sum` of the two protected files verified against `git show HEAD:` after
deletion — the discipline every leg in the results document already uses.

The gate exceeds a two-minute foreground limit. Run it detached and poll:

```
./tools/checks > /tmp/checks.log 2>&1; echo "REAL_EXIT=$?"
grep -cE "^> (eslint|prettier --check|tsc --noEmit|vitest run)" /tmp/checks.log   # must be 4
```

---

## 7. Hard constraints

- **NEVER MERGE.** The owner merges.
- **No `src/` change. No edit to any file under review.** Your critique lands as
  your own document. Keep the reviewer outside the artifact.
- **Do not revise the plan** — the plan-review track is closed.
- **Do not re-baseline a snapshot**, and do not edit
  `tests/baseline/expected-failures.json`, `tests/support/dsl/tabs.ts`,
  `tests/support/dsl/popup.ts` or `BackgroundCustomizer`.
- `ha.home.local` is **READ-ONLY**; `ha-test.home.local` is the writable one.
- ⚠ Never kill a process to free the MemPalace writer lease, and never set
  `MEMPALACE_MCP_ALLOW_PEER_WRITER`. **If your MemPalace write is refused — the
  normal case when author and reviewer run concurrently — put your notes in a
  `MemPalace drawer candidates` section at the end of your own review file** and the
  write-enabled author files them with `added_by="claude-sonnet"` (ruling MP-LEASE).

---

## 8. Your deliverable

1. Write it to
   **`docs/reviews/spacing-helper-repair-followup-sonnet-review.md`**.
2. Open with the three §3.1 header lines, naming the exact model:

   ```
   Author: Claude Sonnet 5
   Reviewer: (none — §3.4 scoped follow-up)
   Owner gate: micah / BaggyG-AU
   ```

3. **Run `npx prettier --write` on it before committing.** An unformatted review
   commit has taken this repository's gate red once already.
4. **Commit it AND PUSH it.** Two earlier rounds on this branch left the review
   commit local-only.
5. Add **only your own document** in that commit.
6. Structure: verdict first; the **per-finding disposition table** (F1/F2/F3); the
   regression and scope-control sweep; answers to Q1–Q8 with "no issue found"
   stated explicitly where that is the answer; then any new findings ranked most
   severe first under the **SEV 1–4** contract, each with evidence at `path:line`,
   the problem, a concrete fix, what must **not** change, and **class swept**.

## 9. Verdict form

One of: **CONFIRMS-REPAIR** (all findings resolved, no regression, scope held) /
**PARTIALLY-CONFIRMS** (name what is outstanding) / **CHANGES-REQUIRED** (a
regression, a defective fix, or an unresolved finding) / **SEV-1-BLOCKED**.

⚠ The owner reads the verdict and the Owner Decision Briefs. Write for a
**non-developer**: what it protects, what is going wrong plainly, whether the
product is affected, the options, your recommendation, and what happens if nothing
is done.
