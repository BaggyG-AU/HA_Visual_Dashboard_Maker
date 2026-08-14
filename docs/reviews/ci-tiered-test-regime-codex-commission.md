# HAVDM Independent Review Commission — PR #143, the tiered test regime (Codex)

**Author:** Claude Opus 5, 2026-08-14
**Reviewer:** OpenAI Codex — independent, has not authored any of this branch
**Owner gate:** micah/BaggyG-AU arbitrates. This document decides nothing.
**Commissioned by:** owner · **Scope:** PR #143, branch
`feature/ci-tiered-test-regime`, commits `bb747cc..736c5c5` off `main` = `143f8c9`

**Governing rule — read this first.** `docs/governance/OPERATING_AGREEMENT.md`
§3 class (d) as ratified by PR #139 (`075241a`): **ONE FULL INDEPENDENT REVIEW
BEFORE MERGE. NO AUTOMATIC FOLLOW-UP ROUND.** The owner decides whether any
post-review change warrants re-review. **You get one pass — spend it on the
mechanisms, not on style.**

**Your write-restrictions (acknowledged on your behalf):** no `[STATE]` drawer
update; no UAT card marked or re-scored; no `src/` change; **no merge**;
`ha.home.local` read-only. Proposed changes go in your review document, nowhere
else.

**Where your MemPalace notes go (ruling MP-LEASE).** If MemPalace is absent, or
present with the **write** refused by the per-palace writer lease — the normal
case when author and reviewer run concurrently — record them in a
`MemPalace drawer candidates` section at the **end of your own review file**,
not in the PR body, and the write-enabled author files them with
`added_by="codex"`. ⚠ Never kill a process to free the lease and never set
`MEMPALACE_MCP_ALLOW_PEER_WRITER`.

---

## 0. Working practice this review is held to

These are cross-project `practice` wing rules. They are **quoted verbatim, not
cited**, because you may have no MemPalace access and a reviewer judges against
exactly what the prompt supplies.

1. **A finding is a sample, not the population.** When you find a defect,
   identify the CLASS it belongs to — all rows of that table, all call sites,
   all specs of that kind — and sweep every member before reporting. Say which
   you did: "L12 is misclassified" and "I checked all 15 legs; only L12 is
   misclassified" are different reports, and only the second lets the author
   stop. Reporting instances one round at a time makes you an expensive linter.
   ⭐ **AND: a mechanical sweep is only as good as the key it is keyed on —
   grepping the TOKEN the first instance used is not a sweep of a class defined
   by what its members DO. State the class as a behaviour before choosing a
   search key, and corroborate a token grep by reading the surface end to end.**
2. **No unverified universals.** "Only", "every", "all", "none" or any count is
   a measurement and needs the enumeration that backs it, attached to the
   claim. A count of containers is not a count of contents — the command you
   ran must measure the property you are asserting.
3. **A check is evidence only for the property it exercises.** Before writing
   "verified", ask: if this claim were false, would what I ran have failed? A
   green suite proves nothing if the tests were written to agree with the code;
   an isolated pass says little about a flaky path; confirming the wiring is
   not confirming that a value flows through it. ⭐ **And apply the same
   question to every clearance you RECEIVE, not only to every verification you
   WRITE — "RESOLVED" on a narrower check reads as clearance of the wider
   claim.**
4. **Verify each finding against the source before reporting it.** Quote
   `path:line`. A finding you cannot locate is a question, and should be
   written as one. Check whether the thing you are calling an inconsistency is
   a DELIBERATE decision recorded somewhere you were not shown — say so if you
   suspect it rather than asserting a defect.
5. **Silence is not a result.** State "no issue found" explicitly for every
   heading you were asked to cover, so the reader can trust the heading was
   checked. Zero findings on a mature artifact is a PASS, not a failed review —
   never manufacture a finding to justify the pass.
6. **Declare your evidence boundary:** what you could not run, could not reach,
   or could not verify. `UNVERIFIABLE` is a result; a quietly dropped claim is
   not.

Two further rules bear directly on this change, quoted in full because the
claims below are exactly the kind they govern:

7. **A changed-file list is a FLOOR for a reading pass, not the POPULATION of a
   semantic universal.** _"version control tells you which files you changed. It
   cannot tell you which files you SHOULD have changed, and it cannot name a
   member of your claim's class that is not a file in that repository at all.
   Before writing 'all', 'every', 'none', 'only' or a count, do two things the
   changed-file list cannot do for you: (1) NAME THE POPULATION SOURCE — the
   independent enumeration the member list came from, as a command, a file, or
   an explicit labelled hand trace, because 'from memory' is not a source; and
   (2) ASK THE EXTERNAL QUESTION EXPLICITLY AND WRITE THE ANSWER DOWN — can a
   member of this class live somewhere that is not a file in this repo? Then
   list those members, or record 'external members: none, because …' with the
   reason."_ Candidate homes for an external member: a pull-request or issue
   body; a code-review comment; a memory or knowledge store; a wiki or docs
   site; a dashboard or ticket; configuration in another repository; a message
   already sent; and **a file in THIS repository that this work never touched.**
8. **A keyboard-reachability claim needs SEQUENTIAL NAVIGATION, not `focus()` —
   and the probe that replaces it measures a DIRECTION.** _"`.focus()` lands on
   elements outside the tab order, so it cannot fail when the claim is false;
   `tabIndex="0"` is necessary and not sufficient. Focus a REAL preceding
   element, send the actual key, assert on `document.activeElement` — then STATE
   WHICH ELEMENT YOU STARTED FROM AND WHICH WAY YOU WENT."_ ⚠⚠ _"A target
   rendered BEFORE its own control is unreachable by forward `Tab` from that
   control and trivially reachable from the one before it."_ **This one matters
   because two of the three new CI failures are `Shift+Tab` reachability legs —
   see §3.**

---

## 1. What this PR does

Moves the regression suites off the maintainer's machine onto GitHub Actions as
a four-tier regime, and replaces "Playwright's exit code" with an explicit
signature check as the definition of green.

| Tier | Trigger                                     | Contents                                                            |
| ---- | ------------------------------------------- | ------------------------------------------------------------------- |
| T0   | before push                                 | `./tools/checks` (local)                                            |
| T1   | every PR push                               | `ci.yml`: lint/format/typecheck/unit/build + `--only-changed` specs |
| T2   | PR labelled `full-suite` / ready-for-review | `test.yml`: full behavioural, sharded 4×                            |
| T3   | nightly 18:00 UTC                           | T2 + un-sharded visual job + red-nightly issue                      |

**Background you need:** the previous `test.yml` ran nightly and was broken for
seven months — 168 runs, 160 cancelled, last success 2026-01-09 — because of a
30-minute timeout, a `windows-latest` runner against `-linux` baselines, and
`continue-on-error: true` on both test steps.

## 2. Required reading

- `.github/workflows/test.yml` and `.github/workflows/ci.yml` — the whole files,
  comments included; several comments carry measurements that are load-bearing.
- `tools/check-suite-signatures.cjs` — the gate.
- `tests/baseline/expected-failures.json` — the manifest it reads.
- `playwright.config.ts` — reporter selection under CI.
- `docs/testing/TESTING_STANDARDS.md` — the tier table and the corrected claims.
- The PR body of #143, **which is a member of several claim populations and is
  not in any `git diff`.**
- Run `31802864528` (the first full sharded run) and run `31802420811` (the
  failed one that disproved an author claim).

## 3. What I most want attacked

Ordered by where I think the work is weakest. **This list is a FLOOR, not a
ceiling — on a previous PR an auditor found a further defect in under an hour
by trying a case the author's list did not name.**

1. **Can `check-suite-signatures.cjs` PASS a run it should FAIL?** This is the
   whole gate. Attack the ACCEPTING side, not the rejecting side. I found two
   holes myself (§4); assume there are more. Specifically: what does it do with
   a test that appears as `flaky` when it should be `unexpected` (retries are
   2 in CI, so a genuine regression that passes on retry is **reported, not
   blocking** — is that defensible?); a report with zero suites; a manifest
   entry whose `titlePath` is subtly wrong; a shard that uploads an EMPTY blob.
2. **`continue-on-error: true` still appears on the shard test steps.** I argue
   this is categorically different from the blanket one that killed the old
   nightly, because the signature check now decides. **Attack that argument.**
   Is there a failure mode where every shard errors, the merge job still runs,
   and the check passes anyway?
3. **The `@visual` partition.** I claim 17 files, 19 tests, and that the six
   visual canonical failures are all inside it. **Enumerate it yourself, with
   your own key** — do not trust my counts or my `--list` output. Rule 1's
   wrong-key hazard applies: I keyed on `*-snapshots` directories first, which
   is a token, not a behaviour.
4. **The three NEW failures the first real run surfaced**, and whether my
   attribution is self-serving. I assert they are pre-existing-on-Linux and not
   caused by this PR, on the grounds that it changes no `src/` and no
   assertions. **I am the author; that is not evidence.** They are:
   `e2e/bubble-card.spec.ts` (a `toMatch`), and two
   `integration/theme-no-effect-badge.spec.ts` legs failing
   `Shift+Tab out of the combobox must land on the badge`. ⚠ Rule 8 above is
   directly on point, and so is open finding **R7-N1** (`expectReachableByTab`
   compares only `data-testid`, an id repeated across all eight render
   contexts). **Is this the R7-N1 defect surfacing, a genuine environment
   difference, or something this PR did?**
5. **The claim that no CI-behaviour statement anywhere is still false.** I swept
   for present-tense claims about what CI executes and corrected four sites in
   `TESTING_STANDARDS.md` (the fourth, a coverage table asserting
   `CI blocks merge if below`, I found only by asking where my population came
   from). **Re-derive the population by ROLE and check for a fifth** — and
   remember the PR body and the MemPalace drawers are members that no
   `git diff` can show you.
6. **Tier 1's vacuous pass.** Measured: a `src/`-only change selects
   `Total: 0 tests in 0 files`. I made it visible rather than fixed it. **Is
   visibility enough, or is a green T1 on a `src/` change still a
   certified-nothing gate of the PR #140 M2 kind?**
7. **The `--min-tests` floors (550 behavioural / 18 visual).** Are they placed
   where a real truncation would actually cross them? Is a floor the right
   instrument at all?
8. **The notify job** (`test.yml`, schedule-only, one reopened issue). Never
   executed. Can it spam, or fail silently, or fire on the wrong event?

## 4. What I already ran against this commission, and what it found

Per the rule that _"the review commission you write is the checklist you owe
yourself — and writing it down is not running it"_, I executed this list against
my own work first. **It found two real defects, both now fixed. Both would have
been your findings.**

- **§3.1 → a doubled report PASSED.** A merged report whose suites appear twice
  printed `unexpected failures: 2 (manifest expects 1)` and then
  `✅ Suite signature check passed`. Cause: set comparison keyed on
  `file › titlePath` collapses duplicates in a Map, and `--min-tests` is a
  floor — it bounds a report that is too SMALL, never one too BIG. Fixed in
  `b417709` with a duplication guard (keyed including the project, since two
  Playwright projects can match one spec path) and a count guard. ⚠ **My first
  attempt at this fixture was built on a stale `results.json` that a later
  `--list` had overwritten; it "passed" for the wrong reason.** That is the
  known hazard of trusting a silent result, and I only caught it because the
  test count was implausible.
- **§3.6 → tier 1 certifies nothing for a `src/` change.** Measured
  `Total: 0 tests in 0 files`, both projects. Made visible in `736c5c5`;
  **not** fixed. Named as an open owner decision.
- **§3.3 → the `@visual` population holds under a second key.** Re-enumerated
  by behaviour (specs reaching any of 11 DSL screenshot methods or a direct
  `toHaveScreenshot`/`toMatchSnapshot`) rather than by snapshot directory. Both
  keys return the same 17 files.
- **§3.1 → six other legs proven red-before-green**, in this checkout: green→0;
  extra failure, vanished expected failure, changed reason class, duplicated
  report, missing report, truncated report → 1. Re-verified against the REAL
  merged reports from run `31802864528`, not only fixtures.

**The commission is handed over unweakened.** Nothing was removed from it after
those fixes.

## 5. Measurements you should try to falsify

| Claim                     | Value                                                                     | How I measured it                                      |
| ------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------ |
| Behavioural population    | 561 (306 e2e + 255 integration)                                           | `--list`; shards sum 165+116+155+125                   |
| `@visual`                 | 19 tests, 17 files                                                        | `--grep @visual --list`; 19+306=325 = full e2e project |
| Full run wall-clock       | **25m51s**                                                                | run `31802864528`; shard 3 alone 25m10s                |
| Why shard 3 dominates     | `integration/entity-browser.spec.ts` = 10.5m                              | its own `Slow test file:` line                         |
| Visual on `ubuntu-latest` | 12 passed / 1 skipped / 6 failed, **exactly the manifest set**            | run `31802864528`, job `visual`                        |
| Local gate                | `REAL_EXIT=0`, 4/4 steps, 0 errors / 145 warnings, 1413 tests / 104 files | `./tools/checks` at each commit                        |

⚠ **I projected ~15 min and measured 25m51s. Treat every other projection here
with the same suspicion.**

## 6. Verdict format

`APPROVE` / `CHANGES-REQUIRED`, with each finding marked **MERGE-BLOCKING** or
**NON-BLOCKING**, and each carrying `path:line` plus the class sweep behind it.
State explicitly, for every heading in §3, either the finding or "no issue
found". End with your evidence boundary and a
`MemPalace drawer candidates` section.
