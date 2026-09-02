# Remediation plan — C3 must parse the grammars it names (PR #154, Codex round 3)

**Author:** BaggyG-AU with Claude Opus 5 (1M context), revision 1 of 2026-09-03

**Reviewer:** OpenAI Codex (GPT-5.6 Sol) — **this plan is reviewed BEFORE any
code is written**, per `CLAUDE.md` "SPEC BEFORE CODE". Prior rounds on this
branch: `docs/reviews/plan-consistency-checker-codex-review.md` (SEV-1-BLOCKED,
F1–F6), `…-codex-followup-review.md` (SEV-1-BLOCKED, R1–R3),
`…-codex-followup2-review.md` (SEV-1-BLOCKED, S1–S4).

**Owner gate:** on 2026-09-03, shown that C3's blocking half has produced a
SEV-1 in three consecutive rounds and that all ten of round 3's constructions
reproduce, the owner chose **Option A — parse both grammars the contract names**
over narrowing to a repository-private syntax (B) or demoting C3 to advisory
(C).

## Revision history

| Rev | What changed                                                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | First plan. Written after independently reproducing all ten round-3 constructions and proving the proposed mechanism 30/30 ok, 0 FAIL on a pre-code harness. |

---

# PART 1 — FOR THE OWNER

## 1.1 What went wrong, in one sentence

C3's blocking contract is written in words borrowed from two other languages —
"**fenced code block**" is a CommonMark term and "**key**" is a YAML term — and
all three repairs implemented both with hand-rolled line matching, which cannot
decide either.

That is one defect, not ten. Every one of round 3's findings S1 and S2 is a
consequence of it:

- it **over-accepts** — a line that is not a Markdown fence read as one, and
  key-shaped text inside a YAML string read as a key;
- it **goes blind** — anything a Markdown container puts in front of a line
  (`> `, `- `, a tab) makes the line unrecognisable to a raw-string matcher,
  even though the reader sees a perfectly ordinary code block or heading.

## 1.2 What I verified before writing this

I did not take the review on trust. I reproduced **all ten** constructions
against the current checker with a temporary probe, and adjudicated each one
against the reference parsers — `marked` 14.0.0 for Markdown, `yaml` 2.9.0 for
YAML. All ten behave exactly as the review states: **8 documents that are
invalid are accepted, and 2 documents that are perfectly legitimate are
blocked.** The probe was deleted; the tree is clean; the focused suite is
57/57.

I also measured the review's fourth finding, which is about evidence rather than
code. The disposition document publishes "12 failed / 45 passed" for the
repaired spec run against the older commit `69f458c`. **The real, unmodified
number is 14 failed / 43 passed.** See §2.6.

## 1.3 What this fixes, and what it costs

**Fixes.** All ten constructions, plus three the reviews never found (a Setext
heading shadow home, an ATX heading with a closing `#`, and a canonical block
nested in a list item). One mechanism, not ten patches.

**Costs, stated plainly.**

1. **One new devDependency: `marked`.** It is already in the tree at 14.0.0 —
   but only because `monaco-editor` (a _production_ dependency) happens to pull
   it in. Relying on that is exactly the kind of accident this project does not
   ship, so it becomes an explicit devDependency pinned to the same major.
2. **Five owner-visible behaviour changes**, listed in §1.4. Two of them are
   the fixes you asked for; three are consequences you should agree to
   knowingly rather than discover later.
3. **The 16 R1 controls have to be regenerated**, because they were derived
   from the line scanner's own dialect. Regenerating them is the point — see
   §1.5.

## 1.4 The five behaviour changes you are approving

| #   | Change                                                                                                                                                                                                                           | Why                                                                                                                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | A legitimate reference to the marker inside an **HTML comment** stops blocking.                                                                                                                                                  | The S3 fix. A comment renders as nothing and can declare no home.                                                                                                                                                                   |
| 2   | A **key-shaped line inside a YAML string** stops being counted as a key.                                                                                                                                                         | The S1 false-blocker fix. YAML says it is string content.                                                                                                                                                                           |
| 3   | A canonical block **inside a block quote or list item now counts** toward "exactly one".                                                                                                                                         | The S2c fix. It is a real, rendered code block.                                                                                                                                                                                     |
| 4   | The shadow-home rule changes from "a raw line equal to the marker" to "**a level-1 heading whose text is `plan-running-totals`**". This newly catches `# plan-running-totals #` and the Setext form, and newly exempts comments. | It is what a reader actually sees as a heading.                                                                                                                                                                                     |
| 5   | **An unterminated fence stays an error** — deliberately stricter than CommonMark, which closes an unclosed fence at end of document.                                                                                             | An unterminated fence silently swallows the rest of the plan into code. Keeping the rule also preserves an existing committed control. ⚠ **This one is a deliberate departure from the named dialect and needs your explicit yes.** |

⚠ The owner's earlier ruling stands untouched: **a plan that documents an
_example_ totals block still blocks**, because two blocks are genuinely
ambiguous. Under this change that now holds inside containers too.

## 1.5 What I am doing differently this time

Three rounds have failed the same way, and round 3 failed it in a form worth
naming precisely, because it looked like compliance.

The standing rule from this branch is _generate the hostile population from the
grammar itself, never from the review's finding list_. Round 3 obeyed the
letter: 23 constructions over fence forms, marker position, key shape,
cardinality and termination — and that genuinely found a fail-open no review had
(the unfenced shadow home). But **every fence form it tried was one its own
regex already recognised.** It generated from its own dialect. It never asked
CommonMark whether a candidate was a fence, or YAML whether a line was a key.

So the rule this plan adds:

> **When a contract borrows a term from a host grammar, generate the hostile
> population from THAT grammar's specification, and let ITS reference parser —
> not your matcher — decide the expected answer for each case.**

I have already done this, **before writing any production code**. The harness
in §2.10 has 30 cases: the 10 from the review, and 20 derived from CommonMark
§4.3/§4.5/§5.1/§5.2/§6.1 and YAML §7.1/§7.4/§8.1/§8.2/§9.1. Each case's
expected verdict was set by the specification, not by the prototype. **Result:
30 ok, 0 FAIL, and the live plan stays clean.** The one case that initially
failed was a real discovery, not a typo — it is change #5 in §1.4.

---

# PART 2 — TECHNICAL DETAIL

## 2.1 The contract, restated so it can be parsed

Unchanged in intent; stated in terms that map onto real parsers.

> A valid canonical home is **exactly one fenced code block anywhere in the
> plan document — at any Markdown container depth** — whose **first content
> line is exactly `# plan-running-totals`** and whose fence is **closed**. Its
> content must parse as a **single YAML document** whose root is a **mapping**,
> in which each governed key — `review_rounds_complete`, `reviewer_findings`,
> `findings_after_round_one` — appears **exactly once as a key of that root
> mapping**. In addition, **no level-1 Markdown heading anywhere in the plan may
> have the text `plan-running-totals`**; such a heading is a shadow home.
>
> Violations raise `C3-NOCANONICAL`. Nothing else in C3's blocking half changes.

## 2.2 The dialect, named

Codex's round-3 correction was that the contract said "fenced code block"
without saying whose. It is now named:

- **Markdown: GitHub Flavored Markdown as implemented by `marked` 14.x**
  (`gfm: true`, `pedantic: false` — the shipped defaults, asserted in a test).
  GFM is the right dialect because these documents are read on GitHub.
- **YAML: YAML 1.2 as implemented by `yaml` 2.x**, with `uniqueKeys: true`.
- **One declared departure:** the unterminated-fence rule of §1.4 #5.

## 2.3 In scope — every change to `tests/support/planConsistency.ts`

1. **Add two imports**: `import { marked } from 'marked';` and
   `import { parseDocument, isMap } from 'yaml';`.
2. **Delete** the line-based fence state machine and the `strayMarkers` scan
   (the `for (const line of specLines)` block and the `for (let i = 0; …)`
   block), and the `^\s*${key}\s*:` key counter.
3. **Add a token walk** over `marked.lexer(spec)` that recurses into
   `blockquote.tokens` and `list.items[].tokens`, and:
   - collects every `code` token whose first content line is exactly the
     marker, recording whether `token.raw` ends in a closing fence;
   - counts every `heading` token with `depth === 1` whose `text` trims to
     `plan-running-totals`;
   - **does not descend into `html` tokens** — that is the S3 fix — and does not
     descend into `code` tokens.
4. **Add YAML payload validation** for the single canonical block:
   `parseDocument(text, { uniqueKeys: true })`; raise on `doc.errors.length > 0`
   (covers malformed YAML, duplicate keys including the quoted spelling, and
   multi-document payloads), then on `!isMap(doc.contents)` (covers an empty
   payload and a sequence root), then count each governed key among
   `doc.contents.items` **key nodes** — never lines.
5. **Keep the site-grouping rule unchanged**: one site per _subject_, never per
   key, established only after the payload validates.
6. **Rewrite the block comment** so it states the contract of §2.1 and the
   dialect of §2.2, and records why the line scanner was removed. ⚠ The existing
   comment's claim "a fence is a state, not a pattern" is the error this repair
   corrects and must not survive.

## 2.4 The dependency change

`package.json` gains `"marked": "^14.0.0"` under **devDependencies**, matching
the version already resolved through `monaco-editor`, so `npm ls marked` stays
deduplicated to a single copy. `yaml` is already a direct dependency at
`^2.9.0`; no change.

⚠ **Reviewer, attack this:** is a transitively-satisfied pin actually
deduplicated here, and is a devDependency correct for a module under `tests/`
that CI's `ci` job executes?

## 2.5 Test changes — `tests/unit/planConsistency.spec.ts`

1. **Regenerate the `canonical block grammar (review R1)` describe block** from
   §2.10's population. Every case in that harness becomes a committed control
   unless an existing test already covers it identically.
2. **Repair the shared `CANON` fixture.** It currently declares only
   `review_rounds_complete`, so `${WIRED}${CANON}` **already emits
   `C3-NOCANONICAL`** for missing keys — meaning every older C3 control that
   asserts `toContain('C3-NOCANONICAL')` on it passes for a reason unrelated to
   what it names, and would keep passing if the behaviour under test were
   deleted. `CANON` gains all three governed keys, and **each affected test is
   then re-checked individually**, not assumed.
   ⓘ This was found while verifying, not by the review.
3. **Add a dialect assertion** pinning `marked.defaults.gfm === true` and
   `pedantic === false`, so a future dependency bump that changes the dialect
   fails loudly rather than silently changing what the gate means.
4. **Add `KNOWN-OPEN:` controls** for §2.7's residuals, per this project's rule
   that a known limit is pinned by a test asserting current behaviour.
5. The advisory half (`C3-COUNTDRIFT`, `reportAdvisories`) is **untouched**;
   round 3 confirmed R2 RESOLVED and its consumer-exercising control stays as
   it is.

## 2.6 The evidence correction (finding S4) — independent of the code

`docs/reviews/plan-consistency-checker-repair-dispositions.md` says:

> The repaired spec was run against the round-1 repair at `69f458c`: **12 failed
> / 45 passed (57)**.

**Measured, in a disposable detached worktree at `69f458c` with the `6420bb4`
spec copied in and nothing else changed: 14 failed / 43 passed.** The two extra
failures are `TypeError: reportAdvisories is not a function` in
`reports no BLOCKING finding against the live plan` and
`R2: the gate PATH surfaces an advisory on a PASSING run`. 45 = 43 + those two
silently counted as passes; 12/45 is reproducible only after backporting the
complete `advisoryFindings` + `reportAdvisories` implementation, which supplies
the very function R2 is about.

The same section also says the R2 control "cannot be run against `69f458c` at
all… the spec would not compile." **That is also wrong, and in the direction
that understates the evidence:** under Vitest/Vite SSR it compiles, runs, and
fails at runtime, which is a stronger discriminator than the structural claim
that replaced it.

**Correction to make:** replace the total with 14/43, keep the correct
"12 of 16 R1 controls discriminate" statement and the four honestly-named
non-discriminators, and replace the "would not compile" sentence with the
measured runtime failure. **The general rule this yields: a fail-against-old
total must name every compatibility substitution, and a structural failure by
missing export is reported separately, never converted into a pass.**

## 2.7 Out of scope — declared, with the residual named

- **The plan/history asymmetry stays.** C3's structural scan reads the plan
  only; the history names the marker three times in prose. Round 3 accepted
  this boundary explicitly. Extending it would need the same treatment and is
  not in this change.
- **The advisory half stays a heuristic**, with all its existing `KNOWN-OPEN:`
  limits (quoted second homes, unparseable number forms).
- **`#plan-running-totals` with no space is not detected** — correctly, since
  CommonMark makes it a paragraph, not a heading. Pinned by a control.
- **A shadow home written as ordinary prose or a table row is not detected.**
  Unchanged from today; the structural half only claims headings and fences.
- **C1's textual-caller limit and C2/C4** are untouched.

## 2.8 Must NOT change

- `docs/testing/SPACING_HELPER_PRESET_PLAN.md` and its `_HISTORY.md` companion —
  **not one character**. The gate's own subject may not be edited to make the
  gate pass.
- Any snapshot, or `tests/baseline/expected-failures.json`.
- Any file under `src/`, any Electron/e2e/integration spec, any governance text.

## 2.9 Blast radius (OA §3.4)

**Upstream.** `tests/support/planConsistency.ts` has exactly one consumer in
the repository — its own spec
(`grep -rln "planConsistency" --include=*.ts . | grep -v node_modules`). It
reads the plan, its history companion, and `tests/support/dsl/spacing.ts`.

**Downstream.** `npm run test:unit` → `./tools/checks` → CI's `ci` job (the only
required context on this branch). No `src/`, no Electron, no e2e/integration, no
snapshot, no baseline manifest.

**New surface.** One devDependency, used only by this test-support module.

**Non-regression to prove.** The live plan stays clean (measured on the
prototype: **VALID**); unit population goes 1470 → 1470 + _n_ with no new file;
`REAL_EXIT=0`, 4/4 steps.

## 2.10 The pre-code harness — 30 ok, 0 FAIL

Built and run **before this plan was written**, against a throwaway prototype of
the exact mechanism in §2.3. Expected verdicts were set by the specification
cited in the provenance column; `marked`/`yaml` adjudicated the Markdown/YAML
facts. Cases marked `codex` are the review's; cases marked `CommonMark`/`YAML`
are generated from the host grammars and appear in no review.

| Must be   | Case                                                   | Provenance                      |
| --------- | ------------------------------------------------------ | ------------------------------- |
| valid     | well-formed block (control)                            | control                         |
| invalid   | governed keys only inside a `notes: \|` scalar         | codex S1                        |
| **valid** | real keys **plus** a scalar mentioning a key           | codex S1                        |
| invalid   | quoted duplicate `"review_rounds_complete": 999`       | codex S1                        |
| invalid   | backtick inside the fence info string                  | codex S2                        |
| invalid   | TAB before the opening fence                           | codex S2                        |
| invalid   | second canonical block in a **block quote**            | codex S2                        |
| invalid   | unfenced marker in a **block quote**                   | codex S2                        |
| invalid   | unfenced marker in a **list item**                     | codex S2                        |
| invalid   | marker indented four spaces as first content line      | codex S2                        |
| **valid** | marker inside an **HTML comment**                      | codex S3                        |
| valid     | tilde fence                                            | CommonMark §4.5                 |
| valid     | four-backtick fence                                    | CommonMark §4.5                 |
| valid     | untagged fence (no info string)                        | CommonMark §4.5                 |
| valid     | fence indented three spaces (legal)                    | CommonMark §4.5                 |
| invalid   | fence never closed                                     | **declared departure, §1.4 #5** |
| invalid   | second canonical block inside a **list item**          | CommonMark §5.2                 |
| invalid   | unfenced marker in a **nested** block quote            | CommonMark §5.1                 |
| invalid   | **Setext** h1 shadow home                              | CommonMark §4.3                 |
| **valid** | marker in an inline code span (the live plan, line 14) | CommonMark §6.1                 |
| invalid   | empty payload                                          | grammar                         |
| valid     | YAML **flow mapping** payload                          | YAML §7.4                       |
| invalid   | YAML **sequence** payload (root is not a mapping)      | YAML §8.2                       |
| invalid   | malformed YAML (`BAD_INDENT`)                          | YAML                            |
| invalid   | governed keys nested one level deep                    | YAML §8.2                       |
| invalid   | governed key commented out                             | YAML §8.1                       |
| valid     | a key that merely **contains** a governed key          | YAML                            |
| invalid   | duplicate key with the **same** value                  | YAML                            |
| valid     | anchor/alias reuse of a governed value                 | YAML §7.1                       |
| invalid   | multi-document payload (`MULTIPLE_DOCS`)               | YAML §9.1                       |

**Result: 30 ok, 0 FAIL. Live plan: VALID (clean).**

⚠ Three of these are **false-blocker** controls — the document is legitimate and
C3 must stay silent. A population of only "does it catch my bad input?" cases is
what let the two round-3 regressions through.

## 2.11 Fail-against-`6420bb4`, planned honestly in advance

Every new control must **fail** against the current head `6420bb4` before it is
credited. The ten review constructions are expected to discriminate by
construction (8 accept→reject, 2 reject→accept). For the 20 generated cases I
will publish, per case, whether it discriminates — and **name every one that
does not**, rather than counting it. The run against `6420bb4` will be reported
**unmodified**, with any compatibility substitution named explicitly; this is
the §2.6 lesson applied to its own repair.

## 2.12 Questions the reviewer is asked to answer

1. Is the §2.1 contract decidable as stated, or does it still borrow a term it
   does not define?
2. Is `marked`'s GFM lexer an acceptable authority here, given the documents are
   read on GitHub — and does anything in the token walk of §2.3 mis-handle a
   container form not in §2.10?
3. Is the unterminated-fence departure (§1.4 #5) the right call, or should C3
   follow CommonMark and drop the rule?
4. Does the §2.10 population have a hole that a **fourth** round would find —
   specifically, a construction generated from CommonMark or YAML that is not
   represented and would flip a verdict?
5. Is §2.7's residual list complete, or does the parser move create a limit not
   named there?

---

⚠ **NO CODE HAS BEEN WRITTEN.** The prototype behind §2.10 was a throwaway in a
scratch directory, never in the repository; `git status --porcelain` is empty
apart from this document and its commission.
