Author: Claude Opus (round-4 fix and remedy author)
Reviewer: OpenAI Codex (independent reviewer; did not author the change)
Owner gate: micah/BaggyG-AU reads PR #141 and this review together; only the owner approves or merges

# PR #141 targeted independent review — round 5

## 1. Verdict first

**CHANGES-REQUIRED.** The round-4 code repair closes the enumerable eight-check
scope class, but two completion repairs do not hold: `C01` is still falsely
dispositioned `FIXED`, and the role-keyed `GATE_OWN` sweep omitted the live PR
body while `C57` claims every current scope description was corrected. The
skills add useful friction, but the second miss is also a concrete case in which
an agent can follow both skills exactly and still ship a false universal because
Git cannot supply an external or otherwise unchanged member of the claim
population.

This review is deliberately limited to the two external skills and drawer text,
plus `aae3b50..233a28a`. It does not re-open the reduced gate design, the
owner-accepted residues, the sixteen-state table, the `GATE_OWN` non-fix, the
worklist clearance, or any other round-4 clearance.

## 2. Confidence, method and evidence boundary

Confidence is high on the two false dispositions and the eight-check
enumeration. I read the pinned skills before the author's reasoning, wrote the
quarantined account and attack list below, then read the fix diff, round-4
review, detector, hostile fixtures, all 57 ledger cells, commission, governing
review rules and live PR body. I ran the two load-bearing specs, a direct
two-sided probe of `checkOwnerAcceptance()`, the exact Git-scope/deeper-remedy
construction, the governed fingerprint, and the final repository gate.

The skill hashes matched the commission exactly:

```text
b09d9a59126aa8d10ffc920827bddac685fdb6a0bf3d63257bcde021026ef63e  edit-freeze/SKILL.md
aa068e8ba3a8049c624b65106fc153eaf007001cb689c70669a44884775b44b5  reading-pass/SKILL.md
```

`HEAD` and `origin/feature/self-pass-gate` both resolved to
`233a28a3888e3a969a00d46902f6feea595f1dc0`. Git regenerated nine commits from
`9e95e4c..HEAD`. Hosted CI run `31360000846` completed successfully at that exact
SHA; the two older listed runs cover different SHAs and are not evidence for
this head.

**Constraints.** Full e2e (307) and integration (235) remain **UNVERIFIED since
PR #128**. This branch changes no `src/` path, so neither suite is owed here.
Packaging, UAT, live Home Assistant, forks, other Git versions and execution of
the user-level skills by a fresh agent were not tested. The skills are outside
this repository and not version-controlled; the hashes above identify only what
this review read. The published reading table from the author's claimed skill
run is not in the repository or live PR body, so execution of that run is not
independently auditable.

## 3. Quarantined remedy account

This section was written after reading the pinned skill files and before opening
the drawer text, commission or current ledger evidence.

`edit-freeze` is a temporal handoff protocol. At the moment an agent believes an
edit is finished, it forbids further edits, derives the changed-file population
from Git, writes intended completion claims before reading, expands a set claim
into one claim per remembered member, reports the file/claim counts, and hands
the list to `reading-pass`. A contradiction starts a new edit/freeze/read cycle.

`reading-pass` is a self-audit protocol, not an independent check. It again takes
file scope from Git, requires a post-edit tool read, requires the whole semantic
unit rather than a selected fragment, forbids weakening the claim after contrary
evidence, and publishes `VERIFIED`, `CONTRADICTED` or `NOT CHECKED` with a fresh
quote. A contradiction blocks completion; an unchecked item must be disclosed.
It expressly says textual agreement does not prove correctness and a
behavioural claim still needs a constructed execution.

The useful constraints are temporal separation, one row per known set member,
whole-unit quotation and visible uncertainty. They make several past evasions
harder to perform silently. They do not authenticate execution, independently
enumerate claims or members the author omitted, decide whether a behavioural
probe is adequate, or make an unchecked item block handoff.

## 4. Independent attack list

This list was also written before the author's account was read.

1. Replay `C22`, `C43`, `C01` and `C53` through the literal rules. Distinguish a
   necessary catch from one that depends on already remembering the missing
   member or external surface.
2. Start “every affected surface is fixed” with six remembered members while a
   seventh exists. Test whether Git scope or the table derives the seventh.
3. Put a class member in an unchanged repository file or the live PR body,
   neither of which appears in the changed-file list.
4. Mark a hard completion item `NOT CHECKED`. Determine whether this is honest
   uncertainty or permission to hand off an unfinished completion claim.
5. Reconcile `reading-pass` running before a status/ledger/disposition edit with
   `edit-freeze` saying any later edit starts a fresh cycle.
6. Quote a whole unit that consistently states a false behavioural property.
   Determine what makes the hostile execution adequate and who judges it.
7. Reconcile rule 2's permission to use `grep -n` with rule 3's whole-unit
   requirement.
8. Separate four observed false dispositions from the proposed three-mechanism
   causal story and from evidence that the remedy prevents recurrence.
9. Enumerate every composed check, every self-refuting ledger cell, every current
   scope-description role, and the hosted PR body.

## 5. Remedy verdict

### Founding-case walkthrough

| Founding case                                                   | Would the literal procedure catch it?                                                                                                                                                                                                                                                                           | Specific rule and boundary                                                                                                                                                                                                                    |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `C22` — four missing normative cells                            | **LIKELY, but not necessarily.** If “every disposition against both kinds” is expanded from all six matrix keys, the twelve member claims make the four absences visible. If the same warm memory omits a vocabulary member, neither skill compares the remembered population to a source of truth.             | `edit-freeze` step 3 requires one line per set member (`:38-52`); `reading-pass` rule 4 forbids changing “all” to “the ones checked” (`:52-56`). Neither rule derives the set independently.                                                  |
| `C43` — six surviving descriptions after a consequence sweep    | **LIKELY for changed repository files; not guaranteed for the whole claim.** Git would have forced all five changed repository files into the reading scope, and whole-unit reads are better than the failed token grep. The live PR body and any unchanged behavioural member are absent from that population. | `reading-pass` rule 1 defines mandatory files as what Git says changed (`:19-29`); rule 3 requires the whole unit (`:41-50`). There is no external-surface or role-population step.                                                           |
| `C01` — first sentence false, fourth sentence true              | **YES for the shipped sentence-level contradiction.** The whole-cell read is aimed directly at this case and prevents quoting only the later true sentence.                                                                                                                                                     | `reading-pass` rule 3 defines a whole row/cell as the unit and explicitly describes this shape (`:41-50`). The current remaining defect is different: the row must also be compared with its commissioned question and disposition semantics. |
| `C53` — `FIXED` while the same cell said the live edit was owed | **YES.** A whole-row quote makes the concession visible. If the hosted body cannot be read, the hosted claim becomes `NOT CHECKED`, not `FIXED`.                                                                                                                                                                | `reading-pass` rules 3 and 4 (`:41-56`) plus the verdict definitions (`:68-77`).                                                                                                                                                              |

The procedure therefore addresses its sharpest founding cases, but it is not a
population mechanism. Its strongest guarantee is: for a claim and member the
agent remembered, a faithful whole-unit reread makes a local contradiction hard
to hide. That is useful and materially narrower than “no false completion claim
ships.”

### Deeper repeat — exact following still permits a false completion universal

This branch supplies the constructed case; no toy reimplementation is needed:

1. `edit-freeze` step 2 and `reading-pass` rule 1 return exactly the four files
   in `git diff --name-only aae3b50..233a28a`: the detector, hostile fixture,
   commission and ledger. A hosted PR body cannot appear in that Git list.
2. From warm memory, the author can expand `C57`'s set claim into the five roles
   named in its evidence: the contract docblock, two commission roles and two
   hostile-fixture comments. Reading those complete units supports each member.
3. The table can therefore contain five `VERIFIED` rows, zero contradictions and
   zero unchecked items while following both skills literally.
4. The live PR body still says the obligation is scoped to “governed text or
   **this gate's own files**.” Round 4 identified that exact phrase in that exact
   surface as part of N1 and required current scope claims to say “the six
   enumerated author artifacts.”
5. Ledger `C57` nevertheless says **every** current description matches the
   six-artifact predicate and is dispositioned `FIXED`.

The false result does not require cheating, a fragmentary quote or misuse of
`NOT CHECKED`. It uses the skills' prescribed Git population and the same warm
memory for claim-member enumeration. `reading-pass` itself admits at `:102-107`
that it checks only claims the agent thought to make and does not prove
correctness, but its suggestion that Git scope addresses an untouched-file miss
does not follow: Git cannot name an unchanged or external member.

### Escape hatches and instruction status

- **`NOT CHECKED` is an honest evidence label, not a completion gate.** The
  skill requires it in the user-facing summary but, unlike `CONTRADICTED`, does
  not say the work is unfinished (`reading-pass:88-96`). That is a reasonable
  safety valve if the handoff says “unverified”; it is a licence to stop only if
  someone mistakes this self-audit for a completion policy. The drawer's caveat
  needs to remain prominent.
- **The claim-list step is real but bounded.** It freezes semantics before the
  evidence can be cherry-picked. It records the same warm-memory population
  earlier; it does not independently discover an omitted claim or set member.
- **The whole-unit rule overrides fragmentary grep.** Rule 2 permits a fresh
  `grep -n`, but rule 3 still requires the complete row, paragraph, docblock,
  function or config block. A grep that prints less is not exact compliance.
- **The status/ledger order is workable.** Filling the final field is an edit;
  exact compliance therefore triggers a second freeze/read cycle over that
  field. The skills could state this two-pass consequence more directly, but it
  is not a bypass.
- **These are instructions, not a gate.** The skills and drawer disclose that
  the same agent executes them, that only thought-of claims are checked, that
  textual agreement is not behavioural truth, and that the remedy is unreviewed
  and unproven. That disclosure is adequate. The current `C57` miss shows why it
  is load-bearing and why surrounding prose must not upgrade the skills into a
  proven cure.

### Drawer and causal account

The four-round recurrence strongly supports the observation that completion
claims were repeatedly published without an adequate fresh verification. It
does **not** establish that the three proposed cognitive mechanisms caused all
four cases, nor that resolve “cannot” help in every agent. That account is a
plausible **JUDGEMENT fitted after the cases**, not a measured causal result.

The drawer's final paragraph does substantial honest work: it calls the remedy
an adopted response rather than a proven cure. Its rule-form headline and
“three mechanisms drive it” paragraph remain more confident than the evidence.
The commission asks whether the phrase “IT WORKED ON ITS FIRST TWO REAL RUNS”
overwhelms the caveat, but that phrase does not occur in the reproduced artifact
under review. The two self-assessed uses are therefore not credited as efficacy
evidence, and no finding rests on wording that was not supplied.

**Remedy verdict: PARTLY.** It is a useful contradiction-reading discipline, not
an independently derived completeness control. It would catch the local `C01`
and `C53` shapes, likely catch the known `C22`/`C43` members, and still permits
the current false `C57` universal when the omitted member is external to Git.

## 6. Round-4 repair verdicts

| Round-4 item                      | Verdict                                       | Independent evidence                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M1 — scope leak**               | **RESOLVED**, with a non-blocking fixture gap | Eight exported `check*` functions were re-derived and all eight are composed at `runGate():766-773`. Seven have an early `!ctx.owesLedger` return. `checkGovernedObligation()` is the sole unguarded member; its governed leg implies `owesLedger`, and its NUL leg deliberately distrusts the derived scope value. A direct synthetic probe made an uncited owner-acceptance row silent out of scope and red when obligated. |
| **M2 — self-refuting rows**       | **PARTLY**                                    | `C53` is corrected and the live body uses regenerating Git commands. `C22` is the author's stated false positive: its current twelve-member hand enumeration may be true even though its guard cannot detect deletion. But `C01` remains `FIXED` while its commissioned property is false and its evidence concedes the missing binding. `C56` falls with it.                                                                 |
| **N1 — six-artifact scope prose** | **PARTLY**                                    | The five repository roles named by `C57` are narrowed. The live PR body retains the rejected “this gate's own files” scope sentence, so the role sweep omitted the external surface and `C57`'s universal is false.                                                                                                                                                                                                           |
| **N2 — hosted PR body inventory** | **RESOLVED**                                  | The live body no longer gives a static commit total; it names `git rev-list --count 9e95e4c..HEAD` and `git log --oneline 9e95e4c..HEAD`. It reports 1387/103. Hosted head and CI are both the reviewed `233a28a` SHA.                                                                                                                                                                                                        |

### M1 enumeration and the deliberate non-fix

```text
checkGovernedObligation        unguarded by design
checkCommissionInput           guarded
checkLedgerFreshness           guarded
checkLedgerCoverage            guarded
checkDispositions              guarded
checkOwnerAcceptance           guarded
checkCommitMessageCandidates   guarded
checkCertificate               guarded
```

There is no ninth exported/composed check. The guards are at the top of each
function, before absent-input or ledger parsing can produce a failure. The
unguarded governed leg is self-limiting because a governed changed path is one
of the predicates that makes `owesLedger` true. The NUL assertion is unreachable
from the current `loadContext()` path because `parseNameStatus()` filters empty
fields at `authorLedger.ts:253-268`; it can still act as conservative
defence-in-depth for an exported `GateContext` supplied directly or after a
future parser change. Leaving it unscoped cannot make a real current
out-of-scope Git state red and is sound.

The hostile fixture does not, however, prove both newly guarded functions. Its
inherited row is a `PASS` on a normative question
(`author-ledger-fixtures.spec.ts:267-282`), which reaches
`checkDispositions()` but would make `checkOwnerAcceptance()` return empty even
without the new guard. The source repair is present and the direct probe below
verified its two sides; the regression fixture's claim of exercising both is
too broad.

### M2 full-cell sweep

I read all 57 commissioned ledger cells as whole rows and then rechecked every
`PASS`/`FIXED` row containing a concession (`cannot`, `not`, `cut`, `outside`,
`open`, `weak` or equivalent) against its commissioned question. No fourth
self-conceding row was found. `C22` is not contradictory: it claims the twelve
cells exist now and openly says only future completeness is hand-maintained.
`C53` now says the owed hosted edit was made and independently reread.

`C01` is still contradictory at the disposition boundary. The commission asks
whether the certified target covers branch commit messages so a content commit
cannot leave a green certificate (`self-pass-gate-codex-commission.md:168`). The
`FIXED` evidence says there is “NO hashed input,” only a count-candidate scan,
and points to `C24`/`C47` for the accepted count-free and substring gaps
(`self-pass-gate-author-ledger.md:54,77,100`). Round 4 already held that a
count-free content commit can leave the governed certificate valid and directed
that `C01` receive the owner-cited disposition its current answer requires. The
false sentence was removed; the false answer was not.

## 7. Findings

### R5-M1 — MERGE-BLOCKING: `C01` is still a false `FIXED`, so `C56` is false too

**Evidence.** Commission `C01` asks whether branch messages are covered such
that a content commit cannot leave a green certificate
(`self-pass-gate-codex-commission.md:168`). The current evidence explicitly says
there is no message hash, only a lexical candidate population, while remaining
`FIXED` (`self-pass-gate-author-ledger.md:54`). `C24` records that a count-free
later message invalidates nothing (`:77`), and `C47` records the substring
acceptance (`:100`). `C56` nevertheless says no cell contradicts its own
disposition (`:114`).

**Problem.** Round 4's requested repair was not just removal of the words “hashed
input.” It said the commissioned answer was wrong and directed an owner-cited
disposition for the accepted residue. The current row still answers “yes/fixed”
to a property its evidence answers “no.” This is the fifth-round instance of the
same false-completion class.

**Fix.** Re-disposition `C01` according to the already recorded owner decision,
with evidence that directly answers its retained commissioned question. Then
re-run the complete whole-cell sweep and update `C56` from that result. Do not
restore the cut message hash or widen the certificate.

**Class swept.** All 57 cells were read whole; all completion-labelled rows with
concessive evidence were adjudicated against their commission. `C01` is the one
affected current row; `C22` is a false positive and `C53` is corrected. `C56` is
the dependent universal that falls.

### R5-M2 — MERGE-BLOCKING: the N1 role sweep omitted the live PR body, falsifying `C57` and the remedy's completeness claim

**Evidence.** Round 4 identified the live PR body as one of the current surfaces
using the rejected broad scope phrase and required all current claims to name the
six enumerated artifacts. `C57` now names five corrected repository roles and
claims “Every scope description” is fixed
(`self-pass-gate-author-ledger.md:115`). The live body at hosted head `233a28a`
still says “The obligation is scoped to branches touching governed text or
**this gate's own files**.” The round-4 fix's Git population contains four
repository files and cannot contain a hosted body.

**Problem.** This is both an incomplete N1 repair and the most useful remedy
attack. An exact skill follower can enumerate and freshly quote all five
remembered repo roles, publish all `VERIFIED`, and never be required to read the
external sixth member. The current false universal therefore survived the
process change that was supposed to prevent this exact class.

**Fix.** Narrow the hosted sentence to “governed paths or the six enumerated
`GATE_OWN` author artifacts,” then perform a role-derived sweep that explicitly
includes external surfaces before re-dispositioning `C57`. Amend the skills so a
set claim identifies its population source and external/unchanged members before
member expansion; Git should remain the changed-file floor, not be presented as
the semantic population. Do not lengthen `GATE_OWN` or re-open the deliberate
tamper-boundary non-fix.

**Class swept.** The five repair roles named by `C57` and the live hosted scope
claim were checked; the hosted member is affected. The retained `C41`
commissioned wording is the explicitly disclosed `C45` exception and is not
silently counted as another repair miss.

### R5-N1 — NON-BLOCKING: the M1 fixture cannot detect loss of the `checkOwnerAcceptance()` guard

**Evidence.** The out-of-scope fixture changes a normative row to `PASS` and
asserts both ledger readers are empty
(`author-ledger-fixtures.spec.ts:267-282`). `checkOwnerAcceptance()` only reacts
to an `OWNER-ACCEPTED` row without an `owner:` citation
(`authorLedger.ts:655-661`), so that assertion was already empty before the
guard. A direct probe of the current function returned `[]` with
`owesLedger=false` and `row C99 claims OWNER-ACCEPTED without citing the owner`
with `owesLedger=true`.

**Problem.** The implementation is correct, but the fixture named as proof for
both checks exercises only the disposition check's old defect. Removing the
owner-acceptance guard would leave the new fixture green.

**Fix.** Add an inherited uncited `OWNER-ACCEPTED` case: out-of-scope must stay
green and the same row on an obligated branch must go red. Preserve all current
guards and the deliberate governed-obligation non-fix.

**Class swept.** Both round-4 guarded functions and both sides of their fixtures
were checked; only the owner-acceptance regression leg lacks fail-against-old
evidence.

## 8. Pattern and round-count verdict

Two patterns have separated. The code scope class was patched one composed
function at a time in rounds 3 and 4, but it is finite and is now exhausted by
an eight-member source enumeration. That part has converged for a structural
reason.

The prose/completion class has not converged. Round 2's `C22`, round 3's `C43`,
round 4's `C01`/`C53`, and now the still-false `C01` plus omitted hosted member
behind `C57` share the same population error: the author verifies the members in
view and publishes a universal over a larger class. This round is not a new
defect generated by a code fix; it is the same class surviving another
self-assessed sweep. Five review rounds are therefore evidence that review cost
is itself material and that the adopted same-agent instruction layer is not a
substitute for an independently derived population or the owner's review.

That observation informs, but does not decide, the owner's class-(d) cost ruling.
This reviewer does not pre-empt the owner and does not merge.

## 9. Required reruns and hosted evidence

### Load-bearing specs

```text
$ npm run test:unit -- tests/unit/author-ledger.spec.ts tests/unit/author-ledger-fixtures.spec.ts
Test Files  2 passed (2)
Tests       52 passed (52)
  blocking spec: 9 passed
  hostile fixtures: 43 passed
TARGETED_REAL_EXIT=0
```

### Deeper repair probe

The remedy construction is recorded in §5. For the one M1 leg not actually
reached by its fixture, the shipped function was bundled from the current source
and called on the same uncited owner-acceptance row:

```text
OUT_OF_SCOPE=[]
OBLIGATED=["row C99 claims OWNER-ACCEPTED without citing the owner"]
```

### Governed fingerprint

```text
GOVERNED_FINGERPRINT=763a4a5efd7d
GOVERNED_CHANGED_PATHS=0
```

The declared value is unchanged and matches the detector's computed value.

### Full repository gate

The complete review text was present and uncommitted for this run.

```text
$ ./tools/checks
first run:
  lint:       0 errors / 145 warnings
  format:     review document required Prettier normalization
  REAL_EXIT=1 (stopped at the format step)

after formatting the permitted review file:
  lint:       0 errors / 145 warnings
  format:     clean
  typecheck:  clean
  unit:       1387 passed across 103 files
  REAL_EXIT=0; 4/4 steps reached and passed
```

The author disclosed two local full runs: the first was red at 1385/1387 because
`CardPalette.canvasOnly` and `DeployDialog` each hit the 5000 ms timeout; the
second was green at 1387/1387. Both specs passed in isolation and neither this
branch nor this review changes `src/`. This review does not convert that into
“held”; its own full-gate result is reported above. If `DeployDialog` fires, the
required stash / clean-HEAD isolated spec / restore / isolated spec
discrimination will be used without debugging or rebaselining.

### Hosted head

```text
CI  success  completed
headSha=233a28a3888e3a969a00d46902f6feea595f1dc0
run=31360000846
```

## 10. Claim ledger

| #   | Claim                                                                                                 | Tag      | Evidence                                                                                                   |
| --- | ----------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | The reviewed skill contents match the commission's pins.                                              | MEASURED | Independent `sha256sum`, values in §2.                                                                     |
| 2   | The remedy catches the historical local `C01` and `C53` contradictions.                               | INFERRED | Literal whole-unit rule replay in §5; no fresh-agent execution.                                            |
| 3   | The remedy does not derive omitted external or unchanged members.                                     | MEASURED | Skill scope at `reading-pass:19-29,102-107`; current Git list versus live PR body construction.            |
| 4   | `C01` remains falsely `FIXED`.                                                                        | MEASURED | Commission `:168`; ledger `:54,77,100`; round-4 direction `self-pass-gate-codex-round4-review.md:196-207`. |
| 5   | Exactly eight exported checks are composed, seven guarded.                                            | MEASURED | `rg`/`awk` enumeration and `authorLedger.ts:449-773`.                                                      |
| 6   | The unguarded governed-obligation check does not leak scope in the current loader.                    | INFERRED | `parseNameStatus():253-268`, `loadContext():402-426`, obligation `:449-460`.                               |
| 7   | The owner-acceptance source repair holds but its checked-in fixture is not load-bearing for that leg. | MEASURED | Direct two-sided function probe; fixture mutation `:267-282`; owner filter `:655-661`.                     |
| 8   | The N1 sweep omitted the live PR body and makes `C57` false.                                          | MEASURED | Hosted body read at `233a28a`; ledger `C57` at `:115`; round-4 class at `round4-review.md:215-237`.        |
| 9   | `C53` and the hosted commit inventory now hold.                                                       | MEASURED | Live `gh pr view 141 --json body,headRefOid`; Git count/log.                                               |
| 10  | Hosted CI is green at the actual reviewed head.                                                       | MEASURED | `gh run list`, run `31360000846`, exact full SHA.                                                          |
| 11  | The governed fingerprint remains `763a4a5efd7d`.                                                      | MEASURED | Computed fingerprint and zero governed changed paths.                                                      |
| 12  | Full e2e and integration remain UNVERIFIED.                                                           | MEASURED | They were not run in this review.                                                                          |

**Weakest claims.** The historical founding-case verdicts are counterfactual
procedure walks, not executions by a fresh agent. The NUL-leg verdict depends on
the current loader being the only production constructor of `GateContext`; the
function is exported and tests may supply synthetic contexts. The causal account
is judgement, not a controlled measurement.

## 11. Directions and disagreements

1. **Required before approval:** correct `C01`'s disposition and regenerate
   `C56` from a complete cell-to-commission sweep. Do not restore either cut
   mechanism.
2. **Required before approval:** correct the live PR scope sentence and
   regenerate `C57` from a population that explicitly includes the hosted body.
3. **Recommended:** add the owner-acceptance-specific paired fixture. This is
   low-cost regression evidence and does not change production behaviour.
4. **Recommended outside this repository:** retain Git as the mandatory file
   floor in the skills, but require every set/universal claim to name an
   independently obtained population source plus external/unchanged members.
   Preserve `NOT CHECKED` as an honest result.
5. **No pivot requested:** do not widen `GATE_OWN`, restore the anchor/message
   certificate, re-drive the sixteen-state table, or modify the reduced design.

Disagreements with the author are explicit:

- I agree that `C22` was a false positive in the M2 concession sweep.
- I agree that M1's deliberate unguarded check is sound, and I independently
  close the eight-check class.
- I disagree that `C01` was corrected: its sentence was narrowed, but its
  retained commissioned answer and disposition were not.
- I disagree that the N1 role sweep is complete: the live PR body is the omitted
  current member.
- I judge the skills useful but not load-bearing for population completeness;
  their own disclosure substantially agrees with that narrower description.

## 12. Out-of-scope observations

No serious out-of-scope defect was found. The reduced mechanism, accepted
residues, sixteen-state table, worklist, prior parser/fingerprint/matrix
clearances, product code and test flakes were not re-reviewed. The full gate is
reported as current verification, not as a re-opening of those decisions.

## MemPalace drawer candidates

The reviewer did not write MemPalace. Under MP-LEASE, the write-enabled author
may file these with `added_by="codex"` and index them in the same pass:

1. **[ANTIPATTERN] A CHANGED-FILE LIST IS A FLOOR FOR A READING PASS, NOT THE
   POPULATION OF A SEMANTIC UNIVERSAL.** Git can force every edited file into
   view; it cannot discover an unchanged sibling, hosted PR body or other
   external member. Before expanding “all,” name an independent source of truth
   for the set and add external/unchanged members explicitly. Evidence: HAVDM PR
   #141 round 5, where five freshly readable `C57` members coexisted with an
   omitted live-body sixth member and a false `FIXED`.
2. **[RULE] A REGRESSION FIXTURE THAT NAMES TWO GUARDS MUST FAIL AGAINST THE OLD
   IMPLEMENTATION FOR EACH GUARD.** One mutation can reach one validator while
   the twin returns empty for unrelated reasons; asserting both empty on the
   accepting side does not prove both guards. Give each validator a mutation
   that reaches it and pair out-of-scope green with obligated red. Evidence:
   HAVDM PR #141 round 5, `checkDispositions()` versus
   `checkOwnerAcceptance()`.
