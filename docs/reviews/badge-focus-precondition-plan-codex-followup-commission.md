# COMMISSION — Scoped follow-up of the badge-focus plan repair (STRAT-D7)

Author: Claude Opus 5 (1M context) — the plan author and repair author; an
interested party
Reviewer: OpenAI Codex / GPT-5.6 Sol (you — **the same reviewer** who returned
SEV-1-BLOCKED on round 1, per `docs/governance/OPERATING_AGREEMENT.md` §3.4's
same-reviewer rule)
Owner gate: micah / BaggyG-AU. This document decides nothing on its own.

This is the **scoped follow-up** required by
`docs/governance/OPERATING_AGREEMENT.md` §3.4 and ruling STRAT-D7 for the repair
of your round-1 findings BF-P1 to BF-P4. **Scope is the repair diff plus the
declared radius, nothing wider.** You are **not** re-reviewing the diagnosis,
the prohibition on a `src/` change, the four-call-site enumeration, or the rule
that the manifest rows stay until CI evidence and owner authorisation exist —
you checked all of those clean in round 1 and they are unchanged.

**The owner's profile (standing line — STRAT-D15).** The owner gate is held by a
**non-developer**. Write for the reader who actually rules. Anything routed to
the owner uses the **Owner Decision Brief**: what this protects in product terms
/ what is going wrong plainly / is the product affected Yes-No-Unknown with
honest evidence status / options with costs / recommendation and why / what
happens if you do nothing. **Never require the owner to classify a diff or apply
developer instinct.**

**Severity:** STRAT-D18, per `docs/templates/ADVERSARIAL_REVIEW.md` §4. SEV 1
requires the three-part proof (the decision or claim broken; the violated fact
or text at `path:line`; why no recorded mitigation covers it) — missing any part
is at most SEV 2.

**MemPalace (ruling MP-LEASE).** If your MemPalace write is refused by the
per-palace writer lease — the normal case when author and reviewer run
concurrently — put drawer candidates in a `MemPalace drawer candidates` section
at the **end of your committed review file**, and the write-enabled author files
them with `added_by="codex"`. ⚠ Never kill a process to free the lease and never
set `MEMPALACE_MCP_ALLOW_PEER_WRITER`.

**Execution rules — EVERYTHING HEADLESS**, quoted verbatim from the standing
rules:

> 1\. ⚠⚠ **EVERYTHING HEADLESS:** `bash tools/test-headless.sh <spec…>
--project=electron-e2e|electron-integration --workers=1`. MULTIPLE SPECS IN
> ONE INVOCATION WORK. 2. **INTEGRATION IS A SEPARATE PROJECT — run
> SEQUENTIALLY.** 3. **DO NOT RUN THE UNIT SUITE WHILE AN ELECTRON SUITE IS
> LIVE.**

A suite you cannot run headless is declared **UNRUN**; it is never launched
headed. `ha.home.local` is **read-only**. **No `src/` change, no manifest change,
no merge, no `[STATE]` update, no UAT card touched.** This is a docs-only diff:
nothing beyond the commands you judge warranted is owed, and anything you did
not run is declared UNRUN rather than quietly dropped.

---

## 0. Working practice this follow-up is held to

Quoted verbatim because you may have no MemPalace access, and a reviewer judges
against exactly what the prompt supplies.

1. **A finding is a sample, not the population.** Identify the CLASS the
   instance belongs to and sweep every member before reporting. "X is wrong" and
   "I checked all N; only X is wrong" are different reports, and only the second
   lets the author stop.
2. **No unverified universals.** "Only", "every", "all", "none" or any count is
   a measurement and needs the enumeration that backs it, attached to the claim.
3. **A check is evidence only for the property it exercises.** Before writing
   "verified", ask: if this claim were false, would what I ran have failed?
   ⭐ **And apply that to a clearance you RECEIVE, not only to a verification you
   write** — "RESOLVED" on a narrower check reads as clearance of the wider
   claim.
4. **A finding is a hypothesis.** Verify it against the source before reporting;
   quote `path:line`. Check whether what looks like an inconsistency is a
   deliberate decision recorded somewhere you were not shown.
5. **Silence is not a result.** State "no issue found" explicitly for every
   heading below, so the reader can trust the heading was checked. Zero findings
   is a PASS, never a failed review — do not manufacture one.
6. **Declare your evidence boundary.** UNVERIFIABLE is a result.
7. **The fix round is unreviewed new work.** It fails in two opposite
   directions: **under-reach** (fixing the named instance but not its class) and
   **over-reach** (asserting more than the finding required). A follow-up must
   dispose of each prior finding by name, sweep for regressions in areas
   previously clean, and check each fix stayed inside its own scope.
8. **A keyboard-reachability probe must pin three properties — DIRECTION, STATE
   and EXACT IDENTITY.** A repeated identifier is not an identity; compare the
   scoped locator or the node itself, not a lossy projection of
   `document.activeElement`. Prove a probe can fail on known-bad input before
   trusting a pass.
9. **An attack that FAILED is not a proof of safety, and the attack most likely
   to fail is the one whose MAGNITUDE is wrong.** The defeating case for a
   timing guard sits just **under** its own resolution, not at an extreme.

## 1. Expected state — STOP and tell the owner if any of this is untrue

- Branch `feature/badge-focus-precondition-plan`, off `main` = `2b9a7ca`.
- Four commits ahead of `main`: `90760cd` (plan revision 1), `a81fb78` (your
  round-1 review), `014ac1c` (revision 2), and one revision-3 commit on top.
- Clean worktree. **No commit amended.** No `src/`, test or manifest file has
  been touched by any of them — this is still **plan only, no code written**.
- `tests/baseline/expected-failures.json` still carries 9 `expectedFailures`
  (3 behavioural, including both `theme-no-effect-badge` keyboard rows),
  10 `expectedFlaky`, 21 `expectedSkips`.

## 2. What you review

**The repair diff** — `git diff 90760cd..HEAD -- docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md`,
i.e. revision 1 → revision 3, which is revision 2 (`014ac1c`, answering your
findings) plus revision 3 (answering the author's own pre-handover run of this
commission, recorded in the plan's §10).

**The declared radius** — the plan's §9 blast-radius statement. **Verify it
independently; a wrong or missing radius is itself a finding** (OA §3.4). It was
already corrected once: revision 2 declared two changed assertions where §4.2
changes three.

**Not in scope:** the diagnosis in §1–§2, the four-call-site enumeration, the
test-only decision, `e2e/spacing.spec.ts`, the merged bubble-card work, and
anything on `main`.

## 3. The questions — answer every one, including the ones that come back clean

**Q1 — BF-P1 (SEV 1, exact identity). RESOLVED or REGRESSED?**
The repair passes a caller-supplied, already-scoped badge locator into the
helper and asserts `toBeFocused()`. Does that actually close the bypass you
measured, or move it?

- **Under-reach:** is every member of the class converted? The class is every
  assertion in `expectReachableByTab` that claims a particular collapsed badge
  received focus. §4.2 now says **three** assertions change. Is three right —
  or is there a fourth surface that still decides something from a projection of
  `document.activeElement`?
- **The retained reader:** §4.2 keeps `activeElement` (`:132-140`) as a
  **diagnostics-only** reader feeding the third assertion's message. Does it
  gate anything? Is retaining it defensible, or should it be deleted?
- **Over-reach:** does the repair assert more than BF-P1 required?
- **The caller claim:** §4.2 now states that `:332` and `:439` hold a scoped
  locator in a variable while `:571` and `:577` build one inline and discard it,
  so those two need a new local. Verify all four.
- **Is "this closes R7-N1" earned?** R7-N1 prescribed three things: the scoped
  locator, `toBeFocused()`, and an explicit wait for popup closure. Are all
  three present, and does R7-N1's class extend beyond this one file?

**Q2 — BF-P2 (SEV 1, the transition leg). RESOLVED or REGRESSED?**
Your required repair had four parts: (a) hold the popup open and assert the
precondition's own failure; (b) a controlled delayed close below the guard
deadline, so old code fails and repaired code waits and passes; (c) start
closed, no added blocking; and (d) **"include an unrelated-open-popup case if
the owner selects the scoped guard"** — which the owner did.

- **Revision 2 dropped (d).** Revision 3 adds it as §6a case 4. Is the case as
  specified the one you asked for, and does it discriminate the scoped guard
  from the rejected document-global one in both directions?
- **Is case 2's mechanism executable as written?** §6a now specifies a page-side
  scheduled `keydown` Escape at `DELAY_MS = 4000` against a 5000 ms deadline.
  Will a bubbling native `keydown` dispatched on the input actually reach
  antd/rc-select's React handler and close the popup? If not, the plan's
  fallback carries a stated interleaving hazard — is the fallback sound?
- **Is the magnitude right?** 4000 ms against a 5000 ms deadline. Is that
  genuinely "just under the guard's resolution", or is there a crueller shape
  that would defeat the guard — and would the author's chosen value have failed
  to find it?
- **Does case 4 rest on an unmeasured assumption?** §8 admits that co-presence
  of the two Selects is measured but co-presence of their two open **popups** is
  not.

**Q3 — BF-P3 (SEV 2, the guard's scope and authority). RESOLVED or REGRESSED?**
The guard is now `aria-expanded="false"` on the owning combobox.

- **Is the causal chain sound?** §4.1 now argues: focus was retained on the
  input ⟹ the `Shift+Tab` was prevented ⟹ the only preventer is the option
  list's `case KeyCode.TAB:` … `if (open) { event.preventDefault(); }`
  (`OptionList.js:201-216`) ⟹ reached only through the `mergedOpen` gate
  (`BaseSelect/index.js:257-263`) ⟹ `mergedOpen` was true ⟹ `aria-expanded`
  read `"true"`. **This is the single load-bearing inference in the plan.**
  Attack it. Is there any path that retains focus on the input with `mergedOpen`
  false?
- Are the three dependency citations still exact at the installed versions
  (`@rc-component/select@1.5.0`, `trigger@3.8.1`, `motion@1.1.6`)?
- Does the scoped guard give up anything the document-global one had?

**Q4 — BF-P4 (SEV 3, the unexecuted tail). RESOLVED?**
`:575-581` unexecuted, `finally` at `:582-584` still running, and the
self-contradictory "a first green run may surface a third failure" wording
replaced. Verify against the file.

**Q5 — The declared radius (OA §3.4). Independently verify it.**
The plan's §9 now enumerates five touched surfaces plus a sweep command. Is that
complete and correct? Does anything else in the repo depend on
`expectReachableByTab`, on `activeElement`, or on the `theme-no-effect-badge`
test id in a way the radius does not name? **A wrong or missing radius is itself
a finding.**

**Q6 — Regression sweep on what round 1 checked clean.**
Re-check by name and location: the helper is still file-local with four call
sites; the change is still test-only; both traversal directions and the explicit
`.focus()` starting-point reset are preserved (§4.3); no retry or tolerance was
introduced around the precondition; the `6eb47d8` old-source control is retained
with its limit stated (§6c); both manifest rows are retained (§3, §7.5). Did the
repair break any of these?

**Q7 — Over-reach and internal coherence across the whole revision.**
Does any part of revision 2 or 3 assert more than the findings required, or
contradict another part of the same document? Revision 2 already shipped one
such inconsistency (§4.2 vs §9 on the number of changed assertions). §9's
disposition table, §5's blast radius, §6's harness and §8's weakest claims must
agree with each other and with §4. **Do they?**

**Your case list is a floor, not a ceiling.** These seven questions are what the
author could predict. Invent the cases he did not.

## 4. What the author already ran, and what that does and does not buy

The plan's **§10** records the author's own run of **this commission** against
revision 2, before it was handed over. It caught six items (S1–S6), all fixed in
revision 3, the largest being the missing unrelated-open-popup case at Q2(d).
**The commission was not softened afterwards** — every question above is in the
same words it was run in.

⚠ **Treat §10 as a claim to be checked, not as clearance.** A self-check that
failed to break something has not cleared it, and the author is an interested
party. If §10 overstates what it verified, that is a finding.

## 5. Deliverable

A committed document on this branch:
**`docs/reviews/badge-focus-precondition-plan-codex-followup-review.md`** —
never a chat reply, never an amendment to any existing commit or to the plan
itself.

Required shape:

1. **Verdict first**, in three sentences or fewer. The vocabulary is
   **ACCEPTS-REVISION** / **CHANGES-REQUIRED** / **SEV-1-BLOCKED**, and it must
   be unambiguous, because it is a hard gate: **implementation begins only on
   ACCEPTS-REVISION.**
2. **A per-finding disposition table** — BF-P1, BF-P2, BF-P3, BF-P4, each
   **RESOLVED** / **PARTIALLY RESOLVED** / **REGRESSED** / **OPEN**, with the
   new wording quoted and its citations re-checked.
3. **A regression and contradiction sweep** over the Q6 list.
4. **Method and evidence boundary** — what you read, what you ran with real
   output, and what you did not.
5. **A claim ledger** tagged MEASURED / INFERRED / JUDGEMENT, closing with your
   own weakest claims.
6. **Any new findings**, numbered BF-F1, BF-F2, …, each with severity and, at
   SEV 1 or SEV 2, an Owner Decision Brief in the six fields.
7. **Disagreements stated as disagreements** — never softened into partial
   confirmations. The owner arbitrates.
8. A **MemPalace drawer candidates** section if the lease refuses your write, or
   an explicit "none" if nothing generalises.

**Depth is proportional and you decide it inside this follow-up, not before it**
(D7-final). This is a docs-only diff and the designed cost is minutes rather
than hours for the parts that are records-only — but Q2 and Q3 turn on facts in
locked dependency source and on whether a specified harness can actually run, so
say plainly if they cost more.

⚠ **Do not approve to be agreeable, and do not manufacture a finding to justify
a pass.** Round 1 returned two SEV 1s and both were correct; the author accepted
every one without rejection. If revision 3 is right, say so plainly and let the
code be written.
