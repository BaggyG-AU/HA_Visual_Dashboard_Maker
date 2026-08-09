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

## Round 3

**Verdict: CHANGES-REQUIRED (high confidence).** **Merge readiness: not ready.**
Both round-2 corrections make the right central move, but both remain only
partially resolved. The evidence-only regex still admits behaviour-bearing
paths, and `ai_rules.md` still gives a no-MemPalace reviewer a third destination
in local memory. The PR is structurally converging, but those are not residues
the owner should accept with the merge.

### Disposition of R2-M1 and R2-M2

| Round-2 finding                       | Disposition            | Merge effect               | Round-3 judgement                                                                                                                                                                                                                                                                                                             |
| ------------------------------------- | ---------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R2-M1 — evidence-only mechanical test | **PARTIALLY RESOLVED** | **MERGE-BLOCKING — R3-M1** | Inverting the test from an executable-directory blocklist to a prose-path allowlist closes the omitted-third-surface class outside the allowlist. The actual regex is broader than the prose allowlist it describes: the directory alternative accepts any file type, and the two filename alternatives are not end-anchored. |
| R2-M2 — one MP-LEASE destination      | **PARTIALLY RESOLVED** | **MERGE-BLOCKING — R3-M2** | The reviewer exception is now explicit in `ai_rules.md`, `CLAUDE.md`, the Operating Agreement and the reviewer template. But `ai_rules.md:329` still directs an unavailable/read-only case to local memory files, so reading §11 straight through does not yield one destination.                                             |

### R3-M1 — the allowlist regex still accepts behaviour-bearing paths

**What the real ranges printed.** I ran the rule's exact filter over two real
ranges:

```text
$ git diff --name-only fa62399..446271d | grep -vE '^(docs/reviews/|PR_NOTES\.md|CODEX_SUMMARY\.md)'
<no output>  # exit 1; the range changes only the Round-2 review file

$ git diff --name-only 446271d..0fa3de9 | grep -vE '^(docs/reviews/|PR_NOTES\.md|CODEX_SUMMARY\.md)'
CLAUDE.md
ai_rules.md
docs/governance/OPERATING_AGREEMENT.md
docs/templates/ADVERSARIAL_REVIEW.md
```

Those results correctly classify the actual review-only and governance-repair
ranges. They do not decide the wider claim that every behaviour-bearing path is
rejected.

**Counterexample.** The regex's alternatives match prefixes, not the prose-file
population stated at `docs/governance/OPERATING_AGREEMENT.md:263-275`. This
negative test printed nothing and exited 1 for all three constructed paths:

```text
$ printf '%s\n' PR_NOTES.md.sh CODEX_SUMMARY.md/tool.js docs/reviews/behavior-bearing-tool.sh \
    | grep -vE '^(docs/reviews/|PR_NOTES\.md|CODEX_SUMMARY\.md)'
<no output>
```

A repair can therefore add a shell/JavaScript tool under an allowed prefix and
pass the mechanical test. `git ls-files docs/reviews` currently enumerates
eight files and all eight are Markdown reviews: the two `HAVDM_ADVERSARIAL`
reviews plus `contributor-fallback`, `f5-sections-palette-drop`,
`f5-spec-insertion-contract`, `governance-codification`,
`governance-review-invariant-implementation`, and `parameterise-host-refs`.
There is no unsafe current member; the unsafe claim is the wholesale future
wildcard. This is exactly the kind of negative case that the universal at
`docs/governance/OPERATING_AGREEMENT.md:290-292` says is impossible.

**Required correction.** Anchor the alternatives and constrain the review
population to review documents—for the current layout, for example:

```text
grep -vE '^(docs/reviews/[^/]+\.md|PR_NOTES\.md|CODEX_SUMMARY\.md)$'
```

The exact expression is the author's choice, but a behaviour-bearing suffix,
subpath or non-document beneath an allowed prefix must print. Exercise those
negative cases before claiming the class closed.

**Other R2-M1 questions — no issue found.** Excluding `ai_rules.md`,
`CLAUDE.md` and `docs/governance/**` is conservative but not improper
over-reach: rule text is the governance product, so prose syntax alone does not
make a repair evidence-only (`OPERATING_AGREEMENT.md:299-303`). Steps 2 and 3,
the single-list maintenance warning and the closing summary are mutually
consistent (`:259-307`). The lifecycle also terminates: a governance finding
repaired in round N requires N+1; if N+1 is clean, there is no repair and step 4
stops, while a finding the owner declines to repair likewise creates no further
repair. Repeated fresh defects can prolong the process, but the rule does not
force another round in the absence of another repair.

### R3-M2 — `ai_rules.md` still names a third destination

**The five live surfaces.** Four now state the intended reviewer exception
without ambiguity:

- `docs/governance/OPERATING_AGREEMENT.md:89-105` — non-reviewers use the PR
  body; the independent reviewer uses the committed review file. The MP-LEASE
  row repeats the exception at `:399`.
- `CLAUDE.md:70-85` — “if — and only if” the agent is the independent reviewer,
  it uses the review file; `:83-85` explicitly says a refused write alone does
  not qualify a non-reviewer.
- `docs/templates/ADVERSARIAL_REVIEW.md:27-35` — “this document, not ... the PR
  body” for the commissioned independent reviewer.
- `ai_rules.md:323-325` — the general PR-body fallback followed immediately by
  “One exception ... the independent reviewer”; `:337` repeats the carve-out.

The fifth reading is inside that last surface: `ai_rules.md:329` still says
“If MemPalace is unavailable (tools absent, or the server is read-only) ...
fall back to local memory files.” A no-MemPalace independent reviewer reading
§11 straight through therefore encounters PR body at `:323`, review file at
`:325`, and local memory at `:329`, before review file is repeated at `:337`.
The exception is scoped to the PR-body fallback and does not expressly displace
the local-memory instruction. R2-M2 required one unambiguous destination, so
this same-class member remains merge-blocking.

**Required correction.** Reconcile the absent and read-only branches at
`ai_rules.md:319-337` and state expressly that an independent reviewer uses the
committed review file instead of either the PR-body or local-memory fallback.
Preserve whichever local-memory rule is intended for non-reviewers; this
finding does not require redesigning their policy.

**History-count verification — no issue found.** These commands returned 18 at
the pre-amendment review commit, then 19 at both the amendment and current head:

```text
git log --follow --format='%H' 446271d -- ai_rules.md | wc -l  # 18
git log --follow --format='%H' c4fd0a4 -- ai_rules.md | wc -l  # 19
git log --follow --format='%H' 0fa3de9 -- ai_rules.md | wc -l  # 19
```

The 18-commit enumeration at `446271d` is `6b8e1a9`, `cc5577c`, `289163a`,
`96c4a95`, `18f3ef5`, `4e66a49`, `116a2e5`, `939d4b5`, `d72fcc7`, `a59377e`,
`e67be52`, `23f441a`, `1774ac0`, `2613ee4`, `d88e255`, `2dba83d`, `293a869`,
and `ac4a4ad`. `git show` verifies that the five named governance commits
`18f3ef5`, `96c4a95`, `289163a`, `cc5577c` and `6b8e1a9` each amend §11.
Pinning “eighteen” to `446271d` is accurate, and `0fa3de9` correctly repairs the
first draft's stale count.

**Other R2-M2 questions — no issue found.** The `CLAUDE.md` condition is now
unambiguous. Adding the destination to `ADVERSARIAL_REVIEW.md` is a legitimate
class sweep, not unrelated scope: both `ai_rules.md:335` and
`CLAUDE.md:123-128` send a no-MemPalace reviewer to that template. Editing
`ai_rules.md` is the sounder of the two options R2-M2 offered and resolves,
rather than disturbs, its §0 precedence rule. No other conflict was introduced
by placing the exception in the higher-precedence file; the remaining conflict
is the pre-existing local-memory sentence the destination sweep missed.

### Regression and same-class sweep

- The branch began clean at the commissioned `0fa3de9`; `main` and
  `origin/main` were both `a6ce103`, and PR #139 was open and unmerged.
- `git diff 446271d..0fa3de9` changes exactly `ai_rules.md`, `CLAUDE.md`,
  `docs/governance/OPERATING_AGREEMENT.md`, and
  `docs/templates/ADVERSARIAL_REVIEW.md`. It changes no `src/`, `tests/`, PNG,
  signed feature specification, UAT material or `[STATE]` content.
- `./tools/checks` exited 0: lint reported 0 errors / 145 warnings, formatting
  and typecheck passed, and all 1,335 unit tests passed across 101 files.
- `gh pr view 139 --json body` showed that the live PR body now accurately says
  round 1 did not rerun the MEDIUM sweeps and round 2 was the sole independently
  observed MEDIUM run. That matches
  `docs/reviews/f5-sections-palette-drop-codex-review.md:390-400` and
  `:534-548`; the correction did not overstate what was observed.
- The corrected “rounds 2–6” account is also accurate. The real
  `4827082..4b02dcc` range has an empty `src/` stat but changes
  `tests/e2e/sections-canvas.spec.ts` and `tools/f5-load-path-sweep.sh` (184
  insertions / 35 deletions combined), so those repairs were not evidence-only
  and each correctly drew a follow-up round.

**Prior clearances, checked at their actual claim width — no issue found.** M1's
pilot population and cost trigger at
`docs/governance/OPERATING_AGREEMENT.md:132-219` were not changed by this repair;
the Round-2 clearance was expressly based on repository text and the ruling
quoted in the commission, while the unavailable drawer remained unverified.
M3's historical account at `OPERATING_AGREEMENT.md:327-372` and
`docs/testing/TESTING_STANDARDS.md:813-849` is unchanged and is now directly
cross-checked against the round-1/round-2 review evidence above. Neither
“RESOLVED” clearance rested on a narrower check than the claim it cleared.

**Previously-clean regression areas, by name and location — no issue found.**
ARB-R8 at `OPERATING_AGREEMENT.md:169-184`, the superseded exclusion in
`PROMPTMI_GOVERNANCE_REVIEW_2026-08.md`, and the lease/latch text at
`OPERATING_AGREEMENT.md:119-125` were not substantively changed. The ARB-R8,
REV-IMPL and REV-RERUN index rows at `:396-398` retain their prior content; the
MP-LEASE row at `:399` changed only to align the repaired exception. The repair
range stays inside the two finding classes; the reviewer template is the one
legitimate extra member of the destination sweep.

**One non-blocking scope-control note.** The repair added historical narrative
at `OPERATING_AGREEMENT.md:105-118` and `:280-303`, although the document's own
preamble says it is pointer-style and “never carries that narrative itself”
(`:15-22`). That is real over-reach: the operative exception, allowlist and
pointers do not need the failed-draft chronology or the 18-commit story. The
owner may accept this note with the merge because it creates no destination or
lifecycle ambiguity and §3.3's named index trigger has not fired; the MP-LEASE
row remains one operative sentence plus its authority pointer. Moving future
case history to the review/PR record would better honor the constitution.

### Step 3 — the author's weakest claims

1. **“The allowlist is a class fix” — partly accepted, but insufficient.** The
   polarity inversion is a class-level correction for every non-allowlisted
   path. The author nevertheless failed to sweep false-negative members inside
   the allowed prefixes, leaving R3-M1. This is not merely `+ one directory`,
   but it is still an incomplete class fix.
2. **Excluding governance documents — accepted.** Governance prose changes the
   operative rule and is appropriately review-requiring; the correction asked
   for known prose-only paths, not every file whose syntax is prose.
3. **Termination — accepted.** The worked governance case above reaches step 4
   after a clean round or an owner-declined repair. Endless fresh repair defects
   are possible in practice but are not mandated by the lifecycle.
4. **Pointer-style narrative — concern confirmed, non-blocking.** The new
   history conflicts with `OPERATING_AGREEMENT.md:15-22`; the owner may accept
   it with the merge, but it should not become the pattern for another repair.
5. **Editing `ai_rules.md` — accepted.** The amendment count and five §11 SHAs
   are verified, and putting the exception in the highest-precedence source is
   cleaner than relying on a cross-document pointer alone.

### Step 4 — verdict, convergence, and rollback

**CHANGES-REQUIRED, high confidence.** PR #139 is **not merge-ready**. R3-M1
and R3-M2 are merge-blocking; the pointer-style narrative is explicitly a note
the owner may accept with the merge. Tighten the regex against the three named
negative cases, reconcile `ai_rules.md:329` with the reviewer exception, and
commission one narrow follow-up over only those two edits and their same-class
negative cases.

Applying §0 rule 1 clause 6 by name, the rising round count is primarily an
**author sweep failure**: R2-M1 did not test the allowed population after
inverting the test, and R2-M2 did not read every destination sentence in §11.
It is not principally a scope-control failure, although the added historical
narrative is a non-blocking example of that secondary risk. The PR is
converging—the two architectural choices are now sound and the remaining
repairs are narrow—but the current residues still falsify the exact mechanical
and single-destination claims.

No §3.3 rollback trigger has fired. This is one governance PR, not three
consecutive implementation slices or spec reviews; its rounds have produced
acted-on findings rather than three clean passes; no machine enforcement was
proposed; and the §4 index still has one row per ruling. The body-narrative note
does not satisfy the specifically named index-accumulation trigger.

### Checked clean and not checked

- **Checked clean:** the central allowlist inversion, its two real-range
  classifications, governance exclusion, lifecycle termination, step/list
  alignment, `CLAUDE.md`, Operating Agreement, index and template destinations,
  the amendment counts and five §11 commits, both live PR-body corrections,
  M1/M3 clearance widths, and the named regression areas above.
- **Could not check:** MemPalace remained unavailable, so the Round-2 review
  drawer, owner-ruling drawer and author filing could not be inspected; all
  drawer-only claims remain **UNVERIFIABLE**. The repository and live PR body
  supplied the evidence used here.
- **Not run:** e2e, integration and UAT. The repair is docs-only and the
  commissioned rerun is `./tools/checks` only.

### MemPalace drawer candidates

- `havdm/review`, `added_by="codex"` — **PR #139 Round-3 narrow governance
  review:** CHANGES-REQUIRED, high confidence; not merge-ready. R2-M1 and
  R2-M2 are both partially resolved. The polarity inversion and explicit
  reviewer exception are sound, but the allowlist admits non-document paths
  under allowed prefixes (R3-M1), and `ai_rules.md:329` still supplies a third
  local-memory destination (R3-M2). The rising round count is primarily an
  author sweep failure, though the PR is structurally converging. Historical
  narrative added to the pointer-style Operating Agreement is a non-blocking
  note the owner may accept with the merge. No §3.3 rollback trigger fired.
  Correct only R3-M1 and R3-M2, exercise their negative cases, then commission
  one narrow follow-up review.

## Round 4

**Verdict: CHANGES-REQUIRED (high confidence).** **Merge readiness: not ready.**
R3-M2 is resolved: the independent reviewer now reaches one destination in
every unavailable form, and the non-reviewer fallbacks remain conditional on
whether a local store exists. R3-M1 closes the named prefix cases but remains
only partially resolved. The command uses Git's rename-collapsing
`--name-only` output, so a behaviour-bearing file renamed into an allowed
review pathname disappears from the input and the repair is certified as
evidence-only. That is one merge-blocking defect, R4-M1.

### Disposition of R3-M1 and R3-M2

| Round-3 finding                  | Disposition            | Merge effect               | Round-4 judgement                                                                                                                                                                                                                                                                 |
| -------------------------------- | ---------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R3-M1 — anchored path allowlist  | **PARTIALLY RESOLVED** | **MERGE-BLOCKING — R4-M1** | The shipped expression rejects the named suffixes, subpaths and wrong extensions. The surrounding `git diff --name-only` command nevertheless omits the preimage of a detected rename, and pathname matching cannot distinguish regular Markdown blobs from symlinks or gitlinks. |
| R3-M2 — one reviewer destination | **RESOLVED**           | None                       | Section 11 expressly displaces both fallbacks for the reviewer in all three unavailable forms, carves the reviewer out of the local branch, and preserves the non-reviewer's pre-existing store-dependent split. No sixth destination was found.                                  |

### R3-M1 — the regex is sound over names, but the command does not enumerate every touched path

I extracted the expression from the shipped Operating Agreement rather than
copying it from the commission, then ran every name through that value. The
loop printed `SILENT` when `grep -vE` printed no path and `PRINTS` when it
printed the path:

```sh
round4_re=$(sed -n "s/.*grep -vE '\([^']*\)'.*/\1/p" \
  docs/governance/OPERATING_AGREEMENT.md | head -n 1)
printf '%s\n' "$round4_path" | grep -vE "$round4_re"
```

```text
EXTRACTED_REGEX=^(docs/reviews/[^/]+\.md|PR_NOTES\.md|CODEX_SUMMARY\.md)$

SILENT  docs/reviews/HAVDM_ADVERSARIAL_REVIEW_2026-08_CODEX_CROSSCHECK.md
SILENT  docs/reviews/HAVDM_ADVERSARIAL_REVIEW_2026-08_FABLE.md
SILENT  docs/reviews/contributor-fallback-codex-review.md
SILENT  docs/reviews/f5-sections-palette-drop-codex-review.md
SILENT  docs/reviews/f5-spec-insertion-contract-codex-review.md
SILENT  docs/reviews/governance-codification-codex-review.md
SILENT  docs/reviews/governance-review-invariant-implementation-codex-review.md
SILENT  docs/reviews/parameterise-host-refs-codex-review.md
SILENT  PR_NOTES.md
SILENT  CODEX_SUMMARY.md

PRINTS  PR_NOTES.md.sh
PRINTS  CODEX_SUMMARY.md/tool.js
PRINTS  docs/reviews/some-tool.sh
PRINTS  docs/reviews/sub/x.md
PRINTS  docs/reviews/x.md.sh
PRINTS  PR_NOTES.mdx
PRINTS  CODEX_SUMMARY.md.bak
PRINTS  docs/reviewsX/y.md
PRINTS  docs/reviews/.md
PRINTS  docs/reviews/x.MD
PRINTS  docs/reviews/x.markdown
PRINTS  .github/workflows/ci.yml
PRINTS  package.json
PRINTS  ai_rules.md

SILENT  docs/reviews/x y.md
PRINTS  docs/reviews/x.md/child
PRINTS  "docs/reviews/x\ny.md"
SILENT  docs/reviews/symlink.md
SILENT  docs/reviews/submodule.md
SILENT  docs/reviews/deleted-review.md
SILENT  docs/reviews/renamed-review.md
```

The first ten are the complete current positive population: `git ls-files`
enumerated eight direct review documents plus the two root documents. All ten
currently have Git mode `100644`; `git ls-files --stage` found no `120000`
symlink or `160000` gitlink anywhere in the repository. A direct name with a
space is valid and accepted. A child of a directory named `x.md` is rejected
because it contains another slash. A newline is either split when fed raw to
line-oriented `grep`, or quoted in Git's non-`-z` name output; the quoted form
above is rejected. Git passes the tracked spelling to the filter even on a
case-insensitive filesystem, so uppercase `.MD` remains rejected.

The silent synthetic symlink, gitlink, deletion and rename names show the
limit of a name-only regex: it cannot decide object type or change status. A
deletion of an allowed evidence path is still an allowed _path_ under the
current rule, and neither a symlink nor a gitlink is currently present or
consumed, so those cases alone do not establish a live behaviour change. They
do show that the prose's “a `.md` file” is narrower than what the mechanism can
observe; the rule must either say it classifies pathnames regardless of Git
mode or mechanically constrain the allowed object types.

**R4-M1 is the concrete behaviour-bearing bypass.** Git's default rename
detection emits only the destination in `--name-only` output. The repository's
own `74a2582` rename supplies fail-against-current-command evidence:

```text
$ git diff --name-status 74a2582^ 74a2582 | rg 'FOUNDATION_LAYER_IMPLEMENTATION'
R100  docs/features/FOUNDATION_LAYER_IMPLEMENTATION.md  docs/archive/features/FOUNDATION_LAYER_IMPLEMENTATION.md

$ git diff --name-only 74a2582^ 74a2582 | rg 'FOUNDATION_LAYER_IMPLEMENTATION'
docs/archive/features/FOUNDATION_LAYER_IMPLEMENTATION.md

$ git diff --no-renames --name-only 74a2582^ 74a2582 | rg 'FOUNDATION_LAYER_IMPLEMENTATION'
docs/archive/features/FOUNDATION_LAYER_IMPLEMENTATION.md
docs/features/FOUNDATION_LAYER_IMPLEMENTATION.md
```

If that same detected rename moves `package.json`, a workflow, source file or
tool to `docs/reviews/x.md`, the shipped command supplies only the allowed
destination to the regex and prints nothing. The repair touched a
non-allowlisted behaviour path, directly falsifying the universals at
`OPERATING_AGREEMENT.md:258-269` and `:276-282`.

**Required correction.** Make the mechanical test enumerate both sides of a
rename—for example, disable rename detection before applying the path
allowlist, or consume a status format that preserves both paths. Decide and
state whether deletions, symlinks and gitlinks are members of the evidence-only
population; if only regular Markdown blobs qualify, the mechanism must inspect
mode/status rather than promise that property from a name regex. Add a
behaviour-file-to-allowed-name rename as the fail-against-old negative case.

**The remaining R3-M1 alignment questions — no issue found beyond R4-M1.** The
regex and the revised direct-`.md` prose agree over ordinary pathname strings.
Steps (2) and (3), warnings (a)/(b), the single-list rule and the closing
summary use the same named path population. No current tool reads, follows or
executes fenced content from `docs/reviews`, `PR_NOTES.md` or
`CODEX_SUMMARY.md`; a future consumer would itself be a non-allowlisted code or
configuration change and would draw review. Wholesale review Markdown is
therefore an acceptable current content risk, but not an evergreen exemption
from reconsidering the allowlist when such a consumer is introduced.

### R3-M2 — one destination is now unambiguous

I read `ai_rules.md` §11 straight through twice and independently enumerated
the governed set by role and availability, using cross-references to inspect
`ai_rules.md`, `CLAUDE.md`, the Operating Agreement, the adversarial-review
template and `MEMPALACE_PROTOCOL.md`. The resulting destination matrix is:

| Role                 | Write condition                                       | One destination                    |
| -------------------- | ----------------------------------------------------- | ---------------------------------- |
| Any agent            | MemPalace responds and accepts writes                 | MemPalace                          |
| Independent reviewer | Tools absent, read-only, or writer-lease refusal      | Committed review file              |
| Non-reviewer         | MemPalace unavailable; an existing local store exists | Existing local memory files        |
| Non-reviewer         | No memory store exists                                | PR body                            |
| Non-reviewer         | Writer-lease refusal                                  | PR body under the general fallback |

No governed artifact adds a sixth destination. `MEMPALACE_PROTOCOL.md`
describes operation and authority but adds no persistence destination. This
role-by-condition enumeration is independent of the author's end-to-end
section read and does not key the class on a known destination token.

The reviewer reaches the committed review file exactly once: `ai_rules.md:327`
displaces both PR-body and local-file branches, and `:331` repeats the local
carve-out. The non-reviewer policy is genuinely preserved: the repair added
only reviewer qualifications and left the existing store-dependent distinction
at `:323`/`:331` intact. Those lines are not simultaneous commands—`:323`
governs absence of a local store, while the local path explicitly assumes one
exists. The reviewer exception does not contradict “do not create one” at
`:323`: the committed review is the reviewer's already-required branch
deliverable, not a newly created local memory store. Leaving `CLAUDE.md`
untouched was sound scope control; it already states the reviewer file and
never offers the reviewer a local-memory destination.

### Regression and same-class sweep

- The branch began clean at `7a2d66e42e6043f3a6a04f2eb09219c596eaf316`;
  `main` and `origin/main` were `a6ce103`, and PR #139 was open, non-draft and
  unmerged with the commissioned head and base.
- `git diff --name-only 04bd02a..7a2d66e` returned exactly `ai_rules.md` and
  `docs/governance/OPERATING_AGREEMENT.md`. The range has no `src/`, `tests/`,
  PNG, signed specification, UAT or `[STATE]` change. It therefore remains
  docs-only.
- The §2 and §3.4 trim removed failed-draft chronology and the amendment-count
  story, not operative conditions. The shorter §2 retains the mandatory
  higher-precedence placement, lease rule and authority pointers; §3.4 retains
  the polarity, anchors, population and maintenance instruction. A targeted
  dangling-reference sweep found no residue after `7a2d66e` made the one list
  drift failure self-contained.
- The defect facts attributed at `OPERATING_AGREEMENT.md:294-298` are supported
  by rounds 2 and 3 in this committed review and by PR #139. Whether each named
  drawer contains the specifically attributed record is **UNVERIFIABLE** from
  the repository alone. MemPalace remained unavailable, so I did not accept
  the drawer-to-defect mapping as independently checked.
- `./tools/checks` exited 0 after this Round-4 text was formatted: all 4 steps
  passed, lint reported 0 errors / 145 warnings, and 1,335 unit tests passed
  across 101 files.

### Step 4 — the author's weakest claims

1. **The self-pass did not make this round short.** It found two real prose
   defects, but it remained keyed to hostile _names_ and missed the
   behaviour-to-allowed rename that its own commission explicitly required the
   reviewer to test. For this same-class sweep, it functioned as theatre rather
   than a reliable adversarial method. The remedy is fail-against-old evidence
   over Git change records, not a longer author-generated name table.
2. **The allowlist is still under-specified.** Ordinary pathname negatives are
   now sound, but rename preimages, modes and statuses are outside the key the
   mechanism observes. R4-M1 is merge-blocking; the symlink/gitlink/deletion
   policy also needs an explicit prose/mechanism decision in the same repair.
3. **Not editing `CLAUDE.md` was correct.** Its reviewer condition was already
   unambiguous and it contains no local-memory alternative for that role.
   Symmetry-only wording would have been unrelated fix-round work.
4. **The trim is clean.** It removed chronology, retained the operative rule
   and evidence pointers, and the head commit repaired the one dangling
   antecedent it initially introduced. No further dangling or operative loss
   was found.

### Step 5 — verdict, convergence, and rollback

**CHANGES-REQUIRED, high confidence.** PR #139 is **not merge-ready**. R4-M1
is merge-blocking because the exact mechanical test can certify a repair that
removes a behaviour-bearing path. R3-M2 is fully resolved, and the trim,
drawer-pointer evidence boundary and `CLAUDE.md` scope decision add no further
finding. Correct only the rename/status population of R3-M1, align its prose,
exercise a behaviour-file-to-review-file rename against the old and repaired
commands, then commission the required narrow follow-up.

Applying §0 rule 1 clause 6 by name, the rising round count remains primarily
an **author sweep failure**, not a scope-control failure. The self-pass has not
changed that diagnosis: it improved two pieces of prose but still tested the
class through path tokens rather than Git's behaviour. Scope control has
improved—the trim is operative-safe and `CLAUDE.md` was deliberately left
alone. The PR remains technically convergent: one of two Round-3 blockers is
closed and the remaining correction is confined to one mechanical invariant.

No §3.3 rollback trigger fired. This is still one governance PR, not three
consecutive implementation slices or specification reviews; there have not
been three clean passes; no machine-enforcement proposal was added; and the §4
index remains one row per ruling. The remaining residue is not acceptable with
the merge because it defeats the rule that decides whether a repair receives
independent follow-up review.

### Checked clean and not checked

- **Checked clean:** the exact author negative/positive names; spaces,
  newlines, case, subdirectory and empty-basename cases; all current allowed
  modes; ordinary prose/regex alignment; warning/summary alignment; current
  Markdown-consumer risk; the reviewer and non-reviewer destination matrix;
  all governed destination surfaces; the `CLAUDE.md` no-edit decision; exact
  repair range; narrative trim; dangling references; rollback triggers; and
  the required repository check.
- **Could not check:** MemPalace was unavailable, so the Round-3 and practice
  drawers, their filing fidelity, and the two Operating Agreement drawer
  attributions remain **UNVERIFIABLE**. Repository and live PR evidence—not
  drawer content—support this review.
- **Not run:** e2e, integration or UAT. The range is docs-only and the
  commission limits the rerun to `./tools/checks`.

### MemPalace drawer candidates

- `havdm/review`, `added_by="codex"` — **PR #139 Round-4 narrow governance
  review:** CHANGES-REQUIRED, high confidence; not merge-ready. R3-M2 is
  resolved: every reviewer unavailability form reaches the committed review
  file, non-reviewer fallbacks remain conditional, and no sixth destination
  was found. R3-M1 is partially resolved and leaves merge-blocking R4-M1:
  default Git rename detection makes `git diff --name-only` omit a
  behaviour-bearing preimage when it is renamed into an allowed review path.
  The author self-pass remained name-keyed and functioned as theatre rather
  than a reliable same-class sweep; the rising-round diagnosis remains author
  sweep failure. The narrative trim and `CLAUDE.md` scope decision are clean,
  and no §3.3 rollback trigger fired. Correct only the change-record population
  and prose, prove a behaviour-to-allowed rename fails against the repaired
  mechanism, then commission one narrow follow-up.
- `practice/review`, `added_by="codex"` — **Candidate general lesson:** a path
  allowlist applied to `git diff --name-only` does not necessarily enumerate
  every path a change touched, because rename detection can collapse a
  behaviour-bearing preimage to an allowed destination. Classify Git change
  records, including both rename sides and any promised mode/status property,
  before treating silence from a pathname filter as evidence-only proof.

## Round 5

**Verdict: CHANGES-REQUIRED (high confidence).** **Merge readiness: not ready.**
The two shipped assertions close R4-M1's named rename and object-type cases,
including their false-positive controls. They still compare only the endpoint
trees. A real commit that adds a behaviour path and a later commit that removes
it is absent from both endpoint diffs, so both assertions print nothing while
the repair history did touch a non-allowlisted path. The same bypass hides a
temporary executable/symlink mode that is restored before HEAD. This leaves
one merge-blocking finding, R5-M1.

### Disposition of R4-M1

| Round-4 finding                                 | Disposition            | Merge effect               | Round-5 judgement                                                                                                                                                                                                                                              |
| ----------------------------------------------- | ---------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R4-M1 — enumerate rename sides and object modes | **PARTIALLY RESOLVED** | **MERGE-BLOCKING — R5-M1** | `--no-renames` exposes both sides of a net rename and the raw-mode assertion rejects a net symlink, gitlink or executable file. Both operate on `<previous>..HEAD` endpoint trees, not every change record in the repair, so transient behaviour is invisible. |

### R4-M1 — the endpoint assertions miss paths and modes touched only in intermediate commits

I extracted the allowlist and `awk` program from the shipped Operating
Agreement, then used those extracted values in the two exact commands:

```sh
round5_allow_re=$(sed -n "s/.*grep -vE '\([^']*\)'.*/\1/p" \
  docs/governance/OPERATING_AGREEMENT.md | head -n 1)
round5_mode_awk=$(sed -n "s/.*awk '\([^']*\)'.*/\1/p" \
  docs/governance/OPERATING_AGREEMENT.md | head -n 1)

git diff --no-renames --name-only 34fbc1c..HEAD | grep -vE "$round5_allow_re"
git diff --no-renames --raw 34fbc1c..HEAD | awk "$round5_mode_awk"
```

They extracted:

```text
round5_allow_re=^(docs/reviews/[^/]+\.md|PR_NOTES\.md|CODEX_SUMMARY\.md)$
round5_mode_awk=$2 !~ /^(100644|000000)$/
```

On the actual Round-4 repair range, command 1 printed the governance document
and command 2 printed nothing:

```text
docs/governance/OPERATING_AGREEMENT.md
<no output>
```

That correctly classifies `34fbc1c..2cc9dc9` as review-requiring because at
least one assertion printed. On the real evidence-only control
`7a2d66e..34fbc1c`, both printed nothing, correctly accepting the Round-4
review-file-only change.

**Real-commit adversarial results.** I constructed commits in an isolated Git
repository with `git update-index`/`commit-tree`, declared the expected
classification, and ran both shipped assertions. `PRINT` below records which
assertion supplied the output; `SILENT` means both printed nothing.

| Change-record case                                    | Expected | Observed                                                  | Judgement                                      |
| ----------------------------------------------------- | -------- | --------------------------------------------------------- | ---------------------------------------------- |
| Behaviour file → allowed review name                  | PRINT    | command 1: `package.json`                                 | Correct                                        |
| Allowed → allowed rename                              | SILENT   | both: no output                                           | Correct false-positive control                 |
| Regular allowed file → symlink                        | PRINT    | command 2: `:100644 120000 … T docs/reviews/a.md`         | Correct                                        |
| Gitlink added at allowed path                         | PRINT    | command 2: `:000000 160000 … A docs/reviews/submodule.md` | Correct                                        |
| Executable bit added to allowed file                  | PRINT    | command 2: `:100644 100755 … M docs/reviews/a.md`         | Correct                                        |
| Symlink → ordinary file                               | SILENT   | both: no output                                           | Correct under the stated resulting-type policy |
| Executable bit removed                                | SILENT   | both: no output                                           | Correct under the stated resulting-type policy |
| Non-ancestor endpoints with a net `src/behavior.ts`   | PRINT    | command 1: `src/behavior.ts`                              | Correct, conservative post-rebase result       |
| Empty range                                           | SILENT   | both: no output                                           | Correct                                        |
| Merge endpoint resolving an allowed path to a symlink | PRINT    | command 2: `:100644 120000 … T docs/reviews/x.md`         | Correct                                        |
| Behaviour path added, then removed within the range   | PRINT    | **both: no output**                                       | **False accept — R5-M1**                       |
| Executable bit added, then removed within the range   | PRINT    | **both: no output**                                       | **False accept — same R5-M1 class**            |
| Unsupported index mode `100664` requested             | SILENT   | Git normalized the index entry to `100644`                | No unobserved mode exists                      |

The fail-against-current-command evidence for the path case was:

```text
$ git diff --no-renames --name-only BASE..RESTORED | grep -vE "$round5_allow_re"
<no output>
$ git diff --no-renames --raw BASE..RESTORED | awk "$round5_mode_awk"
<no output>
$ git log --format= --no-renames --name-only BASE..RESTORED | sed '/^$/d'
src/transient.ts
src/transient.ts
```

The corresponding mode sequence was also invisible at the endpoints, while a
per-commit raw enumeration exposed the disallowed transition:

```text
:100755 100644 … M  docs/reviews/a.md
:100644 100755 … M  docs/reviews/a.md

$ git log --format= --no-renames --raw BASE..RESTORED | awk "$round5_mode_awk"
:100644 100755 … M  docs/reviews/a.md
```

This is behaviour-bearing, not merely historical trivia. An intermediate
workflow can run when pushed, an executable can be invoked, and sensitive or
behavioural content remains in Git history even after the endpoint tree is
restored. More directly, the normative claim at
`OPERATING_AGREEMENT.md:258-262` is “the repair touched only allowed paths,”
not “the two endpoint trees have a net difference only at allowed paths.” The
checks do not decide the claim they certify.

**Required correction.** Enumerate the path and resulting-mode records of every
commit in the reviewed repair range rather than only the aggregate endpoint
delta. Preserve the fixed rename decomposition and regular-file policy, define
or fail closed when the previous-review commit is not an ancestor, and handle
merge commits without silently dropping a parent comparison. The exact command
is the author's choice. The required fail-against-old cases are a behaviour
path added then removed and an allowed file made executable/symlink then
restored; the repaired mechanism must report both histories through the
appropriate assertion.

**Raw line shapes.** `$2` is the destination mode in every ordinary raw record
the exact `git diff --raw A..B` command produced, including when `B` was a merge
commit. The merge endpoint appeared in the ordinary form and was correctly
rejected:

```text
:100644 120000 … T  docs/reviews/x.md
```

I also forced a combined raw display with `git show --cc --raw`. It produced:

```text
::100644 100644 120000 … TT  docs/reviews/x.md
```

There `$2` is a parent mode and the shipped `awk` program printed nothing. That
is not a current defect because the shipped `git diff A..B` does not emit
combined records, even for a merge endpoint. It is a constraint on the R5-M1
repair: if it adopts a history/combined form, it must parse that form rather
than reuse `$2` blindly.

`--find-copies-harder` also re-enabled rename/copy detection when added to the
test, regardless of its order relative to `--no-renames`, and reproduced the
rename false accept. The shipped command does not contain that option, so this
is not a current defect; the mandatory real-commit rename control would detect
such a future edit. Re-running the shipped form over repository rename `74a2582`
emitted both paths under `diff.renames=true`, `copies`, `false`, and
`diff.renameLimit=1`; omitting `--no-renames` emitted only the destination under
`true` and `copies`. The documented configuration measurement is therefore
confirmed. No issue was found in the existing prose's add/delete versus
resulting-object-type policy over a single endpoint delta.

**Two-command form — no issue found.** A single parser could reduce the chance
of a half-run, but it would also have to parse quoting, path fields, modes and
merge shapes together. The binding text says “both,” labels each assertion,
and repeats that the second is not optional. Two short orthogonal commands are
clearer and independently auditable; the current defect is their shared
endpoint key, not their count.

### Regression and same-class sweep

- The branch began clean at `2cc9dc91a1c2ebcd8cee3c298be85dcd2025ab4f`;
  `main` and `origin/main` were `a6ce103`, and PR #139 was open, non-draft and
  unmerged at the commissioned head and base.
- `git diff --name-only 34fbc1c..2cc9dc9` returned only
  `docs/governance/OPERATING_AGREEMENT.md`. More strongly, per-commit
  `git log --name-status` enumerated all three repair commits and each modified
  only that file with mode `100644 → 100644`. The range has no `src/`, `tests/`,
  PNG, signed specification, UAT or `[STATE]` change and remains docs-only.
- The §3.4 pointer is structurally complete in the repository: rounds 2, 3 and
  4 in this committed review record the incomplete blocklist, prefix and rename
  defects respectively, and the Operating Agreement attributes one drawer to
  each corresponding round. Whether
  `drawer_havdm_review_c922769aee0360b071fa5566` or the two earlier drawers
  contain the attributed content is **UNVERIFIABLE** without MemPalace. I did
  not substitute the author's filing commit for drawer inspection.
- The two measured-property sentences removed no operative content. The
  `diff.renames`/`diff.renameLimit` measurement is compatible with the exact
  command, but both sentences are explanatory case history in a document whose
  preamble says full narrative never lives there. The non-ASCII universal is
  also config-dependent: default `core.quotePath` printed
  `"docs/reviews/caf\303\251.md"`, while
  `git -c core.quotePath=false diff --no-renames --name-only …` emitted the raw
  `docs/reviews/café.md`, which matched the allowlist and made command 1 silent.
  Acceptance under that configuration is policy-correct for an ordinary direct
  `.md`; the statement that the path always false-rejects is not. This is a
  **non-blocking scope-control note** the owner may accept with the merge, though
  the already-required repair should remove the narrative or qualify it.
- `./tools/checks` exited 0 after this Round-5 text was formatted: all 4 steps
  passed, lint reported 0 errors / 145 warnings, and 1,335 unit tests passed
  across 101 files.

### Step 4 — the author's weakest claims

1. **The self-pass technique materially improved, but is still insufficient.**
   Real commits, declared expectations, configuration variance and a
   false-positive control are genuine method rather than the Round-4 name-table
   theatre. The pass nevertheless remained keyed to the net endpoint delta and
   never enumerated the commits whose paths/modes the prose claims to govern;
   R5-M1 is the behaviour-bearing bypass that key cannot see. One improved pass
   therefore does not establish a reliable method.
2. **The edge population remains incomplete.** Ordinary raw `$2` parsing is
   sound for the exact command, but transient records are absent and combined
   records would move the destination mode out of `$2`. The repair must choose
   a history form and test its merge semantics explicitly.
3. **The measured properties are unnecessary documentation.** The rename
   configuration result is accurate within the named options, but belongs in
   the review/drawer evidence rather than pointer-style law. The non-ASCII
   statement is additionally false as a universal under
   `core.quotePath=false`. This is non-blocking because the operative
   classification remains safe and policy-aligned.
4. **Two commands are acceptable.** Their explicit conjunction and separate
   responsibilities are clearer than one complicated parser. A compound
   wrapper could improve ergonomics, but its absence does not falsify the rule.

### Step 5 — verdict, convergence, and rollback

**CHANGES-REQUIRED, high confidence.** PR #139 is **not merge-ready**. R5-M1
is merge-blocking: the current mechanism can certify a repair history that
contains a behaviour-bearing path or disallowed mode, contradicting the exact
“repair touched” population it claims to decide. The optional measured-property
paragraph is a non-blocking note the owner could accept with the merge, but it
should be removed or qualified while the blocker is repaired. Correct only the
endpoint-versus-history population, preserve the now-clean rename/type cases,
exercise transient path and mode cases against old and repaired commands, then
commission the required narrow follow-up.

Applying §0 rule 1 clause 6 by name, the rising round count remains primarily
an **author sweep failure**. The technique changed in a meaningful way, but it
still patched the named endpoint instances without enumerating the behavioural
population promised by “touched.” This gap existed in the earlier endpoint
command rather than being generated by the R4-M1 repair. The optional
measurement paragraph is a secondary scope-control failure: it introduced
unnecessary narrative and one configuration-dependent universal, but it is not
the merge blocker.

No §3.3 rollback trigger fired. This is one governance PR, not three
consecutive implementation slices or specification reviews; its rounds have
not been clean; no machine-enforcement mechanism was proposed; and the §4
index remains one row per ruling. The PR is still converging—net rename and
object-mode handling are now sound—but the remaining endpoint gap is not an
acceptable residue because it controls whether behavior-bearing repair history
receives independent review.

### Checked clean and not checked

- **Checked clean:** commissioned branch/PR/base state; exact two-command
  extraction; net behavior-to-allowed and allowed-to-allowed renames; symlink,
  gitlink and executable additions; regularizing type/mode transitions;
  non-ancestor and empty ranges; merge endpoints; ordinary and combined raw
  field shapes; unusual index-mode normalization; rename configuration and
  `--find-copies-harder` interaction; two-command ergonomics; actual per-commit
  repair scope; pointer completeness in repository evidence; rollback triggers;
  and the required repository gate.
- **Could not check:** MemPalace remained unavailable, so the Round-4 drawer,
  its author-filed wording, and all three drawer-content attributions remain
  **UNVERIFIABLE**. Repository and live PR evidence—not drawer content—support
  this review.
- **Not run:** e2e, integration or UAT. The repair range is docs-only and the
  commission limits the rerun to `./tools/checks`.

### MemPalace drawer candidates

- `havdm/review`, `added_by="codex"` — **PR #139 Round-5 narrow governance
  review:** CHANGES-REQUIRED, high confidence; not merge-ready. R4-M1 is
  partially resolved: net renames, symlinks, gitlinks and executable modes are
  now classified correctly, but both shipped assertions compare endpoint trees
  and silently accept a behaviour path or disallowed mode introduced and then
  restored within the repair history (merge-blocking R5-M1). The self-pass is
  materially better than Round-4 name-table theatre but remains insufficient
  because it is keyed to net endpoint records rather than every commit touched.
  The measured-property paragraph is a non-blocking scope-control note;
  `core.quotePath=false` disproves its universal non-ASCII false-reject claim.
  No §3.3 rollback trigger fired. Correct only the history population, preserve
  the clean endpoint cases, prove transient path/mode histories print, then
  commission one narrow follow-up.
- `practice/review`, `added_by="codex"` — **Candidate general lesson:** an
  endpoint diff cannot prove a universal about every path or mode a commit range
  touched. A path or unsafe mode added and restored between endpoints is absent
  from both trees; when the claim governs repair history, enumerate per-commit
  change records (including merge semantics) and use transient add/remove and
  mode/restore sequences as fail-against-old cases.

## Round 6

**Verdict: CHANGES-REQUIRED (high confidence).** **Merge readiness: not ready.**
The population is still defined exactly in the Operating Agreement, the move to
an evidentiary command does not reopen M2, and both R5-M1's history defect and
R6-M1's merge-record-format defect are closed. The shipped commands nevertheless
have two new false-accept routes through Git state the author left delegated,
including a `diff.*` variable and `git replace`—both populations this commission
expressly offered for attack. Separately, the new structural rationale says five
review rounds each found a defect in a command that the audit proves did not
exist until after round 1. Those are merge-blocking R6-M2 and R6-M3.

### Disposition

| Item                                                       | Disposition                | Merge effect                 | Round-6 judgement                                                                                                                                                                                       |
| ---------------------------------------------------------- | -------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R5-M1 — endpoint rather than history population            | **RESOLVED**               | None                         | Both moved commands enumerate every commit. Real transient-path and transient-mode histories print; their endpoint predecessors stay silent.                                                            |
| R6-M1 — `-m` delegates merge-record shape                  | **RESOLVED**               | None                         | `--diff-merges=separate` overrides all four tested `log.diffMerges` values, including `GIT_CONFIG_*` injection, and emits ordinary per-parent raw records.                                              |
| M2 — define evidence-only in the rule                      | **RESOLVED; not reopened** | None                         | §3.4(3)(i) and (ii) state the complete path/history and resulting-object population. The command moved; the definition did not.                                                                         |
| R6-M2 — other Git state suppresses or replaces records     | **OPEN**                   | **MERGE-BLOCKING**           | `diff.ignoreSubmodules=all` suppresses a gitlink record, and a replacement commit can hide a behaviour path. Both shipped commands then certify falsely.                                                |
| R6-M3 — the split rationale misstates the measured lineage | **OPEN**                   | **MERGE-BLOCKING**           | The Operating Agreement and testing standard say five rounds each found a command defect; the audit correctly proves the command was born in the round-1 fix and rounds 2–5 found four command defects. |
| R6-N1 — the audit's terminal defect count                  | **OPEN**                   | **OWNER-ACCEPTABLE RESIDUE** | The audit's otherwise-correct enumeration calls R6-M1 the “twelfth defect in that paragraph.” Its own counts support no such number.                                                                    |

### R6-M2 — the commands still delegate which records exist

I extracted and ran the two commands exactly as shipped in
`docs/testing/TESTING_STANDARDS.md`:

```sh
git log --format= --no-renames --diff-merges=separate --raw 818b9d2..c26a8c2 \
  | awk -F'\t' 'NF>1 {print $2}' \
  | grep -vE '^(docs/reviews/[^/]+\.md|PR_NOTES\.md|CODEX_SUMMARY\.md)$'

git log --format= --no-renames --diff-merges=separate --raw 818b9d2..c26a8c2 \
  | awk '$2 !~ /^(100644|000000)$/'
```

Command 1 printed:

```text
docs/governance/OPERATING_AGREEMENT.md
docs/testing/TESTING_STANDARDS.md
docs/governance/OPERATING_AGREEMENT.md
```

Command 2 printed nothing. Check (0),
`git merge-base --is-ancestor 818b9d2 c26a8c2`, exited 0. The conjunction
therefore correctly classifies the commissioned range as review-requiring.

It does not remain correct under another ordinary Git configuration variable.
I made a real commit whose tree contains:

```text
160000 commit <object>  docs/reviews/gitlink.md
```

The default mode command printed the `:000000 160000 ...` raw record. Against
the identical commits, this exact command printed nothing:

```sh
git -c diff.ignoreSubmodules=all log --format= --no-renames \
  --diff-merges=separate --raw BASE..HEAD \
  | awk '$2 !~ /^(100644|000000)$/'
```

The path command also stayed silent because the allowed path passed its regex.
This is a false accept under §3.4(3)(ii), not a conservative rejection. A
tested repair is to add `--ignore-submodules=none`: with the same hostile
configuration it restored the `160000` record and command 2 printed.

Replacement refs produce an independent false accept. I committed
`src/replaced.ts`, then used `git replace` to substitute a same-parent commit
whose tree matched the base. Check (0) succeeded and both shipped commands were
silent. The actual object, inspected with replacement disabled, still changed:

```text
$ git --no-replace-objects diff-tree --no-commit-id --name-only -r <actual-head>
src/replaced.ts
```

Running the path command through `git --no-replace-objects log ...` printed
`src/replaced.ts`. A known-bad live-proof range does not close either class: an
ordinary bad file still prints under `diff.ignoreSubmodules=all`, and a
replacement can target the reviewed range without targeting the range chosen
for the liveness check.

**Required correction.** Make all three Git reads use unreplaced objects, and
make both log commands override submodule suppression (for example,
`git --no-replace-objects ...` and `--ignore-submodules=none`). Prove both
repairs fail against the current commands and pass against the replacement.
Add at least these two cases to the negative-case floor: a gitlink under
`diff.ignoreSubmodules=all`, and a behaviour commit hidden by a replacement ref.
Sweep other inputs that can suppress the raw population rather than patching
only these names.

This is one finding because both demonstrations falsify the same claimed
property: the command delegates the commit/change-record population to ambient
repository state. It is merge-blocking because silence can exempt a
behaviour-bearing repair from the independent follow-up §3.4 requires.

### R6-M1 and the change-record matrix

R6-M1's named repair is sound. On Git 2.43.0, a two-parent merge resolving an
allowed file to a symlink produced two ordinary records, and command 2 printed
under effective `log.diffMerges=separate`, `first-parent`, `combined`, and
`dense-combined`. Injecting `combined` and `dense-combined` through
`GIT_CONFIG_COUNT`, `GIT_CONFIG_KEY_0`, and `GIT_CONFIG_VALUE_0` also printed.
The explicit option wins.

I rebuilt all six mandated negative cases and the four false-positive controls
as real commits. The numbers below are output-record counts from path command 1
and mode command 2, respectively:

| Case                                             | Expected | Path / mode records | Result                                                       |
| ------------------------------------------------ | -------- | ------------------- | ------------------------------------------------------------ |
| `PR_NOTES.md.sh` added                           | PRINT    | 1 / 0               | Correct                                                      |
| behaviour path renamed to an allowed review name | PRINT    | 1 / 0               | Correct                                                      |
| allowed ordinary file becomes a symlink          | PRINT    | 0 / 1               | Correct                                                      |
| transient behaviour path                         | PRINT    | 2 / 0               | Correct; R5-M1 closed                                        |
| transient executable mode                        | PRINT    | 0 / 1               | Correct under `core.fileMode=true` and `false`; R5-M1 closed |
| evil merge, each of four merge configs           | PRINT    | 0 / 2 each          | Correct; R6-M1 closed                                        |
| review document only                             | SILENT   | 0 / 0               | Correct control                                              |
| allowed → allowed rename                         | SILENT   | 0 / 0               | Correct control                                              |
| both exact root notes                            | SILENT   | 0 / 0               | Correct control                                              |
| empty commit                                     | SILENT   | 0 / 0               | Correct control                                              |

The moved command also classified the author's other named cases correctly
when independently rebuilt: a three-parent octopus merge printed the behaviour
path three times under each of `separate`, `combined`, `dense-combined`, and
`off`; a copy to an allowed name stayed silent under default settings and
`diff.renames=copies`; replacing `docs/reviews/` itself with a symlink printed;
non-ASCII behaviour paths printed under both `core.quotePath` settings; the
non-ASCII allowed-path asymmetry remained conservative; a TAB-bearing behaviour
path printed; an allowed path containing a space stayed silent; and a clean
unsigned range remained silent under `log.showSignature=true`. A non-ancestor
check returned nonzero.

`$2` is the destination mode in every record that
`--diff-merges=separate` actually emits: each record has one old mode and one
new mode, including one record per octopus parent. A root commit cannot occur
inside a valid `<previous-review>..HEAD` range: if the previous review is an
ancestor, the root is either the excluded lower endpoint or precedes it; if it
is unrelated or unavailable, check (0) fails. No root-record gap was found.

Correctly positioned `--first-parent` still printed the path introduced by the
octopus merge. `--find-copies-harder` on the behaviour-to-allowed rename also
printed the source pathname in the raw rename record; this does not make the
option safe generally, and the shipped warning not to add it remains warranted.
`.gitattributes` did not suppress raw records and its own non-allowlisted change
printed. An unmerged index did not alter committed-log output; that is correct
because §3.4 governs commits, not an uncommitted working tree. A shallow clone
cannot silently reconstruct an unavailable previous review commit: ancestry
fails; a history rewrite likewise makes the old review SHA non-ancestral.
Grafted histories are part of the replacement-object finding above.

On this machine the supported option succeeds. Simulating an unsupported form
with `--diff-merges=not-a-mode` exited 128, wrote `fatal:` to stderr, and wrote
zero bytes to stdout; `--follow` behaved the same way. Older and newer Git
binaries were not installed, so their exact diagnostics are **UNVERIFIED**.
The mandatory known-bad proof is an adequate procedural guard against this
specific execution-error hazard when followed, but it does not make the
commands fail loudly and cannot test semantic completeness. An error-preserving
wrapper would be stronger. I do not make that a separate finding because the
text accurately calls the guard a mitigation and explicitly requires it.

One harness error occurred in my option-interaction pass: I initially placed
`--first-parent` and `--find-copies-harder` before the `log` subcommand, which
made Git fail and produced misleading silence. I detected the nonzero command,
discarded those observations, and rebuilt both with the options in their valid
positions before recording the results above.

### R6-M3 — the new rationale contradicts the audit's central measurement

The audit's central history is correct:

```text
$ git show 0a311bb:docs/governance/OPERATING_AGREEMENT.md | grep -c evidence-only
2
$ git show 0a311bb:docs/governance/OPERATING_AGREEMENT.md \
    | grep -E 'git diff --stat|git diff --name-only|--no-renames'
<no output>
$ git show bcba77a:docs/governance/OPERATING_AGREEMENT.md \
    | grep -n 'git diff --stat <previous review commit>'
250: ...
```

M2 was the original absence of a repair trigger and definition. Its fix in
`bcba77a` created the command. Rounds 2–5 then found four defects in that
command: blocklist, prefix, rename collapse, and endpoint enumeration. The audit
found the fifth command defect, delegated merge-record format.

The new Operating Agreement instead says, at lines 290–295, that between rounds
1 and 5 the command was the definition and **“five consecutive review rounds
each found exactly one defect in it”**, names only the four defects above, and
calls the audit result a sixth. The new testing section repeats that five review
rounds each found a defect in a command living in governance. Both statements
are false on the audit's own evidence: the command was absent in round 1, four
review rounds found command defects, and the audit found the fifth.

The live PR body is less explicit but carries the same misleading compression:
“every deficiency in it was a deficiency in the governing law — five rounds,
five governance amendments.” Five rounds did require amendments, but the first
amendment created the mechanism; it did not correct a pre-existing command
defect. The distinction is the audit's main scope-control finding and must not be
flattened in the text adopting that audit.

**Required correction.** Align the Operating Agreement, testing standard, and
live body to the measured chain: one original definition/lifecycle gap; the
round-1 fix introduced the mechanism; rounds 2–5 found four command defects; the
audit found the fifth. This is merge-blocking because the false causal count is
new governance rationale and directly contradicts the primary source cited to
justify the structural ruling.

### The structural split and M2

**M2 remains resolved.** Read without the command, §3.4(3) still supplies a
decision procedure in prose. Condition (i) names the complete allowed-path
population, requires every commit in the range, and counts both rename sides.
Condition (ii) independently rejects symlinks, submodules, and added executable
bits. Addition/deletion semantics and the non-ancestor failure are explicit. A
stranger need not infer whether an allowed symlink or transient behaviour path
qualifies.

The removed mechanism material landed rather than disappearing. Former
properties (a)–(d) are in the testing standard as (a)–(d); R6-M1 added (e). The
five old mandatory negatives moved and R6-M1 added a sixth. The four-defect
history moved and gained the audit's fifth command defect. The old extracted
commands themselves were deliberately replaced with the pinned history form.
No operative population clause was lost.

Step (2)'s “not evidence-only under (3)” is the correct reference. It covers
both (i) and (ii), unlike the former “outside the allowlist” wording, and it has
no independent surface list that can drift inversely from (3).

The split is sound despite `TESTING_STANDARDS.md` not being a §3-governed
authority. The Operating Agreement binds the population and the duty to publish
and independently re-run evidence that establishes it. Weakening a working
command cannot change that population; it creates rejectable evidence, as
R6-M2 demonstrates, rather than silently amending the law. The testing standard
therefore has standing to carry the current working form, but no authority to
redefine the term. This does not make command defects cost-free or immune from a
narrow follow-up: a finding-driven change to the non-allowlisted testing
standard is still fresh work under §3.4(2).

The owner-directed widening was proper. The audit measured a repeated defect
pattern and the owner commissioned adoption of its recommendation. Both the
audit and adoption remain fresh review surface, and this round has treated them
that way. No unrelated product or test implementation entered the range.

### Regression, class sweep, index, and live PR body

- `git diff --name-status 818b9d2..c26a8c2` returned exactly one added audit and
  the two expected modified documents:
  `docs/reviews/pr139-defect-pattern-audit.md`,
  `docs/governance/OPERATING_AGREEMENT.md`, and
  `docs/testing/TESTING_STANDARDS.md`. Per-commit enumeration showed the same
  three paths. No `src/`, `tests/`, PNG, signed specification, UAT, or `[STATE]`
  path changed.
- The new evidence command over that range correctly printed the two
  non-allowlisted documents; the audit path passed the allowlist. The range is
  review-requiring, as claimed.
- A behaviour-keyed enumeration found these operative readers: §3.3's cost
  trigger sends readers to §3.4; §3.4 defines the population and sends readers
  to the testing standard; the testing standard carries the command and points
  back to §3.4; and the single REV-IMPL row summarizes and points to both. The
  superseded Promptmi governance review points to §3.4 but does not state a
  rival test. Historical review files describe prior forms rather than direct a
  current classification. No unreported operative member was found.
- The REV-IMPL index remains one row for one ruling and matches the body on
  pilot status, lifecycle, population authority, and command location. Its
  added clause is a compact operative summary, not a second definition. R6-M3's
  false history is in the body, not the row.
- At review start, the live PR was open, non-draft, and unmerged against
  `main`, but its remote head was still `3db6c4d` while the commissioned author
  head `c26a8c2` was two local commits ahead. The live body had nevertheless
  already appended the audit/adoption sections. Its withdrawal of the claim
  that `-m` always yields ordinary records is accurate and not over-corrected;
  R6-M3 is the remaining stale causal compression. The temporary head/body
  mismatch is delivery state, not a separate content finding.

### The audit as a change artifact

The audit's main measurements hold at its `3db6c4d` cutoff. The
governance-prefixed log contains twelve commits, but `0a311bb` is the original
content commit; the eleven commits after it that touch the Operating Agreement
are fixes. Eight of the twelve governance-prefixed commits touch only that
document. At `c4fd0a4`, the unanchored regex and rename-detecting
`--name-only` command are present, while the endpoint key inherited from
`bcba77a` remains; the round-3, round-4, and round-5 defects were therefore
co-resident.

I agree with the audit's **four author-sweep / two scope-control** classification
and with its narrower statement about my own earlier diagnosis. “Primarily an
author sweep failure” is right for rounds 3–5, while the full lineage has a
scope-control stage that created the mechanism and an author-sweep stage that
failed to test its population. The two causes are sequential, not mutually
exclusive.

At 587 lines, the audit is long but not itself over-reach. It is the
owner-commissioned, primary-source measurement for a five-round governance
decision, is contained to `docs/reviews/`, and is independently reviewed here.
Its local count error is real but does not invalidate its tables or central
measurements:

`docs/reviews/pr139-defect-pattern-audit.md:449` says an auditor found the
“twelfth defect in that paragraph.” Before R6-M1 the audit counts five of ten
merge-blocking findings in that lineage, six of twelve including R5-N1. R6-M1
is therefore the sixth merge-blocking finding in the lineage, the eleventh
merge-blocking finding overall, or the thirteenth item if both earlier notes are
counted—never the twelfth defect in the paragraph. This is R6-N1, an isolated
review-file error the owner may accept as evidence-only residue, though it
should be corrected with the blockers.

MemPalace remained unavailable. The claim that the five author-filed drawers
did not soften the review is therefore **UNVERIFIABLE**; I did not substitute
the committed filing prose or semantic search for drawer inspection.

### Weakest claims, convergence, and rollback

1. **Moving the commands does not reopen M2.** Confirmed. The population, not
   an implementation accident, is the definition.
2. **The split is the right remedy.** Confirmed as a governance boundary, not
   as a proven future cost reduction. R6-M2 shows the intended distinction in
   action: the evidence is defective while the law remains decidable.
3. **The widening was proper.** Confirmed because the owner commissioned both
   the audit and adoption. It did not relax the duty to review the new work.
4. **The live-proof guard is sufficient.** Sufficient only for the execution
   error it names when a human follows it; weaker than mechanically preserving
   the Git command's failure status and irrelevant to semantic suppression.
5. **The self-pass is reliable.** Not established. It is substantially better
   and its reported named cases held, but the author again wrote the winning
   populations—`diff.*` variables and `git replace`—into the commission without
   exercising them. One broad pass with two same-class misses cannot establish
   reliability.

Applying **§0 rule 1 clause 6 by name**, the rising round count remains
primarily an **author sweep failure**, now with a secondary scope-control error
in R6-M3. Pinning `log.diffMerges` closed the demonstrated instance of ambient
Git configuration but did not sweep other settings that control whether raw
records exist. The audit-driven restructuring is a different animal from a
narrow finding repair: it is an owner-directed architectural response to the
measured pattern. It improves the authority boundary, but its new command and
rationale are still unreviewed work.

No §3.3 rollback trigger fired. Six rounds on one governance PR are not three
consecutive implementation slices or three clean spec reviews; findings have
been substantive and acted on; no author/reviewer machine-enforcement proposal
was made; and the §4 index remains one row per ruling. The PR is structurally
converging, but R6-M2 controls whether behaviour-bearing repairs receive review
and R6-M3 writes a known-false causal account into the governing rationale.
Neither is an owner-acceptable merge residue.

### Checked clean and not checked

- **Repository gate:** `./tools/checks` exited 0 after the Round-6 review was
  formatted: all four steps passed; lint reported 0 errors / 145 warnings;
  Prettier and `tsc --noEmit` were clean; and 1,335 unit tests passed across 101
  files.
- **Checked clean:** local author head/base and docs-only range; exact shipped
  command extraction; actual-range classification; all six mandatory negatives
  and four controls; transient path/mode history; two-parent and octopus merge
  shapes; four `log.diffMerges` values and environment injection; `core.fileMode`
  settings; `--first-parent`, `--follow`, `--find-copies-harder`, attributes,
  quoting, TAB/space paths, clean signature configuration, unmerged index,
  ancestry/root reasoning, current Git error behavior; M2 definition;
  relocation of the removed properties/cases/history; step (2)/(3) alignment;
  behaviour-keyed reference sweep; REV-IMPL row; live PR body; audit counts,
  lineage, classifications, scope; and rollback triggers.
- **Could not check:** MemPalace drawer contents and no-softening claim;
  unavailable older/newer Git binaries; platform-specific case-insensitive
  filesystem behavior. Those remain **UNVERIFIED**.
- **Not run:** e2e, integration, or UAT. The commissioned range is docs-only and
  this round permits only `./tools/checks` as the repository gate.

### MemPalace drawer candidates

- `havdm/review`, `added_by="codex"` — **PR #139 Round-6 review:**
  CHANGES-REQUIRED, high confidence; not merge-ready. M2 remains resolved and
  the structural split is sound; R5-M1 and R6-M1 close. Merge-blocking R6-M2:
  `diff.ignoreSubmodules=all` suppresses a `160000` record and replacement refs
  can hide an actual behaviour commit, making both published commands silent.
  Merge-blocking R6-M3: the new Operating Agreement and testing standard say
  five review rounds each found a command defect although the audit proves the
  command was created by the round-1 fix and rounds 2–5 found four defects.
  R6-N1 is an owner-acceptable isolated audit count error. No rollback trigger
  fired.
- `practice/verification`, `added_by="codex"` — **Candidate general lesson:**
  pinning an output format does not pin the population that reaches it. A Git
  proof over `--raw` must also neutralize settings that suppress records and
  replacement objects that substitute commits; prove a gitlink under
  `diff.ignoreSubmodules=all` and an actual behaviour commit under `git replace`
  fail against the old form before trusting silence from the repair.

## Round 7

Author: Claude Opus (`2d667f5` repairs and `9ded8c6` merge resolution)
Reviewer: OpenAI Codex (GPT-5), independent reviewer; did not author either commit
Owner gate: BaggyG-AU reads PR #139 and this round together; only the owner signs off and merges

**Verdict: CHANGES-REQUIRED (high confidence).** **Merge readiness: not ready.**
R6-M3, R6-N1, and the merge resolution are resolved. The two named R6-M2
repairs also work, but R6-M2's required population sweep is still open: a legacy
graft file bypasses `--no-replace-objects`, and `diff.relative=true` can remove
out-of-directory records before either filter sees them. Both produce a real
false accept on Git 2.43.0. The new submodule-sweep prose is also factually
wrong about `submodule.<name>.ignore=all`, although the shipped override handles
that setting correctly.

This is not an owner-acceptable evidence-only residue. Repairing the published
commands and their negative-case floor changes
`docs/testing/TESTING_STANDARDS.md`, which is outside §3.4(3)'s allowlist. Under
§3.4(2), the repair **forces round 8**. A seventh commissioned round has found
another false-accept route in the same mechanism class; **the rule is too
expensive to ratify in its current form.**

### Disposition

| Item                                            | Disposition  | Merge effect                                  | Round-7 judgement                                                                                                                                                                                                |
| ----------------------------------------------- | ------------ | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R6-M2 — ambient state changes record population | **OPEN**     | **MERGE-BLOCKING; FORCES ROUND 8**            | The named submodule and replacement-ref repairs hold, but `.git/info/grafts` still rewrites history under `--no-replace-objects`, and `diff.relative=true` can suppress paths outside the current subdirectory.  |
| R6-M3 — false five-round command lineage        | **RESOLVED** | None                                          | Both live explanations now distinguish the absent round-1 command, its creation by the round-1 fix, four round-found defects, the audit defect, and round 6's population defect.                                 |
| R6-N1 — unsupported audit count                 | **RESOLVED** | None                                          | The correction now derives R6-M1 as sixth in the §3.4 lineage, eleventh merge-blocking overall, and thirteenth including both notes.                                                                             |
| `9ded8c6` conflict resolution                   | **RESOLVED** | None; no parent contribution lost or reopened | All thirteen paths differing from either parent are accounted for. The only synthesized blob is the Operating Agreement, and its semantic table delta is exactly the claimed MP-LEASE replacement plus two rows. |

### R7-M1 — the population proof still delegates history and path scope

#### Legacy grafts bypass `--no-replace-objects`

`--no-replace-objects` disables replacement refs; it does not disable the
deprecated but still-operative `.git/info/grafts` mechanism. I built this real
history in an isolated repository:

```text
known-bad liveness range: add docs/reviews/bad.sh and leave
                          docs/reviews/live.md as a symlink
review base -> C1:        add src/transient.ts
C1 -> review HEAD:        delete src/transient.ts
```

Without a graft, the shipped path command reports two records over the review
range. I then added one graft line assigning `HEAD` directly to the review base
as its parent. The object itself still names C1 as its parent (`git cat-file -p
HEAD`), but Git's revision walk skips C1. With
`advice.graftFileDeprecated=false`, there is no warning to rescue the result:

| Range / state                 | Check (0) | Raw-log exit | Raw bytes | Path / mode records | stderr bytes |
| ----------------------------- | --------- | ------------ | --------- | ------------------- | ------------ |
| Known-bad range, before graft | 0         | 0            | 106       | 1 / 1               | 0 / 0        |
| Review range, before graft    | 0         | 0            | 99        | 2 / 0               | 0 / 0        |
| Known-bad range, after graft  | 0         | 0            | 106       | 1 / 1               | 0 / 0        |
| Review range, after graft     | 0         | 0            | **0**     | **0 / 0**           | **0 / 0**    |

The liveness proof therefore passes while the reviewed range is falsely
certified evidence-only. This is the exact population property R6-M2 was
required to sweep. Round 6's statement that grafted histories belonged to the
replacement-object finding was incorrect on the Git version being reviewed.

#### `diff.relative` filters the population by working directory

I separately committed `src/evil.ts`, ran the published commands from
`docs/reviews/`, and injected `diff.relative=true` through both `-c` and
`GIT_CONFIG_*`. Check (0) returned 0; `git log` returned 0 with no stderr; both
filters saw zero records. The same hostile configuration still let a separate
known-bad range inside `docs/reviews/` print in both commands. Adding
`--no-relative` to the log invocation restored `src/evil.ts`:

| Measurement                                        | Ancestry / raw exit | Raw bytes | Path / mode records |
| -------------------------------------------------- | ------------------- | --------- | ------------------- |
| Known-bad liveness under `diff.relative=true`      | 0 / 0               | 80        | 2 / 1               |
| Reviewed behavior range under `diff.relative=true` | 0 / 0               | **0**     | **0 / 0**           |
| Same range through `GIT_CONFIG_*` injection        | 0 / 0               | **0**     | **0 / 0**           |
| Same range with explicit `--no-relative`           | n/a / 0             | 44        | 1 / 0               |

This is not a pathname-regex problem. Git removed the record before the regex
or mode check received input.

**Required correction.** Fail closed when the repository's legacy graft file
is non-empty, before trusting ancestry or log output; pin non-relative output
on both log commands; and add real-commit negative cases proving both old forms
fail and both replacements pass. Re-run the class sweep against settings and
environment that choose the revision walk and diff scope, not only settings
whose names mention submodules or replacements. If the owner keeps this
mechanism, its non-allowlisted repair requires round 8 under the rule being
ratified.

### R7-N1 — the per-submodule sweep claim is false, though the override works

The new property (f) says a per-submodule `submodule.<name>.ignore` “did not”
suppress the gitlink (`TESTING_STANDARDS.md:946-952`). In a repository whose
`.gitmodules` mapped the gitlink to `submodule.review`, the old command emitted
zero records under `submodule.review.ignore=all`. `dirty` and `untracked`
emitted one record. The shipped `--ignore-submodules=none` emitted one record
under all four values (`none`, `dirty`, `untracked`, `all`).

The operative repair is therefore sound, but the reported sweep is not. Amend
the sentence to record that both global and correctly mapped per-submodule
`=all` suppress, and that the unconditional option overrides both. Fold this
claim correction into the R7-M1 repair rather than spending a separate round on
it.

### Named R6-M2 repairs and regression suite

Source inspection confirms all three Git reads carry
`--no-replace-objects`, and both logs carry
`--ignore-submodules=none` (`TESTING_STANDARDS.md:872-887`). The named repairs
fail against the old form and pass against the shipped form:

- A gitlink at an allowed path under `diff.ignoreSubmodules=all` was silent in
  the old form and produced one mode record in the new form. The global
  `dirty`/`untracked` values produced a record in both forms; the explicit
  option also overrode a mapped `submodule.review.ignore=all`.
- A behavior commit replaced by a same-parent decoy was silent in the old form
  and produced `src/replaced.ts` in the new form.
- A replacement that fabricated ancestry returned 0 in the old check and 1
  under `--no-replace-objects`.

I rebuilt the eight mandatory negatives as real commits. Cases 1 and 2 printed
one path record; case 3 printed one mode record; case 4 printed two path
records; case 5 printed one mode record; the rebuilt merge case printed mode
records under all four hostile `log.diffMerges` values; and cases 7 and 8
produced the fail-old/pass-new results above. Review-only (also under
`diff.ignoreSubmodules=all`), allowed-to-allowed rename, and the two exact root
notes remained silent.

Two harness defects were caught rather than counted as evidence. My first
merge fixture left a side-path conflict unresolved, so its failed commit and
results were discarded; I rebuilt it as a symlink/symlink conflict with a
third resolution. My first counter treated a blank input line as a mode record;
I detected the contradiction against zero raw bytes, required a raw-record
prefix in the counter, and reran the submodule and replacement cases.

I enumerated applicable `diff.*`, `log.*`, and adjacent settings from
`git help --config`, then exercised a matrix over algorithms, external diff,
submodule ignore/format, rename detection, relative output, merge format,
follow, root display, signatures, attributes, quoting, replacement enablement,
and submodule recursion. Only `diff.relative=true` suppressed the ordinary
behavior record. A hostile attributes file, external diff environment,
alternate object directory, and substituted/sparse index did not suppress raw
history records. Legacy grafts independently did.

### R6-M3 and R6-N1

R6-M3 is closed at both changed live surfaces. The source history confirms no
mechanical command at `0a311bb`, creation by `bcba77a`, four command findings in
rounds 2–5, the audit's merge-format finding, and round 6's population finding.
The numbered account in `OPERATING_AGREEMENT.md:289-313` and the shorter account
in `TESTING_STANDARDS.md:859-870` preserve those distinctions and do not revive
the old five-round falsehood.

R6-N1 is also closed. The audit's tables enumerate ten pre-round-6
merge-blocking findings and two notes. R6-M1 is the sixth merge-blocking item in
the §3.4 lineage and the eleventh overall, or thirteenth including the two
notes. The correction at `pr139-defect-pattern-audit.md:453-460` states exactly
that and leaves the valid §5 overall heading intact.

### `9ded8c6` merge resolution

After fetching, the live PR remained open, non-draft, and mergeable with remote
head `9ded8c6975b8bf4f0cea98b744f217874a9915fe` and remote base
`e1773f9e4b97bddc9002df55aa9620870f0660dc`. The merge's first parent is
`2d667f55bddeb2d6f0f115b623c56dc2d17272b7`; the common ancestor of the two
parents is `a6ce103c560ac45331321c8956bb445c789fa9d0`.

I took the union of every path differing between the merge and either parent,
then compared blob IDs at all three commits. Thirteen paths are in that
population: four are the first parent's blobs, eight are the second parent's
blobs, and `docs/governance/OPERATING_AGREEMENT.md` is the sole synthesized
blob. `CLAUDE.md` and `MEMPALACE_PROTOCOL.md` are main's blobs exactly; the
branch never changed the protocol file from the common ancestor. The other
twelve path dispositions match their branch of origin. `git diff --check`
against both parents is clean, and no conflict marker remains in the touched
population.

The first-parent-to-merge diff of the synthesized file has one hunk, the §4
table. Independently counting lines beginning `| ` gives eighteen lines and
sixteen data rows in both the first parent and merge; main has fourteen data
rows. All current rows contain zero escaped pipes, so cell splitting does not
drop a present row. Comparing normalized data cells (excluding header,
separator, and padding) gives exactly one semantic delta against the first
parent—the MP-LEASE Authority cell—and exactly two added rows against main,
REV-IMPL and REV-RERUN. Taking main's MP-LEASE authority preserves PR #140's
correction. The resolution lost no parent contribution and reopened no closed
finding.

The docs-only boundary also holds: `git diff --stat origin/main...HEAD -- src/
tests/` is empty, and the `src`, `tests`, `package.json`, and `vitest.config.ts`
tree/blob IDs equal main.

### Checked clean and not checked

- **Repository gate:** `./tools/checks` exited **0**; all four steps passed.
  ESLint reported 0 errors / 145 warnings, Prettier and `tsc --noEmit` were
  clean, and Vitest passed 1,335 tests across 101 files.
- **Checked clean:** live remote head/base and PR state; complete `2d667f5`
  source diff; all eight mandated negative cases and three controls; fail-old
  evidence for submodule suppression, commit replacement, and fabricated
  ancestry; the ambient configuration matrix and independent graft/relative
  cases; R6-M3 and R6-N1 histories; union-of-parent merge path classification;
  §4 row population and semantic cell deltas; conflict-marker and whitespace
  checks; main's CLAUDE/MP-LEASE carriage; docs-only source/test boundary.
- **Could not check:** behavior on Git versions other than 2.43.0; a genuine
  network-backed partial clone during an unavailable promisor fetch;
  platform-specific case-insensitive filesystem behavior. These remain
  **UNVERIFIED**.
- **Not run:** e2e, integration, or UAT. The commission limits repository
  re-run scope to `./tools/checks`, and the reviewed commits are docs-only.
- **Not changed:** governance/testing sources, PR body, `[STATE]`, UAT, branch
  topology, or merge state. This round changes only this review file. No
  MemPalace write was attempted under MP-LEASE.

### MemPalace drawer candidates

- `havdm/review`, `added_by="codex"` — **PR #139 Round-7 review:**
  CHANGES-REQUIRED, high confidence. R6-M3, R6-N1, and the `9ded8c6` merge
  resolution are resolved. R6-M2 remains open: `.git/info/grafts` is honored by
  Git 2.43 under `--no-replace-objects` and can skip a transient behavior commit
  while liveness still passes; `diff.relative=true` can suppress
  out-of-directory records when the command runs from a subdirectory. The
  shipped submodule/replacement fixes work, but the prose incorrectly says a
  mapped `submodule.<name>.ignore=all` does not suppress. The required
  non-allowlisted testing-standard repair forces round 8; the rule is too
  expensive to ratify in its current form.
- `practice/verification`, `added_by="codex"` candidate — **Disabling replacement
  refs does not disable every Git history substitution:** on Git 2.43,
  `.git/info/grafts` still rewrites ancestry under `--no-replace-objects`; with
  its warning disabled, a targeted graft can leave a known-bad liveness range
  live while making the reviewed transient-change range cleanly silent. Also
  pin `--no-relative` when a repository-wide raw population must not depend on
  the caller's working directory.

## Round 8

Author: Claude Opus (`7d30703`, `80cfef2`, and `58fc230`)
Reviewer: OpenAI Codex (GPT-5), independent reviewer; did not author these commits
Owner gate: BaggyG-AU reads PR #139 and this round together; only the owner signs off and merges

**Verdict: CHANGES-REQUIRED (high confidence).** **Merge readiness: not ready.**
Option B operationally resolves R7-M1 and R7-N1: no command remains normative,
and a defect in the advisory hazard list no longer compels a repair. The
narrowing nevertheless reopens the exact false-lineage class closed as R6-M3
and states a repeated engineering failure as proof of mechanical
undecidability. Both claims appear in the normative Operating Agreement and are
false on the committed record.

Correcting them changes non-allowlisted governance/testing paths, so §3.4(2)
would force round 9. At the explicit round-8 go/no-go requested by the owner,
**drop class (d) entirely rather than commission another repair round.** The
narrowed design has broken the command-defect generator, but this ratification
has not become cheap enough to land: the same historical-count defect has now
been recreated after it was already found, repaired, and independently closed.

### Disposition

| Item                              | Disposition   | Merge effect                                  | Round-8 judgement                                                                                                                                                                                                          |
| --------------------------------- | ------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R7-M1 — normative false accepts   | **RESOLVED**  | None                                          | The pipeline and negative-case floor are deleted from normative status. No surviving operative text requires a particular command, and the finite §3.4(3) population remains followable by a reviewer.                     |
| R7-N1 — false per-submodule claim | **RESOLVED**  | None                                          | The normative block containing the false sentence is gone. The advisory replacement correctly says a mapped `submodule.<name>.ignore=all` suppresses; a fresh fixture also confirmed the former explicit override worked.  |
| Option B narrowing                | **REGRESSED** | **MERGE-BLOCKING; correction forces round 9** | Commit `7d30703` reintroduces R6-M3's false causal count and adds an unsupported undecidability premise. `80cfef2` corrects the adjacent population-definition claim but leaves both defects live in two current surfaces. |

### R8-M1 — `7d30703` recreates the false round lineage closed as R6-M3

The Operating Agreement now says **“Seven consecutive rounds each found a NEW
false-accept route in the same pipeline”**
(`OPERATING_AGREEMENT.md:296-306`). Testing Standards says the pipeline was
tried through seven review rounds and produced a false accept **“in every one”**
(`TESTING_STANDARDS.md:868-877`). `git blame` assigns both statements to
`7d30703`.

The committed review and audit prove a different sequence:

1. Round 1 found M2, the absence of a repair trigger and definition. There was
   no pipeline; the round-1 fix `bcba77a` created it.
2. Rounds 2–5 found the blocklist, prefix, rename, and endpoint defects.
3. The merge-record-format defect was found by the separate pre-round-6 audit,
   not by a review round.
4. Rounds 6 and 7 found the two later ambient-state populations.

That is not seven consecutive review rounds in which every round found a
pipeline false accept. It is the same causal compression R6-M3 rejected and
Round 7 independently marked resolved. Commit `80cfef2` correctly narrows the
adjacent statement from “not one round found a definition defect” to “once the
definition existed,” but it does not sweep or correct the preceding false
round claim.

**Required correction.** State the measured sequence above without assigning
the audit to a review round or inventing a round-1 pipeline. This is
merge-blocking for the same reason R6-M3 was: the false causal history is the
normative rationale for the structural ruling, and it directly contradicts the
primary records it cites.

### R8-M2 — repeated pipeline failure does not make the property undecidable

The Operating Agreement calls seven rounds “the evidence that this property is
not mechanically decidable under hostile repository configuration” and then
invokes the rule that an undecidable property is a defect generator
(`OPERATING_AGREEMENT.md:303-306`). Testing Standards restates the conclusion
as an owner ruling (`TESTING_STANDARDS.md:875-877`). Seven failed forms of one
shell pipeline establish that those forms were unreliable; they do not prove
that no mechanical decision procedure exists.

The §3.4(3) property is finite and mechanically decidable in principle. A
config-independent implementation can:

1. read the exact previous-review and `HEAD` commit objects and traverse their
   literal parent OIDs, ignoring replacement refs and graft presentation;
2. fail closed on a missing, malformed, or unreachable object;
3. compute the finite set reachable from `HEAD` but not from the previous
   review; and
4. recursively compare each immutable tree map against every parent, checking
   raw pathname bytes and modes against (3)(i) and (ii).

This algorithm does not consult `diff.*` or `log.*` presentation settings.
Under Git's object-identity model, content-addressed IDs prevent an alternate
store from silently substituting different bytes; unavailable objects fail
closed. On Git 2.43.0 I
also re-confirmed the key separation: with an active `.git/info/grafts`,
`--no-replace-objects rev-list` reported the grafted parent while
`--no-replace-objects cat-file -p` returned the commit object's actual parent.
A purpose-built raw-object walker can therefore avoid the mechanism that broke
the former pipeline. A more conservative certificate can also reject any
ambient state it has not neutralized; false rejection costs a review but cannot
create a false evidence-only acceptance.

The owner's conclusion can still stand as a cost judgement: maintaining a
normative decider proved more expensive than letting the reviewer trace a
range. Its stated premise must say that. **Required correction:** replace the
claim of undecidability with the measured claim that the attempted pipeline was
not a reliable or cost-effective normative decider under ambient Git state.
The current wording is merge-blocking because it writes a false universal into
the binding rationale and would preclude a future sound tool on grounds the
evidence does not establish.

### The forcing chain is broken, and §3.4(3) remains followable

The author's weakest claim 1 has a split answer. Testing Standards remains
outside the allowlist, so an author who voluntarily edits its advisory hazard
list during a repair still makes that repair non-evidence-only and draws a
round. That is correct scope classification. What Option B removes is the
causal requirement to edit it: no command or checklist there decides the
certificate, so a newly discovered advisory hazard does not invalidate §3.4 or
compel a finding-driven repair. The round-on-round command-defect generator is
therefore removed, not renamed.

I applied §3.4(3) to two genuinely nontrivial histories built as real commits:

- **Hard positive — evidence-only.** From the previous review, one side added
  `CODEX_SUMMARY.md`, another renamed `docs/reviews/a.md` to
  `docs/reviews/b.md`, and a two-parent merge combined them. Comparing every
  commit with every parent produced only the three allowed pathnames and modes
  `000000`/`100644`; both rename sides were allowed. The range qualifies.
- **Hard negative — not evidence-only despite a clean endpoint.** A behavior
  file moved from `src/tool.sh` into `docs/reviews/renamed.md` and later moved
  back; an allowed review file became a symlink and was restored; two later
  branches added only `PR_NOTES.md` and `docs/reviews/side.md` and merged. The
  endpoint diff showed only those two allowed additions, but the per-commit hand
  trace exposed both `src/tool.sh` sides and the transient `120000` mode. The
  range does not qualify.

Those decisions took a finite commit/parent trace and no normative command.
The definition is usable without the deleted mechanism.

The actual commissioned range also classifies cleanly: `06246fc..58fc230`
contains three commits; their complete per-parent trace touches only
`docs/governance/OPERATING_AGREEMENT.md` and
`docs/testing/TESTING_STANDARDS.md`, always as `100644`. Neither path is
allowed, so the repair is not evidence-only and this round was required.

### Normative-effect sweep and advisory accuracy

I stated the swept class as **text or executable behavior that makes a
particular evidence mechanism binding**, then enumerated it three ways: current
references to §3.4/REV-IMPL/evidence-only, modal language near Git/diff/range
terms, and executable consumers of the two documents. I read the complete
current §3.4 and Testing Standards evidence-only section rather than trusting
the searches.

- The only current operative surfaces are §3.4 itself, the explicitly advisory
  Testing Standards section, and the corrected REV-IMPL index row.
  `ai_rules.md` and `CLAUDE.md` each contain zero evidence-only references.
- No old pipeline, fenced command, mandatory negative-case floor, or text whose
  effect requires a particular certificate survives outside historical review
  files. `tools/check-e2e-guardrails.sh` names Testing Standards only in a
  comment describing unrelated E2E rules; it does not read either document.
- The seven-round review (1,848 lines before this section) and the 596-line
  defect audit remain committed. The current committed repair is a net deletion
  of 115 lines (96 added / 211 deleted). The author's pre-format net of 119
  deleted lines cannot be regenerated from the committed trees and is
  **UNVERIFIED**; the load-bearing direction, net deletion, holds.

The advisory list is correctly labelled “not a checklist” and says clearing it
is insufficient. Its R7-specific facts hold: a correctly mapped
`submodule.<name>.ignore=all` suppressed the gitlink in my fresh fixture and an
explicit `--ignore-submodules=none` restored it; a graft still rewrote history
under `--no-replace-objects`; and `diff.relative=true` suppressed an
out-of-directory path when invoked from a subdirectory.

### R8-N1 — three advisory hazard descriptions are overbroad

These are prose defects, but **not merge-blocking** under the owner's Option B
because the list is explicitly non-normative and incomplete:

- “Renames report only the destination” is true of the former `--name-only`
  form, not Git rename output generally. In a fresh real rename,
  `git diff -M --name-only` printed only the destination, while
  `--name-status` and `--raw` printed both source and destination.
- `log.diffMerges=combined` and `dense-combined` are grouped under “measured
  suppressors,” but they did not suppress the record; they changed its shape so
  the former `$2` parser read a parent mode. The distinction is the point of the
  old format/population split.
- `diff.relative=true` drops out-of-directory paths only when Git is invoked
  below the repository root. My rerun produced one record from the root and
  zero from `docs/reviews/`; the advisory sentence omits that precondition.

Qualify these if the advisory paragraph is touched later. They do not reopen
R7-M1, alter §3.4's population, or require another repair in this pull request.

### Checked clean and not checked

- **Repository gate:** `./tools/checks` exited **0**; all four steps passed.
  ESLint reported 0 errors / 145 warnings, Prettier and `tsc --noEmit` were
  clean, and Vitest passed 1,335 tests across 101 files.
- **Checked clean:** live remote head/base and PR state; exact three-commit
  population and modes; docs-only boundary; R7-M1/R7-N1 deletion; effect-keyed
  normativity sweep; §4 correction; hard positive and negative hand traces;
  forcing-chain analysis; raw-object decidability; per-submodule, graft,
  relative-path, and rename advisory facts; committed review/audit preservation;
  current net deletion and whitespace.
- **Could not check:** the author's uncommitted pre-format line count; behavior
  on Git versions other than 2.43.0; a production implementation of the raw
  object-walk algorithm; platform-specific case-insensitive filesystem behavior.
  These remain **UNVERIFIED**.
- **Not run:** e2e, integration, or UAT. The commission limits repository
  re-run scope to `./tools/checks`, and the in-scope commits are docs-only.
- **Not changed:** either governance/testing source, PR body, `[STATE]`, UAT,
  branch topology, or merge state. This round changes only this review file. No
  MemPalace write was attempted under MP-LEASE.

### MemPalace drawer candidates

- `havdm/review`, `added_by="codex"` — **PR #139 Round-8 review:**
  CHANGES-REQUIRED, high confidence. Option B resolves R7-M1/R7-N1 and breaks
  the normative-command defect generator; §3.4 remains hand-decidable on hard
  merge/history cases. `7d30703` nevertheless recreates R6-M3's false lineage:
  round 1 had no pipeline and the merge-format defect came from the audit, so
  seven review rounds did not each find a false accept. The same commit also
  overclaims mechanical undecidability; the finite raw commit/tree graph admits
  an exact config-independent decision procedure. Correcting the two current
  surfaces would force round 9. At the owner's requested round-8 go/no-go, drop
  class (d) rather than continue this ratification.
- `practice/claims`, `added_by="codex"` candidate — **Repeated failure of one
  implementation is not proof that its finite property is undecidable.**
  Separate “the attempted mechanism was not reliable or cost-effective” from
  “no algorithm can decide the property.” Before publishing the latter, state
  the finite inputs and test whether a raw-state traversal or a fail-closed
  certificate decides them without the failed presentation layer.

## Round 9

Author: Claude Opus (`c28559f`, Option C implementation)
Reviewer: OpenAI Codex (GPT-5), independent reviewer; did not author this commit
Owner gate: BaggyG-AU reads PR #139 and this round together; only the owner signs off and merges

**Verdict: APPROVE (high confidence).** **Merge readiness: ready.** Commit
`c28559f` implements Option C as a complete semantic deletion. The old
evidence-only population, automatic repair lifecycle, allowlist, mechanical
decider and advisory mirror are gone; no surviving rule needs them. The new
class-(d) lifecycle retains the independently valuable first full review and
places every later re-review decision with the owner. PR #139 is now mergeable,
and the owner should **retain class (d), not drop it**.

### Disposition

| Item                                         | Disposition  | Merge effect | Round-9 judgement                                                                                                                                                                                                                                 |
| -------------------------------------------- | ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R8-M1 — false seven-round lineage            | **RESOLVED** | None         | Both false surfaces are deleted. The surviving history distinguishes rounds 2–7 from the separate audit and does not invent a round-1 pipeline.                                                                                                   |
| R8-M2 — unsupported undecidability claim     | **RESOLVED** | None         | The Testing Standards claim is deleted. §3.4 expressly says the outcome is a judgement about one implementation's reliability and cost as a normative decider, **not** a claim that no decision procedure exists.                                 |
| R8-N1 — overbroad advisory hazard prose      | **RESOLVED** | None         | The entire non-normative evidence-only section containing all three descriptions is deleted.                                                                                                                                                      |
| Safeguard 1 — delete both dependent surfaces | **RESOLVED** | None         | The old 111-line §3.4 machinery and the 50-line Testing Standards mirror are absent. The compact replacement contains no allowlist, population, range classifier or required certificate.                                                         |
| Safeguard 2 — explicit stopping rule         | **RESOLVED** | None         | One full review is mandatory before merge; no automatic follow-up is required; the owner decides whether each post-review change warrants re-review. Read with the standing owner sign-off and merge gate, the clause has an accountable decider. |
| Safeguard 3 — effect-keyed sweep/retentions  | **RESOLVED** | None         | The live class list, §3.3 cost trigger and REV-IMPL row match the new lifecycle. The generic clean-round clarification and both class-(d) rollback triggers remain; §3.5 is independent; no executable consumer relies on deleted machinery.      |

### The stopping rule closes the old hole

The clause is normatively self-executing even though it is deliberately not
machine-enforced. Section 3 already requires the owner to sign off while reading
artifact and review together, and §1 reserves the merge action to the owner.
After a post-review change, a compliant owner therefore has two choices: decide
that it warrants re-review and request one, or decide that it does not and merge.
The owner cannot merge while “simply not deciding” without violating the express
assignment that the **OWNER decides**. Silence alone performs no merge; an owner
merge is the sign-off that exercises the discretion.

This is materially different from the old M2 hole. The old text simultaneously
promised narrow later rounds and acceptance of a residue without assigning the
boundary between them. The new text deliberately creates no automatic later
round and names the person who decides. Requiring a separate recorded checkbox
could improve auditability, but it is not necessary to make the rule determinate
and would add an enforcement mechanism that Option C did not adopt.

### Independent history derivation

I re-derived the count from the committed primary review and audit rather than
from the new prose:

| Source         | False-accept route found                                                             |
| -------------- | ------------------------------------------------------------------------------------ |
| Round 2        | executable-directory blocklist omitted other behaviour-bearing surfaces              |
| Round 3        | prefix regex accepted non-allowlisted suffixes and descendants                       |
| Round 4        | rename-collapsing `--name-only` output omitted the source side                       |
| Round 5        | endpoint comparison omitted transient paths and modes                                |
| Separate audit | delegated merge-record format changed what the parser consumed                       |
| Round 6        | submodule suppression and replacement refs changed or replaced the record population |
| Round 7        | legacy grafts and `diff.relative` changed the revision walk or path scope            |

That is **six review rounds (2–7) plus one separate audit**, producing seven
distinct route groups. Round 1 found that no definition or pipeline existed;
its repair created the first pipeline. Round 8 found false prose about the
history and decidability, not another pipeline route. The replacement account
at `OPERATING_AGREEMENT.md:236-246` is therefore accurate. Its statement that
the removal is not proof of undecidability also preserves the exact R8-M2
boundary.

### Effect-keyed deletion and surviving rules

I defined the swept class as **any live obligation, exception, authority or
packaging rule whose meaning depended on classifying repairs through the deleted
population or on automatically commissioning a later narrow round**. This goes
past the author's four keys by looking for consequences of a post-review change
even where the old terms and section pointers are absent. I searched those
effects and read the current Operating Agreement §§2–4 and the surrounding
Testing Standards surface end to end.

- The §3 class list and REV-IMPL row state the same three-part lifecycle. The
  superseded governance-review source says “one mandatory round, not
  review-until-approve,” which is compatible with it.
- §2's reference to post-review fix commits governs branch-history preservation
  only; it does not require another review or classify a repair.
- The old allowlist, path/mode population, previous-review range and advisory
  certificate existed only to decide whether §3.4 forced another round. Once
  that automatic consequence is deleted, no live rule has an undefined term.
- The retained governed-rule-surfaces sentence is independently meaningful:
  §3 class (b) already treats substantive governance text as the product. It
  does not refer to or require the deleted allowlist.
- §3.5 is 60 lines from its heading through its final rule. Within that complete
  surface there are zero occurrences of `evidence-only`, `§3.4`, `allowlist`,
  `population` or `follow-up`; its subject remains the live class-(d) artifact.
- No source, test, tool, workflow, package script or configuration reads either
  changed document. `tools/check-e2e-guardrails.sh` names Testing Standards in a
  comment about unrelated E2E conventions; `sectionsLayout.spec.ts` refers to a
  “source view,” not a read operation on the Operating Agreement.

### R9-N1 — the self-pass enumeration has two harmless count errors

The author's semantic conclusion is clean, but two published enumeration
details are not exact:

- The commission and commit message say the only current `evidence-only` hits
  outside historical reviews are REV-IMPL and the unrelated adversarial-review
  rule. A repository-wide `rg` also returns
  `OPERATING_AGREEMENT.md:236`, the new sentence saying that no mechanical
  evidence-only test remains.
- The commission calls §3.5 a 61-line section. Counting from its heading through
  the line before `## 4` returns **60**; 61 includes the next section's heading.

These inaccuracies do not identify a stale dependency. The omitted hit records
the deletion rather than relying on deleted machinery, and the §3.5 content was
read in full and is independent. The committed review now corrects the
enumeration. This is an **owner-acceptable, non-blocking note**, not a reason to
alter either governing document or commission another round.

### Checked clean and not checked

- **Live scope:** after fetching, local and remote head were both
  `c28559ffef749970b20b0332fc9843ecab2e9d16`; local and remote `main` were both
  `e1773f9e4b97bddc9002df55aa9620870f0660dc`. PR #139 was open, non-draft,
  mergeable and based on `main`. `fc4aec9..c28559f` contains exactly one commit,
  modifying only the two stated Markdown files as ordinary `100644` files.
- **Repository gate:** `./tools/checks` exited **0** with **4/4 steps**. ESLint
  reported 0 errors / 145 warnings; Prettier and `tsc --noEmit` were clean;
  Vitest passed **1,335 tests across 101 files**.
- **Checked clean:** complete commit diff and deletion boundaries; all six
  required dispositions; corrected primary-record history; stopping-rule
  semantics; class-(d) scope and owner gate; §3.3 retentions; §3.5 independence;
  REV-IMPL; superseded governance-review references; executable consumers;
  document modes; line counts; net deletion (**35 additions / 164 deletions =
  129 net deleted lines**); and whitespace.
- **Could not check:** whether a future owner will consciously apply the
  post-review-change decision, or the author's claim that its gate passed on the
  first attempt. Those are **UNVERIFIED**. The rule itself assigns the decision,
  and my own gate result is reported above.
- **Not run:** e2e, integration or UAT. The commission requires
  `./tools/checks`; the scoped commit changes only Markdown and no executable
  consumer reads it.
- **Not changed:** either governance/testing source, PR body, `[STATE]`, UAT,
  branch topology or merge state. This round changes only this review file. No
  MemPalace operation was attempted under MP-LEASE.

### MemPalace drawer candidates

- `havdm/review`, `added_by="codex"` — **PR #139 Round-9 review:** APPROVE,
  high confidence; merge-ready. Option C completely removes the evidence-only
  classifier and automatic follow-up machinery from both operative surfaces,
  retains a determinate one-round lifecycle with owner discretion over later
  changes, preserves both class-(d) rollback triggers and independent §3.5
  re-run scope, and leaves no live consumer dependent on deleted terms. The
  corrected history is six review rounds plus one audit, not seven consecutive
  review rounds, and it expressly makes no undecidability claim. Retain class
  (d); do not commission round 10.
- `practice/review`, `added_by="codex"` candidate — **When deleting a decision
  mechanism, sweep its consequences rather than its vocabulary.** Enumerate
  every surviving obligation, exception, authority and packaging rule that used
  the deleted classification or trigger, including prose that describes what
  happens after the governed event without naming the old mechanism. A clean
  token sweep is corroboration; the end-to-end consequence trace is the result.
