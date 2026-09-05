Author: Claude Opus 5 (1M context)
Reviewer: OpenAI Codex (GPT-5.6 Sol)
Owner gate: micah / BaggyG-AU

# Repair dispositions — PR #154 plan-consistency checker

One dated section per round, appended and never rewritten (OA §3.4).

---

## Round 1 — 2026-09-03, answering `plan-consistency-checker-codex-review.md` (SEV-1-BLOCKED, `94aee56`)

**Owner ruling, 2026-09-03: option B, with C3's heuristic half demoted to
ADVISORY.** The review's own Owner Decision Brief offered (A) merge as-is,
(B) repair and narrow C3, (C) demote C3 to advisory. The owner took **B for the
decidable half and C for the heuristic half**, after a measurement showed pure B
neither fully cleared F2 nor left F4 where it found it — see the pre-decision
evidence below.

### ⚠ Why pure B was not taken — measured before any code was written

Option B was built in a throwaway worktree and exercised against the real
documents. Two results decided the owner's split:

| Case (repaired-under-pure-B code)                           | Result          | Meaning                              |
| ----------------------------------------------------------- | --------------- | ------------------------------------ |
| canonical block + QUOTED `"six review rounds complete"`     | **CLEAN**       | F2's fail-open **survives** pure B   |
| canonical block + `the eleventh review round` / `the 11th`  | **CLEAN**       | F2's fail-open **survives** pure B   |
| canonical block + ONE historical `Across two review rounds` | `C3-COUNTDRIFT` | F4 gets **worse**: 1 sentence blocks |

**F2 and F4 are the same root cause.** C3 tries to decide semantically what a
number is _about_; every repair in one direction opens the other. Counting the
canonical block as a site necessarily lowers the false-positive threshold on the
same counter. So the claim was narrowed rather than the regex grown.

### Dispositions

| ID     | Sev | Disposition             | What was done                                                                                                                                                                                                                                           |
| ------ | --- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F1** | 1   | **RESOLVED**            | The live gate is an ordinary `it` with unconditional reads of all three inputs; a missing input throws naming the path and telling the reader to update the test in the same commit.                                                                    |
| **F2** | 1   | **RESOLVED (narrowed)** | The marked `plan-running-totals` block is parsed, required to exist **exactly once** (`C3-NOCANONICAL`, blocking), and counted as site #1. The prose-frame half is now **advisory** and its two measured blind spots are pinned as `KNOWN-OPEN:` tests. |
| **F3** | 1   | **RESOLVED**            | C4 fails closed on a missing section, zero parsed steps, no helper step, or **duplicated** helper/leg anchors, via the **distinct** code `C4-UNVERIFIABLE`.                                                                                             |
| **F4** | 2   | **RESOLVED**            | Prose-derived `C3-COUNTDRIFT` is advisory, so the measured false positive is reported and **cannot block**. Pinned by a control asserting both halves.                                                                                                  |
| **F5** | 3   | **RESOLVED**            | The disposition-row regex accepts optional `**`/`_` emphasis. Two controls prove the bold form still disposes and a genuinely undispositioned finding still fires.                                                                                      |
| **F6** | 3   | **ACKNOWLEDGED**        | The **claim** was narrowed, not the code. C1 measures textual incoming calls; the message now says "has NO TEXTUAL CALLER" and the comment states that reachability needs a call graph this deliberately is not. Pinned by a `KNOWN-OPEN:` test.        |

### Fail-against-old evidence — every new blocking control proved live

The repaired spec was run against the **pre-repair implementation** at `94aee56`
(with a one-line `blockingFindings` shim so it could import). **9 of the 16 new
tests failed against old**, and they are exactly the 9 that must:

```
× F2: FIRES when the canonical totals block is MISSING
× F2: FIRES when the canonical totals block is DUPLICATED
× F2: the canonical block counts as a SITE — block + ONE prose restatement is drift
× F3: FIRES when the implementation section is ABSENT
× F3: FIRES when the section exists but no HELPER step does
× F3: FIRES when the nested list is FLATTENED to zero parsed steps
× F3: FIRES when the helper anchor is DUPLICATED — the order is then ambiguous
× F5: a disposition row disposes WITHOUT bold emphasis
× KNOWN-OPEN: C3 prose matches are ADVISORY, so a false positive cannot block
   (9 failed | 31 passed)
```

The **seven** that passed against old are correct to pass: the two F5
sanity-controls and the `CONTROL: exactly ONE canonical block` prove the new
controls are not vacuous in the other direction; the three `KNOWN-OPEN:` pins
assert **unchanged** behaviour by design; and `F3: CONTROL — a MISSING leg 1 is
deliberately NOT unverifiable` pins the boundary the repair deliberately drew.
⚠ This sentence said "six" and omitted the missing-leg control until the
follow-up review's R3 corrected it — a count edited by hand while the
enumeration behind it was left alone, which is the exact defect C3 exists to
catch, committed in the document describing C3's repair.

**F1 was proved separately**, because its discriminator is a missing file rather
than an input: with `SPACING_HELPER_PRESET_PLAN.md` renamed, the **old** spec
reported `23 passed | 1 skipped` and **exited 0**; the repaired spec fails with
`the live plan gate requires docs/testing/SPACING_HELPER_PRESET_PLAN.md, which is
missing`.

### Blast-radius statement (OA §3.4)

**Upstream reliances.** `tests/support/planConsistency.ts` is imported by exactly
one consumer — its own spec. Regenerate:
`grep -rn "planConsistency" --include=*.ts . | grep -v node_modules`.
It reads three files: `docs/testing/SPACING_HELPER_PRESET_PLAN.md`, its
`_HISTORY` companion, and `tests/support/dsl/spacing.ts`.

**Downstream consumers.** `./tools/checks` (via Vitest) and CI's `ci` job. No
`src/`, no Electron, no e2e/integration spec, no snapshot, no baseline manifest
and no governance text is touched. `git diff --name-only 94aee56..HEAD`.

**Measured non-regression.**

- Neither plan document was edited. The live plan already carries exactly one
  canonical block (`SPACING_HELPER_PRESET_PLAN.md:521`) and C4's anchors are
  present (helper at step 3, leg 1 at step 4), so **no new code fires on the live
  documents** — verified with the real `checkPlan` before writing the repair.
- All **24** pre-existing tests still pass, unchanged. Two would-be regressions
  were caught before writing: counting the canonical block **per key** would have
  fired on the live plan on day one, because it declares both
  `reviewer_findings` and `findings_after_round_one` — it counts **one site per
  subject**; and reusing `C4-SEQUENCE` for fail-closed structure would have broken
  the committed `NOT leg 1` negative fixture, so `C4-UNVERIFIABLE` is a distinct
  code.
- Unit population **1437/105 → 1453/105** (+16 controls, no new file).
- Gate at the repair commit: `REAL_EXIT=0`, 4/4 steps, lint 0 errors / 145
  warnings, **1453 passed / 105 files**.

**Accepted operational cost, stated rather than buried.**
`SPACING_HELPER_PRESET_PLAN.md` is now **permanently load-bearing**: retiring or
renaming it fails `./tools/checks` until the same commit updates this spec. That
is the intended consequence of a lifecycle-bound input, and the thrown message
says so to whoever hits it.

### What this repair does NOT establish

- **C3 no longer claims to detect prose restatements.** It blocks only on the
  canonical block's existence and uniqueness. A second home stated inside quotes,
  or written in a number form `numberFrom` cannot parse, is **not detected** —
  both are pinned as `KNOWN-OPEN:` tests rather than described in prose.
- **C1 does not decide reachability**, and no longer implies it.
- The `KNOWN-OPEN:` tests assert **current** behaviour. Anyone who closes one of
  those holes breaks the test and must correct the claim in the same commit.
- **A MISSING leg 1 is deliberately not treated as unverifiable**, though the
  review's required correction named it. A plan may legitimately schedule no
  leg 1, and the committed `NOT leg 1` negative fixture asserts exactly that;
  firing there would have broken it. Absence of the **helper** is the
  unverifiable case, because C4's whole question is whether the helper came
  first. Both halves are pinned by controls. **This is a deliberate narrowing of
  the required correction, not an oversight — reopen it if you disagree.**

---

## Round 2 — 2026-09-03, answering `plan-consistency-checker-codex-followup-review.md` (SEV-1-BLOCKED, `7909c6f`)

The follow-up confirmed F1, F3, F4, F5 RESOLVED and F6 ACKNOWLEDGED-SUFFICIENT,
and **withdrew its own round-1 demand** that a missing leg-1 anchor make C4
unverifiable — the narrowing this table proposed was upheld. It marked **F2
REGRESSED / STILL OPEN** and raised R1 (SEV 1), R2 (SEV 2) and R3 (SEV 3).

### ⚠⚠ Why round 1's repair failed, stated before the fix

All three findings are **one error wearing three faces: the author verified the
property implemented, not the property claimed.**

- **R1** — the code enforced _"the marker `# plan-running-totals` occurs exactly
  once"_; the claim was _"the canonical block exists exactly once and declares
  its governed keys"_. Marker-cardinality is a count of **containers**; the claim
  was about **contents**. That is the founding case study of this project's own
  claims rule, reproduced inside the checker built to catch it.
- **R2** — the code implemented a **filter** and the contract claimed a
  **reporting channel**. `blockingFindings` made advisories not block; nothing
  made them reported. The word "reported" was written in the type comment and
  never built.
- **R3** — the counts were edited by hand (8→9, 14→16) and the enumeration
  explaining them was not. A count beside the list it summarises drifts on the
  next edit.

**Why round 1's controls could not have caught it.** All three F2 controls varied
ONE axis — marker count — which is the same axis the implementation keyed on. The
control set and the code were keyed on the same dimension, so the controls could
only confirm the axis already thought of. The class was never stated as a
behaviour before a key was chosen.

**Why the author's own double-check also missed it.** Its hostile population was
**inherited entirely from the round-1 review**. No new adversarial input was
generated for code that was newly written, so no finding on the list could have
covered a validator that did not exist when the list was made. The fix round is
unreviewed new work, and it was checked against the previous work's findings.

### Dispositions

| ID     | Sev | Disposition  | What was done                                                                                                                                                                                                                                                                        |
| ------ | --- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **R1** | 1   | **RESOLVED** | The marker regex is replaced by a **line-based fenced-block parse**: an opening fence is required, the marker must be the block's first content line, the fence must close, each governed key must appear **exactly once**, and any **unfenced** marker outside a fence invalidates. |
| **R2** | 2   | **RESOLVED** | `reportAdvisories(findings, log = console.warn)` is a real delivery path returning how many it surfaced; the live gate calls it on every run. The control exercises the **consumer**, asserting a visible diagnostic **and** that the gate still passes.                             |
| **R3** | 3   | **RESOLVED** | Six → seven, and the omitted `F3: CONTROL — a MISSING leg 1` is now named in the round-1 section, with a note recording why the miscount happened.                                                                                                                                   |

### The method change, and the defect it found that no review contained

The hostile population for R1 was generated **from the grammar itself** rather
than from the review's finding list — 23 cases across fence forms (backtick,
tilde, four-backtick, indented, untagged), marker position, key shape
(commented-out, substring, outside-the-block, indented), cardinality, and
termination.

⭐⭐⭐ **That found a fail-open present in NO review: an UNFENCED SHADOW HOME.**
With the real block intact, appending an unfenced `# plan-running-totals` plus
all three governed keys stating `99/88/77` returned **CLEAN** — a parser that
only _finds_ fenced blocks cannot _see_ an unfenced one. It is now detected and
pinned by a committed control. **Final adversarial result: 23 ok, 0 FAIL.**

### Fail-against-current evidence, with the non-discriminators named

⚠ **CORRECTED (C3 parser plan revision 3, §2.6): the total below was
originally published as 12 failed / 45 passed and was not reproducible.**
Measured in a disposable detached worktree at `69f458c` with the `6420bb4`
spec copied in and nothing else changed: **14 failed / 43 passed (57)**. The
12 failures below are the R1 grammar controls — empty payload, each of three
governed keys missing, each of three duplicated with a conflicting value, the
unfenced shadow home, marker-not-first-line, key-outside-the-block,
key-commented-out, and the substring control. **The two extra failures are
`TypeError: reportAdvisories is not a function`**, in
`reports no BLOCKING finding against the live plan` and
`R2: the gate PATH surfaces an advisory on a PASSING run`. The original 45
counted those two `TypeError`s silently as passes; 12/45 is reproducible only
after backporting the complete `advisoryFindings` + `reportAdvisories`
implementation, which supplies the very function R2 is about — a
compatibility substitution, not a reproduction of `69f458c` as committed.

⚠ **Four new controls do NOT discriminate, and are not counted as if they did:**

- **Two are controls meant to pass** — the well-formed block, and a prose mention
  of the marker not being a home.
- **Two pass against `69f458c` for the wrong reason** —
  `unfenced (no opening fence)` and `fence never closed` already emit
  `C3-NOCANONICAL` there, because the old regex found no match at all. They are
  correct assertions of the new behaviour and are **not** old-vs-new
  discriminators.
- **The R2 control cannot pass against `69f458c` as committed.** `reportAdvisories`
  does not exist at that commit. ⚠ **CORRECTED: this was originally described
  as "the spec would not compile", which understates the evidence.** Measured
  under Vitest/Vite SSR: it **compiles, runs, and fails at runtime** with
  `TypeError: reportAdvisories is not a function` — a stronger discriminator
  than a structural claim, and the one counted in the 14/43 total above.
  Shimming the function in would supply the very thing under test, so its
  discriminator is the function's absence, stated rather than dressed up as a
  passing test.

### Blast-radius statement (OA §3.4)

**Upstream reliances.** `tests/support/planConsistency.ts` has exactly one
consumer in the repository — its own spec:
`grep -rln "planConsistency" --include=*.ts . | grep -v node_modules`. It reads
`docs/testing/SPACING_HELPER_PRESET_PLAN.md`, its `_HISTORY` companion, and
`tests/support/dsl/spacing.ts`.

**Downstream consumers.** `./tools/checks` via Vitest, and CI's `ci` job. No
`src/`, no Electron, no e2e/integration spec, no snapshot, no baseline manifest,
no governance text.

**Measured non-regression.**

- **Neither plan document was edited** —
  `git diff --quiet 7909c6f -- docs/testing/SPACING_HELPER_PRESET_PLAN.md docs/testing/SPACING_HELPER_PRESET_PLAN_HISTORY.md`.
- The live plan stays clean. ⚠ The marker **also appears in live prose at
  `SPACING_HELPER_PRESET_PLAN.md:14`** inside an inline code span; the
  stray-marker rule correctly ignores it, and a control pins that.
- All 41 prior tests pass unchanged.
- Unit population **1453/105 → 1470/105** (+17 controls, no new file).
- Gate at the repair commit: `REAL_EXIT=0`, 4/4 steps, lint 0 errors / 145
  warnings, **1470 passed / 105 files**.

**A behaviour change the owner should see, not discover.** A plan that documents
an **example** totals block now blocks, because two fenced blocks are genuinely
ambiguous. Ordinary prose edits and new historical sentences stay clean —
measured. If that trade is wrong, the remedy is to mark the example block with a
different marker, not to loosen the grammar.

**An asymmetry introduced deliberately.** The canonical-block rules scan only the
**plan**, not the history. The history names the marker three times in prose. A
future change that extends the scan to the history owes the same stray-marker
care this round added.

### What this repair does NOT establish

- C3 still blocks only on the canonical block's grammar. **Prose interpretation
  remains advisory**, and its two blind spots — a second home inside quotes, or
  in a number form `numberFrom` cannot parse — remain pinned as `KNOWN-OPEN:`.
- C1 still does not decide reachability.
- The grammar was attacked with 23 constructions. That is a **tested population,
  not a proof**; a construction nobody thought of is not excluded.
