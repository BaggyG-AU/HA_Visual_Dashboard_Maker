Author: Claude Opus 5 (1M context) — ⚠ Round 1 was originally drafted under an incorrect model invocation and has since been independently re-derived; see **Round 1 attribution correction and independent ratification** below
Reviewer: Claude Sonnet 5 (scoped follow-up owed under `docs/governance/OPERATING_AGREEMENT.md` §3.4 — see Round 1 note below; not yet run)
Owner gate: micah/BaggyG-AU

# Repair dispositions — PR #155 (spacing DSL Select-targeting repair, implementation review)

Per Operating Agreement §3.4 (STRAT-D7): the author answers every finding in a
committed disposition table regardless of whether a repair is made. One dated
section per round, appended, never rewritten.

## Round 1 — 2026-09-03

⚠⚠ **Read the attribution correction at the end of this file before relying on
this section.** Round 1 was executed under an incorrect model invocation (the
session ran as Claude Sonnet 5, not Claude Opus 5). Its content has since been
independently re-derived and adopted by a fresh Claude Opus 5 session, with one
over-reach corrected. The section below is left as it was written, as the record
of what happened.

Review: `docs/reviews/spacing-helper-implementation-sonnet-review.md`
(verdict APPROVE, no SEV-1; two SEV-2 findings and one SEV-3 finding, all
explicitly non-blocking).

| Finding                                                                                                                                                                                   | Severity | Disposition  | Repair                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1 — §10 condition 2's HALT-bearing class-smoke check had no record in `SPACING_HELPER_HARNESS_RESULTS.md`, only in commit `82c0e49`'s message (authored by the disqualified plan author) | SEV 2    | **REPAIRED** | Re-ran the check independently (see below) and added §1.1 to `docs/testing/SPACING_HELPER_HARNESS_RESULTS.md` recording it with the same rigor as legs 0–9                              |
| F2 — leg 1b's sentence overstated how closely it mirrors the real failing spec's call sequence (it matches control order, not the settling-wait-inclusive timing)                         | SEV 2    | **REPAIRED** | Narrowed the sentence in §3 of `SPACING_HELPER_HARNESS_RESULTS.md` to distinguish control-order match from full-sequence match, and recorded the reviewer's own n=1 probe result inline |
| F3 — leg 4 is labelled FAIL-OLD/PASS-NEW in the plan's §6 kind table but never differentiates CURRENT from REPAIRED (PASS/PASS on a clean panel)                                          | SEV 3    | **REPAIRED** | Added leg 4 to the exclusion sentence in §3 of `SPACING_HELPER_HARNESS_RESULTS.md` alongside leg 1                                                                                      |

**Why repair rather than acknowledge-only, for all three.** The review states
plainly that none of the three findings casts doubt on the repair's
correctness, and frames F1/F2 as things "the owner can take or leave." I
repaired anyway because all three concrete fixes are: (a) named exactly by the
review's own "Concrete fix" text, so applying them is not manufacturing work
the review didn't ask for; (b) cheap — F1 was a few minutes of re-running a
headless check, F2 and F3 were one sentence and one clause; and (c) the
project's own standing practice (`drawer_practice_artifacts_0980f7d1e9518c30709a13d5`
in the MemPalace `practice` wing — "a hand-maintained consistency surface
needs a generated check... the PR body is the canonical ungated surface", and
this project's own review history in `drawer_havdm_investigations_af5c30f599857a339615114b`
and elsewhere — has repeatedly paid real cost for exactly this class of gap:
a claim that reads as settled because it appears in confident prose without a
corresponding entry in the evidence surface actually reviewed. F1 in
particular is the same failure mode by name (the review's own §4 text: "This
is exactly the failure mode Q2 asks about"). Leaving all three
acknowledged-only when the fix was already handed to me in full would have
been the cheaper path for no articulable reason other than avoiding the
scoped follow-up review this repair now owes (see below) — that is not a
legitimate reason to decline a fix the review itself recommended.

**F1 — re-measurement (not a copy of the disqualified author's claim).** I did
not simply transcribe commit `82c0e49`'s message into the results document —
that would have repeated exactly the defect F1 identifies (evidence living
only in prose from an interested party). I built a new, independent, untracked
probe (`tests/e2e/_class_smoke_probe.spec.ts`, same harness exception as the
legs already in the document: headless via `bash tools/test-headless.sh
tests/e2e/_class_smoke_probe.spec.ts --project=electron-e2e --workers=1
--retries=0`, deleted after use) that opened each of the four spacing Selects
in turn from the app's pre-satisfied starting state, asserted each one's own
`.<testid>-popup` class matched exactly one `.ant-select-dropdown` node and
was not also present on any other visible popup, then — after all four had
been opened once — counted DOM nodes per class and the union across all four.
**Result:** `{"spacing-margin-mode":1,"spacing-margin-preset":1,"spacing-padding-mode":1,"spacing-padding-preset":1}`,
total distinct nodes across all four classes = **4**. No missing, duplicate,
shared or swapped mapping — condition 2 is satisfied, independently
re-measured rather than taken on the commit message's word. Verified after
deletion: `git status --porcelain` empty, `git diff HEAD -- src/ tests/`
empty, `sha256sum` of both changed files identical to `git show HEAD:` for
each (the same discipline the author's original harness and the reviewer's
own probe both used).

**Blast-radius statement (covers all three repairs — same file, same commit):**

- **Upstream reliances:** none. No rule text, template, code, or other
  document consumes the edited prose in `SPACING_HELPER_HARNESS_RESULTS.md`.
  `docs/testing/SPACING_HELPER_PRESET_PLAN.md` §10 (the binding contract) is
  untouched — the repair adds evidence and clarifies wording, it does not
  reinterpret or revise the contract. The plan-review track stays closed.
- **Downstream consumers:** readers of the results document — the owner, and
  any future reviewer checking this branch's acceptance evidence. The PR
  body's own leg-1b/leg-4 prose is a separate surface and was not edited in
  this round (out of scope for this task; the review's own Q9 sweep found no
  defect in the PR body's claims, and neither F2 nor F3 named the PR body).
  `SPACING_HELPER_PRESET_PLAN.md` §7.5's running-totals block does not draw on
  this document's prose and needed no change.
- **Governed rule surfaces:** none touched. Only `docs/testing/SPACING_HELPER_HARNESS_RESULTS.md`
  changed; `src/components/SpacingControls.tsx` and
  `tests/support/dsl/spacing.ts` are byte-identical to `HEAD` before and after
  (verified by `sha256sum` above), and no snapshot, `tests/baseline/expected-failures.json`,
  `tests/support/dsl/tabs.ts`, `tests/support/dsl/popup.ts`, or
  `BackgroundCustomizer` was touched.

**Evidence, measured after the repair:**

- `npx prettier --write docs/testing/SPACING_HELPER_HARNESS_RESULTS.md` → unchanged (already
  clean).
- `./tools/checks > checks.log 2>&1; echo REAL_EXIT=$?`, run detached and
  polled — **REAL_EXIT=0**, 4/4 steps
  (`grep -cE "^> (eslint|prettier --check|tsc --noEmit|vitest run)"` → 4), lint
  **0 errors / 145 warnings**, unit **1413 passed / 104 files** — identical to
  the figures both the author's original commit and the reviewer's
  independent run already established; a docs-only repair moved nothing.

**What was deliberately not changed** (per the review's "must not change"
rails, all three findings): `docs/testing/SPACING_HELPER_PRESET_PLAN.md`
(plan-review track closed under the owner's stop rule); the two-line `src/`
change; `tests/support/dsl/spacing.ts`; leg 1b's or leg 4's actual measured
results (PASS/FAIL values unchanged — only the surrounding prose was
narrowed/extended); `tests/baseline/expected-failures.json`; any snapshot;
`tests/support/dsl/tabs.ts`; `tests/support/dsl/popup.ts`; `BackgroundCustomizer`.

**Mandatory follow-up (§3.4).** This round made an actual repair to a
committed file (`docs/testing/SPACING_HELPER_HARNESS_RESULTS.md`), which
triggers a mandatory same-reviewer scoped follow-up under Operating Agreement
§3.4: **Claude Sonnet 5**, scope = the repair diff shown above plus its
declared blast radius (i.e., re-check that §1.1 accurately records the
class-smoke measurement, that the narrowed leg 1b sentence and the leg 4
addition are accurate and don't overstate/understate anything, and that
nothing outside `SPACING_HELPER_HARNESS_RESULTS.md` was touched). **This round
does not merge on its own repair — the owner commissions the follow-up the
same way the original review was commissioned.**

## Round 1 attribution correction and independent ratification — 2026-09-03

⚠⚠ **Round 1 above was executed under an incorrect model invocation.** This
file's first line originally read "Author: Claude Opus 5 (repair author)". **That
was false.** The session that produced commit `86b897e` ran as **Claude Sonnet
5** — the owner started it under the wrong model by accident. The committed
record already contradicted the header: `86b897e`'s own message carries
`Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` (`git log -1
--format=%B 86b897e`).

**Why this is not a labelling nit.** Claude Sonnet 5 holds the independent
implementation-review seat for PR #155, and is the reviewer required by
[`docs/governance/OPERATING_AGREEMENT.md`](../governance/OPERATING_AGREEMENT.md)
§3.4 (STRAT-D7) to perform the **mandatory** scoped follow-up on any post-review
repair. A repair authored by Sonnet and then reviewed by Sonnet is precisely the
conflict this project's reviewer-eligibility rule exists to prevent — the same
rule disqualified Codex/Sol from the original implementation review because Sol
had authored §10 of the plan, and it used **model identity** as the disqualifying
criterion, not session freshness. By that same logic "Sonnet" (any session) is
conflicted for reviewing a repair "Sonnet" (a different session) authored. The
precedent on this very branch is directly on point: on 2026-09-03 a same-session
`/model sonnet` switch was ruled **not** to confer reviewer independence and the
owner required a genuinely fresh session instead
(`drawer_havdm_decisions_0df96fa1cd80752be6f71430`).

**This was NOT resolved by relabelling.** A genuinely fresh Claude Opus 5 session
re-derived Round 1's work from scratch and adopts it only on the strength of its
own measurements.

### What was independently re-derived

| Round 1 claim                                                          | How it was re-checked, independently                                                                                                                                                                                                                                                                                                                                                                                                                   | Outcome                       |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| F1's class-smoke result (4 classes × 1 node, 4 distinct nodes)         | A **new probe written from scratch** (`tests/e2e/_opus_class_smoke_probe.spec.ts`), headless, untracked, deleted after use, carrying its own positive and negative controls. ⓘ Stated exactly: Round 1's probe no longer exists and was not re-run, but §1.1's published figures had necessarily been read first (this task required reading §1.1) — so what is claimed here is independent CONSTRUCTION and an independent RUN, not blind measurement | **REPRODUCED EXACTLY**        |
| F1's conclusion "no missing, duplicate, shared **or swapped** mapping" | Asked whether the stated instrument could decide each of the four modes named by §10 condition 2                                                                                                                                                                                                                                                                                                                                                       | **OVER-REACH — corrected**    |
| F2's narrowed leg 1b sentence                                          | Read against `tests/e2e/spacing.spec.ts:109,112`, `git show main:tests/support/dsl/spacing.ts` (the settling wait at `:29-33`, called from `selectOptionByText` at `:63`), and the review's own §4 F2 "Concrete fix" text                                                                                                                                                                                                                              | **FAITHFUL — adopted**        |
| F3's added leg-4 clause                                                | Read against the plan's §6 kind table (`SPACING_HELPER_PRESET_PLAN.md:463`, leg 4 listed under FAIL-OLD/PASS-NEW) and leg 4's measured results (`SPACING_HELPER_HARNESS_RESULTS.md:212-213`, PASS 2731 ms / PASS 2390 ms)                                                                                                                                                                                                                              | **FAITHFUL — adopted**        |
| "No change to `src/` or `tests/support/dsl/spacing.ts`"                | `git diff-tree --name-only -r 86b897e` (two docs files only) and `sha256sum` of both files against `git show HEAD:`                                                                                                                                                                                                                                                                                                                                    | **CONFIRMED**                 |
| PR #155's body does not misattribute the repair                        | Re-fetched live with `gh pr view 155 --json body`, not read from a local copy                                                                                                                                                                                                                                                                                                                                                                          | **CONFIRMED — no fix needed** |

### The one thing Round 1 got wrong

§10 condition 2 names **four** failure modes: "Any missing, duplicate, shared or
swapped mapping HALTS the work." Round 1's §1.1 closed with "the union across all
four selectors has exactly 4 members... so no two classes resolved to the same
node (**no shared or swapped mapping**)".

**Counting cannot decide a swap.** Four classes landing on four distinct nodes is
equally true when the mapping is swapped — `spacing-margin-preset`'s Select
rendering the popup that carries `spacing-padding-preset-popup`, and vice versa.
Every count Round 1 published is unchanged under that swap, so the word "swapped"
was cleared by an instrument that cannot see it. This is the failure mode the
`practice` wing files under substitution 6 — a narrower check reported in the
wider claim's words (`drawer_practice_verification_8cccc05dfb795cb31d2ce3a6`).
⭐ Note that the **original** commit `82c0e49`'s message did not make this claim;
it said "no popup carried another Select's class", which is the _shared_ check.
The over-reach entered in Round 1's write-up, not in the implementation.

**Closed, not merely narrowed.** Rather than delete the word, the swap was
measured functionally: each Select was driven by clicking an option reachable
**only** through `.ant-select-dropdown.<testid>-popup`, then the control that
actually moved was read back, with per-half distinct targets so a margin↔padding
swap could not hide. All four resolved to their own control; the other half never
moved. Recorded as **§1.2** of
[`docs/testing/SPACING_HELPER_HARNESS_RESULTS.md`](../testing/SPACING_HELPER_HARNESS_RESULTS.md),
with its negative control (a nonexistent class counts 0) and its positive control
(every target differed from the control's prior value, so no assertion could pass
vacuously).

⚠ **A trap recorded for the next agent.** The first version of this probe used the
combobox's `aria-controls` as an identity link and reported a **false swap** on
three of the four Selects. Cause, measured: `@rc-component/util`'s `useId` returns
the literal string `'test-id'` when `NODE_ENV === 'test'`
(`node_modules/@rc-component/util/es/hooks/useId.js:30`), so all four Selects emit
`aria-controls="test-id_list"`. The first red came from the instrument, not the
app — this project's own "treat the first red as suspect by default" rule earned
its keep here.

### Adoption

With F1 re-measured, F2 and F3 re-read against their own sources, and the single
over-reach corrected, **this session adopts Round 1's dispositions as its own**
and takes authorship of them. ⓘ Stated plainly for the follow-up reviewer: the
_prose_ of Round 1 and of §1.1 was physically composed by the Sonnet session; what
a fresh Opus session has done is re-derive the underlying facts independently,
correct what it found wrong, and accept responsibility for the result. The
reviewer should weigh it on that basis.

### Scope of this correction round

- **Changed:** this file (header line, Round 1 pointer, this section) and
  `docs/testing/SPACING_HELPER_HARNESS_RESULTS.md` (§1.1's over-reach corrected;
  new §1.2 recording the independent re-measurement and the swap check).
- **Not changed, verified:** `docs/testing/SPACING_HELPER_PRESET_PLAN.md` (§10
  closed under the owner's stop rule), `src/components/SpacingControls.tsx`,
  `tests/support/dsl/spacing.ts` (both `sha256sum`-identical to `HEAD` before and
  after — `9756c68c…` and `c52db0bc…`), any snapshot,
  `tests/baseline/expected-failures.json`, `tests/support/dsl/tabs.ts`,
  `tests/support/dsl/popup.ts`, `BackgroundCustomizer`. No leg's measured result
  was altered; leg 1b and leg 4 keep their recorded values.
- **The §3.4 follow-up is still owed**, and is now conflict-free: **Claude Sonnet
  5**, in a genuinely fresh session, reviewing a repair it did not author. Scope =
  the Round 1 diff (`86b897e`) **plus this correction round's diff**. The owner
  commissions it separately. **This round did not merge.**

## Round 2 — dispositions against the §3.4 scoped follow-up — 2026-09-03

Follow-up review:
[`spacing-helper-repair-followup-sonnet-review.md`](spacing-helper-repair-followup-sonnet-review.md)
(Claude Sonnet 5, genuinely fresh session, verdict **PARTIALLY-CONFIRMS**). It
disposed F2 and F3 **RESOLVED**, F1 **PARTIALLY RESOLVED**, found **no
regression** anywhere in the previously-clean population, confirmed the blast
radius independently by hash, and raised one new SEV-3 process finding (F4).

| Finding                                                            | Severity | Disposition      | Basis                                                                                                                                |
| ------------------------------------------------------------------ | -------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| F1 — condition 2's _sequencing_ claim rests on `82c0e49`'s message | SEV 2    | **ACKNOWLEDGED** | The property half is closed and is narrowed further below; the residue is a historical process fact that **no re-run can establish** |
| F2 — leg 1b's overstated naturalism claim                          | SEV 2    | **RESOLVED**     | Confirmed RESOLVED by the follow-up; nothing further owed                                                                            |
| F3 — leg 4's FAIL-OLD/PASS-NEW label                               | SEV 3    | **RESOLVED**     | Confirmed RESOLVED by the follow-up; nothing further owed                                                                            |
| F4 — the seat-conflict cure is substantiated for facts, not prose  | SEV 3    | **ACKNOWLEDGED** | No change owed on this branch (the reviewer says so itself); recorded as a process lesson and raised as a `practice`-wing candidate  |

### F1 — ACKNOWLEDGED, and why the reviewer's proposed closure would not close it

⭐ **This is a disagreement with the follow-up's recommended fix, stated with
evidence, in the spirit of "a finding is a hypothesis" applied to a
recommendation received.** The reviewer's Q1 proposes: reconstruct the
pre-helper tree state (`git show 82c0e49^:tests/support/dsl/spacing.ts` restores
the old helper) and re-run the four-control smoke against it. **That
reconstruction would measure nothing.** Three measurements, each one command:

1. **The "hooks-only" tree state never existed.** `git show --stat 82c0e49`
   shows that commit added the two class hooks to
   `src/components/SpacingControls.tsx` (+2) **and** rewrote
   `tests/support/dsl/spacing.ts` (+235/-49) **in the same commit**. The
   reviewer established this itself. So the proposed reconstruction assembles a
   tree that was never in this repository's history.
2. **The file being reconstructed cannot affect the measurement.**
   `tests/support/dsl/spacing.ts` is test-support code, not renderer code. The
   renderer bundle's rebuild inputs are enumerated at
   `tests/setup/global-setup.ts:44-51` — `src/`, the three vite configs,
   `forge.config.ts`, `package.json`, `package-lock.json`. **`tests/` is not
   among them.** Swapping the helper cannot change a single DOM class the smoke
   observes.
3. **The renderer §1.2 measured IS the renderer that existed the moment the
   hooks landed.** `git diff --name-only 82c0e49..HEAD -- src/ forge.config.ts
vite.main.config.ts vite.preload.config.ts vite.renderer.config.ts
package.json package-lock.json` returns **empty** — every renderer build
   input is byte-identical across the whole range (only documentation changed).
   `src/components/SpacingControls.tsx` is `c52db0bc…` at `82c0e49` and at HEAD.

⚠ **Scope of that argument, stated exactly.** It licenses §1.2 specifically,
whose probe drove each Select directly (`getByTestId(testId).click()`) and never
called `SpacingDSL` at all — so it is helper-independent **by construction**, not
merely by inference. It is **not** asserted of §1.1, whose probe was deleted
before this round and cannot be inspected. ⓘ And points 1–3 are **INFERRED**
(identical build inputs ⇒ identical bundle), not MEASURED: this project's own
rule that a source-text comparison is not a runtime-behaviour proof applies to
me here too. What makes the inference safe to rely on is that it is
**corroborative**, not load-bearing — the property is independently MEASURED
twice, at §1.1 and §1.2.

**What therefore actually remains open.** Not "was the property true when the
hooks landed" — that is measured, and now also transported. The residue is
strictly: **was the check performed at that moment, before the helper was
written?** That is a claim about what an agent did on a particular day. **No
re-run, now or ever, can establish it** — it is unprovable by construction
rather than merely unproven, and a reconstruction dressed as closure would be
substitution 6 in its purest form: a narrower check (the property, again) wearing
the wider claim's words (the process).

**Disposition: ACKNOWLEDGED, not repaired.** The honest state of the record is
that condition 2's HALT-bearing check is satisfied on its substance and
undocumented on its timing, and that this is now disclosed in four places — the
results document's §6 register, §1.2's own framing, the follow-up review, and
here. ⓘ Recommended to the owner: accept it. Matches the follow-up's own Owner
Decision Brief recommendation (a).

### F4 — ACKNOWLEDGED, no change owed here, lesson recorded

The reviewer's own text: "**Concrete fix:** none needed on this branch — already
mitigated by this round's independent re-verification," and "**What must NOT
change:** nothing on this branch." Accepted as written; no edit is made, which is
the disposition the finding itself asks for.

⭐ **The lesson is real and is recorded rather than lost.** When a repair's
authorship is corrected because it ran under the wrong model, the correcting
session should **rewrite the adopted prose in its own words** rather than adopt it
verbatim — or the mandatory §3.4 follow-up should be routed to a **third** model.
The evidence is on this very branch: a Sonnet session wrote a claim ("no shared
**or swapped** mapping") that its own instrument could not support and did not
catch it in its own writing; a _different_ model did. This round's Opus session
adopted most of that prose rather than rewriting it, which is precisely the gap
F4 names. **Raised as a `practice`-wing candidate for the owner's approval** — not
filed unilaterally, per that wing's standing rule that practice candidates are
owner-gated and that a rule must not be filed out of a mechanism which has not
survived an independent review.

### Scope of this round

- **Changed:** this file only — this Round 2 section. **No change to
  `docs/testing/SPACING_HELPER_HARNESS_RESULTS.md`**: §6's existing bullet ("neither
  §1.1 nor §1.2 reproduces condition 2's literal sequencing") remains true exactly
  as written, and the argument above is commentary belonging in the response
  artifact, not new evidence belonging in the evidence surface. One fact, one home.
- **Not changed:** `docs/testing/SPACING_HELPER_PRESET_PLAN.md`,
  `src/components/SpacingControls.tsx`, `tests/support/dsl/spacing.ts` (both
  `sha256sum`-identical to `HEAD` — `c52db0bc…` and `9756c68c…`), any snapshot,
  `tests/baseline/expected-failures.json`, `tests/support/dsl/tabs.ts`,
  `tests/support/dsl/popup.ts`, `BackgroundCustomizer`.
- ⚠⚠ **No repair was made this round, so no further §3.4 follow-up is owed.**
  §3.4 requires the author to answer every finding in a committed disposition
  table **regardless of whether a repair is made**; it attaches a same-reviewer
  follow-up to a **repair**, not to a disposition — otherwise the obligation
  regresses without end. **This is the author's reading and the owner may
  overrule it.** If the owner judges that this Round 2 section is itself a
  repair, a further scoped follow-up is owed before merge and this round's
  disposition of F1 and F4 should be its scope.
- **This round did not merge.** PR #155 remains at the owner's merge gate.

## MemPalace drawer candidates

(Filed directly — this session had a live write lease; see the Workflow State
block at the end of this session's response for the drawer ID actually filed.
Kept here too per the disposition-table convention in case a future round
needs the pointer without re-deriving it.)

⚠ **Round 2's filing is OWED, not filed.** The MemPalace write was refused —
`Peer MCP writer active; this server is read-only for mutating tools` — because
the per-palace writer lease was held by another server, almost certainly the
§3.4 follow-up reviewer's own, which filed
`drawer_havdm_review_6fa17afeedaf18b83fd33c96` minutes earlier. Per ruling
**MP-LEASE** the write was **not retried**, `MEMPALACE_MCP_ALLOW_PEER_WRITER`
was **not set**, and **no process was killed**. The full drawer content and the
paired diary entry are staged verbatim at
`~/.mempalace/pending/20260903-havdm-decisions-spacing-round2-dispositions.md`
for a write-enabled agent to file as `wing=havdm`, `room=decisions`,
`added_by="claude-code"`. ⓘ Reads were unaffected throughout; only the write
was refused.
