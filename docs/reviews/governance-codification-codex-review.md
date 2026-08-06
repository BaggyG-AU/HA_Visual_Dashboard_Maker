# Independent Artifact Review — Governance Codification (PR #131)

**Author:** OpenAI Codex (GPT-5), 2026-08-06

**Reviewer independence:** I authored none of the content under review. This is
an independent, advisory review against the owner's supplied ratification and
the committed governance authorities.

**Scope:** commit `9cc23ed`; `docs/governance/OPERATING_AGREEMENT.md`,
`docs/templates/FEATURE_SPEC.md`, and
`docs/templates/ADVERSARIAL_REVIEW.md`.

**Owner gate:** BaggyG-AU remains the sole merger and final approver, after
reading PR #131 and this review together.

## Checklist results

### 1. Transcription fidelity

**Result: FAIL.** Most of R1, R2, R4, and the F5/F8 assignment is transcribed
faithfully, but several scope words change operative meaning. The most serious
are the conditional path to `gh pr merge`, narrowing the plan gate from
implementation to code, applying the written-spec gate to unqualified
"Specs", making red-before-green absolute, and broadening a rollback trigger
from spec reviews to all independent reviews.

The classifications below apply to every normative statement in the operating
agreement. Where a row combines adjacent sentences, they impose the same rule.
For opaque drawer-backed index entries, `FAITHFUL` means the entry is a
one-sentence pointer consistent with the supplied or committed evidence; the
drawer's full contents were not independently available.

| Statement                                                                                                                                                                          | Evidence                                         | Classification                | Basis                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The agreement binds every HAVDM agent; owner merge is the gate for landing or amending it.                                                                                         | `docs/governance/OPERATING_AGREEMENT.md:3-7`     | FAITHFUL                      | R3 makes the agreement normative; R1 and R5 require owner sign-off.                                                                                                 |
| The repository carries operative rules and pointers only; narrative stays in MemPalace and content growth is cut back.                                                             | `docs/governance/OPERATING_AGREEMENT.md:11-15`   | FAITHFUL                      | R3 and rollback trigger 4 say this directly.                                                                                                                        |
| `ai_rules.md` implementation safety wins; phase governance controls scope, sequencing, and packaging; the agreement occupies the session-workflow layer.                           | `docs/governance/OPERATING_AGREEMENT.md:17-21`   | FAITHFUL                      | Matches `ai_rules.md:46-54` and `docs/governance/PHASE_ORCHESTRATION_FRAMEWORK.md:43-48`, subject to the broken shorthand pointer in M11.                           |
| Before sign-off, investigation is read-only and the agent presents a short plan.                                                                                                   | `docs/governance/OPERATING_AGREEMENT.md:27-29`   | NEW RULE — no cited authority | Plan sign-off is ratified, but the supplied authority does not prescribe plan length; read-only investigation is safe practice rather than a cited ratified clause. |
| Owner sign-off is required before **writing code**.                                                                                                                                | `docs/governance/OPERATING_AGREEMENT.md:27-29`   | LOOSENS                       | The ratified rule is sign-off before **implementation**, not merely before code.                                                                                    |
| Autonomous implement → test → commit → push → PR begins after plan sign-off.                                                                                                       | `docs/governance/OPERATING_AGREEMENT.md:29-31`   | FAITHFUL                      | Corroborated by `docs/governance/MULTI_MODEL_WORKFLOW_PLAN_2026-07.md:39-45`.                                                                                       |
| R7-class work needs an owner-approved written spec before code.                                                                                                                    | `docs/governance/OPERATING_AGREEMENT.md:31-32`   | FAITHFUL                      | Matches the supplied F5/F8 R7 authority.                                                                                                                            |
| `gh pr merge` requires owner authorization every time.                                                                                                                             | `docs/governance/OPERATING_AGREEMENT.md:33-35`   | LOOSENS                       | The supplied rule is that the agent **never** merges; authorization is not an exception.                                                                            |
| The merge `permissions.ask` rule is never removed or bypassed.                                                                                                                     | `docs/governance/OPERATING_AGREEMENT.md:34-35`   | FAITHFUL                      | Matches the standing merge backstop.                                                                                                                                |
| Agents never commit or push to `main`; only the owner merges.                                                                                                                      | `docs/governance/OPERATING_AGREEMENT.md:36`      | FAITHFUL                      | Matches supplied standing law.                                                                                                                                      |
| Branches use `tools/feature-start` / `tools/feature-finish`; PRs are non-stacked, one-commit, and based on current `main`.                                                         | `docs/governance/OPERATING_AGREEMENT.md:43-45`   | FAITHFUL                      | Matches supplied standing law and `ai_rules.md:226-257`, but conflicts with the required review commit (M3).                                                        |
| After merge, the agent autonomously verifies ancestry, syncs `main`, prunes, reruns checks, and updates `[STATE]`.                                                                 | `docs/governance/OPERATING_AGREEMENT.md:46-48`   | NEW RULE — no cited authority | None of these exact mandatory steps is in R1-R5, R7, or the supplied standing-law list.                                                                             |
| Every new test must be observed failing on base in the same checkout or it does not count.                                                                                         | `docs/governance/OPERATING_AGREEMENT.md:49-50`   | TIGHTENS                      | R2 asks the test plan to state red-before-green legs; it does not abolish documented no-valid-red-leg cases.                                                        |
| Never blind-rebaseline; triage against the documented baseline first.                                                                                                              | `docs/governance/OPERATING_AGREEMENT.md:51-52`   | FAITHFUL                      | Matches supplied standing law.                                                                                                                                      |
| Every rebaseline needs an explained cause and its own PR.                                                                                                                          | `docs/governance/OPERATING_AGREEMENT.md:52-54`   | TIGHTENS                      | The standalone-PR rule is stricter than the ratified never-blind-rebaseline rule.                                                                                   |
| Every gate report includes the real exit code and 4/4 step count, never a piped/laundered result.                                                                                  | `docs/governance/OPERATING_AGREEMENT.md:55-57`   | NEW RULE — no cited authority | Sound reporting practice, but not part of the supplied ratification and no specific authority is cited.                                                             |
| The owner/tester runs and marks every UAT test; the agent never marks one.                                                                                                         | `docs/governance/OPERATING_AGREEMENT.md:58-59`   | FAITHFUL                      | Matches `docs/testing/UAT_STRATEGY.md:47-59` and its solo-owner clarification at `:367-374`.                                                                        |
| `ha.home.local` is read-only because VPP enrolment forbids writes.                                                                                                                 | `docs/governance/OPERATING_AGREEMENT.md:60-61`   | TIGHTENS                      | It omits the owner-authorized, bounded UAT temp-dashboard write envelope in `docs/testing/UAT_STRATEGY.md:378-400`.                                                 |
| `ai_rules.md` §11 memory policy and §12 Workflow State reporting apply.                                                                                                            | `docs/governance/OPERATING_AGREEMENT.md:62-63`   | FAITHFUL                      | Matches supplied standing law and `ai_rules.md:313-356`.                                                                                                            |
| A no-write agent may put drawer candidates in the PR body **or** `~/.mempalace/pending/`.                                                                                          | `docs/governance/OPERATING_AGREEMENT.md:63-65`   | LOOSENS                       | `ai_rules.md:323` names the PR body; the alternative private queue is not authorized there.                                                                         |
| The invariant is piloted on F5/F8 and permanence is decided at the v1.0.0 gate / Phase 7 close-out.                                                                                | `docs/governance/OPERATING_AGREEMENT.md:67-70`   | FAITHFUL                      | Matches the ratified pilot and the adoption sequence at `docs/governance/PROMPTMI_GOVERNANCE_REVIEW_2026-08.md:279-287`.                                            |
| No author approves its own governed artifact; a different model reviews first in a committed branch document; the owner is final; same model/different session is not independent. | `docs/governance/OPERATING_AGREEMENT.md:72-76`   | FAITHFUL                      | Transcribes R1.                                                                                                                                                     |
| Covered classes are R7-class specs/remediation plans, substantive governance changes, and defect-ranking/re-scoping triage.                                                        | `docs/governance/OPERATING_AGREEMENT.md:78-80`   | FAITHFUL                      | Transcribes R1's exact classes.                                                                                                                                     |
| Routine slice implementation is excluded and is audited by owner review, gates, UAT, and periodic adversarial passes.                                                              | `docs/governance/OPERATING_AGREEMENT.md:81-83`   | FAITHFUL                      | Preserves the explicit declined per-slice implementation cross-review.                                                                                              |
| The review uses `docs/reviews/<branch-shortname>-<reviewer>-review.md` on the artifact branch and the owner reads both together.                                                   | `docs/governance/OPERATING_AGREEMENT.md:85-87`   | FAITHFUL                      | Matches the supplied F5/F8 pilot mechanics.                                                                                                                         |
| Opus authors and Codex reviews the F5/F8 specs.                                                                                                                                    | `docs/governance/OPERATING_AGREEMENT.md:87-88`   | FAITHFUL                      | Matches the owner-supplied assignment.                                                                                                                              |
| Every governed artifact identified as "spec, review, governance change" opens with `Author:`, `Reviewer:`, and `Owner gate:`; the header is the enforcement mechanism.             | `docs/governance/OPERATING_AGREEMENT.md:90-95`   | LOOSENS                       | The owner ratified the header for governed artifacts, which also include R7 remediation plans and ranking/re-scoping triage; the parenthetical omits them.          |
| Author ≠ reviewer is not machine-enforced.                                                                                                                                         | `docs/governance/OPERATING_AGREEMENT.md:94-95`   | FAITHFUL                      | Preserves the declined machine-enforcement proposal and rollback trigger 3.                                                                                         |
| Unqualified "Specs" use `FEATURE_SPEC.md`.                                                                                                                                         | `docs/governance/OPERATING_AGREEMENT.md:97-100`  | TIGHTENS                      | R1 governs R7-class specs/remediation plans only; this wording silently makes the template mandatory for every spec.                                                |
| Adversarial review uses the named template before every UAT round and every release gate.                                                                                          | `docs/governance/OPERATING_AGREEMENT.md:100-102` | FAITHFUL                      | Transcribes R4 and the owner's cadence ruling.                                                                                                                      |
| Adversarial reviews use the month/model-only filename.                                                                                                                             | `docs/governance/OPERATING_AGREEMENT.md:102`     | NEW RULE — no cited authority | R4 specifies the template and cadence, not this collision-prone filename.                                                                                           |
| Three consecutive zero-finding **independent reviews** trigger a vendor switch or narrowing to governance only.                                                                    | `docs/governance/OPERATING_AGREEMENT.md:106-108` | TIGHTENS                      | PR #130 §7 limits this trigger to independent **spec** reviews.                                                                                                     |
| More than one working session per spec without acted-on findings drops the pilot to owner-only sign-off and records the outcome.                                                   | `docs/governance/OPERATING_AGREEMENT.md:109-111` | FAITHFUL                      | Transcribes rollback trigger 2.                                                                                                                                     |
| Any proposal to machine-enforce author ≠ reviewer stops the invariant.                                                                                                             | `docs/governance/OPERATING_AGREEMENT.md:112-114` | FAITHFUL                      | Transcribes rollback trigger 3.                                                                                                                                     |
| Content growth in the rulings index is cut back to one line per ruling.                                                                                                            | `docs/governance/OPERATING_AGREEMENT.md:115-116` | FAITHFUL                      | Transcribes rollback trigger 4.                                                                                                                                     |
| The rulings index is living and append-only.                                                                                                                                       | `docs/governance/OPERATING_AGREEMENT.md:118-122` | NEW RULE — no cited authority | R3 says pointer-style and one line per ruling; it does not ratify an append-only lifecycle.                                                                         |
| Each index entry is one sentence with an authority pointer; the authority, not the index, is the record; no narrative lives here.                                                  | `docs/governance/OPERATING_AGREEMENT.md:120-122` | FAITHFUL                      | Transcribes R3, although the table's execution fails R3 (M10).                                                                                                      |
| Product VISION is indexed as one drawer-backed pointer.                                                                                                                            | `docs/governance/OPERATING_AGREEMENT.md:126`     | FAITHFUL                      | Pointer form is compliant; drawer substance was unavailable.                                                                                                        |
| The autonomy agreement is indexed as plan sign-off, owner-only merge, and post-sign-off autonomy.                                                                                  | `docs/governance/OPERATING_AGREEMENT.md:127`     | FAITHFUL                      | Corroborated by `docs/governance/MULTI_MODEL_WORKFLOW_PLAN_2026-07.md:39-45`.                                                                                       |
| The no-automated-orchestration verdict is indexed with narrow manual uses only.                                                                                                    | `docs/governance/OPERATING_AGREEMENT.md:128`     | FAITHFUL                      | Matches `docs/governance/MULTI_MODEL_WORKFLOW_PLAN_2026-07.md:343-351`.                                                                                             |
| Seven Fable-vs-Codex arbitration rulings are collapsed into one row that names only R7.                                                                                            | `docs/governance/OPERATING_AGREEMENT.md:129`     | LOOSENS                       | R3 requires an ID and one line per ruling; six rulings become unlocatable.                                                                                          |
| A one-time stale-snapshot rebaseline authorization is presented in the standing-rulings index.                                                                                     | `docs/governance/OPERATING_AGREEMENT.md:130`     | LOOSENS                       | A completed, sequenced authorization is not safely distinguishable from a current standing permission.                                                              |
| The governance ratification is summarized as Tier 1 plus per-UAT-round cadence.                                                                                                    | `docs/governance/OPERATING_AGREEMENT.md:131`     | LOOSENS                       | The summary omits the separately ratified every-release-gate cadence.                                                                                               |
| Pre-index rulings are added only when next cited and are not back-filled.                                                                                                          | `docs/governance/OPERATING_AGREEMENT.md:133-134` | NEW RULE — no cited authority | The ratification did not specify this population policy.                                                                                                            |

### 2. Omissions

**Result: FAIL.** The codification omits or narrows the following ratified or
standing terms:

- The plan gate covers implementation, while the agreement says only "before
  writing code" (`docs/governance/OPERATING_AGREEMENT.md:27-29`).
- The live-HA law's bounded owner-run UAT exception is omitted
  (`docs/testing/UAT_STRATEGY.md:378-400`).
- The R5 header mechanism does not unambiguously cover triage and R7 remediation
  plans, and the adversarial template has no literal top-level `Reviewer:` field
  (`docs/governance/OPERATING_AGREEMENT.md:90-95`;
  `docs/templates/ADVERSARIAL_REVIEW.md:12-15`).
- R3's ruling ID field and one-row-per-ruling structure are absent; seven
  arbitration rulings are collapsed into one row
  (`docs/governance/OPERATING_AGREEMENT.md:124-131` versus
  `docs/governance/PROMPTMI_GOVERNANCE_REVIEW_2026-08.md:203-208`).
- The governance-ratification index summary omits the every-release-gate half of
  R4 (`docs/governance/OPERATING_AGREEMENT.md:131`).
- No packaging rule explains how the mandatory committed reviewer artifact
  coexists with the one-commit PR discipline
  (`docs/governance/OPERATING_AGREEMENT.md:43-45,72-75`).

R6 is correctly absent because Tier 2 was not ratified. The documents also do
not adopt the declined per-slice brief/spec/prompt chain, per-slice
implementation cross-review, automated orchestration, full in-repo decision
log, draft-PR-first workflow, or machine author/reviewer enforcement.

### 3. Consistency with in-repo law

**Result: FAIL.** The phase-precedence statement itself matches
`ai_rules.md:46-54` and
`docs/governance/PHASE_ORCHESTRATION_FRAMEWORK.md:43-48`, and nothing reopens
the automated multi-model loop rejected by
`docs/governance/MULTI_MODEL_WORKFLOW_PLAN_2026-07.md:15-19,343-351`.

The failures are:

- owner authorization is described as a path to an agent merge, contradicting
  the same paragraph's "Only the owner merges" rule;
- the one-commit rule conflicts with the invariant's required on-branch review
  commit;
- the private pending-directory alternative conflicts with the PR-body fallback
  in `ai_rules.md:313-325`;
- the absolute live-HA wording contradicts
  `docs/testing/UAT_STRATEGY.md:378-400` and
  `docs/governance/phases/phase-7-ecosystem-future-growth-amendment-04.md:43-76`;
- rationale such as "decoration" and why rebaseline is uniquely dangerous is
  carried in-repo rather than reduced to an operative rule plus authority
  pointer (`docs/governance/OPERATING_AGREEMENT.md:49-54`), contrary to its own
  pointer-style rule at `:11-15`.

### 4. Pointer accuracy

**Result: FAIL.** The principal committed paths and the F5/F8 review naming
convention resolve, including `ai_rules.md`, both governance authorities, the
UAT strategy, both templates, and `docs/reviews/`.

The following do not satisfy the requested tree/cross-reference check:

- `PHASE_WORKFLOW.md` at
  `docs/governance/OPERATING_AGREEMENT.md:19` does not exist at the repository
  root; the file is `docs/governance/PHASE_WORKFLOW.md`.
- `OPERATING_AGREEMENT.md` at `docs/templates/FEATURE_SPEC.md:15-16` does not
  exist at the repository root, and §3 is not the section that states the
  before-code R7 spec gate; that rule is in agreement §1.
- `.claude/settings.local.json` at
  `docs/governance/OPERATING_AGREEMENT.md:33-35` exists only as an ignored local
  file (`.gitignore:77`); `git ls-tree -r --name-only 9cc23ed .claude` confirms
  it is absent from the commit. A fresh clone cannot verify the claimed
  mechanical enforcement from this pointer.
- `~/.mempalace/pending/` at
  `docs/governance/OPERATING_AGREEMENT.md:63-65` is a private external location,
  not a tree path, and is not marked as such.
- The rulings-index table is physically one row per Markdown line, but it lacks
  R3's ID column and row 129 aggregates seven rulings. It is therefore not
  well-formed against its authority.

Drawer IDs were treated as opaque authority references, as instructed; their
contents could not be resolved independently.

### 5. Template fitness

**Result: FAIL.** `FEATURE_SPEC.md` includes every R2 element: status,
assignment, objective, background, Finding Coverage, in/out and MUST-NOT scope,
files, acceptance criteria, red-leg test plan, open questions, and revision
history (`docs/templates/FEATURE_SPEC.md:12-82`).
`ADVERSARIAL_REVIEW.md` includes every R4 element: tagged claim ledger, weakest
claims, per-claim cross-check verdicts, owner arbitration of disagreements, the
anti-sycophancy sentence, reviewer write restrictions, and the ratified cadence
(`docs/templates/ADVERSARIAL_REVIEW.md:3-79`).

They are not yet safe to use without guessing or silently accepting new rules:

- The feature template makes the owner-approved written-spec gate and
  owner-assigned reviewer look universal, instead of R7-class only
  (`docs/templates/FEATURE_SPEC.md:13-16`).
- "Each new test" must have a base-failing leg
  (`docs/templates/FEATURE_SPEC.md:65-68`), although the repository expressly
  recognizes honest no-valid-red-leg cases
  (`docs/governance/phases/phase-7-ecosystem-future-growth-amendment-02.md:116-130`).
- The immutable-spec instruction says changes are appended only to Revision
  History, but does not tell an author where the amended normative text lives
  (`docs/templates/FEATURE_SPEC.md:3-9,78-82`).
- The Finding Coverage instruction declares every section without a row to be
  scope creep, which is too absolute for supporting design/test sections
  (`docs/templates/FEATURE_SPEC.md:28-36`).
- The adversarial template cannot represent two same-model reviews in the same
  month without a filename collision
  (`docs/templates/ADVERSARIAL_REVIEW.md:3-5`).
- "Executable, not advisory" conflicts with the header's correct statement that
  the review decides nothing (`docs/templates/ADVERSARIAL_REVIEW.md:12-14,52-56`).

### 6. Mechanics

**Result: PASS for the scoped content commit.** After `git fetch origin`:

- `origin/main` was `acc984a` and
  `origin/feature/governance-codification` was `9cc23ed`;
- the branch was exactly one commit ahead and zero behind;
- commit `9cc23ed` added exactly the three scoped Markdown files (295 lines),
  with no `src/` or `tests/` changes;
- the worktree was clean before this review; and
- `npx prettier --check docs/governance/OPERATING_AGREEMENT.md docs/templates/FEATURE_SPEC.md docs/templates/ADVERSARIAL_REVIEW.md`
  returned: `All matched files use Prettier code style!`

The review commit required by the invariant necessarily makes the source branch
two commits ahead after this document is committed; that is the unresolved
packaging conflict in M3, not a failure of the original content commit's
starting-point mechanics.

## Major findings

### M1 — The "never merges" gate is weakened into an authorization gate

**Evidence:** `docs/governance/OPERATING_AGREEMENT.md:33-36` says both that
`gh pr merge` "requires the owner's explicit authorization" and that only the
owner merges.

**Problem:** The first statement implies an owner can authorize an agent to run
the merge command. The authoritative term is unconditional: the agent never
merges, while `permissions.ask` is a mechanical backstop. This is the exact
silent-loosening defect the independent review is meant to catch.

**Concrete fix:** State unconditionally that an agent never runs `gh pr merge`;
describe the `permissions.ask` entry as a non-removable backstop, not an
authorization path.

### M2 — Approval scope drifts in both directions

**Evidence:** `docs/governance/OPERATING_AGREEMENT.md:27-29` gates only "writing
code"; `:97-100` requires unqualified "Specs" to use the template; and
`docs/templates/FEATURE_SPEC.md:13-16` assigns every template use a different
owner-assigned reviewer and approval-before-code gate.

**Problem:** "Before writing code" is narrower than the ratified
before-implementation plan gate, while unqualified "Specs" is broader than R1's
R7-class written specs/remediation plans. Together they loosen the general gate
and silently create a stricter separate spec-approval rule for non-R7 specs.

**Concrete fix:** Restore "before implementation" for the general plan gate.
Limit mandatory template use, independent review, and separate owner spec
approval to R7-class specs/remediation plans; describe non-R7 template use as
optional unless separately owner-ruled.

### M3 — One-commit PRs and mandatory committed review artifacts are incompatible

**Evidence:** `docs/governance/OPERATING_AGREEMENT.md:43-45` mandates one-commit
PRs, while `:72-75,85-87` mandates a committed review on the already-created
artifact branch. `docs/templates/ADVERSARIAL_REVIEW.md:6-8` additionally forbids
amending the first review's commit. This PR's instructed sequence starts with
content commit `9cc23ed` and adds this independent review as a second commit.

**Problem:** A compliant independent review makes the branch non-compliant with
the unqualified one-commit rule. No squash/amend/exception sequence is stated,
and an after-the-fact squash could erase the reviewer-authorship audit trail.

**Concrete fix:** Add an owner-ratified packaging exception or precise close-out
sequence for governed artifacts—for example, define "one content commit plus
mandated review/fix commits" and state how merge-time squashing preserves the
Author/Reviewer evidence.

### M4 — Red-before-green is made absolute despite established honest exceptions

**Evidence:** `docs/governance/OPERATING_AGREEMENT.md:49-50` says every new test
must fail on base to count, and `docs/templates/FEATURE_SPEC.md:65-68` asks how
each new test will do so. Existing governance explicitly recognizes a new-module
case where manufacturing a behavioral red leg would be false
(`docs/governance/phases/phase-7-ecosystem-future-growth-amendment-02.md:116-130`),
with another recorded at `docs/governance/phases/phase-7-tracking.md:259-267`.

**Problem:** R2 requires specs to state red-before-green legs; it does not make
all coverage invalid where no meaningful base-failing behavioral leg exists.
The absolute wording converts an evidence discipline into a stricter new
validity rule and contradicts accepted repository practice.

**Concrete fix:** Require a genuine base-failing behavioral leg where one
exists; otherwise require an explicitly justified no-valid-red-leg case and the
alternative evidence that makes the coverage meaningful.

### M5 — The agreement creates uncited standing law

**Evidence:** Mandatory additions include the autonomous post-merge sequence
(`docs/governance/OPERATING_AGREEMENT.md:46-48`), standalone-PR requirement for
every rebaseline (`:52-54`), exact 4/4 gate-report format (`:55-57`), append-only
index lifecycle (`:118-122`), and no-backfill policy (`:133-134`). The feature
template also requires owner assignment of every reviewer
(`docs/templates/FEATURE_SPEC.md:13-14`).

**Problem:** None of those exact normative rules appears in the supplied
ratification or PR #130's adopted R1-R5 text. The agreement's blanket authority
header cannot turn additional author-written process into owner-ratified law.
The standalone rebaseline PR is particularly material because it creates a
stricter packaging/approval rule than "never blind-rebaseline."

**Concrete fix:** Remove the additions from this codification, or have the owner
ratify each separately and cite its precise authority next to the rule. Keep
non-normative implementation guidance in the governing script/document rather
than elevating it here.

### M6 — The live-HA rule omits its bounded UAT exception

**Evidence:** `docs/governance/OPERATING_AGREEMENT.md:60-61` says
`ha.home.local` is read-only without qualification.
`docs/testing/UAT_STRATEGY.md:378-400` permits owner-run deploy-flow cards to
create/update/deploy/delete a temporary dashboard inside a tightly bounded UAT
envelope. The later amendment preserves that exact exception
(`docs/governance/phases/phase-7-ecosystem-future-growth-amendment-04.md:43-76`).

**Problem:** The absolute transcription tightens and contradicts standing law.
An operator following the UAT strategy and the agreement cannot satisfy both.

**Concrete fix:** Either remove this unratified rule from the agreement or state
the ordinary-development read-only rule with an explicit pointer to the bounded
UAT exception; do not duplicate its full narrative.

### M7 — The memory fallback loosens `ai_rules.md` §11

**Evidence:** `docs/governance/OPERATING_AGREEMENT.md:63-65` allows drawer
candidates in a PR body **or** `~/.mempalace/pending/`, while
`ai_rules.md:313-325` says agents without MemPalace access surface them in the PR
body.

**Problem:** The alternative queue lets a durable governance note bypass the
auditable PR location required by the cited rule. It is also a private external
path unavailable to a fresh clone.

**Concrete fix:** Transcribe the PR-body fallback exactly. If a pending queue is
desired, ratify and codify it first in `ai_rules.md`/the MemPalace protocol, then
point to that authority and mark it as machine-local.

### M8 — Rollback trigger 1 is broadened beyond the ratified spec pilot

**Evidence:** `docs/governance/OPERATING_AGREEMENT.md:106-108` counts three
zero-finding "independent reviews." PR #130 §7 counts three consecutive
zero-finding independent **spec** reviews
(`docs/governance/PROMPTMI_GOVERNANCE_REVIEW_2026-08.md:293-300`).

**Problem:** Governance or triage reviews could now trigger a vendor switch or
narrowing even if the F5/F8 spec-review pilot is working. That changes the
pre-named rollback metric.

**Concrete fix:** Restore "independent spec reviews" and keep the trigger tied
to the pilot unless the owner separately broadens it.

### M9 — R5's header enforcement is incomplete in the document and template

**Evidence:** The agreement describes governed artifacts only as "spec, review,
governance change" (`docs/governance/OPERATING_AGREEMENT.md:90-95`), omitting
covered triage and R7 remediation plans. Its own Author and Reviewer share a
single line (`:5-6`). The adversarial-review template has `Author (reviewer):`
but no literal top-level `Reviewer:` line
(`docs/templates/ADVERSARIAL_REVIEW.md:12-15`); the cross-checker appears only at
`:66-69`.

**Problem:** R5 was ratified as three auditable lines on governed artifacts.
The codification omits covered artifact types and the review template fails to
provide the exact field that is supposed to make independence visible at a
glance.

**Concrete fix:** Enumerate all governed types consistently and put literal,
separate `Author:`, `Reviewer:`, and `Owner gate:` fields at the top of every
governed template and of the agreement itself. Define the adversarial review's
Reviewer as its independent cross-checker.

### M10 — The rulings index does not implement R3's traceability contract

**Evidence:** The table has only Date/Ruling/Authority columns
(`docs/governance/OPERATING_AGREEMENT.md:124-131`), while R3 requires ID, date,
one-sentence statement, and authority
(`docs/governance/PROMPTMI_GOVERNANCE_REVIEW_2026-08.md:203-208`). Row 129
collapses seven numbered arbitration rulings into one and exposes only R7. Row
130 places a one-time rebaseline authorization in an index described as
standing. Row 131 omits R4's every-release-gate cadence.

**Problem:** A reader cannot locate six arbitration rulings by ID, cannot tell a
completed one-time authorization from standing law, and receives an incomplete
summary of the 2026-08-06 cadence ruling. This is a traceability and safety
failure, not a formatting nit.

**Concrete fix:** Add a ruling-ID/status field; use one row per actual ruling;
mark superseded/completed one-time decisions so they cannot be read as current
permission; and make the 2026-08-06 summary mention both UAT-round and release
gates. Keep each row to one sentence plus its authority pointer.

### M11 — Three operative references do not resolve correctly from the tree

**Evidence:** `docs/governance/OPERATING_AGREEMENT.md:19` names root-level
`PHASE_WORKFLOW.md`, but the file is under `docs/governance/`.
`docs/templates/FEATURE_SPEC.md:15-16` names root-level
`OPERATING_AGREEMENT.md` and points to §3 for a gate stated in §1.
`docs/governance/OPERATING_AGREEMENT.md:33-35` points to ignored
`.claude/settings.local.json`; it is absent from commit `9cc23ed`.

**Problem:** The first two references are wrong paths/cross-references. The
third asks fresh-clone agents to trust mechanical enforcement they cannot inspect
in the committed tree, contrary to the codification's resilience purpose.

**Concrete fix:** Use full repository-relative paths and the correct agreement
section. Mark `settings.local.json` explicitly as machine-local/gitignored and
point to a committed source that defines how its merge backstop is verified, or
commit a non-secret enforcement/configuration policy that fresh clones can
inspect.

### M12 — The adversarial filename cannot satisfy the ratified cadence

**Evidence:** The agreement and template require
`docs/reviews/HAVDM_ADVERSARIAL_REVIEW_<YYYY-MM>_<MODEL>.md`
(`docs/governance/OPERATING_AGREEMENT.md:100-102`;
`docs/templates/ADVERSARIAL_REVIEW.md:3-5`) while requiring a review before
every UAT round and every release gate.

**Problem:** Two reviews by the same model in the same month map to the same
path. The second review must overwrite/amend the first or violate the naming
rule, defeating the separate committed-artifact requirement.

**Concrete fix:** Include a unique gate/round identifier (or full date plus a
sequence) in both the agreement and template naming convention.

### M13 — The agreement is not consistently pointer-style

**Evidence:** The agreement says narrative and rationale never live in-repo
(`docs/governance/OPERATING_AGREEMENT.md:11-15`) but then includes the
"decoration" characterization and a rationale about rebaseline permanently
erasing defects (`:49-54`), plus a detailed uncited post-merge recipe (`:46-48`).

**Problem:** These are rationale and operational narrative rather than the
minimal operative rule plus an authority pointer. They duplicate the kind of
content R3 leaves in MemPalace and make future drift more likely.

**Concrete fix:** Retain only the operative clauses and precise authority
pointers. Move rationale and procedural detail to the authoritative drawer or
existing operational document.

## Minor findings

### m1 — Approved-spec amendment mechanics are ambiguous

**Evidence:** `docs/templates/FEATURE_SPEC.md:3-9` says approved specs are never
edited in place and changes are appended to §11, but §11 is only a four-column
revision-log table (`:78-82`).

**Problem:** An author cannot tell where the amended normative text belongs.

**Concrete fix:** Add a clearly structured append-only amendment section or
state the exact separate-amendment-file convention and have Revision History
point to it.

### m2 — Finding Coverage overstates what an unmapped section proves

**Evidence:** `docs/templates/FEATURE_SPEC.md:30-32` declares any section that
does not address a coverage-table row to be scope creep.

**Problem:** Supporting design, constraints, risk, and test-plan text can be
necessary without mapping one-to-one to a finding. The instruction invites
artificial mappings instead of useful traceability.

**Concrete fix:** Say that every scoped deliverable must map to a row and that
unmapped substantive behavior requires scope justification; do not presume all
supporting sections are scope creep.

### m3 — The feature template adds useful but unratified mandatory detail

**Evidence:** Background must be cold-readable with expanded drawer/path
references (`docs/templates/FEATURE_SPEC.md:23-26`); the added Design/Contract
section requires existing-code claims at `path:line` (`:53-56`); and expected
baseline movement must be named (`:69-70`).

**Problem:** These are useful directions, but R2 did not specify them and their
imperative wording makes them new template gates.

**Concrete fix:** Label them as guidance/examples, or obtain owner ratification
if they are intended to be mandatory completeness conditions.

### m4 — "Executable, not advisory" is internally misleading

**Evidence:** The adversarial template correctly says the review decides
nothing (`docs/templates/ADVERSARIAL_REVIEW.md:12-14`) but later calls directions
"Executable, not advisory" (`:52-56`).

**Problem:** A reviewer should make concrete recommendations, but only the owner
can authorize them. The wording can be read as bypassing owner arbitration.

**Concrete fix:** Use "actionable and specific, but advisory pending owner
arbitration."

## Verdict

**CHANGES-REQUIRED.** Blocking items: M1-M13. The central invariant and both
templates are directionally sound and contain their required core elements, but
the current text changes approval/rollback scope, contradicts standing law,
adds uncited rules, and leaves reference and packaging failures that must be
owner/author-resolved before merge.

**Confidence: High.** The starting-point tripwire, complete scoped diff,
ratification source sections, cited standing-law files, reference targets, and
Prettier result were checked directly. Confidence is not absolute only because
the MemPalace drawer contents were intentionally unavailable; no finding relies
solely on guessing their contents.

## Drawer candidates

- **`[INVESTIGATION] PR #131 independent artifact review`** — record that Codex
  found the rule-meaning, pointer, index, and template blockers M1-M13 at commit
  `9cc23ed`; the committed review is
  `docs/reviews/governance-codification-codex-review.md`.
- **`[DECISION] Governed-artifact commit packaging` (owner ruling required)** —
  reconcile the standing one-commit PR rule with the new mandatory committed
  reviewer artifact without erasing reviewer authorship/auditability.
- **`[DECISION] Scope of additional operating-law clauses` (owner ruling
  required)** — explicitly adopt or decline the post-merge recipe, standalone
  rebaseline PR, exact gate-report format, index lifecycle/backfill policy,
  private pending queue, and universal owner-assigned reviewer rule before any
  of them becomes normative in-repo.
