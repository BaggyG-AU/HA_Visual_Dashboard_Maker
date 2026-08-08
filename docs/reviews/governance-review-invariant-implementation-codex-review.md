Author: Claude Opus (PR #139 governance change)
Reviewer: OpenAI Codex (GPT-5), independent reviewer; did not author the change
Owner gate: BaggyG-AU reads PR #139 and this review together; only the owner signs off and merges PR #139

# Independent Governance Review — Review Invariant Implementation

## Verdict

**CHANGES-REQUIRED — High confidence.** The PR accurately carries the core
PR #137 measurements and correctly annotates the old implementation exclusion,
but the binding law is not yet internally executable: class (d) is universal
while the invariant is still expressly an F5/F8 pilot; post-finding narrow
rounds have no trigger or exit rule; REV-RERUN generalises one PR into a
universal mandate and overstates the MEDIUM evidence; and MP-LEASE conflicts
with the repository's still-operative PR-body fallback.

**Merge-readiness recommendation:** PR #139 is **not ready for the owner to
merge**. Resolve M1–M4 in the governance sources, then commission a narrow
follow-up review of only those corrections and their cross-document sweep.

## Scope, method, and evidence boundary

- Branch `feature/governance-review-invariant-implementation` began clean at
  `0a311bbef96af6b856c0e03511037ea68080b5c4`; local and remote `main` were
  `a6ce103c560ac45331321c8956bb445c789fa9d0`.
- `gh pr view 139` showed PR #139 open, non-draft and unmerged, with head
  `0a311bb` and base `main`.
- `git diff --stat main...HEAD -- src/ tests/` was empty. The complete content
  diff changes only `docs/governance/OPERATING_AGREEMENT.md`,
  `docs/governance/PROMPTMI_GOVERNANCE_REVIEW_2026-08.md`, and
  `docs/testing/TESTING_STANDARDS.md`. This is docs-only; no e2e or integration
  run is owed.
- `./tools/checks` exited 0 on the branch plus this review: Prettier clean,
  TypeScript clean, ESLint **0 errors / 145 warnings**, and Vitest **1,335 passed
  across 101 files**.
- I read the three changed documents, `ai_rules.md`, `CLAUDE.md`, the relevant
  MemPalace protocol and adversarial-review rules, all six rounds of
  `docs/reviews/f5-sections-palette-drop-codex-review.md`, the PR #137 commit
  sequence, and the six committed Codex review prompts. I swept
  `docs/governance/`, `docs/testing/`, `ai_rules.md`, and `CLAUDE.md` for stale
  implementation exclusions, provisional/binding re-run language, and
  drawer-candidate destinations.
- MemPalace was unavailable in this session: no `mempalace_*` tool was
  callable. I therefore could not read ARB-R8, GOV-RAT, or the PR #137 anatomy
  drawer by ID. Their exact drawer-only wording is **UNVERIFIABLE in this
  review**; I did not substitute semantic search or claim a memory read.
- I did not edit the three governance/testing source documents, the PR body,
  UAT, `[STATE]`, or any implementation/test file; did not create a branch or a
  second PR; and did not ready-mark or merge PR #139.

## Claim ledger

| Claim                                                                           | Tag                | Review judgment and evidence                                                                                                                                                                                            |
| ------------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PR #139 is docs-only at the commissioned commits                                | MEASURED           | Confirmed by `git rev-parse`, `gh pr view 139`, the empty `src/ tests/` stat, and the three-path complete diff.                                                                                                         |
| PR #137 round 1 returned 31/1 against 32/32, then 3/2 at `--repeat-each=5`      | MEASURED           | Confirmed in `docs/reviews/f5-sections-palette-drop-codex-review.md:47-100,366-388`.                                                                                                                                    |
| Round 1 contained seven findings and later rounds made no product-source change | MEASURED           | Five Majors plus two minors are present; `git diff 4827082..<each later review> -- src/` is empty, matching the round-6 record at `docs/reviews/f5-sections-palette-drop-codex-review.md:1057-1063`.                    |
| One full mandatory implementation review is the right minimum                   | JUDGEMENT          | Defensible: round 1 found the load-bearing defects, while later rounds concentrated on repair evidence. It still needs the post-repair rule in M2.                                                                      |
| REV-RERUN items 1–3 should bind every class-(d) review                          | JUDGEMENT          | Not established by one implementation PR, and the text has no applicability path for slices without one load-bearing spec or a repeatable flaky mechanism; M3.                                                          |
| The MEDIUM sweeps produced identical results in two consecutive review rounds   | MEASURED           | Not established as reviewer evidence: round 1 explicitly did not rerun the author's MEDIUM e2e sweep; only round 2 records the 107/56 reviewer runs. M3.                                                                |
| PR #137 M1 was an implementation-class failure                                  | INFERRED           | Acceptable only in the artifact-class sense: it was a test-harness/proof defect inside an implementation slice, not a demonstrated product-code defect (`docs/reviews/f5-sections-palette-drop-codex-review.md:11-29`). |
| The MP-LEASE workflow reflects the PR #137 handoff                              | MEASURED / PARTIAL | The round prompts corroborate repeated lease refusal and author-filed records, but the codified destination contradicts current PR-body rules; M4. The exact drawer account was unavailable.                            |

**Weakest review claim:** M1 treats the unchanged pilot language as a blocking
scope ambiguity rather than an implicit wrapper around the new class. I judge
it blocking because the old ratification defines the pilot as two F5/F8 spec
artifacts while the new operative text says every slice implementation; a
future reviewer cannot safely infer which scope the owner intended.

## Major findings

### M1 — Class (d) is universal inside a still-limited F5/F8 pilot, and its cost has no effective rollback trigger

**Evidence.** The §3 preamble still says the invariant is “piloting on F5/F8”
and that permanence is decided at the v1.0.0 gate
(`docs/governance/OPERATING_AGREEMENT.md:108-109`). The ratification record is
more specific: F5 and F8 run the two-artifact pilot, and only at the gate does
the owner either make the invariant permanent for Phase 8 or drop it
(`docs/governance/PROMPTMI_GOVERNANCE_REVIEW_2026-08.md:269-294`). The new law,
however, governs “slice implementations” without an F5/F8 qualifier, says
nothing in class (d) is exempt, applies to “a slice implementation,” and indexes
REV-IMPL as Standing (`docs/governance/OPERATING_AGREEMENT.md:117-125,186-195,271`).

That leaves two incompatible readings: only the F5/F8 implementation artifacts
are added to the existing pilot, or every current and future slice now owes the
round before the pilot's permanence decision. The PR's own cost premise assumes
the latter, but the governing preamble still states the former scope.

The class-(d) rollback trigger also catches only three consecutive rounds with
no acted-on finding (`OPERATING_AGREEMENT.md:173-176`). The wall-clock trigger
still says “per spec” (`:177-179`). An implementation review can consume more
than one session on every slice while always finding one small acted-on residue;
neither trigger fires. This is the new recurring cost the old spec-only trigger
cannot observe.

**Required correction.** Make the scope explicit in the preamble, §3.4 and the
REV-IMPL row: either class (d) is limited to the remaining F5/F8 pilot artifacts
until the v1.0.0 decision, or the owner has expanded the pilot/universal scope
and the old two-artifact permanence wording is superseded. Add an implementation
wall-clock/cost trigger that can fire even when reviews find minor actionable
residues.

**Class swept:** all pilot/permanence and rollback statements in the Operating
Agreement and the ratification document. These are the only live scope and cost
statements for the §3 invariant; both are affected.

### M2 — “One mandatory round” does not say when a repair requires the narrow next round

**Evidence.** §3.4 makes only the first round mandatory, describes rounds 2+ as
narrow, and permits the owner to accept “evidence-only residues” with the merge
(`OPERATING_AGREEMENT.md:190-195`). It later says a fix round is unreviewed new
work and that round N+1 exists because a repair can introduce its own defect
(`:211-214`). It never states which repair makes N+1 mandatory, what counts as
an evidence-only residue, or when the sequence stops. The REV-IMPL index row
repeats the outcome but supplies no missing trigger (`:271`).

On the literal rule, an author can apply a review's Major code or test-harness
repair after the sole mandatory round and the owner can merge without a
different model reviewing that new work. That contradicts both the stated
reason for narrow follow-up and the invariant's review-before-owner ordering.
Conversely, reading every residue as requiring another round recreates the six-
round cost the ruling is meant to stop.

**Required correction.** Define the lifecycle, not only the width. A concrete
boundary would be: one full round is always mandatory; a finding-driven change
to product code or behavior-bearing tests/tools requires one narrow follow-up
covering the finding plus regression scope; documentation/PR-body evidence-only
residues may be accepted by the owner without another round; and the owner may
merge when no repair that requires follow-up remains. Define “evidence-only” in
the rule rather than leaving it to inference.

**Class swept:** §3's invariant statement, mechanics, rollback triggers, all of
§3.4, the REV-IMPL row, and the TESTING_STANDARDS re-run section. Only §3.4
addresses later-round obligation, so the ambiguity is not resolved elsewhere.

### M3 — REV-RERUN binds a universal workflow from one PR and overstates the evidence that supports the carve-out

**Evidence.** The previous review found that two rounds on one PR supported a
provisional heuristic, not a universal mandate
(`docs/reviews/f5-sections-palette-drop-codex-review.md:716-744`). This PR changes
the route from scope overreach to a proper §3(b) governance PR, but it does not
add another implementation PR: the evidence remains n=1 PR. Six review rounds
measure the same F5 slice and are not six independent slice samples.

The binding text assumes every slice has **one** load-bearing spec and a
“flakiest mechanism” on which the reviewer can always go deeper than the author
(`OPERATING_AGREEMENT.md:221-227`; `TESTING_STANDARDS.md:831-836`). It gives no
rule for multiple load-bearing specs, no `not applicable` path for a slice with
no repeatable mechanism, no stopping/cost bound when the author already
published a deep repeat, and no definition of “deeper.” A reviewer cannot obey
that mandate honestly for every class-(d) artifact.

The MEDIUM rationale also strengthens the record beyond what was independently
run. §3.5 says the sweeps produced identical numbers in “two consecutive
rounds” and found nothing in either (`OPERATING_AGREEMENT.md:235-240`), and
TESTING_STANDARDS says the two sweeps were identical “in both rounds”
(`TESTING_STANDARDS.md:824-829`). But the round-1 review explicitly says the
reviewer **did not rerun** the author's multi-file MEDIUM e2e sweep
(`docs/reviews/f5-sections-palette-drop-codex-review.md:390-400`). Only round 2
records reviewer-observed 107-pass e2e and 56-pass/19-skip integration sweeps
(`:534-545`). The first number may be author-reported, but calling both rounds
equivalent measured outcomes conflicts with this PR's own rule that an
unperformed rerun remains UNVERIFIED (`OPERATING_AGREEMENT.md:242-246`).

**Required correction.** Keep items 1–3 as guidance while the F5/F8 pilot
collects another implementation sample, or explicitly bind only the pilot and
record the owner's acceptance of n=1 as a judgement rather than a measured
generalisation. If binding remains, define multi-spec and no-applicable paths,
the minimum meaningful escalation, and a cost cap. Correct the MEDIUM narrative
to distinguish the author's prior reported counts from the one independently
observed reviewer rerun.

**Class swept:** every live implementation/re-run statement in
`docs/governance/`, `docs/testing/`, `ai_rules.md`, and `CLAUDE.md`, plus all six
rounds of the PR #137 review. No other live document still says the split binds
nobody; the affected overstatement is confined to the two changed policy
surfaces above.

### M4 — MP-LEASE sends the same reviewer notes to two different places

**Evidence.** Immediately before the new rule, the Operating Agreement sends
agents without MemPalace write access to the **PR body**
(`OPERATING_AGREEMENT.md:89-92`). The new MP-LEASE paragraph sends the reviewer
to a **`MemPalace drawer candidates` section in the review file** (`:93-104`),
and the MP-LEASE index row repeats the review-file destination (`:273`). The
repository-wide fallback still requires the PR body in
`ai_rules.md:319-335` and `CLAUDE.md:59-68`.

The specific reviewer convention is workable and matches the PR #137 round
prompts: it preserves the reviewer's write restriction while letting the
write-enabled author file with `added_by="codex"`. But the PR does not state
that it is a reviewer-specific exception to the general fallback, and it does
not update or annotate the two instructions a future no-MemPalace reviewer is
told to follow. This is exactly the under-reach class: the new ruling lands, but
its displaced destination remains operative.

**Required correction.** State one rule everywhere: independent reviewers put
drawer candidates in their committed review file and the write-enabled author
files them with reviewer attribution; non-reviewing agents may continue using
the PR body if that distinction is intended. Update or explicitly supersede the
PR-body language in the Operating Agreement, `ai_rules.md`, and `CLAUDE.md`.
Also reflow the new paragraph's broken “author-reviews-by-a -different-model”
wording and unindented `candidates` continuation while touching it
(`OPERATING_AGREEMENT.md:94-98`).

**Class swept:** every `drawer candidate`, PR-body fallback, writer-lease, and
`added_by` instruction in the commissioned governance/testing scope. The three
listed PR-body surfaces are the affected live instructions; the MemPalace
protocol's lease/latch mechanics remain consistent and need no change.

## Checked clean

- **ARB-R8 header placement:** I did not file a finding against the long-lived
  Operating Agreement. The new §3.1 paragraph and ARB-R8 index row both put the
  header on the change artifact and exempt `ai_rules.md`/`CLAUDE.md`; this review
  itself carries the required three lines. Exact word-for-word drawer comparison
  was unavailable, as declared above.
- **Stale implementation exclusion:** the old quoted exclusion in
  `PROMPTMI_GOVERNANCE_REVIEW_2026-08.md:178-188` is clearly marked superseded,
  and the old “Do not adopt” row is visibly overturned. I found no other live
  implementation exclusion in the commissioned sweep.
- **M1 classification:** the original review calls M1 a proof/test-harness
  defect rather than a product-code defect. Treating it as a defect of the
  implementation-slice artifact is a fair reason to test REV-IMPL, provided the
  wording is not later strengthened into a demonstrated product failure.
- **PR #137 numbers and history:** 31/1, 3/2, five Majors plus two minors, the
  no-`src/` repair history, and the clean sixth review are accurately restated.
- **Four §4 rows versus their bodies:** ARB-R8, REV-IMPL, REV-RERUN and MP-LEASE
  summarize their corresponding new body text. M1–M4 concern the body rules or
  stale consequences, not a body/index mismatch.
- **MP lease mechanics:** the prohibition on killing a process or setting
  `MEMPALACE_MCP_ALLOW_PEER_WRITER`, the permanent read-only latch, and the stale
  index rationale agree with `docs/governance/MEMPALACE_PROTOCOL.md:97-127`.
- **Scope control:** apart from the consequences identified in M1–M4, I found no
  fifth ruling or unrelated behavioral change in the three-file diff.

## MemPalace drawer candidates

- `havdm/review`, `added_by="codex"` — **PR #139 independent governance
  review:** CHANGES-REQUIRED, high confidence. The core PR #137 measurements and
  ARB-R8 placement are clean. M1 finds universal class-(d) wording inside an
  unchanged F5/F8 pilot plus no effective implementation cost trigger; M2 finds
  no trigger/exit rule for narrow post-repair rounds; M3 finds n=1 PR
  insufficient for universal REV-RERUN, no applicability path, and a conflated
  two-review-round MEDIUM account; M4 finds review-file drawer candidates in
  direct conflict with three live PR-body fallbacks. PR #139 is not owner-
  merge-ready pending a narrow correction and follow-up review.
- `practice/review`, `added_by="codex"` candidate — **A mandatory review minimum
  needs a repair-follow-up rule:** saying “one mandatory round” is incomplete
  when the round can cause unreviewed code or test changes. Name which repair
  classes require a narrow follow-up, what residues the owner may accept, and
  the exit condition; otherwise the process permits both under-review and
  endless review.

## Round 2

**Verdict: CHANGES-REQUIRED (high confidence).** **Merge readiness: not ready.**
M1 and M3 are resolved. M2 and M4 are only partially resolved and each leaves
one merge-blocking defect. The class-(d) three-slice cost threshold is a
non-blocking judgement the owner may accept with the merge after the blockers
are corrected.

### Disposition of M1–M4

| Round-1 finding                   | Disposition            | Merge effect               | Round-2 judgement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------------- | ---------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1 — pilot scope and cost trigger | **RESOLVED**           | None                       | Class (d) unambiguously covers every implementation slice from 2026-08-08 until the shared v1.0.0/Phase 7 pilot gate. Keeping the owner's extension inside the existing pilot is the faithful conservative reading: the ruling widened the pilot's subject matter but did not say to make class (d) permanent. In the stated scenario, after the third consecutive slice the accumulated review time is over one working session and all three findings are evidence-only, so the new trigger fires even though each slice produced a small acted-on residue. |
| M2 — repair lifecycle             | **PARTIALLY RESOLVED** | **MERGE-BLOCKING — R2-M1** | A Major product fix now requires a narrow follow-up and the sequence stops when no qualifying repair remains. The mechanical evidence-only test still has false negatives outside its three named directories.                                                                                                                                                                                                                                                                                                                                                |
| M3 — MEDIUM correction and n=1    | **RESOLVED**           | None                       | Both policy documents now distinguish round 1's author-reported MEDIUM figures from round 2's sole independently observed MEDIUM rerun. The binding rule is candidly an owner judgement based on one PR and is bounded by the pilot. A slice with no load-bearing spec and no repeatable flaky mechanism can mark items 1 and 2 not applicable with the named substitute/reason, then run item 3, without inventing evidence.                                                                                                                                 |
| M4 — MP-LEASE destination         | **PARTIALLY RESOLVED** | **MERGE-BLOCKING — R2-M2** | The Operating Agreement and its index now state the reviewer-specific refinement, but the first instruction a reviewer is told to read still sends the notes to the PR body. The contradiction therefore survives at the decisive surface.                                                                                                                                                                                                                                                                                                                    |

### R2-M1 — the evidence-only mechanical test still misses live behaviour surfaces

**Evidence.** The lifecycle correctly requires a narrow follow-up after a change
to product code or behaviour-bearing tests or tools
(`docs/governance/OPERATING_AGREEMENT.md:238-260`). Commit `fa62399` also made
step 3 check `src/`, `tests/`, and `tools/`, closing the specific mismatch from
the first repair (`:243-258`). But the repository has existing executable or
behaviour-bearing paths outside all three: root-level
`analyze-test-results.js`, `package.json`, `playwright.config.ts`,
`vitest.config.ts`, and `vite.*.config.ts`; `.github/workflows/`; and product
templates under `templates/`. A repair can change any of them while
`git diff --stat <previous review commit>..HEAD -- src/ tests/ tools/` remains
empty. The prose definition would still say such a change is not evidence-only,
but the purportedly mechanical guard does not establish that fact and can be
gamed or applied as a false proof. The maintenance warning compounds the
problem by assuming each behaviour-bearing surface can be represented as a
directory added to both lists (`:262-264`), while the closing summary again
mentions only `src/` and tests (`:266-268`).

**Required correction.** Make the mechanical test conservative over the whole
diff—for example, mechanically allowlist the known prose-only review/document
paths and require review for every other changed path—rather than trying to
enumerate executable directories. Align steps 2 and 3, the maintenance warning,
and the closing summary. The result must classify root configuration and
scripts, workflows, templates, and any future behaviour-bearing path without
human inference being presented as a mechanical proof.

**Class swept.** I enumerated the tracked tree rather than stopping at the
prompt's `tools/` example. The third-surface problem is a repository-path-class
gap, not another omission confined to one known directory. I found no separate
lifecycle or termination defect: a product-code Major cannot now reach merge
after the sole full round without the required narrow follow-up, and step 4 is
a finite exit rule.

### R2-M2 — the reviewer destination still conflicts at `ai_rules.md`

**Evidence.** The Operating Agreement now calls the review-file destination a
reviewer-specific refinement and preserves the PR body for non-reviewers
(`docs/governance/OPERATING_AGREEMENT.md:89-106`); the MP-LEASE index row says
the same (`:360`). `CLAUDE.md:70-81` adds an exception, although its
“independent reviewer ... **or** your write is refused” construction can also
be read to include a non-reviewer whose write is refused, contrary to the
paragraph's “independent reviewers only” label and its final “Every other
agent” sentence.

The decisive conflict remains unchanged in `ai_rules.md`. That file calls
itself immutable, says its rules win unless a prompt explicitly overrides it,
and tells an agent to read it first (`ai_rules.md:1-13`). It then twice directs
an agent without MemPalace to put drawer candidates in the PR body
(`ai_rules.md:319-335`) and neither points to nor scopes an exception for an
independent reviewer. Calling the later Operating Agreement text a
“refinement” cannot make that destination discoverable to the no-MemPalace
reviewer who reads only the instruction it was told to read. The title
“Immutable” is not a resolution of two incompatible actions.

**Required correction.** Put the reviewer exception in `ai_rules.md` itself,
or add an equally explicit pointer there that makes the review-file destination
authoritative for independent reviewers while retaining the PR body for
everyone else. Tighten `CLAUDE.md` so the exception unambiguously applies only
to independent reviewers. Keep the Operating Agreement bullet and MP-LEASE row
aligned with that single rule.

**Class swept.** I checked the live fallback destinations in the Operating
Agreement, its MP-LEASE index row, `CLAUDE.md`, and `ai_rules.md`. The author's
extra index-row repair is present, but the sweep missed the unchanged
high-precedence instruction and the ambiguous `CLAUDE.md` condition. The
writer-lease/latch mechanics were outside this narrow round because round 1
already checked them clean.

### Regression and repair sweep

- The branch began this round at the commissioned `fa62399`; `main` and
  `origin/main` were both `a6ce103`, and PR #139 was open and unmerged.
- `git diff bfcc01a..bcba77a` changes only `CLAUDE.md`,
  `docs/governance/OPERATING_AGREEMENT.md`, and
  `docs/testing/TESTING_STANDARDS.md`. Commit `fa62399` changes only the
  Operating Agreement. Neither repair range changes `src/`, `tests/`, PNGs,
  signed feature specifications, UAT material, `[STATE]`, or `ai_rules.md`.
- `git diff --stat main...HEAD -- src/ tests/` was empty. This is a docs-only
  governance review, so I did not run e2e or integration tests.
- `./tools/checks` exited 0: lint reported 0 errors / 145 warnings, formatting
  and typecheck passed, and all 1,335 unit tests passed across 101 files.
- The repair introduced the two same-class defects above. I found no unrelated
  fifth ruling or behavioural expansion in the repair diff.

### Step 3 — the author's weakest claims

1. **Pilot scope — accepted.** The new wording is explicit and the conservative
   reading is faithful. “Extend” did not silently ratify permanence; the owner
   can make permanence a later ruling at the already-declared gate.
2. **Mechanical test — rejected.** Adding `tools/` closes the published example
   but not the defect class. Existing root scripts/configuration, workflows,
   and templates supply third surfaces, producing R2-M1.
3. **No `ai_rules.md` edit — rejected.** The unchanged general rule is both the
   highest-precedence text and the first surface a future reviewer is told to
   read. Scope elsewhere does not resolve the contradiction there, producing
   R2-M2.
4. **Three-slice threshold — accepted as a pilot judgement, not as measured
   fact.** It is invented rather than measured, but it is openly bounded,
   reversible, and capable of firing in the named scenario. This is a note the
   owner may accept with the merge, not a blocker.

### Step 4 — verdict, merge readiness, and rollback

**CHANGES-REQUIRED, high confidence.** PR #139 is **not merge-ready**. R2-M1
and R2-M2 are merge-blocking because each leaves a mechanical or instruction
path through a rule whose stated purpose is invariance. Correct those two
findings and commission one narrow follow-up over only those corrections and
their same-class sweep. The three-slice threshold is expressly a non-blocking
owner-judgement note that may be accepted with the eventual merge.

No §3.3 rollback trigger has fired. This governance PR is not one of the three
consecutive class-(d) implementation slices needed for either class-(d)
trigger; the review rounds also produced acted-on findings rather than three
clean rounds. There is therefore no evidentiary basis in this round to drop or
narrow the pilot before its existing triggers or gate operate.

### Checked clean and not checked

- **Checked clean:** M1's population and time boundary; the cost-trigger walk;
  M2's product-fix follow-up and termination; both M3 MEDIUM accounts, n=1
  framing, and applicability paths; the M4 Operating Agreement bullet/index;
  the complete repair path list and the changed-file regression scope.
- **Not reopened:** ARB-R8 header placement, the superseded implementation
  exclusion, PR #137's numbers, the four original §4 rows against their bodies,
  lease mechanics, and original scope control. Round 1 checked those clean and
  this commission prohibited reopening them.
- **Not checked:** e2e, integration, UAT, and product behaviour, because the
  repair is docs-only and the commissioned rerun is `./tools/checks` only.
  MemPalace remained unavailable, so the two drawer contents and author filing
  could not be inspected; all drawer-only claims remain **UNVERIFIABLE**. The
  repository evidence stands independently of them.

### MemPalace drawer candidates

- `havdm/review`, `added_by="codex"` — **PR #139 round-2 narrow governance
  review:** CHANGES-REQUIRED, high confidence; not merge-ready. M1 and M3 are
  resolved. M2 remains merge-blocking because the evidence-only mechanical
  test misses behaviour-bearing root scripts/configuration, workflows,
  templates, and future paths outside `src/`, `tests/`, and `tools/`. M4 remains
  merge-blocking because unchanged, high-precedence `ai_rules.md` still sends a
  no-MemPalace reviewer to the PR body, while `CLAUDE.md` states an ambiguous
  “reviewer or refused write” condition. The invented three-slice threshold is
  a bounded, reversible pilot judgement the owner may accept with the merge.
  No §3.3 rollback trigger fired. Correct R2-M1 and R2-M2, then commission one
  narrow follow-up review.
