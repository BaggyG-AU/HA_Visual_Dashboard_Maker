Author: Claude Sonnet 5
Reviewer: GPT-5.6 Sol
Owner gate: micah / BaggyG-AU

CHANGES-REQUIRED

# Independent implementation review — C3 parser repair (PR #154)

Reviewed branch `feature/plan-consistency-checker` at
`f1d51da180e99a6b60978033dea5f7777b2d3f17`. This review changes no product,
test, plan, snapshot, baseline, board, PR, or MemPalace state; this document is
the only repository change.

## Owner Summary Table

| Ref | Plain-English problem                                                                                      | Severity | Blocks: scope                        | Fix complexity (1–5) | Recommendation |
| --- | ---------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------ | -------------------: | -------------- |
| P12 | A document can opt into older number rules and make a non-count look like a valid total.                   | SEV-2    | The promised totals-document dialect |                    2 | Fix now        |
| P13 | An invalid totals block can still be treated as a real source when warnings are produced.                  | SEV-3    | None                                 |                    1 | Fix now        |
| P14 | The explanation promises swallowed content is caught, while a committed example proves that promise false. | SEV-3    | None                                 |                    1 | Fix now        |
| P15 | The cost summary says one package was added although the branch declares two.                              | SEV-3    | None                                 |                    1 | Fix now        |

## Owner Decision Brief

**What this protects.** C3 is a document-quality gate: it should reject a
malformed single source of truth for review totals without creating misleading
warnings. It is not Electron product code.

**What is going wrong.** The main parser replacement is sound over the committed
population, but the YAML library lets a document-level directive switch from the
promised 1.2 rules to 1.1. Under 1.1, `1:20` becomes the number 80 and passes as a
total. A separate ordering error lets part of an invalid totals block seed an
advisory. Two written claims also contradict the committed evidence/diff.

**Is the product affected? No, directly.** The changed module is test support and
the full product gate passes. **The governance check is affected: Yes, measured.**
It can accept an explicitly versioned YAML payload outside its stated dialect.
No such directive exists in the live governed plan today.

**Options and costs.** Fixing P12 and P13 needs a small parser guard, a small
ordering change, and focused controls. P14 and P15 are wording corrections. The
alternative is to merge while knowingly accepting a dialect escape and a noisy
failure path; that saves little work and makes the contract less reliable.

**Recommendation.** Fix all four now, then re-run the focused spec and
`./tools/checks`. If nothing is done, ordinary current documents remain clean,
but a plausible copied `%YAML 1.1` header can silently change how a hand-edited
total is interpreted, and future maintainers will be relying on two statements
the branch's own evidence disproves.

## Confidence and method

**Confidence: high on P12–P15 and on the committed population accounting; medium
on how likely a future author is to add an explicit YAML directive.** The defects
are deterministic and reproduced at the reviewed commit. The reachability
judgement for P12 is necessarily about a future hand edit, not current content.

### Material read

- The commission in full; `docs/governance/OPERATING_AGREEMENT.md` §§3.1, 3.5,
  and 3.6; the whole revision-3
  `docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md`; and both required plan
  reviews (`plan-consistency-c3-parser-plan-review.md` and `-rev2.md`).
- The complete reviewed `tests/support/planConsistency.ts` and
  `tests/unit/planConsistency.spec.ts`; the repair dispositions; the complete
  `f1d51da^..f1d51da` diff and commit message; and the deleted harness recovered
  with `git show 03f4fe7:tools/c3-parser-harness.cjs`.
- The installed `yaml` 2.9.0 option declaration at
  `node_modules/yaml/dist/options.d.ts:65-84`. It states that `version` applies
  to documents **without** a `%YAML` directive; an explicit directive overrides
  the default.

### Required reruns

1. `npx vitest run tests/unit/planConsistency.spec.ts` — **exit 0**: 1 file,
   **112/112 tests passed**, including the live-plan control.
2. Deeper repeat — **N/A, not invented**. This is a deterministic pure unit
   checker over static strings; the author published no flaky mechanism for
   which repetition would add evidence.
3. `./tools/checks` — **exit 0**: **4/4 steps**; lint **0 errors / 145 warnings**;
   formatting and type-check passed; Vitest **1525/1525 tests in 105 files**.

### Independent evidence runs

- Exact-lock fail-against-old at `6420bb4`: a detached temporary worktree, the
  reviewed 112-test spec copied in, then
  `npm ci --ignore-scripts --prefer-offline --no-audit --no-fund` — **exit 0** —
  followed by `npx vitest run tests/unit/planConsistency.spec.ts` — **exit 1 as
  expected: 35 failed / 77 passed; all 112 tests ran**. No `node_modules`
  symlink was used. `git worktree remove --force <temporary-worktree>` — exit 0.
  This independently upholds “35 controls discriminate; 0 structural failures.”
- Historical correction at `69f458c`: detached worktrees at `69f458c` and
  `6420bb4`, the exact 57-test `6420bb4` spec copied to the former, an exact-lock
  `npm ci` there, then the focused Vitest command — **exit 1 as expected: 14
  failed / 43 passed**. Two failures were the missing `reportAdvisories` runtime
  export. This upholds the disposition correction and refutes the old 12/45
  publication.
- `npm ls entities marked yaml --all` — **exit 0**: direct `entities@6.0.1`,
  direct `marked@14.0.0`, direct `yaml@2.9.0`; `entities` and `marked` are each
  deduped with their transitive users.
- A TypeScript-AST enumeration of the deleted harness's `CASES` and the current
  spec's `CASES` — **exit 0** — returned 69 and 64. The exact set difference was
  the two unclosed-fence cases, no-space heading control, image-heading residual,
  and raw-`h1` residual. All five are present as executable tests in the current
  `KNOWN-OPEN` section; the added Markdown-dialect assertion is separate. No
  harness label was silently dropped.

The label enumeration is reproducible with:

```sh
node - <<'NODE'
const ts = require('typescript');
const cp = require('node:child_process');
const fs = require('node:fs');
function labels(source, name) {
  const sf = ts.createSourceFile(name, source, ts.ScriptTarget.Latest, true);
  let out;
  function visit(n) {
    if (ts.isVariableDeclaration(n) && n.name.getText(sf) === 'CASES' &&
        n.initializer && ts.isArrayLiteralExpression(n.initializer)) {
      out = n.initializer.elements.map(e => e.elements[0].text);
    }
    ts.forEachChild(n, visit);
  }
  visit(sf);
  if (!out) throw new Error('CASES not found');
  return out;
}
const oldLabels = labels(
  cp.execFileSync('git', ['show', '03f4fe7:tools/c3-parser-harness.cjs'], { encoding: 'utf8' }),
  'old.cjs',
);
const newLabels = labels(fs.readFileSync('tests/unit/planConsistency.spec.ts', 'utf8'), 'new.ts');
console.log({ old: oldLabels.length, current: newLabels.length,
  missing: oldLabels.filter(x => !newLabels.includes(x)) });
NODE
```

- A single exit-coded Vite-SSR assertion probe exercised 13 named boundaries —
  **exit 0**. Results: double-decode clean; code-span literal clean; missing
  character-reference semicolon clean; alias-to-integer clean; alias-to-map,
  alias-to-sequence, forward alias, and alias-chain syntax all blocked; merge-only
  governed values blocked; merge plus direct governed keys clean; YAML 1.1
  directive clean; YAML 1.2 control blocked; invalid payload plus matching prose
  emitted both the structural blocker and the drift advisory. P12 and P13 give
  minimal reproductions.

### What I did not check

- **UNVERIFIED:** Electron e2e, Electron integration, live Home Assistant, and a
  packaged application. This slice is unit-only and touches no product source;
  no Electron process was started.
- **UNVERIFIED:** every possible Markdown, HTML, character-reference, and YAML
  construction outside the committed 69-case population and the targeted seam
  probes above. The clean conclusions below are bounded to those populations;
  they are not claims of grammar completeness.
- **UNVERIFIED:** behavior under dependency versions other than the lockfile's
  installed `marked@14.0.0`, `entities@6.0.1`, and `yaml@2.9.0`.
- No snapshots or baselines were re-recorded. No live PR/board state was changed.

## Claim ledger

| Claim                                                                                                                       | Tag           | Evidence                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The reviewed head is the commissioned `f1d51da`, and its implementation diff is confined to the four listed paths.          | **MEASURED**  | `git rev-parse HEAD`; `git diff-tree --no-commit-id --name-status -r f1d51da`.                                                                                                     |
| The focused suite and complete repository gate pass at that exact head.                                                     | **MEASURED**  | Required reruns above: 112/112 and 1525/1525, both exit 0.                                                                                                                         |
| The reviewed controls discriminate against `6420bb4` without borrowing current dependencies.                                | **MEASURED**  | Exact-lock detached-worktree run: 35 failed / 77 passed, all 112 executed.                                                                                                         |
| The corrected old evidence is 14 failed / 43 passed, not 12/45.                                                             | **MEASURED**  | Exact-lock detached `69f458c` run with the exact `6420bb4` 57-test spec.                                                                                                           |
| The 69-case harness population is completely accounted for by 64 grammar cases plus five current known-open tests.          | **MEASURED**  | AST label enumeration and semantic inspection of the five-item difference.                                                                                                         |
| The two direct added development packages are deduped at the resolved versions.                                             | **MEASURED**  | `npm ls entities marked yaml --all`; package and lockfile diff.                                                                                                                    |
| Character references are decoded once, and code spans remain literal, for the attacked boundary cases.                      | **MEASURED**  | Exit-0 Vite-SSR probe and committed character-reference controls.                                                                                                                  |
| Alias container, forward-reference, chain-syntax, and merge cases fail safely; a scalar integer alias remains valid.        | **MEASURED**  | Exit-0 Vite-SSR probe; no crash in any case.                                                                                                                                       |
| An explicit YAML 1.1 directive changes scalar resolution and makes `1:20` pass as 80 despite the promised 1.2 dialect.      | **MEASURED**  | P12 reproduction; `yaml` option declaration confirms directives override the default version.                                                                                      |
| Site creation occurs before aggregate payload validity is known.                                                            | **MEASURED**  | `tests/support/planConsistency.ts:451-478` plus P13 reproduction.                                                                                                                  |
| Requiring valid non-negative integer values before they can establish a site is the correct reading of P7, not scope drift. | **JUDGEMENT** | Plan §§1.4(6), 2.1, and 2.3(5) make value validity part of the canonical payload contract. P13 concerns aggregate ordering, not this value gate.                                   |
| A `%YAML 1.1` directive is plausible in a future hand-maintained document but is not a current input.                       | **JUDGEMENT** | The plan is hand edited and a directive can arrive with copied YAML; repository search/current live control contains none. This plausibility limit is why P12 is SEV-2, not SEV-1. |
| A deeper repeat would add no useful evidence for this deterministic mechanism.                                              | **JUDGEMENT** | Static inputs, pure checker, no timing/process/network surface in the load-bearing spec.                                                                                           |

### Weakest claims

- P12's behavior is measured, but its future reachability is a judgement. A
  cross-checker who establishes a repository rule forbidding YAML directives
  could lower urgency; no such rule was found in the reviewed contract.
- The character-reference conclusion is intentionally finite. I tested the
  commission's double-decoding boundary and the committed matrix, not the whole
  HTML5 named-reference inventory.
- “No harness label dropped” is mechanically strong for labels and manually
  checked for the five moves. It does not prove that every conceivable semantic
  mutation within the 64 retained fixture expressions would be caught by the
  label-only regeneration command.

## Findings

### P12 — SEV-2 — An explicit YAML 1.1 directive bypasses the promised YAML 1.2 dialect

**Evidence.** The plan names “YAML 1.2 as implemented by `yaml` 2.x” at
`docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md:268-281`, and the source repeats
that contract at `tests/support/planConsistency.ts:310-316`. The implementation
calls `parseDocument` at `:435-438` without rejecting a non-1.2 document
directive. The installed library's option declaration says its `version`
setting applies only when a `%YAML` directive is absent.

**Concrete failure (input → wrong output).** With an otherwise valid canonical
block:

```yaml
# plan-running-totals
%YAML 1.1
---
review_rounds_complete: 1:20
reviewer_findings: 30
findings_after_round_one: 24
```

`yaml` 2.9.0 selects version 1.1 and resolves `1:20` to numeric `80`.
`checkPlan` emits no C3 finding. Changing only the directive to `%YAML 1.2`
resolves the same scalar to the string `"1:20"`, and C3 correctly emits
`C3-NOCANONICAL`. The gate therefore accepts a spelling that is not a count
under its named dialect.

**Reachability and impact.** No explicit directive exists in the live plan, so
the current artifact and Electron product are unaffected. A directive is a
plausible future edit when a YAML fragment is copied from a tool or another
document, but the demonstrated input is not ordinary current authoring. That
caps this at SEV-2.

**Fix.** Enforce the document's effective version, not merely the parser's
fallback default: reject an explicit effective version other than 1.2 before
crediting the payload. Passing `version: '1.2'` alone is insufficient because
the library documents that an in-document directive overrides it. Add the
paired 1.1/1.2 sexagesimal control above and prove it fails against `f1d51da`.

**Class swept.** Default-version configuration, explicit 1.1 and 1.2 directives,
and scalar interpretation at the integer-value boundary. No claim is made for
every YAML directive/tag combination.

### P13 — SEV-3 — A partially valid but invalid payload seeds a drift advisory

**Evidence.** Plan §2.3 item 6 requires a site to be established only after the
payload validates. At `tests/support/planConsistency.ts:451-470`, valid keys add
their subject to `sites` inside the validation loop; only at `:473-478` does the
implementation emit the aggregate payload failure.

**Concrete failure (input → wrong output).** Give the canonical block valid
review-round and post-review values, `reviewer_findings: bananas`, and add prose
that says “The review produced 31 findings.” The checker correctly emits
`C3-NOCANONICAL`, but also emits `C3-COUNTDRIFT` whose sites claim that “the
canonical block declares finding.” The block is invalid and, under the plan's
rule, declares no canonical site at all.

**Impact.** The extra result is advisory and appears only on a run already
blocked by the structural error, so it cannot fail a passing gate or affect the
product. It can misdirect the person repairing the document.

**Fix.** Collect validated subjects temporarily, and populate `sites` only if
the entire payload has no grammar/value errors. Add a control proving malformed
payload plus prose produces the blocker but not the advisory, beside a valid
payload plus prose control that still produces the advisory.

**Scope judgement.** The new per-value gate is correct: a non-count cannot form
a valid canonical site under P7. The defect is that the code commits earlier
valid subjects before it knows whether the whole payload is valid. Thus “the
site-grouping rule is unchanged” is inaccurate as implemented, although the
intended value check is not scope drift.

### P14 — SEV-3 — The closure rationale contradicts the declared, executable residual

**Evidence.** The source says at `tests/support/planConsistency.ts:318-328` that
the swallow risk “is caught by the YAML parse” and that a swallowed document
fails to parse as one valid mapping. The plan makes the same general claim at
§1.4 and §2.3 item 4. Yet plan §2.7 and the executable control at
`tests/unit/planConsistency.spec.ts:765-772` correctly demonstrate an unclosed
fence swallowing later `##`/`###` headings that YAML interprets as comments;
the payload remains valid and C3 stays clean. The preceding test comment at
`:754-758` also says closure protected nothing beyond the parsers, which the
next test disproves.

**Concrete failure (input → wrong output).** Remove a canonical fence's closer,
then follow the valid governed keys with Markdown headings. `marked` swallows the
headings into the code block, YAML treats them as comments, and C3 emits no
structural finding. That output is the owner-accepted known-open behavior; the
wrong output here is the implementation/plan explanation promising that this
risk is caught.

**Impact and fix.** Runtime behavior is deliberately accepted and pinned, so no
mechanism change is requested. Narrow the comments and plan rationale: ordinary
swallowed prose and deletion of the live closer are caught by YAML, while
YAML-compatible swallowed content is the declared residual. This preserves the
owner's “no hand-written closure parser” decision without a false universal.

### P15 — SEV-3 — The blast-radius cost understates the dependency count

**Evidence.** Plan §1.3 and §2.4 correctly name two newly declared direct
development dependencies, `marked` and `entities`; `package.json:85,93` and
`npm ls` confirm both. Plan §2.9 instead says “New surface. One devDependency,
used only by this test-support module.”

**Concrete failure (input → wrong output).** An owner or reviewer using §2.9 as
the blast-radius summary is told to assess one new direct package even though
the branch asks them to accept and maintain two. The installed graph is healthy
and deduped; this is a cost/accounting error, not a package defect.

**Fix.** Change “One” to “Two” and name both, consistent with §§1.3 and 2.4.

## Disagreements and clean conclusions

- **Commission weakest claim 1 — upheld.** The independent exact-lock run found
  35 failures / 77 passes at `6420bb4`, with all 112 tests executing. The
  author's current-`node_modules` symlink did not change the published count.
- **Commission weakest claim 2 — partly rejected.** Value validity correctly
  gates whether a value may represent a canonical site, but aggregate site
  establishment is not unchanged; P13 shows it occurs before the whole payload
  validates.
- **Commission weakest claim 3 — upheld.** The full gate independently returned
  exit 0, 0 lint errors, and 145 warnings.
- **Commission weakest claim 4 — upheld on placement and completeness.** The five
  harness cases absent from the 64-case grammar array all have faithful current
  known-open tests, and the fresh ungoverned-key control is correctly placed.
  One provenance sentence is wrong but not behaviorally material: the commit
  message and test comment call the no-space case “fresh”; it already existed in
  the 69-case harness as a control and was moved/relabelled.
- **Entity boundary — clean in the attacked population.** `decodeHTML` performs
  one decoding pass; `&amp;#x2D;` does not become a shadow marker, malformed/no-
  semicolon references stay literal in the tested form, and code spans remain
  literal. The `escape`/`codespan` treatment matches the token meanings exercised.
- **Alias/merge boundary — clean in the attacked population.** Integer aliases
  pass; string, mapping, and sequence targets block; a forward reference and the
  attempted alias chain fail safely; merge-only inherited governed keys do not
  count as direct root keys; merge plus direct governed keys remains valid.
- **Reader-visible projection residuals — accurately declared.** Image alt text,
  inline raw HTML, and block raw HTML are hand-chosen boundaries, but the plan
  names them and the current tests faithfully pin image and raw-`h1` behavior.
  `plan-<b>running</b>-totals` is still caught because the surrounding Markdown
  text tokens carry the visible words; the tag tokens contribute nothing.
- **Raw HTML owner ruling — internally consistent.** §§2.1, 2.2a, 2.3, and 2.7
  consistently limit the blocking contract to Markdown headings and declare the
  visible raw-`h1` hole. I do not ask the owner to revisit option B.
- **`CANON` repair — correct.** Both shared fixtures now contain the three direct
  governed keys with integer values. The focused suite executes all dependent
  tests and passes. I found no dependent assertion still succeeding solely due
  to a missing-key blocker.
- **Deeper repeat — agreement with the commission.** It is N/A for this pure,
  deterministic unit mechanism; inventing repeated identical runs would not
  strengthen the evidence.
- **Plan revision 3 — not ceremony.** Its architecture is still the right one,
  and the implementation removes the prior partial parsers. This first
  independent revision-3 review nevertheless found P12 at the new YAML seam and
  the P14 internal contradiction, so the waived design review left real work for
  this round.

## MemPalace drawer candidates

No MemPalace write was made; under MP-LEASE these candidates are routed to the
write-enabled author with `added_by="codex"`.

1. **Wing:** `practice` · **Type:** verification rule · **Candidate:** “A parser
   option that names a dialect may be only a fallback: test in-document version
   selectors/directives and inspect the parsed document's effective dialect
   before claiming the dialect is enforced.” Add its one-line entry to the
   `practice` index in the same write.
2. **Wing:** `havdm` · **Type:** investigation · **Candidate:** “At PR #154
   commit `f1d51da`, an explicit `%YAML 1.1` directive makes `1:20` resolve to
   integer 80 and pass C3, while `%YAML 1.2` rejects it; review finding P12 asks
   the repair to reject effective versions other than 1.2.”
3. **Wing:** `havdm` · **Type:** investigation · **Candidate:** “At PR #154
   commit `f1d51da`, C3 seeds subject sites inside per-key validation before the
   aggregate payload is known valid; malformed findings plus prose therefore
   emits both the structural blocker and a misleading drift advisory (P13).”
