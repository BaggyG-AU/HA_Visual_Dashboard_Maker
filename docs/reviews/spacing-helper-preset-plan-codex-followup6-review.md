# SEV-1-BLOCKED — scoped follow-up 6 review of the spacing-helper preset plan

Author and repair author: Claude Opus 5 (interested party)

Reviewer: OpenAI Codex / GPT-5.6 Sol (same reviewer as rounds 1–6)

Owner gate: micah / BaggyG-AU; this review decides nothing on its own

Reviewed head: `f46d32df314afb2cb8ef235d350a8721491658cc`

## Verdict

**SEV-1-BLOCKED.** Revision 7 correctly records the double-pre-satisfied state,
the owner-approved narrowing, and SP-26's keyed diagnostic repair. P1 is strong
enough to carry prevention _if_ the proposed same-expression class mapping is
implemented exactly and the mandatory Electron class smoke passes. The repaired
checker also produces the exact advertised revision-6/revision-7 results.

The narrowing was not propagated through the whole live specification. The
caller discussion and the still-live revision-4 weak-claim entry continue to say
that P4 closes, or is the only thing standing against, a correctly formed but
misattached class. M9b and leg 5b now explicitly prove that statement false in
the ordinary double-pre-satisfied state. That is blocker SP-27; no implementation
may begin from this revision.

Three non-blocking findings follow. M9c is a liveness control but not the matched
mirror the plan calls it (SP-28). The capture-side weak claim has the wrong
Playwright mechanism and misses a fail-open error-sentinel interaction (SP-29).
Finally, C3's enumerated frame list is a useful regression alarm but cannot be
the mechanical one-home guarantee the plan calls it (SP-30).

## SP-20…SP-26 disposition

| Finding   | Disposition            | Follow-up result                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SP-20** | **RESOLVED**           | The implementation order now adds the product classes, runs a one-sided class smoke explicitly marked **NOT leg 1**, builds the helper and all three callers, and only then runs leg 1 first among the mechanism legs (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:1678-1695`). This confirms round 6.                                                                                                                           |
| **SP-21** | **PARTIALLY RESOLVED** | The other-half snapshot detects a wrong operation that leaves a changed value, and the owner has validly narrowed the no-change case through SP-25. The repair is not complete as a document because three live passages still assign the old universal role to P4 (SP-27).                                                                                                                                                      |
| **SP-22** | **RESOLVED**           | The live totals occur once, in §7.5. Running the repaired C3 against revision 6 produced exactly two findings: two finding sites and eight review-round sites. It produced no finding against revision 7. The history now points to §7.5 without restating a figure. SP-30 limits the claim that the frame list prevents every future rephrasing; it does not identify current count drift.                                      |
| **SP-23** | **RESOLVED**           | The current weak-claim text distinguishes the two retry branches: a still-closed Select costs another gesture, while an open-but-unresolved Select is re-resolved without one, and the latter is marked unmeasured (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:2115-2124`). This confirms round 6.                                                                                                                              |
| **SP-24** | **RESOLVED**           | The current specification says the background CSS records intent consistent with the general mechanism, not an incident or second M5 measurement, and limits M5 runtime support to its three recorded runs (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:444-455`). The older overclaim survives only inside a historical row that the later SP-24 row corrects.                                                                  |
| **SP-25** | **PARTIALLY RESOLVED** | The factual premise is source-backed and author-measured in M9b; the owner ruling is represented correctly in the header, §3, §4.1, the P4 method comment, §8's first current weak claim and leg 5b. The plan still contains the stronger, contradicted promise elsewhere (SP-27). M9c's control-design limit is SP-28 and does not overturn M9b.                                                                                |
| **SP-26** | **RESOLVED**           | The before/after shape is one shared keyed record; the custom poll message names the requested id and both guarded ids; the returned private value carries those keys to each caller; and leg 5 requires the exact message and exit code (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:996-1067,1099-1125,1151-1169,1568`). This is proportionate to the named-diagnostic finding. SP-29 concerns error semantics, not anonymity. |

## G2 — the narrowed promise and P1 standing alone

### The narrowing did not go far enough through the document

The main revised surfaces are candid. They say P4 detects wrong-control mutation,
not operation identity, and that the no-op case rests on P1 alone. The sweep is
nevertheless incomplete:

- the proposed method comment says the other-half assertion “makes a
  wrong-control click loud when the requested value was pre-satisfied” without
  the necessary condition that the foreign value changes (`:1110-1111`);
- the caller discussion says P4 “closes the one silent path option B still has,”
  namely a unique class on the wrong Select (`:1173-1179`); and
- the live revision-4 weak-claim entry says P4 is the “ONLY thing standing”
  between option B and that misattachment (`:2107-2110`).

The latter two are the exact path M9b and leg 5b say can pass. SP-27 gives the
blocking proof and the complete class sweep.

### P1 is sufficient as a design, conditional on its mandatory runtime gate

The proposed product mapping derives each Select's `data-testid` and popup class
from the same local `testIdPrefix` expression, separately for mode and preset
(`:863-879`). `renderSection` is called with two fixed prefixes
(`src/components/SpacingControls.tsx:228-229`), yielding four distinct names.
The helper derives its selector from the caller's same test id, requires exactly
one class-bearing popup and separately requires visibility (`plan:889-898,947-967`).
Missing or duplicate classes therefore fail closed.

That is enough to make P1 prevention-by-construction credible; P4 need not prove
identity. It is not yet runtime clearance. M7 observed class placement and
uniqueness in jsdom only, and neither I nor the author has observed the option-B
class in Electron. The implementation sequence correctly makes an all-four
Electron class smoke the first post-source gate, before the helper. A missing,
swapped or shared class there must halt implementation; it cannot be recorded as
mere characterisation.

## G3 — what M9 does and does not prove

M9b is adequate evidence for SP-25's factual premise at the stated boundary. It
records an Electron run in which the foreign mode Select and requested mode
Select were both pre-satisfied, the global lookup had one match, the click was
delivered, every displayed value stayed fixed and the popup closed. Installed
rc-select source independently supports that result: a single-select option
remains clickable and closes the popup (`OptionList.js:161-170,371-374`), while
`onChange` is emitted only for a changed value (`Select.js:314-333`). I did not
repeat the run.

M9c proves less than “mirroring” or genuine bidirectionality. M9b uses mode
controls and requests Margin while the foreign Padding mode is already `All
Sides`. M9c switches to preset controls and changes Padding from `Relaxed` to
`Normal`. It proves the snapshot instrument is not globally dead: it can fail
when some guarded value changes. It does not hold the requested operation,
foreign popup, option kind and target constant while changing only the foreign
precondition. Nor does it reverse Margin and Padding. SP-28 records that evidence
overstatement without reopening SP-25.

The missing matched control is simple: repeat M9b's exact
`setMarginMode('all')`/misattached-padding-mode path, but first put Padding mode in
`per-side`; P4 must then fail on Padding mode changing to `all`. Reverse the two
halves as a second pair if “bidirectional” is meant directionally. That would
isolate pre-satisfaction as the variable rather than merely show that another
P4 invocation can red.

M9's value-space limit is otherwise stated honestly. It explicitly declines to
claim an event/association oracle and says it establishes what controls end up
showing, not which control received the operation. The owner declined the wider
oracle; this review does not reopen that judgement.

## G4 — the checker, A1 and A2

### Check set taken from the module

At `feature/plan-consistency-checker` commit `1f6650a`, the module implements
exactly four checks:

1. **C1-ORPHAN** — a parsed method definition must be called somewhere in the
   plan's TypeScript blocks or live DSL;
2. **C2-NODISPOSITION** — every referenced `SP-*` number must have a bold table
   disposition in the plan or history;
3. **C3-COUNTDRIFT** — more than one recognized review-round or finding-total
   site is an error, even when the values agree; and
4. **C4-SEQUENCE** — leg 1 may not precede the repaired helper in the recognized
   implementation sequence.

There is no C5.

### Executed results

I ran the module's unit spec at `1f6650a` in a detached temporary worktree and
added an untracked audit spec there, then removed the worktree. All 23 permanent
tests passed; the branch-dependent real-plan test skipped because that branch
does not contain this plan. All three audit cases passed.

- Against revision 6 (`e65bb46`), repaired C3 reported a **finding total at two
  sites**: plan line 1630 and history line 7, both 24.
- It reported a **review-round total at eight sites**: plan lines 12, 31, 53, 169
  and 1628, plus history lines 6, 82 and 148.
- Against reviewed revision 7, `checkPlan` returned `[]`.
- The permanent negative fixture containing “Option A survived two review
  rounds” and seven other real historical sentences remained silent.
- The permanent `twenty-four` versus `four` known-bad fixture fired and reported
  24 and 4, confirming A2's repair.

Those results prove the narrow revision-7 claim.

### Structural blind spots

They do not prove that C1–C4 are a semantic plan gate:

- C1 builds global “defined” and “called” sets; it does not construct a call
  graph. A detector called only by a disconnected harness/example block counts
  as wired even if no public repair path reaches it—the SP-15 class in a slightly
  different shape.
- C2 proves row presence, not that the latest disposition is true, unique or
  compatible with a later correction.
- C3 cannot know that its one recognized site is factually right. It also misses
  any new frame. I appended the live sentence “This plan has been reviewed six
  times and has 26 total findings” to revision 7 in the audit fixture; C3 still
  returned no finding. Ratios, “reviewed N times,” `N total findings`, numerals
  above its word maps, and an assertion hidden after an unbalanced quote share
  that structural boundary.
- C4 recognizes one heading shape and bold step titles. It is not a dependency
  graph and cannot catch another leg/helper inversion phrased elsewhere.
- None of the four checks interprets event order, retries, state setup or oracle
  causality. SP-3's `click`/`mousedown` error, SP-8's listener-lifetime error,
  SP-25's idempotent state and SP-28's unmatched control can all pass C1–C4.

A frame list is useful as a regression suite for spellings that actually bit,
but it is the wrong primary shape for a one-home convention. SP-30 recommends a
single marked totals block and numeric-free pointers elsewhere.

### A1 and A2

Both author-found records are honest and complete against the inspectable
module. A1 correctly says the prior commission invented C5 and that I repeated
the bad name. My round-6 G3 conclusion nevertheless stands: I named executable
event/control-flow semantics, and the actual C1–C4 do not inspect that class.
Removing an imaginary textual check from the set cannot make the remaining four
catch it. What does not stand is the literal “C1–C5” description; this review
corrects it rather than treating the old answer as cleanly worded.

A2 accurately records the old hyphen truncation and its false-accept consequence.
The repaired parser and known-bad test now exercise it directly.

## G5 — scope and over-reach

I found no repair over-reach. SP-26 requires identity-bearing diagnostics; one
private snapshot method, a keyed private return value and one custom poll message
are a cohesive way to carry that identity through the existing three callers.
No public signature changes.

SP-25 required a promise change rather than a code invention. M9, the narrowed
header/§3/§4.1/P4 text, the current §8 boundary and leg 5b all directly evidence
or preserve that owner ruling. The problem is under-reach in the sweep (SP-27),
not excess surface. No revision-7 repair expands into unrelated DSLs, product
behaviour, snapshots, manifest state or CI policy.

## G6 — capture semantics and the unpredicted interaction

The broad concern—capture and comparison have unequal readiness and error
semantics—is right. The specific “momentarily absent becomes `null`” account is
not. Playwright 1.57.0's `locator.textContent()` delegates to a selector operation
that retries until an element matches
(`playwright-core/lib/client/locator.js:270-272`,
`client/frame.js:306-308`, `server/frames.js:1322-1345`). This repository sets
`actionTimeout: 30_000` (`playwright.config.ts:53`). A briefly absent value node
therefore waits; it does not immediately throw into `null` and then consume the
five-second comparison budget.

The real defect is the catch-to-sentinel design. `readSelectValue` turns _every_
error into the same valid comparison value, `null`, on both sides. An immediate,
persistent read error such as a strict-selector violation from two value nodes
can therefore produce `null` before and `null` after; the keyed equality passes
without observing whether that control changed. Separately, an absent node can
stall the pre-gesture path for the 30-second action timeout before its error is
erased. SP-29 routes the fail-open behavior and hidden budget to the owner and
supplies a fail-closed design.

This is the interaction the author did not name: the shared reader prevents
before/after shape drift, but sharing its swallowed-error sentinel can make both
sides agree for the wrong reason. The custom SP-26 message never appears when the
comparison passes on `null === null`.

The load-bearing revision-7 claim about what the app **does** is the SP-25
no-change behavior: an already-selected foreign option can receive the click,
close normally and change no displayed value. The author ran that headlessly as
M9b; I did not rerun it. The distinct P1 runtime premise—that all four option-B
classes land uniquely in Electron—has **not** been run. M7 is jsdom only; the
mandatory class smoke still owes that observation.

## Confidence and method

**Confidence: high on SP-27 and the checker results; high on Playwright's capture
semantics and SP-29's error-sentinel control flow; medium-high on SP-28 because I
do not have M9's deleted raw probe; high on the structural C3 limitation.**

The pinned-tree gate passed before review: branch
`feature/spacing-helper-preset-plan`, head
`f46d32df314afb2cb8ef235d350a8721491658cc`, base
`08a9544643ef01aed843fa9babf1892291ed3e7f`, clean and docs-only. I read the
commission, revision-7 plan, complete history and reviews 6 through 2 in the
required order, then the checker module/spec and every source range named by the
commission.

I swept every live `P4`, `wrong-control`, `misattached`, `silent path`, M9 and
bidirectionality statement; re-traced all three current callers and the first
SP-25 action; checked the two `renderSection` calls and sole product consumer;
and read rc-select's select/close/change code plus Playwright's `expect.poll`,
locator-read and timeout paths. I regenerated the branch/diff/status gate and
the checker's revision-6/revision-7 results.

## Evidence boundary

- I did **not** run Electron, M9, the class smoke, harness legs 0–12, an e2e or
  integration suite, CI, or live Home Assistant. No app probe was built.
- M8 and M9 remain author-recorded runtime evidence. Installed source supports
  M9b's no-change/close path, but I did not independently observe its values,
  popup counts or click delivery.
- P1's current clearance is source/jsdom plus a mandatory future Electron smoke,
  not an Electron observation.
- The checker run exercised local branch commit `1f6650a`; I did not inspect PR
  #154's remote metadata or CI state. The temporary worktree and audit fixture
  were removed, leaving the reviewed worktree clean before this review document.
- SP-29's strict-duplicate construction was traced from the proposed code and
  Playwright source; it was not injected into the app. Its current frequency is
  unknown.
- I changed no plan, source, test, snapshot, manifest or CI file. This review is
  the only tracked change.

## Claim ledger

| Load-bearing claim                                                                                 | Tag                                           | Evidence and result                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The reviewed tree matches the pinned branch/head/base and is clean/docs-only.                      | **MEASURED**                                  | Gate regenerated before review; confirmed.                                                                                                                          |
| SP-20, SP-23 and SP-24 remain resolved.                                                            | **MEASURED**                                  | Re-traced their current sequence, retry-branch and evidence-boundary text; confirmed.                                                                               |
| Revision 7 fully propagated SP-25's narrowed P4 promise.                                           | **MEASURED — CONTRADICTED**                   | Main surfaces are corrected, but plan `:1110-1111`, `:1173-1179` and `:2107-2110` retain the stronger role; SP-27.                                                  |
| P1 can carry no-op prevention alone if implemented as specified.                                   | **INFERRED from source/jsdom, runtime owed**  | Same-expression test-id/class construction, fixed render calls, exact count and visibility fail closed. Electron placement remains the mandatory unrun class smoke. |
| M9b establishes that a double-pre-satisfied wrong operation changes no displayed value and closes. | **AUTHOR-MEASURED / source-corroborated**     | M9b record plus installed rc-select select/close/change paths. I did not rerun Electron.                                                                            |
| M9c is a matched, genuinely bidirectional mirror of M9b.                                           | **MEASURED-from-text — CONTRADICTED**         | It changes mode→preset and setup, and does not reverse direction. It proves detector liveness, not matched causal isolation; SP-28.                                 |
| Repaired C3 reports eight round sites and two finding sites on revision 6, and none on revision 7. | **MEASURED by execution**                     | Exact results reproduced with checker commit `1f6650a`.                                                                                                             |
| C3 stays silent on the supplied historical population.                                             | **MEASURED by execution**                     | Permanent negative-population test passed.                                                                                                                          |
| C3 mechanically prevents future one-home count drift regardless of phrasing.                       | **MEASURED — CONTRADICTED**                   | A new live `reviewed six times` / `26 total findings` restatement returned no finding; SP-30.                                                                       |
| A brief missing value node is immediately caught as `null` by the proposed capture.                | **MEASURED-from-source — CONTRADICTED**       | Locator text reads retry element resolution and inherit the repo's 30-second action timeout; SP-29.                                                                 |
| The nullable shared reader always fails safely when it cannot observe a guarded control.           | **MEASURED-from-control-flow — CONTRADICTED** | The same immediate read error can yield `null` on both sides and satisfy equality; SP-29.                                                                           |
| SP-25/SP-26 repairs changed no more implementation surface than their findings required.           | **JUDGEMENT**                                 | Promise narrowing, one private keyed snapshot path and private return propagation are cohesive; no public/product expansion found.                                  |
| My round-6 semantic-defect answer survives correction from C1–C5 to C1–C4.                         | **MEASURED / JUDGEMENT**                      | The actual four checks do not interpret event order, retry lifetime or state/oracle causality.                                                                      |

**Weakest claims in this review:** I did not observe P1's classes in Electron;
SP-28 judges M9 from its retained record rather than raw probe code; SP-29's
strict-duplicate path is a source/control-flow construction rather than an
observed app state; and the marked-total convention in SP-30 is a design
judgement, not the only possible replacement.

## Findings

### SP-27 — SEV 1 — the owner-approved P4 narrowing is contradicted by three live P4 claims

**Three-part blocking proof.** (1) The binding decision is SP-25 option (a): P4
detects wrong-control mutation, P1 alone prevents the double-pre-satisfied no-op,
and revision 7 claims to have corrected the promise in every live load-bearing
surface (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:128-143,541-566,1085-1096,
1890-1902`). (2) The same specification still says the other-half check makes a
wrong click loud whenever the requested value was pre-satisfied (`:1110-1111`),
that P4 closes the silent correctly-formed-but-misattached-class path
(`:1173-1179`), and that it is the only thing standing against that path
(`:2107-2110`). M9b and leg 5b give the direct counterexample: attach the requested
class to the foreign mode popup while both controls already show `All Sides`; the
count and visibility pass, the click changes no value, both P4 assertions pass,
and the popup closes (`:679-681,1569`). (3) No mitigation reconciles a
specification that assigns opposite results to the same state. P1 may prevent the
misattachment when implemented exactly, but that does not make the claim that P4
catches it true; leg 5b exists specifically to preserve the passing hole.

**Concrete fix.** Rewrite all three survivors in the same commit. The code
comment must say P4 makes the click loud only when the other half changes. The
caller paragraph must assign closure of the misattached-class path to P1 and say
P4 is a mutation-only diagnostic if that construction drifts. The revision-4
weak-claim entry must be struck as historical or replaced by the current P1-only
weak point and a pointer to leg 5b.

**What must not change.** Keep the owner ruling, option B, M9b, the passing
known-open leg 5b, the mutation leg 5 and both keyed P4 assertions. Do not invent
the declined event oracle or make idempotent setters invalid.

**Class swept.** I read every live occurrence of `P4`, `wrong-control`,
`misattached`, `silent path`, `only thing`, `read-back`, M9 and leg 5/5b. The
header, §3 items 2 and 6, §4.1 table/main prose, M9, the P4 docblock, harness kind
table, leg 5 and leg 5b carry the narrowed rule. The three passages above are the
unqualified survivors. The M6 and leg-8 statements are state-specific historical
oracles in which a changed/failed requested value remains observable; they do not
restore the no-op universal.

#### Non-binding design appendix for SP-27

Specification text I would accept at the two load-bearing prose sites:

> P1 closes the correctly-formed-but-misattached-class path by construction. P4
> is a second, mutation-only alarm: if that construction drifts and the wrong
> operation leaves the requested control wrong or the other half changed, P4
> names the result. If both requested and foreign controls were already at the
> target value, P4 supplies no evidence; leg 5b pins that limit.

### SP-28 — SEV 3 — M9c is a liveness control, not the matched mirror the plan claims

M9 labels its probe bidirectional and M9c a mirroring control
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:673-681`). M9b requests a Margin
**mode** and clicks an already-satisfied Padding mode; M9c changes to **preset**
controls and first drives Padding preset from `Relaxed` to `Normal`. It therefore
shows that the shared snapshot mechanism can detect _a_ changed value. It does not
show that foreign pre-satisfaction is the only difference responsible for the
M9b/M9c outcome, and it does not mirror the direction.

Relabel M9c as a detector-liveness control and narrow the causal sentence, or add
the matched mode pair described under G3 and, if directional symmetry is claimed,
its reverse. This does not invalidate M9b, the source mechanism, the value-space
limit or the owner ruling.

**Class swept.** I compared M8a/M8b, all three M9 rows, the harness's definition
of bidirectionality and legs 5/5b. The broader harness is capable of green and red;
the defect is the stronger “mirroring”/causal-isolation description of this pair.

#### Non-binding design appendix for SP-28

Use one four-leg matrix, keeping option kind and target fixed:

| Direction        | Foreign mode before click | Expected P4 result        |
| ---------------- | ------------------------- | ------------------------- |
| Margin → Padding | `all`                     | pass                      |
| Margin → Padding | `per-side`                | fail, naming Padding mode |
| Padding → Margin | `all`                     | pass                      |
| Padding → Margin | `per-side`                | fail, naming Margin mode  |

The two rows in each direction differ only in the foreign starting value.

### SP-29 — SEV 2 — the nullable reader misstates Playwright and can make two read errors look equal

The plan correctly notices asymmetric capture/comparison semantics, but its
stated mechanism is wrong and the proposed sentinel fails open in another state.
`locator.textContent()` retries until its selector resolves; with this repo's
30-second action timeout, momentary absence does not immediately become `null`.
Conversely, `.catch(() => null)` erases every read error. An immediate persistent
error such as a strict-selector violation can yield a keyed `null` before and the
same keyed `null` after. Equality then passes even if the underlying foreign
control changed; SP-26's named message is never emitted. An absent node can also
consume the 30-second action timeout before capture proceeds.

**Owner Decision Brief.** (1) **What this protects in product terms:** no shipped
product behavior; it protects whether a passing test alarm actually observed the
controls it says stayed fixed. (2) **What is going wrong plainly:** the helper
treats “I could not read this control” as a value, so two failures to look can be
mistaken for proof that nothing changed. (3) **Is the product affected? No.
Evidence status: MEASURED from proposed control flow and installed Playwright
source; runtime frequency UNMEASURED.** (4) **Options and costs:** A, remove the
nullable sentinel, apply one explicit bounded capture budget and fail by control
name on any unreadable value; small helper/test change. B, retain nullable values
but assert every captured/comparison entry is non-null before equality; similar
code, a less useful type. C, do nothing; no implementation cost, but P4 can stall
or certify sensor failure as stability. (5) **Recommendation: A**, because a
guard should fail closed and `Record<string, string>` makes the invariant
unrepresentable rather than repeatedly asserted. (6) **If you do nothing:** the
ordinary current DOM will probably work, but a selector/markup regression can
silently disable the mutation alarm exactly when P1 drift makes that alarm useful.

**Class swept.** I traced every capture and comparison call, Playwright locator
text resolution, repository timeout configuration and `expect.poll`'s deadline.
Transient absence waits; absent nodes can stall; immediate errors are swallowed;
and only the repeated immediate-error case can make the equality pass on two
sentinels. No caller validates non-null entries.

#### Non-binding design appendix for SP-29

Specification text I would accept:

> `snapshotOtherHalf` returns `Record<string, string>`, never nullable data. It
> owns one explicit five-second absolute deadline shared by both guarded ids.
> For each id it requires the value locator to become visible, reads text with the
> positive remaining budget, and throws a custom error naming that id if the read
> fails or yields null. No read error is converted into comparison data. Capture
> completes before any gesture; the same fail-closed reader is used by the
> comparison poll.

Add two controls: temporarily remove one guarded value node and restore it within
the capture budget—the helper must wait and proceed without a false “moved”
failure; then create a persistent duplicate value node—the helper must fail at
capture, before any click, within the stated budget and name the unreadable id.

### SP-30 — SEV 3 — an enumerated phrase list is not a mechanical one-home convention

Revision 7 calls the difference “not a promise—it is a CHECK” and the history says
C3 is what prevents the defect (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:
1807-1814`; `SPACING_HELPER_PRESET_PLAN_HISTORY.md:15-22`). C3 itself honestly
says it is an enumerated frame list. The executed hostile sentence “reviewed six
times and has 26 total findings” adds two new live homes yet returns no finding.
The author's `17-of-18` example, a single wrong canonical value and other new
frames share the limit.

Keep C3 as regression evidence for the ten old sites, but stop calling it a
general prevention mechanism. Adopt one syntactically marked source of truth and
require numeric-free pointers elsewhere; adding frames whenever prose changes is
the same hand-maintained-enumeration failure §5.3 just corrected.

**Class swept.** I read every C3 frame and positive/negative fixture, both current
total sites, every history pointer, the documented quote/code exemption and the
plan/history claims about what C3 guarantees. The current corpus conforms; this
finding is about the claimed future mechanism, not present count disagreement.

#### Non-binding design appendix for SP-30

Use one canonical block in §7.5, for example:

```yaml
# plan-running-totals
review_rounds_complete: 6
review_rounds_owed: 1
reviewer_findings: 26
findings_after_round_one: 20
repair_introduced_after_round_one: 19
```

The convention should say that every other plan/history sentence refers to the
key and links to the block without restating its value. C3 should require exactly
one marked block, an exact schema, integer values and no duplicate keys; it should
cross-check `reviewer_findings` against the contiguous highest `SP-*` disposition
where possible. Keep the old frames temporarily as migration warnings, not as the
source-of-truth parser. Known-bad tests should cover a missing block, a duplicate
block/key, a wrong `reviewer_findings` value and revision 6's two-file corpus.

## MemPalace drawer candidates

**Candidate — wing `havdm`, room `review`, `added_by="codex"`:**

> [REVIEW] The same-reviewer STRAT-D7 follow-up 6 of revision 7 at reviewed head
> `f46d32df314afb2cb8ef235d350a8721491658cc` returned SEV-1-BLOCKED. SP-20,
> SP-22, SP-23, SP-24 and SP-26 are resolved; SP-21 and SP-25 remain partial.
> SP-27 blocks because three live passages still say P4 closes, or is the only
> defence against, a misattached popup class although M9b/leg 5b prove P4 passes
> when both controls are pre-satisfied. SP-28 records that M9c proves detector
> liveness but is not a matched or directional mirror. SP-29 corrects the proposed
> capture mechanism: locator text reads retry, while catch-to-null can turn two
> sensor errors into passing equality; a fail-closed non-null design is supplied.
> SP-30 proves C3's frame list is not a general one-home mechanism and proposes a
> marked canonical totals block. Checker commit `1f6650a` was executed: revision 6
> produced exactly eight round sites and two finding sites, revision 7 produced
> none, and the historical negative corpus stayed silent. No Electron/app suite
> was run. Review artifact:
> `docs/reviews/spacing-helper-preset-plan-codex-followup6-review.md`.

**Candidate — wing `practice`, room `verification`, `added_by="codex"`:**

> A before/after guard must not convert read errors into the same comparison
> sentinel on both sides. Two failures to observe can then compare equal and turn
> a broken sensor into a green invariant. Preserve the error or reject the
> sentinel before equality, and include a known-bad unreadable-sensor control.

**Candidate — wing `practice`, room `verification`, `added_by="codex"`:**

> When a document requires one home for running totals, enumerating natural-
> language phrasings is a regression suite, not an exhaustive gate. Prefer one
> marked canonical block plus numeric-free references; test missing, duplicate
> and factually inconsistent canonical data.
