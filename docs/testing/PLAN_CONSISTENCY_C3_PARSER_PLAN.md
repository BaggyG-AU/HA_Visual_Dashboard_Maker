# Remediation plan — C3 must parse the grammars it names (PR #154, Codex round 3)

**Author:** BaggyG-AU with Claude Opus 5 (1M context), revision 3 of 2026-09-03

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

| Rev | What changed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | First plan. Written after independently reproducing all ten round-3 constructions and proving the proposed mechanism 30/30 ok, 0 FAIL on a pre-code harness. **CHANGES-REQUIRED (P1–P7): three SEV-1 boundary errors in how the plan consumes the parsers, plus two evidence defects.**                                                                                                                                                                                                                                                                                                                                                                          |
| 3   | **All four revision-2 findings reproduced and repaired.** The hand-written character-reference decoder is DELETED and `entities` called instead (P8) — the same partial-parser mistake as P1/P3, committed inside their own fix. An alias value is dereferenced with `Alias.resolve(doc)` and the two rows revision 2 silently dropped are restored (P9). The swallowed-document residual is pinned by an executable case (P10). The raw-HTML heading boundary is declared and pinned (P11, owner-ruled). Population 54 → **69 cases, 69 ok, 0 FAIL**. ⭐ `entities` and `marked` are now DECLARED devDependencies, because the committed harness requires them. |
| 2   | **All seven findings reproduced and repaired.** The unterminated-fence departure is DROPPED (P1); indented `code` tokens are excluded (P2); heading text becomes a specified reader-visible projection (P3); `stringKeys` rejects alias keys (P4); the harness is COMMITTED and its transcript published (P5); §2.11's contradiction is corrected (P6); governed values must be non-negative integers (P7). Population 30 → **54 cases, 54 ok, 0 FAIL**.                                                                                                                                                                                                         |

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

**Fixes.** All ten round-3 constructions, all seven plan-review findings, plus
three the reviews never found (a Setext heading shadow home, an ATX heading with
a closing `#`, and a canonical block nested in a list item). One mechanism, not
seventeen patches.

**Costs, stated plainly.**

1. **Two new devDependencies, both already in the tree and now DECLARED:
   `marked` (^14.0.0) and `entities` (^6.0.1).** Each was present only by
   accident — `marked` because `monaco-editor` (a _production_ dependency) pulls
   it in, `entities` because `jsdom` → `parse5` does. ⭐ **They are declared as
   of revision 3 rather than when the repair lands, because the committed
   harness requires them** — an evidence artifact depending on undeclared
   transitives is not self-supporting. Verified deduplicated: one
   `marked@14.0.0` and one `entities@6.0.1` after `npm install
--package-lock-only`.
2. **Six owner-visible behaviour changes**, listed in §1.4 — three of them
   introduced or revised by the plan review, and all six ruled on rather than
   discovered later. One change revision 1 asked you to approve has been
   **withdrawn** on measurement.
3. **The 16 R1 controls have to be regenerated**, because they were derived
   from the line scanner's own dialect. Regenerating them is the point — see
   §1.5.

## 1.4 The six behaviour changes you are approving

| #   | Change                                                                                                                                                                                                                                      | Why                                                                                                                                                                                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | A legitimate reference to the marker inside an **HTML comment** stops blocking.                                                                                                                                                             | A comment renders as nothing and can declare no home.                                                                                                                                                                                                                                             |
| 2   | A **key-shaped line inside a YAML string** stops being counted as a key.                                                                                                                                                                    | YAML says it is string content.                                                                                                                                                                                                                                                                   |
| 3   | A canonical block **inside a block quote or list item now counts** toward "exactly one".                                                                                                                                                    | It is a real, rendered code block.                                                                                                                                                                                                                                                                |
| 4   | The shadow-home rule becomes "**a level-1 heading whose READER-VISIBLE text is `plan-running-totals`**". This newly catches the bold, struck, code-spanned, linked, character-referenced and closing-`#` forms, and newly exempts comments. | ⭐ **Revised in rev 2 (P3).** All of those render identically to the prohibited heading; rev 1 compared source markup and missed every one.                                                                                                                                                       |
| 5   | An **indented** (four-space) code block is **never** the canonical home, even with the marker as its first line.                                                                                                                            | ⭐ **New in rev 2 (P2).** The contract says _fenced_; `marked` gives both forms the same token type. An indented totals example beside the real block is now correctly ignored rather than counted or mis-rejected.                                                                               |
| 6   | Each governed key's value must be a **finite non-negative integer**. `review_rounds_complete: bananas` now blocks.                                                                                                                          | ⭐ **New in rev 2 (P7), owner-ruled.** This is a running-**totals** block; checking the labels but not the numbers was a residual the reviewer showed had silently vanished from the list. Verified: the live values 7, 30 and 24 all pass, and the block's three ungoverned keys are unaffected. |

⚠⚠ **WITHDRAWN IN REVISION 2 — the unterminated-fence departure.** Revision 1
asked the owner to approve keeping "the fence must be closed" as a deliberate
departure from CommonMark. **The owner ruled to drop it, on measurement.**
Deleting the real plan's closing fence still blocks — the swallowed document
fails the _YAML_ parse (`MULTILINE_IMPLICIT_KEY, MULTIPLE_DOCS`) — so the rule
protected nothing that the parsers do not already protect, while requiring a
hand-written delimiter parser `marked` does not support. §2.10 shows the four
closer-relation constructions the reviewer raised (narrower, wrong-character,
over-indented, wider) all decided correctly **with no delimiter logic at all**.

⚠ The owner's earlier ruling stands untouched: **a plan that documents an
_example_ totals block still blocks**, because two blocks are genuinely
ambiguous. Under this change that holds inside containers too — but **not** for
an indented example, which change #5 now excludes by design.

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

I have done this, **before writing any production code**. The harness is
**committed at `tools/c3-parser-harness.cjs`** — revision 1's was discarded,
which is why its result could not be reviewed (finding P5). It now carries
**69 cases**: the ten round-3 constructions, twenty derived from CommonMark and
YAML in revision 1, twenty-four added in revision 2, and **fifteen added in
revision 3** — the character-reference boundary matrix, the raw-HTML heading,
the real swallowed-document residual, and the two rows revision 2 had dropped.
Each case names the specification clause that decides its verdict, and the
reference parsers decide the grammar facts. **Result: 69 ok, 0 FAIL, live plan
clean**, transcript in §2.10.

⚠⚠ **AND THE SAME MISTAKE HAS NOW BEEN MADE THREE TIMES, EACH TIME INSIDE THE
FIX FOR THE LAST ONE.** Revision 1 delegated to the two host grammars — the
right architecture — then re-introduced **one hand-written delimiter test** for
fence closure and compared against **one token field** (`heading.text`) without
asking what that field holds (P1, P3). Revision 2 deleted both and shipped **a
hand-written character-reference decoder** whose four boundaries were all wrong,
one of which **crashed the check outright** (P8).

⭐ **The lesson is not "try harder at the seam" — it is that the seam is where
this keeps happening, so the seam is where a real parser must go.** Stated as
the rule: **delegating to a parser is not finished until every property you
assert is one the parser actually decides — and when you find one it does not,
add a parser that does, never a table.**

---

# PART 2 — TECHNICAL DETAIL

## 2.1 The contract, restated so it can be parsed

Unchanged in intent; stated in terms that map onto real parsers.

> A valid canonical home is **exactly one FENCED code block anywhere in the
> plan document — at any Markdown container depth, and excluding indented code
> blocks** — whose **first content line is exactly `# plan-running-totals`**.
> Its content must parse as a **single YAML document** whose root is a
> **mapping with string keys**, in which each governed key —
> `review_rounds_complete`, `reviewer_findings`, `findings_after_round_one` —
> appears **exactly once as a key of that root mapping**, with a value that is
> a **finite non-negative integer**. In addition, **no level-1 Markdown heading
> anywhere in the plan may have the READER-VISIBLE TEXT `plan-running-totals`**,
> as projected by §2.2a; such a heading is a shadow home.
>
> Violations raise `C3-NOCANONICAL`. Nothing else in C3's blocking half changes.

⚠ **Three terms changed in revision 2, each because the reviewer showed the
earlier wording was not decidable:**

- **"fenced"** now excludes indented code blocks explicitly. `marked` gives both
  the same token type (P2).
- **"closed" is GONE.** CommonMark ends an unclosed fence at end of file, and
  `marked` exposes no closure flag, so the old rule required a hand-written
  delimiter parser at exactly the boundary this repair exists to remove (P1).
- **"text"** is now a named projection, not a token field (P3).

## 2.2 The dialect, named

Codex's round-3 correction was that the contract said "fenced code block"
without saying whose. It is now named:

- **Markdown: GitHub Flavored Markdown as implemented by `marked` 14.x**
  (`gfm: true`, `pedantic: false` — the shipped defaults, asserted in a test).
  GFM is the right dialect because these documents are read on GitHub.
- **YAML: YAML 1.2 as implemented by `yaml` 2.x**, with **`uniqueKeys: true`
  AND `stringKeys: true`**. ⚠ The second option is load-bearing, not tidiness:
  without it an **alias used as a key** — `&k review_rounds_complete: 7` then
  `*k : 8` — raises no error, counts as one key, and lets the second value
  silently win (`toJS()` returns `8`). Measured; finding P4.
- **No declared departures.** Revision 1 had one and it is withdrawn (§1.4).
  Every property C3 asserts is now one a reference parser decides.

## 2.2a Reader-visible heading text — the projection, stated as a contract

⚠⚠ **`heading.text` IS SOURCE MARKUP.** `# **plan-running-totals**` has a
`text` of `**plan-running-totals**`, so rev 1's equality test missed it while a
reader saw the prohibited heading (finding P3). Reader-visible text is
therefore **defined**, not inherited from a token field. Walking the heading's
parsed inline children, each role contributes:

| Inline role                   | Contributes                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `text`                        | its text, with character references decoded **by `entities`** (`&#x2D;` → `-`) |
| `escape`, `codespan`          | its literal text                                                               |
| `strong`, `em`, `del`, `link` | its children, recursively (its text if it has none)                            |
| `br`                          | a single space                                                                 |
| `image`                       | **nothing** — a reader sees a picture, not the `alt` attribute                 |
| inline `html`                 | **nothing** — raw markup is not text                                           |

Whitespace is then collapsed and trimmed, and the result compared to
`plan-running-totals`. The last two rows are **deliberate residuals**, pinned by
passing `KNOWN-OPEN:` cases rather than left to be discovered (§2.7).

⚠⚠⚠ **REVISION 2 DECODED CHARACTER REFERENCES WITH THREE REGEXES AND A
SIX-NAME TABLE, AND THAT WAS THE SAME MISTAKE AS P1 AND P3 COMMITTED INSIDE
THEIR OWN FIX** (review finding P8). All four boundaries measured wrong:
`&#X2D;` with an uppercase `X` was not decoded — **a false accept, the marker
hides**; `&Tab;`, a real HTML5 name, was not decoded — **another false accept**;
`&Nbsp;`, INVALID because the name inventory is case-**sensitive**, WAS decoded
because the table lowercased its lookup — **a false blocker**; and `&#x110000;`
reached `String.fromCodePoint` and **threw `RangeError`, crashing the entire
check** where CommonMark §2.5 asks for U+FFFD.

⭐ **The fix is not a better table.** `decodeHTML` from `entities` — the
standards-complete HTML5 decoder `parse5` uses — replaces it and returns `-`, a
tab, the literal `&Nbsp;` and U+FFFD for exactly those four inputs. The rule
this arc keeps re-learning, stated where it applies: **do not complete a partial
parser; delete it and call one.**

## 2.3 In scope — every change to `tests/support/planConsistency.ts`

1. **Add two imports**: `import { marked } from 'marked';` and
   `import { parseDocument, isMap } from 'yaml';`.
2. **Delete** the line-based fence state machine, the `strayMarkers` raw-line
   scan and the `^\s*${key}\s*:` key counter.
3. **Add `visibleText(tokens)`** implementing §2.2a exactly — the switch over
   inline roles, whitespace collapse, and **`decodeHTML` from `entities` for
   character references. ⚠ Do not hand-write an entity table (P8).**
4. **Add a token walk** over `marked.lexer(spec)` that recurses into
   `blockquote.tokens` and `list.items[].tokens`, and:
   - collects every `code` token **whose `codeBlockStyle` is not `'indented'`**
     and whose first content line is exactly the marker;
   - counts every `heading` token with `depth === 1` whose **`visibleText`**
     equals `plan-running-totals`;
   - **does not descend into `html` tokens** (the S3 fix) or `code` tokens.
     ⚠ Skipping block `html` is the owner's **declared Markdown-only boundary**,
     not a claim that raw blocks are invisible: the same bucket holds
     `<h1>plan-running-totals</h1>`, which renders a visible title (P11).
     ⚠ **No closure check of any kind.** An unclosed fence runs to end of file,
     as CommonMark says; the swallow risk is caught by the YAML parse (§1.4).
5. **Add YAML payload validation** for the single canonical block:
   `parseDocument(text, { uniqueKeys: true, stringKeys: true })`; raise on
   `doc.errors.length > 0` (malformed YAML, duplicate keys including the quoted
   spelling, multi-document payloads, **and alias or non-string keys**), then on
   `!isMap(doc.contents)` (empty payload, sequence root), then for each governed
   key check it appears exactly once among `doc.contents.items` **key nodes** —
   never lines — **and that its value is a finite non-negative integer**.
   ⚠ **Dereference an alias value with `Alias.resolve(doc)` before testing it**
   (P9): an `Alias` node has no scalar `.value`, so reading `pair.value.value`
   made every alias look like `null` and rejected `base: &n 7` /
   `review_rounds_complete: *n` — a form revision 1 promised would pass.
6. **Keep the site-grouping rule unchanged**: one site per _subject_, never per
   key, established only after the payload validates.
7. **Rewrite the block comment** so it states §2.1's contract, §2.2's dialect
   and §2.2a's projection, and records why the line scanner was removed. ⚠ The
   existing comment's claim "a fence is a state, not a pattern" is the error
   this repair corrects and must not survive. ⚠ Neither may any wording implying
   C3 checks fence closure.

⭐ **The reference implementation of items 3–5 is committed and runnable at
`tools/c3-parser-harness.cjs`.** The repair ports it; it is not pseudocode.

## 2.4 The dependency change

**DONE in revision 3, not deferred to the repair.** `package.json` gains
`"marked": "^14.0.0"` and `"entities": "^6.0.1"` under **devDependencies**,
matching the versions already resolved through `monaco-editor` and
`jsdom` → `parse5`. Measured after
`npm install --package-lock-only --ignore-scripts`: **one `marked@14.0.0` and
one `entities@6.0.1`, both deduped.** `yaml` is already a direct dependency at
`^2.9.0`; no change. ⭐ They are declared now because
`tools/c3-parser-harness.cjs` is committed and requires them; an evidence
artifact resting on undeclared transitives is exactly the fragility this section
exists to remove.

⚠ **Reviewer, attack this:** is a transitively-satisfied pin actually
deduplicated here, and is a devDependency correct for a module under `tests/`
that CI's `ci` job executes?

## 2.5 Test changes — `tests/unit/planConsistency.spec.ts`

1. **Regenerate the `canonical block grammar (review R1)` describe block** from
   §2.10's population. Every case in that harness becomes a committed control
   unless an existing test already covers it identically.
   ⚠ **`CANON` must gain integer values that satisfy §2.1** — with values now
   governed (P7), a fixture carrying a non-integer would fire for the wrong
   reason, which is exactly the defect item 2 exists to remove.
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
4. **Add `KNOWN-OPEN:` controls** for **every** §2.7 residual, per this
   project's rule that a known limit is pinned by a test asserting current
   behaviour — specifically the image heading, the inline-HTML-wrapped heading,
   the unclosed fence at end of file, `#plan-running-totals` with no space, and
   the ungoverned keys' freedom from value checks.
5. **Add the value-shape matrix** required by P7: string, negative, null,
   sequence and float values each block, and **zero passes** — a legitimate
   total may be 0, and a truthiness check would wrongly reject it.
6. **Add the `stringKeys` controls** required by P4: an alias used as a key
   blocks, and an alias used as a _value_ still passes.
7. The advisory half (`C3-COUNTDRIFT`, `reportAdvisories`) is **untouched**;
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

⚠ Revision 1's list was **REFUTED** by the review: it claimed to name the
parser move's residuals while silently dropping one the previous round had
explicitly recorded (governed value types, finding P7). That one is now
**fixed** rather than declared. The list below is rebuilt, and **every member
is pinned by a passing `KNOWN-OPEN:` test**, so closing any hole breaks a test
and forces the claim to be corrected in the same commit.

- **An IMAGE heading contributes no visible text** — `# ![plan-running-totals](i.png)`
  is not a shadow home. A reader sees a picture; `alt` is an accessibility
  attribute. Deliberate (§2.2a).
- ⭐ **A raw BLOCK HTML heading is NOT a shadow home** — `<h1>plan-running-totals</h1>`
  renders a fully visible level-1 title and C3 does not see it. **Owner-ruled
  2026-09-03 (P11): the contract stays Markdown-only**, as §2.1 literally says,
  rather than acquiring an HTML parsing boundary. Pinned by a passing
  `KNOWN-OPEN:` case. ⚠ The harness comment that once said raw blocks "declare
  nothing" was false and is corrected.
- **Inline raw HTML contributes no text.** `# plan-<b>running</b>-totals`
  projects to `plan-running-totals` and IS caught, because the surrounding text
  tokens carry the words; but a heading whose words live _inside_ an inline HTML
  tag is not. Deliberate (§2.2a).
- **An unclosed fence at end of file is a valid code block**, per CommonMark.
  The residual is a swallowed document that happens to parse as valid YAML _and_
  keep all three governed keys exactly once with integer values. ⚠ **Revision 2
  pinned this with a fixture that had nothing after the fence, so it could not
  swallow anything** (P10). It is now pinned by the real construction: the valid
  block followed by `## Later section` and `### Last section`, which YAML reads
  as comments — measured **clean**, which IS the residual. The hostile
  ordinary-prose case stays as the inverse control, and deleting the live plan's
  closer still blocks.
- **The plan/history asymmetry stays.** C3's structural scan reads the plan
  only; the history names the marker three times in prose.
- **The advisory half stays a heuristic**, with its existing `KNOWN-OPEN:`
  limits (quoted second homes, unparseable number forms).
- **`#plan-running-totals` with no space is not detected** — correctly, since
  CommonMark makes it a paragraph.
- **A shadow home written as ordinary prose or a table row is not detected.**
  The structural half claims headings and fences only.
- **Ungoverned keys in the canonical block are unconstrained** — `review_rounds_owed`,
  `repair_introduced_after_round_one` and `executable_spec_lines` are not
  value-checked. Only the three governed keys are.
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

## 2.10 The pre-code harness — 69 ok, 0 FAIL, COMMITTED

⚠⚠ **REVISION 1 PUBLISHED ITS RESULT FROM A PROTOTYPE IT HAD DELETED**
(finding P5), so the plan's strongest assurance could not be reproduced by the
reviewer or by any later audit. The mechanism, the literal fixtures, the
expectations and their provenance are now committed at
**`tools/c3-parser-harness.cjs`**, runnable with `node tools/c3-parser-harness.cjs`
(exit 0 on success). It is not a test and nothing imports it; when the repair
lands, these cases become committed controls and the file is deleted.

⚠ **Revision 2 then silently DROPPED two revision-1 rows** — the four-space
indented marker and the alias-valued total — so 30 → 54 was 26 additions and two
removals, not 24 additions (finding P9). Both are restored and labelled
`RESTORED (rev 1)`. **Revision 3 is 54 → 69: fifteen additions, zero removals.**

Each case's expected verdict is set by the cited specification clause, not by
the mechanism. Cases marked `codex` came from a review — they are the **floor,
not the population**.

<!-- prettier-ignore -->
| Must be | Case | Provenance | Mechanism said |
| ------- | ---- | ---------- | -------------- |
| valid | well-formed canonical block | control | clean |
| valid | tilde fence | CommonMark 4.5 | clean |
| valid | four-backtick fence | CommonMark 4.5 | clean |
| valid | untagged fence (no info string) | CommonMark 4.5 | clean |
| valid | fence indented three spaces (legal) | CommonMark 4.5 | clean |
| invalid | backtick in the info string | CommonMark 4.5 | 1 shadow-home heading(s); found 0 canonical blocks (expected 1) |
| invalid | TAB before the opening fence | codex S2 / CommonMark 4.5 | 1 shadow-home heading(s); found 0 canonical blocks (expected 1) |
| invalid | closer NARROWER than opener (4 open, 3 close) | codex P1 / CommonMark 4.5 | YAML: BAD_SCALAR_START,MISSING_CHAR |
| valid | closer WIDER than opener (3 open, 4 close) | codex P1 / CommonMark 4.5 | clean |
| invalid | closer of the WRONG CHARACTER (backtick open, tilde close) | codex P1 / CommonMark 4.5 | YAML: MISSING_CHAR |
| invalid | closer OVER-INDENTED four spaces | codex P1 / CommonMark 4.5 | YAML: MISSING_CHAR |
| valid | KNOWN-OPEN: unclosed fence at END OF FILE is a valid block | CommonMark 4.5 (departure DROPPED, owner ruling) | clean |
| valid | KNOWN-OPEN: an unclosed fence swallows later content that YAML reads as comments | codex P10 (the residual §2.7 declares, now pinned) | clean |
| invalid | unclosed fence SWALLOWS the rest of the document | CommonMark 4.5 (the swallow risk, caught by YAML) | YAML: MISSING_CHAR |
| invalid | INDENTED code block alone is not a fenced block | codex P2 / CommonMark 4.4 | found 0 canonical blocks (expected 1) |
| valid | INDENTED example beside a valid fence is ignored | codex P2 / CommonMark 4.4 | clean |
| invalid | second canonical block in a BLOCK QUOTE | CommonMark 5.1 | found 2 canonical blocks (expected 1) |
| invalid | second canonical block in a LIST ITEM | CommonMark 5.2 | found 2 canonical blocks (expected 1) |
| invalid | unfenced marker in a BLOCK QUOTE | CommonMark 5.1 | 1 shadow-home heading(s) |
| invalid | unfenced marker in a LIST ITEM | CommonMark 5.2 | 1 shadow-home heading(s) |
| invalid | unfenced marker in a NESTED block quote | CommonMark 5.1 | 1 shadow-home heading(s) |
| invalid | plain ATX shadow home | CommonMark 4.2 | 1 shadow-home heading(s) |
| invalid | SETEXT shadow home | CommonMark 4.3 | 1 shadow-home heading(s) |
| invalid | ATX with a closing # sequence | CommonMark 4.2 | 1 shadow-home heading(s) |
| invalid | BOLD shadow home | codex P3 / CommonMark 6 | 1 shadow-home heading(s) |
| invalid | CODE-SPAN shadow home | codex P3 / CommonMark 6 | 1 shadow-home heading(s) |
| invalid | STRIKETHROUGH shadow home | codex P3 / GFM | 1 shadow-home heading(s) |
| invalid | REFERENCE-LINK shadow home | codex P3 / CommonMark 6 | 1 shadow-home heading(s) |
| invalid | CHARACTER-REFERENCE shadow home | codex P3 / CommonMark 6 | 1 shadow-home heading(s) |
| invalid | formatted SETEXT shadow home | codex P3 / CommonMark 4.3 | 1 shadow-home heading(s) |
| valid | CONTROL: a formatted heading that is NOT the marker | codex P3 | clean |
| valid | CONTROL: level-2 heading with the marker text is not a home | CommonMark 4.2 | clean |
| valid | CONTROL: `#plan-running-totals` with no space is not a heading | CommonMark 4.2 | clean |
| valid | KNOWN-OPEN: an IMAGE heading contributes no visible text | CommonMark 6 (declared residual) | clean |
| invalid | RESTORED (rev 1): marker indented four spaces as the first content line | rev-1 row, dropped in rev 2 (P9) | found 0 canonical blocks (expected 1) |
| valid | CONTROL: marker in an inline code span (live plan, line 14) | CommonMark 6.1 | clean |
| valid | CONTROL: marker inside an HTML comment | codex S3 / CommonMark 4.6 | clean |
| invalid | UPPERCASE-X hex reference shadow home | codex P8 / CommonMark 2.5 | 1 shadow-home heading(s) |
| invalid | DECIMAL reference shadow home | codex P8 / CommonMark 2.5 | 1 shadow-home heading(s) |
| invalid | NAMED reference `&Tab;` decodes to whitespace and collapses away | codex P8 / CommonMark 2.5 | 1 shadow-home heading(s) |
| valid | CONTROL: `&Nbsp;` is INVALID — the name inventory is case-SENSITIVE | codex P8 / CommonMark 2.5 | clean |
| valid | CONTROL: an OUT-OF-RANGE code point becomes U+FFFD, it does not throw | codex P8 / CommonMark 2.5 | clean |
| valid | CONTROL: NUL becomes U+FFFD | codex P8 / CommonMark 2.5 | clean |
| valid | CONTROL: a numeric reference with too many digits stays literal | codex P8 / CommonMark 2.5 | clean |
| valid | CONTROL: a nonentity name stays literal | codex P8 / CommonMark 2.5 | clean |
| valid | CONTROL: references stay LITERAL inside a code span | codex P8 / CommonMark 6.1 | clean |
| valid | KNOWN-OPEN: a raw `<h1>` renders a visible title and is NOT seen | codex P11 (declared residual, owner ruling) | clean |
| invalid | CONTROL: inline HTML around the words still projects the text | codex P11 / CommonMark 6 | 1 shadow-home heading(s) |
| invalid | empty payload | grammar | payload is not a top-level mapping |
| valid | FLOW-MAPPING payload | YAML 7.4 | clean |
| invalid | SEQUENCE payload (root is not a mapping) | YAML 8.2 | payload is not a top-level mapping |
| invalid | malformed YAML payload | YAML | YAML: BAD_INDENT |
| invalid | MULTI-DOCUMENT payload | YAML 9.1 | YAML: MULTIPLE_DOCS |
| invalid | governed keys NESTED one level deep | YAML 8.2 | `review_rounds_complete` x0 (expected 1); `reviewer_findings` x0 (expected 1); `findings_after_round_one` x0 (expected 1) |
| invalid | governed key COMMENTED OUT | YAML 8.1 | `review_rounds_complete` x0 (expected 1) |
| invalid | key-shaped text inside a BLOCK SCALAR | codex S1 / YAML 8.1 | `review_rounds_complete` x0 (expected 1); `reviewer_findings` x0 (expected 1); `findings_after_round_one` x0 (expected 1) |
| valid | CONTROL: real keys PLUS a scalar mentioning one | codex S1 / YAML 8.1 | clean |
| invalid | QUOTED duplicate key | YAML dup | YAML: DUPLICATE_KEY |
| invalid | duplicate key with the SAME value | YAML dup | YAML: DUPLICATE_KEY |
| invalid | ALIAS used as a duplicate key | codex P4 / YAML 7.1 | YAML: NON_STRING_KEY |
| valid | RESTORED (rev 1): an ALIAS resolving to an integer is a valid value | rev-1 row, dropped in rev 2 (codex P9 / YAML 7.1) | clean |
| invalid | an ALIAS resolving to a STRING is not a count | codex P9 / YAML 7.1 | `review_rounds_complete` is not a non-negative integer ("oops") |
| valid | CONTROL: a key that merely CONTAINS a governed key | YAML | clean |
| invalid | STRING value | codex P7 | `review_rounds_complete` is not a non-negative integer ("bananas") |
| invalid | NEGATIVE value | codex P7 | `review_rounds_complete` is not a non-negative integer (-1) |
| invalid | NULL value | codex P7 | `review_rounds_complete` is not a non-negative integer (null) |
| invalid | SEQUENCE value | codex P7 | `review_rounds_complete` is not a non-negative integer (null) |
| invalid | FLOAT value | codex P7 | `review_rounds_complete` is not a non-negative integer (7.5) |
| valid | CONTROL: zero is a legitimate total | codex P7 | clean |

69 ok, 0 FAIL (of 69)

LIVE PLAN -> VALID (clean)

⭐ **What the closer-relation rows show.** The narrower closer, wrong-character
closer and over-indented closer are all rejected — **by the YAML parse, with no
delimiter logic anywhere in the mechanism.** That is the measurement behind
withdrawing the unterminated-fence departure (§1.4).

⚠ **Twenty of these are false-blocker controls** — legitimate documents C3 must
stay silent on, including seven of the nine new character-reference cases. A
population of only "does it catch my bad input?" cases is what let revision 1's
own regressions through, and P8's `&Nbsp;` false blocker and P9's rejected alias
value are both cases where the mechanism was too LOUD, not too quiet.

## 2.11 Fail-against-`6420bb4`, planned honestly in advance

⚠ Revision 1's opening sentence here was **self-contradictory** (finding P6): it
required every new control to fail against old code, then required naming the
ones that do not. Corrected:

- **Every control credited as PROOF OF A REPAIR must fail against `6420bb4`**
  before it is credited.
- **Conformance and population controls may legitimately pass against old
  code** — a tilde fence was already accepted there. They are still committed,
  and their per-case old-code outcome is still reported; they are simply not
  counted as discriminators.
- The run against `6420bb4` will be reported **unmodified**, with any
  compatibility substitution named explicitly, and any structural failure by
  missing export reported **separately** rather than converted into a pass.
  This is §2.6's lesson applied to its own repair.

## 2.11a Disposition of the round-3 plan review (P1–P7)

All seven findings were **independently reproduced before being accepted**; the
reviewer's cumulative record on this PR is now **20 findings, 20 valid**.

| Ref | Severity | Disposition                                                                                                                                                                                                                                                |
| --- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | SEV-1    | **FIXED — departure dropped**, on the owner's ruling and a measurement: deleting the real plan's closing fence still blocks via the YAML parse. All four closer-relation constructions are committed cases.                                                |
| P2  | SEV-1    | **FIXED** — `codeBlockStyle === 'indented'` excluded; the fenced-only contract is preserved. Lone-indented and indented-beside-valid controls committed.                                                                                                   |
| P3  | SEV-1    | **FIXED** — reader-visible projection specified in §2.2a. Bold, code-span, strikethrough, reference-link, character-reference, formatted-Setext, closing-`#`, a non-matching formatted heading and the live inline-code paragraph are all committed cases. |
| P4  | SEV-2    | **FIXED — option A**, `stringKeys: true`. Alias-as-key now raises `NON_STRING_KEY`; the value-alias acceptance control is retained.                                                                                                                        |
| P5  | SEV-2    | **FIXED — option A.** The harness is committed and its transcript published above.                                                                                                                                                                         |
| P6  | SEV-3    | **FIXED** — §2.11 rewritten as above.                                                                                                                                                                                                                      |
| P7  | SEV-2    | **FIXED — option A, owner-ruled.** Governed values must be finite non-negative integers. Live values 7/30/24 verified passing; string, negative, null, sequence and float controls committed, plus a zero-is-legitimate control.                           |

## 2.11b Disposition of the revision-2 review (P8–P11)

All four were reproduced against the exact committed mechanism before being
accepted; the reviewer's cumulative record is now **24 findings, 24 valid**.

⚠⚠ **P8 IS THE SAME CLASS AS P1 AND P3, COMMITTED INSIDE THEIR OWN FIX.** The
revision that deleted a hand-written fence-delimiter test and a token-field
shortcut shipped a hand-written entity decoder. **Fourth consecutive round in
which the repair contained the next finding** — though the trend is convergence
rather than a treadmill: the SEV-1 count has run 3 → 3 → 2 → 1, and this one's
fix complexity was 2.

| Ref | Severity                                | Disposition                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P8  | SEV-1 · `Blocks: C3 heading projection` | **FIXED — the decoder is DELETED**, not completed. `decodeHTML` from `entities` replaces it. Measured against the exact committed mechanism first: `&#X2D;` and `&Tab;` were false accepts, `&Nbsp;` a false blocker, and `&#x110000;` **threw `RangeError`**. Nine controls committed — uppercase-X, decimal, named, invalid-casing, out-of-range, NUL, over-long digits, nonentity, and references-stay-literal-in-a-code-span. |
| P9  | SEV-2                                   | **FIXED — option A.** `Alias.resolve(doc)` dereferences an alias value, accepted only when the resolved node is an integer scalar. Both dropped revision-1 rows are restored and labelled `RESTORED (rev 1)`; an alias-resolving-to-a-string control is added. §2.10 now states 26 additions and two removals rather than 24 additions.                                                                                           |
| P10 | SEV-2                                   | **FIXED.** The residual is pinned by the real construction — the valid block followed by `## Later section` / `### Last section`, which YAML reads as comments and which measures **clean**. The EOF-only case and the hostile ordinary-prose case both stay as the inverse controls.                                                                                                                                             |
| P11 | SEV-2 · Owner judgement                 | **FIXED — option B, owner-ruled 2026-09-03.** The contract stays Markdown-only. The false harness comment "raw blocks declare nothing" is corrected, the boundary is declared in §2.3 and §2.7, and a raw `<h1>` is pinned as a passing `KNOWN-OPEN:` case. No HTML parsing is introduced.                                                                                                                                        |

## 2.12 Questions the reviewer is asked to answer

Revisions 1 and 2 asked ten questions; all were answered and none is repeated.
These target revision 3's own new surface:

1. Is `entities` used correctly and completely — is there a CommonMark §2.5
   boundary it decides differently from the specification, or a place the
   projection should not be decoding at all?
2. Does `Alias.resolve(doc)` handle every alias shape a governed value could
   take, including an alias to an anchored mapping or a chain of aliases?
3. Is the raw-HTML boundary (§2.7, owner-ruled option B) stated everywhere it
   needs to be, and is its `KNOWN-OPEN:` case a faithful pin?
4. Is the swallowed-document residual pinned by the RIGHT construction, or is
   there a cleaner swallow that also stays visible?
5. Declaring `entities` and `marked` as devDependencies in a pre-code revision —
   correct, or scope creep that should have waited for the repair?

---

⚠ **NO PRODUCTION CODE HAS BEEN WRITTEN.** `tests/support/planConsistency.ts`
and `tests/unit/planConsistency.spec.ts` are untouched at `6420bb4`. The only
files this revision adds are this plan and `tools/c3-parser-harness.cjs`, which
is deliberately committed as reviewable evidence (finding P5) and is deleted
when the repair lands.
