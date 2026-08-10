Author: Claude Opus (`82512d1`, PR #141 round-3 fix author)  
Reviewer: OpenAI Codex, independent reviewer; did not author the fix  
Owner gate: BaggyG-AU reads PR #141 and this review together; only the owner signs off and merges

# PR #141 — self-pass gate independent review, round 4

## Quarantined independent account

This account was written after reading the round-3 review and the round-3-fix
implementation/test diff, and before opening the author's current commission or
ledger. It is deliberately independent of the author's trace and dispositions.

The round-3 fix makes three substantive changes:

1. `checkCommitMessageCandidates()` returns immediately when `owesLedger` is
   false, so the commit-message candidate leg follows the same path-based scope
   decision as the other blocking checks.
2. A hostile fixture pairs the newly green out-of-scope/count-message state with
   an explicitly obligated/count-message red control.
3. Several prose claims are narrowed: the certificate title now names the
   governed tree only, the disposition-matrix guard admits it does not count its
   twelve cells, and the `GATE_OWN` declaration describes six enumerated author
   artifacts rather than a tamper-resistant boundary.

The resulting mechanism is still a local, self-authored Vitest gate. It decides
whether a ledger is owed from the merge-base-to-working-tree changed-path
population; validates the commissioned and ledger row populations and
dispositions; checks that the ledger changed on the branch; searches obligated
branch commit messages for a narrow class of count candidates; and compares a
twelve-character digest of the governed index/working/untracked tree. It does
not authenticate the author/reviewer separation, prove evidence truth or
freshness, protect its runners/configuration/spec existence, detect deletion of
a question and its ledger row, or bind non-governed branch content or HEAD.

## Independent attack list

The review will test these properties before consulting the author's current
answers:

1. **Scope interaction, beyond a direct ordinary-file edit.** Construct a later
   branch that renames one of the six enumerated gate artifacts to an unrelated
   destination. The rename preimage must keep `owesLedger` true; an inherited
   ledger must then make the gate red. This attacks the composition of
   NUL-framed rename discovery and the narrowed scope, rather than merely
   replaying an in-scope or out-of-scope content edit.
2. **Paired scope control.** Confirm that an unrelated-only branch carrying a
   count-shaped message is green while the same message remains red when the
   branch is obligated. This checks both sides of the new early return.
3. **Scope-description truth.** Compare every current description of
   `owesLedger` with the executable predicate, not just the comment above
   `GATE_OWN`. In particular, the public `GateContext.owesLedger` contract still
   says “this gate's own files” and “this mechanism” even though the predicate
   covers only six enumerated artifacts and explicitly excludes runners,
   configuration and test deletion. Determine whether the wider claim survived
   round-3 N1.
4. **C43 behavioral consequence sweep.** Treat the affected population as every
   current, present-tense statement whose truth depends on the deleted reviewer
   anchor or base/message certificate—not merely literal symbol references.
   Read the detector, both specs, worklist script, commission, ledger and current
   review-facing prose end to end. For each claim, ask whether it now describes
   only the governed-tree certificate, branch-local ledger edit, visibility at
   human review, or a disclosed known-open limit. Historical descriptions are
   acceptable only when they clearly remain historical. This is a semantic
   property, so a labelled hand trace is the direct instrument; a grep alone
   would be a proxy.
5. **Matrix-guard honesty.** Enumerate the six dispositions against both kinds
   to confirm the load-bearing 6 × 2 = 12 cell claim, while separately checking
   that the guard is described only as a six-key guard and not as evidence that
   all cell fixtures still exist.
6. **Count evidence and full gate.** Independently enumerate the blocking and
   hostile spec cases (expected 9 + 41 = 50), then run the repository's full
   `./tools/checks` gate with this review present and uncommitted. Do not treat
   hosted CI at an older SHA as evidence for the current head.
7. **Governed-tree non-change.** Recompute the governed fingerprint and compare
   it with `763a4a5efd7d`; the round-3 fix should not have altered governed
   content.

## Verdict first

**CHANGES-REQUIRED.** The one-line round-3 scope fix works for the count-message
leg, its paired control holds, and the older mechanical repairs remain intact.
But two other checks composed by `runGate()` still execute when `owesLedger` is
false: an unrelated-only child branch inherited invalid ledger rows and the real
gate failed 2 of 9 tests. The new C43 hand trace is the right kind of instrument
for a semantic consequence sweep, but its execution is incomplete: ledger C01
still says branch messages are a hashed certificate input after that hash was
cut, leaving C01, C43 and C50 falsely dispositioned.

## Round-3 finding disposition

| Round-3 finding                                                | Verdict      | Independent evidence                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| M1 — out-of-scope count messages still made the gate red       | **PARTLY**   | `checkCommitMessageCandidates()` now returns on `!owesLedger`; the authored green/red pair passed in the 50-case run. But `checkDispositions()` and `checkOwnerAcceptance()` have no scope return. In an isolated child with only `package.json` changed, two invalid inherited rows produced exit 1, 7/9. See M1 below. |
| M2 — C43's consequence sweep left cut mechanisms live in prose | **PARTLY**   | The six survivors round 3 named were corrected, and both cut-site history blocks are now honestly historical. Ledger C01 still calls branch messages “a hashed input” while the same row says that hash is cut; the C43/C50 hand trace marked the ledger corrected without finding it. See M2.                           |
| N1 — `GATE_OWN` implied a tamper boundary                      | **PARTLY**   | Not lengthening the list was the right design call, and the declaration docblock plus weakest-claim section name the excluded execution surfaces. Wider “this gate's own files” / “this mechanism” wording remains in the public `owesLedger` contract and four other current surfaces. See N1.                          |
| N2 — the C22 guard claimed more than it asserted               | **RESOLVED** | The code now calls it a six-key guard and expressly says deletion of a cell test stays green. Independent enumeration found all six dispositions against both kinds: 6 × 2 = 12 cells.                                                                                                                                   |
| N3 — static commit inventories had drifted                     | **PARTLY**   | The commission and ledger now direct the reader to Git rather than publishing a growing total. The live PR body still says “Four commits” while its hosted head has five, and C53 is labelled `FIXED` while its evidence says the edit is owed. See N2.                                                                  |

## Comparison with the author's account

### Agreement

- The C48 early return is the smallest appropriate repair for the measured
  count-message leak, and C49 is a useful paired control. It does not disable the
  obligated count candidate.
- A labelled hand trace is the direct instrument for C43's semantic property.
  The question is whether each present-tense sentence remains true after the cut;
  no token key can decide that. The hand trace is not a better-dressed proxy. Its
  defect here is incomplete execution, not the choice of instrument.
- `tools/claims-worklist.sh` is genuinely clean of both cut mechanisms. I read
  all 270 lines before using searches as corroboration; it predates both and does
  not describe either as live.
- The deliberate `GATE_OWN` non-fix is sound. Adding runners and configuration to
  a regex cannot make a local test enforce its own execution. The honest property
  is edits to six enumerated artifacts, with runner/configuration/test-deletion
  tampering left to the human owner gate.
- Not re-driving the old sixteen-state table is an adequate boundary for this
  diff. Every state in that table is obligated, so the new early return cannot
  fire. The complete 50-case in-suite population, the author's three scope
  states, and this review's different rename and inherited-ledger attacks are
  better-targeted evidence. No unmeasured fourth column should be invented.

### What the author's account missed, and what mine did not prioritise

The author's account correctly found the count-free control, named the runner
exclusions, and replaced the C43 grep with a per-surface trace. My quarantined
list did not predict the author's exact count-free control; it is a useful
one-mutation discriminator.

In the other direction, the authored direct-edit fixtures never put invalid
ledger semantics on the inherited side of an out-of-scope branch, so they could
not reach the two unscoped validators. The C43 table also treated the ledger as
one surface and listed the two survivors already found, but did not enumerate
its 53 current evidence rows; C01 therefore survived. My scope-wording sweep
also found broader claims outside the two locations the author corrected.

## Findings

### M1 — MERGE-BLOCKING: two ledger validators still escape the path-based scope

**Evidence.** `loadContext()` sets `owesLedger` only when branch work changes a
governed or `GATE_OWN` path (`tests/support/authorLedger.ts:394-418`). Four
ledger checks return immediately when it is false, and the round-3 fix adds the
same return to `checkCommitMessageCandidates()` at lines 658-660. In contrast,
`checkDispositions()` at lines 587-618 and `checkOwnerAcceptance()` at lines
620-627 always inspect `ctx.ledger`.

I created an isolated base from `82512d1` and appended two inherited invalid
rows: C98 with an unknown disposition and C99 with uncited `OWNER-ACCEPTED`.
From that base I made a child whose exact diff was only `M package.json`, with a
count-free commit message. Under the executable predicate this is branch work,
the sole path is neither governed nor one of the six enumerated author
artifacts, and `owesLedger` is false. Driving the real blocking spec with
`HAVDM_LEDGER_REPO` returned **exit 1, 7 passed / 2 failed**: C98 failed
`checkDispositions()` and C99 failed `checkOwnerAcceptance()`. Commission input,
freshness, coverage, commit candidates and certificate were silent.

**Problem.** The published contract says an ordinary out-of-scope branch owes
nothing and the gate says nothing. That property currently depends on the
inherited ledger already satisfying two validators. It is the same composed-
check class as round-3 M1, two members later; the direct ordinary-branch fixture
could not expose it because it inherited a valid ledger.

**Fix.** Give both functions the same `if (!ctx.owesLedger) return []` boundary,
or establish one explicit top-level scope boundary before all obligation checks.
Add a fail-against-old hostile fixture whose base contains invalid inherited
disposition and owner-acceptance rows and whose child changes exactly one
unrelated path. Preserve the current obligated invalid-row red cases and the
governed-obligation fail-closed path.

**Class swept.** I re-derived all eight checks in `runGate()`. Governed
obligation can only fail on a governed path; commission input, freshness,
coverage, commit candidates and certificate explicitly scope themselves;
dispositions and owner acceptance are the two affected members.

### M2 — MERGE-BLOCKING: C01 is a seventh cut-mechanism survivor, so the C43/C50 hand trace is false

**Evidence.** Commission C01 still asks whether “the certified target” covers
branch commit messages (`docs/reviews/self-pass-gate-codex-commission.md:130`).
Ledger C01 answers `FIXED` and states in the present tense: “Branch commit
messages are BOTH a checked population and a hashed input”
(`docs/reviews/self-pass-gate-author-ledger.md:54`). The same evidence cell then
says the `commit-message range` hash is cut and only the checked-population leg
remains. C24 correctly records that a count-free later message invalidates
nothing (`:77`).

The hand trace says the ledger was read end to end and corrected, but names only
the deletion qualifier, the lifecycle-binding bullet and the old C43 grep cell
(`:108-130`). Rows C43 and C50 are nevertheless `FIXED` (`:96`, `:103`). This
review's effect-based population was every current sentence whose truth depends
on the deleted anchor or message/base certificate, across the detector, both
specs, worklist, commission, ledger and live PR body. The ledger C01 sentence is
the additional affected member. Search by “hashed input” corroborated the hand
read; it did not define the class.

**Problem.** Branch messages are checked only for the narrow count regex on an
obligated branch. They are not a hashed certificate input, and a count-free
content commit can leave the governed certificate valid. C01 therefore answers
its current commissioned question incorrectly, and C43/C50 again publish a
complete-sweep `FIXED` over a surviving contradiction. This is the third
consecutive round with a false disposition in the self-pass ledger.

**Fix.** Correct C01 to the current answer and give the accepted count-free
residue the owner-cited disposition its semantics require; do not restore the
message hash. Re-run the labelled consequence trace over each current ledger row
as well as each containing file, then regenerate C43/C50 evidence from that
enumeration. Preserve the two correct historical cut-site blocks.

**Class swept.** Seven current surfaces were read end to end: detector, blocking
spec, hostile spec, worklist, commission, ledger and live PR body. Historical
descriptions were checked for tense. The cut-anchor descriptions are now
historical; the affected current survivor is ledger C01 and its commissioned
question.

### N1 — NON-BLOCKING: the narrowed six-artifact scope is still described with the rejected wider phrase

**Evidence.** The corrected `GATE_OWN` docblock accurately says it is six
enumerated artifacts and not a boundary (`tests/support/authorLedger.ts:72-100`).
But the public `owesLedger` contract says “this gate's own files” and later
“this mechanism” (`:173-188`). The same wider phrase remains in the hostile-spec
scope comment (`tests/unit/author-ledger-fixtures.spec.ts:193-199`), commission
round summary, C41 and standing consequence
(`docs/reviews/self-pass-gate-codex-commission.md:65-66,170,222-226`), ledger
C41 (`docs/reviews/self-pass-gate-author-ledger.md:94`), and the live PR body.

**Problem.** Nearby disclosure lets a careful reader reconstruct the intended
six-path limit, so this does not create another mechanical false accept. But
round-3 N1 identified this exact wording as implying tamper resistance, and the
fix changed only two occurrences while current contract statements retain it.

**Fix.** Replace current scope claims with “governed paths or the six enumerated
author artifacts” (or an equally exact reference to `GATE_OWN`). Keep the list
unchanged and keep all execution-surface exclusions explicit.

**Class swept.** Current scope descriptions across the seven governing/review
surfaces were checked. The declaration and weakest-claim section are accurate;
the six locations above need narrowing.

### N2 — NON-BLOCKING: C53 is labelled fixed while the hosted PR record is presently wrong

**Evidence.** The hosted PR head is `bdb8bac`. `git rev-list --count
9e95e4c..bdb8bac` returns five, and the body itself lists four named hashes plus
`head`, yet its opening says “Four commits, by design.” Ledger C53 is `FIXED`
while explicitly saying the live edit is not done
(`docs/reviews/self-pass-gate-author-ledger.md:106`). Hosted gate figures
1384/103 are accurate for `bdb8bac`; they will need updating only when the local
commits are pushed.

**Problem.** Holding future local-head figures with the push decision is honest.
Holding the already-wrong hosted commit inventory is not necessary: changing
four to five would describe the remote state more accurately without mentioning
either unpushed commit. The explicit disclosure bounds the defect, but it does
not make the `FIXED` disposition true.

**Fix.** Correct the live body against its actual hosted head, then regenerate it
again if/when the owner pushes the local commits. Until the edit is made, record
C53 as outstanding rather than `FIXED`. Do not pin a growing total into the
commission or ledger.

**Class swept.** Git-derived inventories in the commission and ledger are clean;
the live body is the one outstanding member. No local review action changes that
external record.

## Regression sweep

| Earlier property                                                   | Verdict and evidence                                                                                                                                                                                   |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Round-2 M1 — cut the incomplete base/message certificate           | **MECHANISM HOLDS; prose partly regressed.** The fields and comparison code remain absent and the governed-tree certificate is narrow. M2 above is the surviving documentary contradiction.            |
| Round-2 M2 — cut the filename reviewer anchor                      | **RESOLVED.** No anchor selector or monotonic check remains; the known-open joint-deletion case is intentionally green and the current descriptions make it open at any time.                          |
| Round-2 M3 — complete the disposition matrix                       | **RESOLVED.** Independent source enumeration found all twelve kind/disposition cells; the 41-case hostile suite passed. The guard is now described only as a six-key guard.                            |
| Round-1 M4 — index/worktree/untracked governed state               | **RESOLVED.** All unstaged edit/delete/mode, staged mode, untracked and symlink fixtures passed. Independent reconstruction of 44 fingerprint facts produced `763a4a5efd7d`.                           |
| Round-1 N1 — failed population-defining Git commands               | **RESOLVED.** A resolvable parentless base made `tools/claims-worklist.sh --changed-only` fail closed with exit 2. TypeScript population reads still use throwing `git()`.                             |
| Round-1 N2 — dirty rename source and NUL framing                   | **RESOLVED for the internal population.** A staged governed rename made the shell emit source and destination once each. The human newline-framed display limitation remains disclosed.                |
| Round-0 no-base, rename-preimage and malformed-certificate repairs | **RESOLVED.** Their hostile cases all passed in the 41-case suite. A different gate-own rename independently produced `R100` with both paths and made inherited-ledger freshness red, exit 1 with 8/9. |

No governed artifact changed in `9e95e4c...82512d1`, and the independent
fingerprint reconstruction matches the ledger's unchanged declaration.

## Required §3.5 reruns and independent attacks

### Load-bearing specs

```text
$ npm run test:unit -- tests/unit/author-ledger.spec.ts tests/unit/author-ledger-fixtures.spec.ts
Test Files  2 passed (2)
Tests       50 passed (50)
  blocking spec: 9 passed
  hostile fixtures: 41 passed
TARGETED_REAL_EXIT=0
```

The 9 + 41 = 50 population was independently counted from every `it()` before
the run. The disposition block covers the full six-by-two matrix, with
owner-acceptance citation controls adding cases without adding dispositions.

### Deeper repeats

All mutations below were confined to isolated `/tmp` clones and drove the real
blocking spec or checked-in shell, not a reimplemented detector.

| Constructed state                                                                                       | Result                                                                                    | Reading                                                                         |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Gate-own `tools/claims-worklist.sh` renamed to an unrelated destination on a later branch               | `R100` exposed source and destination; blocking spec exit 1, 8/9, solely ledger freshness | Changed-path preimage and obligated side hold beyond the author's direct edits. |
| Invalid disposition and uncited owner acceptance inherited from base; child changes only `package.json` | blocking spec exit 1, 7/9                                                                 | **False over-reach: M1.** Two composed checks remain outside scope.             |
| Shell base ref resolves but is an unrelated root                                                        | exit 2                                                                                    | Round-1 N1 remains fail-closed.                                                 |
| Staged governed rename through the shell parser                                                         | source count 1; destination count 1                                                       | Round-1 N2 remains repaired.                                                    |

### Governed fingerprint

An independent shell reconstruction followed the detector's `I`, `W` and `U`
serialization, including raw content hashes and no trailing record newline:

```text
GOVERNED_FACT_RECORDS=44
GOVERNED_FINGERPRINT=763a4a5efd7d
```

### Full repository gate

The complete review text was present and uncommitted for the final run.

```text
$ ./tools/checks
lint:        0 errors / 145 warnings
format:      clean
typecheck:   clean
unit:        1385 passed across 103 files
REAL_EXIT=0; 4/4 steps reached and passed
```

## Hosted and unverified boundaries

- Hosted run `31345743622` is green only at
  `bdb8bac038e5985895d11a48b3c33bf0a357c206`. It is two commits behind the
  reviewed head and provides **no hosted-CI verification for `82512d1`**.
- Full e2e (307) and integration (235) remain **UNVERIFIED since PR #128**. No
  `src/` path changed, so neither suite is owed for this review. Packaging, UAT,
  live Home Assistant, forks and a Git-version matrix were not run.
- The watched `tests/unit/DeployDialog.spec.tsx` passed 11/11 in the full gate.
  It did not flake, so no discrimination, rerun, debugging or rebaseline was
  performed.

## Pattern and round-count verdict

The code is improving in a real but narrow way. The round-3 count-message fix is
small, correct for its target and protected on both sides; older fail-closed,
fingerprint, parser and matrix repairs survived again. The mechanism now buys a
useful executable inventory of many known hostile states, a governed-tree
fingerprint, mandatory row shape on obligated branches, and visibility when the
ledger changes.

The author's claim discipline has not improved enough to call the artifact
converged. Round 2 had false `C22 PASS`; round 3 had false `C43 FIXED`; round 4
still has false C01/C43/C50 dispositions after an “end-to-end” hand trace, and
the scope class was again fixed one composed check at a time. Changing from grep
to a hand trace is substantive, not cosmetic, but reading a containing file as
one checkbox instead of enumerating its live claims reproduced the same failure.

The cost is now four independent reviews and a 53-row self-authored ledger whose
semantic truth remains human-reviewed. On this evidence, the trend is toward a
smaller useful mechanical gate, but not toward a self-pass artifact that can
serve as its own clearance. Whether that narrower benefit is worth the ongoing
author/reviewer cost, whether the current residues are accepted, and whether any
further round is warranted are exclusively the owner's decisions.

## Claim ledger

| #   | Claim                                                                                    | Tag       | Evidence                                                                                                  |
| --- | ---------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------- |
| 1   | Both load-bearing specs pass 50/50.                                                      | MEASURED  | Required targeted command above, real exit 0.                                                             |
| 2   | Two validators still run when the obligation predicate is false.                         | MEASURED  | Isolated inherited-invalid-ledger child, exact `M package.json` diff, exit 1 with the two named failures. |
| 3   | Gate-own rename preimages keep the obligated side red.                                   | MEASURED  | Independent `R100` clone, exit 1 with only freshness failing.                                             |
| 4   | C01 still calls commit messages a hashed input and falsifies the C43/C50 complete trace. | MEASURED  | End-to-end read at ledger lines 54, 96, 103 and 108-130; differently keyed corroborating search.          |
| 5   | The disposition matrix presently contains all twelve kind/disposition cells.             | MEASURED  | Independent enumeration of the fixture titles and green 41-case run.                                      |
| 6   | The governed fingerprint remains `763a4a5efd7d`.                                         | MEASURED  | Independent 44-record reconstruction and zero governed changed paths.                                     |
| 7   | Shell unrelated-base and staged-rename repairs hold.                                     | MEASURED  | Exit 2 unrelated root; source/destination counts 1/1.                                                     |
| 8   | Hosted CI does not cover this head.                                                      | MEASURED  | Run metadata: success at `bdb8bac`; local reviewed head `82512d1`.                                        |
| 9   | The full local gate passes.                                                              | MEASURED  | Final uncommitted-review run: real exit 0, 4/4, 1385 tests across 103 files.                              |
| 10  | This head requires changes before it can serve as the reviewed self-pass artifact.       | JUDGEMENT | M1 and M2 are merge-blocking; owner arbitration remains controlling.                                      |

**Weakest claims.** The M1 fixture deliberately starts from an invalid inherited
ledger to isolate whether an out-of-scope child is truly silent. If the intended
policy is instead to validate those two inherited semantics repository-wide,
that is a different, currently undocumented scope and conflicts with the
published “owes nothing / gate says nothing” contract. The full semantic C43
population cannot be mechanically proved complete; confidence comes from the
seven-surface hand read plus differently keyed searches, and another reader can
still find a missed sentence.

## Directions

Fix M1 within `tests/support/authorLedger.ts` and add the inherited-invalid-base
fixture before relying on the scope contract. Correct C01 and rerun C43/C50 as a
row-level consequence trace; do not restore either cut mechanism. Narrow the
remaining scope phrases without lengthening `GATE_OWN`. Correct the live PR body
against the SHA it actually describes when the owner chooses the push sequence.

No `src/`, governed text, `[STATE]` drawer, UAT artifact, author commit or live
PR body was changed by this review. There is no automatic fifth round and this
review does not request, approve or perform a merge.

## Verification boundary

I read round 3 first, then the fix diff and all four implementation/test/tool
surfaces before opening the current commission or ledger. After recording the
quarantined account and attack list, I read both author artifacts, rounds 2 and
1, Operating Agreement §3, all six reviewer-facing template rules, and the live
PR body. Every current governing surface in the C43 class was read end to end.

I did not re-drive the author's sixteen-state historical table, full e2e,
integration, packaging, UAT, live Home Assistant, forks or a Git-version matrix.
The semantic truth of ledger rows not called out above was reviewed for the two
commissioned classes in scope here, not independently re-executed across all 53
historical measurements. Temporary hostile Git mutations were isolated from the
review branch.

## MemPalace drawer candidates

- `wing="havdm"`, `room="review"`, `added_by="codex"` — `[REVIEW] PR #141
SELF-PASS GATE ROUND 4 — CHANGES-REQUIRED at 82512d1. The C48 count-message
return and paired control work, older parser/fingerprint/matrix repairs hold,
and targeted specs pass 50/50. Merge blockers: two validators still run on an
out-of-scope child (inherited invalid ledger, unrelated-only diff, real gate
7/9), and ledger C01 still calls branch messages a hashed input, making the
C43/C50 hand trace another false FIXED. N1 scope wording and C53 live-body
inventory remain partly resolved. Hosted CI is green only at bdb8bac, not the
reviewed head. Full local gate: real exit 0, 4/4; lint 0 errors/145 warnings;
format/typecheck clean; unit 1385/103. Only the owner arbitrates and merges.`

No new cross-project practice drawer is proposed: the existing “finding is a
sample” and deletion-consequence-sweep rules already describe both recurring
classes; this round is another application, not a new general rule.
