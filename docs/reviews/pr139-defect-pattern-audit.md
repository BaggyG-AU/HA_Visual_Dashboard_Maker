Author: Claude Opus (PR #139 defect-pattern audit; also the author of the deliverables audited here is a prior session of the same model — see "Conflict of interest")
Reviewer: none yet — this audit is itself an unreviewed change artifact
Owner gate: BaggyG-AU reads this audit before deciding whether to commission round 6, repair §3.4, or merge PR #139

# PR #139 — why do defects keep being found?

An audit of the PR #139 deliverables across five independent review rounds,
commissioned because the round count kept rising. It answers five questions:
what every finding actually was, how they classify, whether the reviewer's
"author sweep failure" diagnosis is right, why this keeps happening, and what
would stop it.

**Scope and method.** Every claim below is measured against the primary
sources — the committed review file
(`docs/reviews/governance-review-invariant-implementation-codex-review.md`,
1,219 lines), the seventeen commits on this branch, the five review
commissions under `prompts/codex/` (untracked, `.gitignore:114`), and the live
PR body via `gh pr view 139 --json body`. The five MemPalace review drawers were
read **after** the review file and used only as corroboration, because all five
were filed by the author on the reviewer's behalf under ruling MP-LEASE. This
is a docs-only branch: `git diff --stat main...HEAD -- src/ tests/` is empty and
this audit does not change that.

**Headline.** Ten merge-blocking findings plus two non-blocking notes in five
rounds. **Five of the ten live in one paragraph — §3.4's mechanical
"evidence-only" test — and that paragraph did not exist when the PR was first
reviewed. It was created by the round-1 fix.** The author's account of the
cause is measurably wrong in the one way that matters: it says the population
went unexamined, when in fact the author **wrote the winning test case into his
own review commission in each of rounds 3, 4 and 5 and did not run it**. And
the current, unreviewed mechanism has an eleventh defect, found for this audit
in under an hour — reported below as **R6-M1**.

---

## 1. Every finding, enumerated

Read from the review file, not from any summary. "Introduced by" is the commit
in which the defective text first appears, measured with `git show
<commit>:<path>`; it is not always the commit that the round before was
answering.

### The ten merge-blocking findings

| #     | Finding                                                                 | What was claimed                                                                                     | What was actually wrong                                                                                                                                                                                                                                                    | Introduced by                                                                                                                          | Closed by                                   | Introduced by which round's fix                                                                                                                                      |
| ----- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1    | Class (d) universal inside a still-limited F5/F8 pilot; no cost trigger | §3 gains class (d) for "slice implementations", indexed **Standing**                                 | The §3 preamble still called the invariant an F5/F8 pilot decided at v1.0.0. Two incompatible scopes. Separately, no trigger could fire while each round found one small acted-on residue                                                                                  | `0a311bb` (original content)                                                                                                           | `bcba77a`                                   | none — original                                                                                                                                                      |
| M2    | "One mandatory round" stated a minimum with no stopping rule            | Rounds 2+ are narrow; the owner may accept "evidence-only residues"                                  | Never said which repair makes round N+1 mandatory, what an evidence-only residue is, or when the sequence stops. On the literal text a Major product fix could reach merge unreviewed                                                                                      | `0a311bb` (original content)                                                                                                           | `bcba77a`                                   | none — original                                                                                                                                                      |
| M3    | REV-RERUN binds a universal from n=1, and one claim was false           | "The MEDIUM sweeps produced identical numbers in two consecutive rounds and found nothing in either" | Round 1 of PR #137 **explicitly did not re-run** the MEDIUM sweep. Round 1's figures were author-reported. An unperformed re-run was presented as a measured outcome — three paragraphs above §3.5's rule forbidding exactly that                                          | `0a311bb` (original content)                                                                                                           | `bcba77a` (docs) + `c4fd0a4` (live PR body) | none — original                                                                                                                                                      |
| M4    | MP-LEASE sent the same notes to two different destinations              | The reviewer files drawer candidates in its committed review file                                    | The §2 bullet immediately above, plus `ai_rules.md` and `CLAUDE.md`, still sent them to the PR body. The new ruling landed; its displaced destination stayed operative                                                                                                     | `0a311bb` (original content)                                                                                                           | `82e3bd9` (fully, at round 4)               | none — original                                                                                                                                                      |
| R2-M1 | A blocklist of executable directories cannot be complete                | `git diff --stat <prev>..HEAD -- src/ tests/ tools/` empty ⇒ evidence-only                           | Behaviour-bearing paths exist outside all three: root `package.json`, `playwright.config.ts`, `vitest.config.ts`, `analyze-test-results.js`, `.github/workflows/`, `templates/`. A behaviour change could be certified evidence-only                                       | **`bcba77a`** — the M2 fix                                                                                                             | `c4fd0a4`                                   | **round 1's fix**                                                                                                                                                    |
| R2-M2 | Scope cannot resolve a contradiction in the highest-precedence text     | MP-LEASE is a "reviewer-specific refinement" of `ai_rules.md` §11, so §11 need not be edited         | `ai_rules.md` is both the highest-precedence text and the first file an agent is told to read. A no-MemPalace reviewer still landed on "use the PR body". The author had flagged the deviation rather than resolving it                                                    | **`bcba77a`** — the M4 fix (a deliberate declared deviation)                                                                           | `c4fd0a4`                                   | **round 1's fix**                                                                                                                                                    |
| R3-M1 | A prefix allowlist is not a path allowlist                              | `'^(docs/reviews/\|PR_NOTES\.md\|CODEX_SUMMARY\.md)'` names the evidence-only population             | No end anchor and an unconstrained directory alternative. `PR_NOTES.md.sh`, `CODEX_SUMMARY.md/tool.js`, `docs/reviews/some-tool.sh`, `docs/reviews/sub/x.md` all passed as evidence-only, falsifying the rule's own universal                                              | **`c4fd0a4`** — the R2-M1 fix                                                                                                          | `82e3bd9`                                   | **round 2's fix**                                                                                                                                                    |
| R3-M2 | `ai_rules.md` §11 named a third destination                             | The reviewer exception gives one unambiguous destination                                             | `:329` still said "If MemPalace is unavailable … fall back to **local memory files**". Reading §11 straight through gave PR body → review file → local memory → review file. The author had swept by grepping `"PR body"` — the token of the instance he already knew      | **pre-existing on `main`** (`a6ce103:ai_rules.md:327`) — newly exposed by `c4fd0a4` scoping the exception only to the PR-body fallback | `82e3bd9`                                   | exposed by round 2's fix; **text itself predates the PR**                                                                                                            |
| R4-M1 | `git diff --name-only` does not enumerate both sides of a rename        | The anchored allowlist decides every path the repair touched                                         | Git detects renames by default and emits **only the destination**. Renaming `package.json` to `docs/reviews/x.md` made the shipped command print nothing while `package.json` had been deleted. A pathname regex also cannot decide object type (symlink, gitlink)         | **`c4fd0a4`** — the R2-M1 fix introduced `--name-only`                                                                                 | `f788887`                                   | **round 2's fix** — _not_ round 3's; it was co-resident with R3-M1 and unfound for two rounds                                                                        |
| R5-M1 | The checks did not decide the claim they certified                      | "The repair touched only allowed paths"                                                              | Both assertions compared **endpoint trees**. A behaviour path added in one commit and removed in a later one is absent from both endpoint diffs; so is a temporary exec bit or symlink restored before HEAD. The claim is about history; the check measured net difference | **`bcba77a`** — endpoint keying (`<prev>..HEAD`) entered with the very first version and survived four rewrites                        | `3db6c4d` (**unreviewed**)                  | **round 1's fix** — Codex says so explicitly at review line 1167: "This gap existed in the earlier endpoint command rather than being generated by the R4-M1 repair" |

### The two non-blocking notes — real findings, and both count

| #     | Finding                                                   | What was wrong                                                                                                                                                                                                                                                                                                 | Introduced by                                             | Closed by                          |
| ----- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------- |
| R3-N1 | Narrative creep into a pointer-style document             | The R2 repair added the failed-draft chronicle and the 18-commit story to a document whose own preamble says it never carries narrative. Codex: "That is real over-reach"                                                                                                                                      | `c4fd0a4`                                                 | `7a2d66e`                          |
| R5-N1 | An unverified universal, shipped as a "measured property" | The author wrote that "a non-ASCII path fails safe" after testing under the **default** `core.quotePath`. Under `core.quotePath=false` git emits the raw `docs/reviews/café.md`, which **matches** the allowlist and makes command 1 silent. The behaviour is policy-correct; the author's statement was false | `2cc9dc9` — an _unrequested_ addition inside a fix commit | `3db6c4d` (removed, not qualified) |

### Author-self-found defects, for completeness

Not reviewer findings, but evidence about method. **Eight**, all in fix commits:
the `tools/` hole (`fa62399`); the amendment count already stale by one when it
shipped (`0fa3de9`); a §3.4 drawer pointer naming the round-2 record for a
round-3 defect (`9a8fcb2`); two prose defects found by running the round-4
commission first (`7a2d66e`); the round-4 drawer left unnamed (`2a9c062`); and
two corrections to the PR's own record disclosed in `c4fd0a4` — **the M3 factual
error was still live in the PR body a full round after both documents were
corrected**, and "rounds 2–6 were all evidence cleanup" was imprecise.

⚠ That eighth item is the one to notice: **the author's self-checks did work,
repeatedly — they just never reached the mechanism.** Eight self-found defects
against ten reviewer findings is not an author who fails to check. It is an
author checking the surfaces he can read and never the one he built.

---

## 2. Categorisation

Every finding appears in exactly one row of each cut. Counts sum to ten (twelve
where the two non-blocking notes are included, marked).

### By generative relationship

| Category                                                       | Count                | Which                                                                                                                                                |
| -------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Original** — defect in the reviewed content commit `0a311bb` | **4**                | M1, M2, M3, M4                                                                                                                                       |
| **Author-introduced in a fix round**                           | **5** (7 with notes) | R2-M1, R2-M2 (round-1 fix); R3-M1, R4-M1 (round-2 fix); R5-M1 (round-1 fix) — plus R3-N1, R5-N1                                                      |
| **Pre-existing and newly exposed**                             | **1**                | R3-M2 — `ai_rules.md:327`'s local-memory fallback is on `main` and predates the PR; the round-2 fix exposed it by displacing only the PR-body branch |

⚠ **Not one of the six post-round-1 findings is a regression in the ordinary
sense** — no fix broke something a previous round had checked clean. Codex
re-checked the previously-clean areas by name in rounds 3, 4 and 5 and found
none. What the fixes did was **create new surface**, which is a different
failure with a different remedy.

### By defect nature

| Category                                                                          | Count                | Which                                                                                                                             |
| --------------------------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Mechanism defect** — the rule's command did the wrong thing                     | **4**                | R2-M1, R3-M1, R4-M1, R5-M1                                                                                                        |
| **Evidence/claim defect** — the prose asserted something unmeasured or false      | **2** (4 with notes) | M3 (an unperformed re-run reported as measured); M1 (indexing REV-IMPL "Standing" against an unchanged pilot) — plus R3-N1, R5-N1 |
| **Instruction-conflict defect** — two governed surfaces command different actions | **3**                | M4, R2-M2, R3-M2                                                                                                                  |
| **Specification gap** — a rule with no stated trigger or exit                     | **1**                | M2                                                                                                                                |

### By lineage — the structure that sets the round count

Two multi-round chains, not one, and they are **not** staggered as PR #137's
were; the second is fully contained inside the first.

- **Lineage A — the evidence-only mechanical test.** M2 → R2-M1 → R3-M1 →
  R4-M1 → R5-M1. **Five rounds, rounds 1–5, still open at HEAD.** Five of the
  ten findings, six of the twelve including R5-N1.
- **Lineage B — the MP-LEASE destination.** M4 → R2-M2 → R3-M2. **Three
  rounds, rounds 1–4, closed and stayed closed.** Three of the ten.
- **Singletons.** M1 (closed round 2), M3 (closed round 2).

**Lineage A alone sets the round count.** Lineage B, M1 and M3 were all closed
by round 4 and cost no round that A did not already cost. That much of the
author's "one paragraph" framing is correct — but see §4, because it is right
about the round count and wrong about the cause.

### One measurement that reframes everything

**The paragraph that produced five of the ten findings did not exist when the
PR was first reviewed.**

```
$ git show 0a311bb:docs/governance/OPERATING_AGREEMENT.md | grep -c 'evidence-only'
2          # both in prose; NO mechanical command anywhere in §3.4
$ git show bcba77a:docs/governance/OPERATING_AGREEMENT.md | grep -n 'git diff --stat'
250:   and **`git diff --stat <previous review commit>..HEAD -- src/ tests/` is
```

The mechanical test was **born in `bcba77a`, the round-1 fix commit**, as the
answer to M2. Its six successive versions — five of them answering a finding:

| Commit    | Answering  | The mechanism                                                                                                        |
| --------- | ---------- | -------------------------------------------------------------------------------------------------------------------- |
| `bcba77a` | M2         | `git diff --stat <prev>..HEAD -- src/ tests/` — **blocklist, endpoint**                                              |
| `fa62399` | self-found | `+ tools/` — still blocklist, still endpoint                                                                         |
| `c4fd0a4` | R2-M1      | `git diff --name-only <prev>..HEAD \| grep -vE '<unanchored prefixes>'` — **allowlist, endpoint, rename-collapsing** |
| `82e3bd9` | R3-M1      | anchored: `'^(docs/reviews/[^/]+\.md\|PR_NOTES\.md\|CODEX_SUMMARY\.md)$'`                                            |
| `f788887` | R4-M1      | `--no-renames` + a second raw-mode assertion                                                                         |
| `3db6c4d` | R5-M1      | `git log --format= --no-renames --raw -m` + `merge-base --is-ancestor`                                               |

This is verbatim the PR #137 structure recorded at
`drawer_havdm_patterns_9b2499f0b71c059ee556d65a`: _"THE FIX FOR FINDING M4
BECAME THE THING UNDER REVIEW FOR THE REMAINING FIVE ROUNDS."_ It happened
again, on the very PR whose purpose is to codify the lesson from the first
occurrence.

And the three defects found in rounds 3, 4 and 5 were **all co-resident in
`c4fd0a4`**: the unanchored regex, the rename collapse, and the endpoint keying
(inherited from `bcba77a`) were simultaneously present in one commit written in
**11.4 minutes**. They were found one per round because each round's instrument
went one level deeper — round 3 fed strings to `grep`, round 4 exercised real
`git diff` rename behaviour, round 5 built real commits with history.

---

## 3. The `practice` rule, applied

> "A RISING ROUND COUNT IS DIAGNOSTIC. If round N+1 keeps producing findings,
> distinguish the two causes: the same class being patched one instance at a
> time (an author sweep failure), or each fix generating the next finding (a
> scope-control failure). They need different remedies."
> — `drawer_practice_review_6515223540910678763fc11b`

Codex called it an author sweep failure in rounds 3, 4 and 5. **Deciding
independently: the reviewer is right about rounds 3, 4 and 5, and the rule's
binary is the wrong frame for this PR. Both causes operated, in sequence, and
they compound.**

Applying the test finding by finding:

| Finding | Generated by the immediately preceding fix?                                                          | Same class patched one instance at a time?                      | Verdict           |
| ------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------- |
| R2-M1   | **Yes** — the mechanism did not exist before `bcba77a`                                               | No — first instance of its class                                | **scope-control** |
| R2-M2   | No — `bcba77a` fixed the named instance of M4 and declined the rest                                  | **Yes** — under-reach, disclosed at the time                    | **author sweep**  |
| R3-M1   | **Yes** — the regex did not exist before `c4fd0a4`                                                   | No — first instance                                             | **scope-control** |
| R3-M2   | No — the text is on `main`                                                                           | **Yes** — swept on `"PR body"`, the wrong key                   | **author sweep**  |
| R4-M1   | **No** — `--name-only` came from `c4fd0a4`, two rounds earlier                                       | **Yes** — the population of `c4fd0a4`'s command was never swept | **author sweep**  |
| R5-M1   | **No** — endpoint keying came from `bcba77a`, four rounds earlier; Codex says so at review line 1167 | **Yes** — same                                                  | **author sweep**  |

**Four author sweep, two scope-control.** So the reviewer's verdict is correct
on the count, and correct for exactly the rounds it was given for.

But the two causes are not alternatives here, they are stages:

1. **The round-1 fix was a scope-control failure that created the surface.**
   M2's required correction asked the author to _"Define 'evidence-only' in the
   rule rather than leaving it to inference"_ (review line 129–130), and
   Codex's own worked example of a boundary was **prose**
   (`documentation/PR-body evidence-only residues`). The author answered a
   request for a definition with **an executable mechanism** — a git pipeline
   embedded in governance law. That escalation was not required and it is what
   created a falsifiable surface where a prose definition would have been
   merely arguable.
2. **Rounds 3–5 were author sweep failures on that surface.** Once the
   mechanism existed, each round found the next-deepest defect in it because
   the author never swept the mechanism's own population.

**The remedies differ, and both are owed.** For the scope-control stage:
_do not answer a definition request with a mechanism unless the mechanism can
be tested where it lives._ For the sweep stage: see §4, because the sweep
failure has a sharper and cheaper cause than "the author didn't sweep".

---

## 4. Why this keeps happening

### 4.1 The author's hypothesis is falsified in its causal half

The outgoing author's account, recorded in the handover:

> "Each fix corrected the instance the reviewer demonstrated and left the
> rule's POPULATION unexamined … **none asked 'what set of things does this
> rule claim to decide, and can I enumerate it?'**"

**Measured against the commissions, that is not what happened. The author asked
that question every round, wrote the answer down, and handed it to the reviewer
instead of running it.**

| Round | The author's own words in the commission he wrote                                                                                                                                                                                                           | The finding that round produced                |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 3     | `round3.md:163-164` — _"Does the inversion actually close the class? **Construct a repair that is behaviour-bearing and still passes.** If you cannot, say so plainly."_                                                                                    | **R3-M1**                                      |
| 4     | `round4.md:177-179` — _"Invent negative cases the author did not. Symlinks, paths with spaces or newlines, a directory literally named `docs/reviews/x.md/`, **renames and deletions in `--name-only` output**, case-insensitive filesystems…"_             | **R4-M1** — the rename in `--name-only` output |
| 5     | `round5.md:165-170` — _"Invent change-record cases the author did not. Suggestions, not limits: a merge commit inside the range; `<prev>` not an ancestor of HEAD; **a range spanning a commit that adds then removes a behaviour path**; an empty range…"_ | **R5-M1** — the transient add-then-remove      |

**Three consecutive rounds. Each round's merge-blocking finding was named, in
writing, by the author, in the commission for the round that found it.** Note
too that round 5's commission also named the non-ancestor case, which became
the author's own check (0), and the merge/`$2` field question, which Codex
confirmed as a constraint — so the list was not only correct, it was
comprehensive.

The distinction matters because the two accounts imply different remedies.
"I did not think of the population" is a limit of imagination that no cheap
process fixes. "I wrote the check down and handed it to someone else instead of
running it" is a process failure with a one-line remedy that already exists as
a `practice` rule — `drawer_practice_review_a4985584018e52ed44d6de54`, _"the
review commission you write is the checklist you owe yourself"_, filed out of
this very PR on 2026-08-08 and then **field-tested and found insufficient twice
more in the same evening**.

⚠ The round-3 instruction is worth reading again, because it is not narrow:
_"construct a repair that is behaviour-bearing and still passes."_ R3-M1, R4-M1
and R5-M1 are **all** instances of exactly that. A complete execution of the
round-3 commission's own general instruction had all three within reach. The
list did grow reactively round by round, which partially supports the author's
account — but the general instruction that covered all three was written before
any of them were found.

### 4.2 What the author's hypothesis gets right, and one arithmetic error

- **"All twelve fix commits touch `OPERATING_AGREEMENT.md`"** — the measurement
  is right, the label is wrong. `git log --format=%h main..HEAD
--grep='docs(governance)'` returns **12**, all of which touch that file. But
  one of the twelve is `0a311bb`, **the original content commit, which is not a
  fix**. There are **eleven** fix commits. The published measurement command is
  keyed on the commit-message prefix, which cannot distinguish the content
  commit from the repairs — _the same wrong-key defect the PR spent three rounds
  on_, committed in the sentence describing them.
- **"Eight of the twelve touch nothing else, including the last six
  consecutively"** — **correct**. `fa62399`, `0fa3de9`, `9a8fcb2`, `7a2d66e`,
  `f788887`, `2a9c062`, `2cc9dc9`, `3db6c4d`; the last six are consecutive. Of
  the eleven actual fix commits, that is 8/11.
- **"One paragraph produced a finding in EVERY round"** — right about the round
  count, wrong about the chain. **M2 is not a finding about the mechanical
  test**; the test did not exist at the reviewed commit. M2 is a finding about
  the _absence_ of a lifecycle rule, and the mechanical test is M2's _fix_. The
  honest chain is **one original gap plus four defects in the artifact created
  to close it**.
- **"The other three round-1 findings were closed by round 4 and stayed
  closed"** — true, and it flattens Lineage B. M4 consumed rounds 2, 3 **and**
  4 through R2-M2 and R3-M2, with a root cause (a token-keyed sweep of a
  behavioural class) genuinely different from Lineage A's (a check narrower
  than the claim it certified). Collapsing the picture to "one paragraph"
  loses that, which is the specific way the account is self-serving.

### 4.3 The structural causes, tested against the evidence

Testing the candidates rather than asserting them.

**(a) A governance document cannot execute or test what it specifies —
STRONGLY SUPPORTED, and this is the root.** `./tools/checks` is `eslint` →
`prettier --check` → `tsc --noEmit` → `vitest run`. Prettier's inferred parser
for every finding-bearing file is `markdown` — it checks **formatting only**.
There is no `shellcheck`, no `markdownlint`, no `remark` anywhere in the
repository, and nothing in the tracked tree reads or executes the commands
inside `OPERATING_AGREEMENT.md`; the only reference to that file from any
executable path is a comment in one unit test. The gate table:

| Artifact                                                    | Findings in 5 rounds                     | Gated by                       |
| ----------------------------------------------------------- | ---------------------------------------- | ------------------------------ |
| `docs/governance/OPERATING_AGREEMENT.md` **§3.4**           | **5** (+1 note)                          | prettier — **formatting only** |
| `ai_rules.md` / `CLAUDE.md` / OA §2 destinations            | 3                                        | prettier — **formatting only** |
| `OPERATING_AGREEMENT.md` elsewhere / `TESTING_STANDARDS.md` | 2                                        | prettier — **formatting only** |
| **the live PR body**                                        | the M3 error survived a full round there | **nothing — not a file**       |
| `src/`, `tests/`                                            | **0**                                    | eslint + tsc + vitest          |

This is the identical table PR #137 produced —
_"THE GATE POINTS AWAY FROM THE FAILURE SURFACE"_ — and the identical rule that
went unapplied there, `drawer_practice_artifacts_0980f7d1e9518c30709a13d5`,
went unapplied again here.

**(b) The rule is stated as a universal that is expensive to verify and free to
assert — STRONGLY SUPPORTED.** Three of the four mechanism defects are literally
prose-wider-than-command: R3-M1 (prose said "a Markdown review document", the
regex accepted any prefix), R4-M1 (prose promised object type from a name
regex), R5-M1 (prose said "the repair **touched**", the command measured net
endpoint difference). Every version was _correct-looking prose_. Four were
wrong.

**(c) The turnaround cadence excluded the check — SUPPORTED, and measurable.**
The entire five-round arc ran **3 h 4 min**, 18:15:58 → 21:20:06 on 2026-08-08.
Fix commits landed **3.4 to 15.7 minutes** after the review that prompted them;
median ≈ 9 minutes. The two commits that generated the most downstream cost:

- `bcba77a` — created the mechanical test — **7.9 min** after the round-1 review.
- `c4fd0a4` — shipped three co-resident latent defects — **11.4 min** after the round-2 review.

The self-check that eventually found real defects (round 5's: real commits on a
throwaway branch, expectations declared in advance) takes materially longer than
eleven minutes. **The cadence made the correct check unaffordable, and the
correct check is the only one that works on this class.** This is not "the
author was tired at the end of a long session" — it is a rhythm in which
answering fast is rewarded and verifying properly is not.

**(d) The author both writes and tests the rule — supported, but it is the
generic condition the invariant exists to address, and the invariant worked.**
All ten findings held on verification; none was withdrawn.

**(e) The deliverable had no test suite of its own — supported, and it is (a)
restated in actionable form.** Codex has now built the test suite twice, as
throwaway tables inside review prose: thirteen change-record cases in round 5,
twenty-three pathname cases in round 4. **That suite exists, is adversarial,
and is discarded after every round because there is nowhere in the repository
to put it.**

**A measurement of the cost.** §3.4 has grown from 30 lines to **154 lines** —
**33% of the entire Operating Agreement** — and **63 of those 154 lines
(`:287-341` and `:343-350`) are the mechanism's four "load-bearing" properties,
its five mandated negative cases and its four-defect history**: guards and case
law for one shell pipeline, in a document whose own preamble says it is
pointer-style and never carries narrative. The operative rule those 63 lines
defend is about eight lines long.

| Commit    | §3.4 lines | whole document | §3.4 share |
| --------- | ---------- | -------------- | ---------- |
| `0a311bb` | 30         | 273            | 10%        |
| `c4fd0a4` | 88         | 395            | 22%        |
| `f788887` | 128        | 433            | 29%        |
| `3db6c4d` | **154**    | **459**        | **33%**    |

### 4.4 Did the author soften the reviewer's critique when filing it? No.

All five review drawers were filed by the author under MP-LEASE. Checked
against the review file: the harshest reviewer lines are carried **verbatim** —
round 4's _"it functioned as theatre rather than a reliable adversarial method"_
(review line 866) and round 5's _"the checks do not decide the claim they
certify"_ (line 1045) both appear word-for-word in their drawers, as do both
non-blocking notes and the false non-ASCII universal. On several points the
drawers are _harsher_ than the review file. **No softening found.** The
author-filed record is trustworthy; the author's _causal account_ is the part
that needed testing, and it is the part that failed.

---

## 5. ⚠⚠ R6-M1 — the eleventh defect, in the current unreviewed mechanism

**Found for this audit in under an hour, by inventing one case beyond the five
the document mandates.** Reported, not repaired.

**First, what is sound.** I extracted all three programs from the shipped
document, **proved each extraction fires on known-bad input before trusting any
silence**, then built the five negative cases §3.4:334-338 mandates as real
commits in an isolated repository. **All five print. All three positive and
false-positive controls stay silent. Check (0) fails closed on a non-ancestor.**
The `3db6c4d` mechanism passes everything its own document requires of it.

**The defect.** `-m` does not fix the record format — it delegates it to the
`log.diffMerges` configuration variable (git ≥ 2.31; this machine runs 2.43.0).
Under `log.diffMerges=combined` or `dense-combined`, `-m` emits **combined**
raw records, in which `$2` is a **parent** mode, not the destination mode:

```text
ordinary (default log.diffMerges=separate):
  :100644 120000 45cf141 e770119 T   docs/reviews/a.md      <- $2 = 120000, the destination
combined (log.diffMerges=combined):
  ::100644 100644 120000 45cf141 c376d89 e770119 MM  docs/reviews/a.md
                                                            <- $2 = 100644, a PARENT; destination is $3
```

So command (2)'s `$2 !~ /^(100644|000000)$/` reads a parent mode and stays
silent. Command (1) is unaffected — it extracts the path after the tab, and the
path is allowed. **Both commands print nothing on a repair that left an allowed
`.md` as a symlink.**

**Fail-against-current evidence**, real commits, expectation declared in
advance. A merge whose resolution differs from both parents (an ordinary
outcome of resolving a type conflict by hand) turns `docs/reviews/a.md` into a
symlink:

```text
ground truth:  120000 blob e770119   docs/reviews/a.md      <- symlink at an allowed path

log.diffMerges=separate        -> cmd2 PRINTS  (correct)
log.diffMerges=first-parent    -> cmd2 PRINTS  (correct)
log.diffMerges=combined        -> cmd1 [] cmd2 []  *** SILENT = CERTIFIED EVIDENCE-ONLY ***
log.diffMerges=dense-combined  -> cmd1 [] cmd2 []  *** SILENT = CERTIFIED EVIDENCE-ONLY ***
```

**This is the class Codex named and did not re-test after the repair changed the
command.** Review lines 1066–1076: _"There `$2` is a parent mode and the shipped
`awk` program printed nothing. That is not a current defect because the shipped
`git diff A..B` does not emit combined records… **It is a constraint on the
R5-M1 repair: if it adopts a history/combined form, it must parse that form
rather than reuse `$2` blindly.**"_ The R5-M1 repair adopted a history form and
reused `$2` blindly. **Codex's clearance was for `git diff A..B`; the shipped
command is now `git log … -m`, whose format is user-configurable — so the
clearance no longer covers the shipped command.** That is substitution 6 of
`drawer_practice_verification_8cccc05dfb795cb31d2ce3a6` — a clearance being read
wider than the check that earned it — recurring one round after the drawer
recording it was written.

**Severity, stated honestly.** It is **latent, not live**: `log.diffMerges` is
unset at repo, global and system level on this machine, so the effective value
is `separate` and the shipped command is currently correct here. Exploiting it
needs a non-default config **and** a merge commit inside the repair range whose
object-type change is visible only in the merge's own record. On HAVDM's linear
feature-branch workflow that is remote. **But §3.4 asserts a universal and calls
itself mechanical, and a mechanical proof whose result depends on the reader's
git config is not a proof** — which is precisely the `core.quotePath` lesson of
R5-N1, in a new costume and now as a false **accept** rather than a
conservative false reject.

**The fix is one word, and I verified it immunises against all four config
values:** replace `-m` with `--diff-merges=separate`, which pins the format
instead of delegating it. I have not applied it — this audit is analysis-only.

⚠ **The point of R6-M1 is not R6-M1.** It is that an auditor who was not
commissioned to review §3.4, working for under an hour, found the twelfth defect
in that paragraph by trying one case the author's five-case list did not name.
The list will always be shorter than the population. **That is the finding.**

---

## 6. Recommendation

### What I recommend

**Take the mechanism out of the normative position, and let it be evidence
instead of law.** Concretely, in the round-6 repair:

1. **§3.4(3) states the policy in prose, with the population named exactly** —
   a repair is evidence-only only if, across _every commit in the range_, every
   path touched is a `.md` directly under `docs/reviews/` or exactly
   `PR_NOTES.md` / `CODEX_SUMMARY.md`, and no allowed path was left as anything
   but an ordinary file. That is a policy prose can carry and a reviewer can
   decide.
2. **The commands move out of §3.4** — to `docs/testing/TESTING_STANDARDS.md`,
   which already owns re-run mechanics — and become **the evidence an author
   publishes and a reviewer checks**, not the definition of the rule.
3. **Fix R6-M1 in the same pass** (`--diff-merges=separate`) and move the 63
   lines of guards and case law with the commands, since they belong beside the
   mechanism they defend — or into this audit and the drawers, not into the
   constitution.

**Why this and not the alternatives.** The decisive property is _where a defect
in the command lands_. Today §3.4 says the command **is** the test, so every
deficiency in the pipeline is a deficiency in the governing law, requiring a
§3(b) governance amendment and its own review round — which is exactly why one
paragraph has cost five rounds and will cost a sixth. Move the command to the
evidentiary position and the same deficiency becomes **a defect in one PR's
evidence**: correctable inside that PR, caught by the ordinary round, costing
nothing at the governance layer. Nothing else on the table changes that.

### What it costs, plainly

- **It gives up "mechanical, not left to inference"**, which M2's required
  correction asked for and Codex accepted at round 2. A reviewer will fairly ask
  whether this reopens M2. My answer: it does not — M2's complaint was that
  "evidence-only" was _undefined_, and it remains defined, precisely, with the
  full population named. What changes is that a shell pipeline is no longer the
  definition of a governance term. **That answer needs testing by round 6, not
  assertion by me.**
- **It costs a round 6 regardless.** `3db6c4d` is unreviewed and governance text
  is deliberately not on the allowlist, so **by §3.4(2)'s own terms this PR
  already owes a narrow round 6** — merging without one would be the owner
  overriding the very rule being ratified. Round 6 is not a cost of this
  recommendation; it is already due.
- **It does not disturb PR #138.** No `tools/` change, so no new collision
  beyond the existing trivial `TESTING_STANDARDS.md` one.

### The follow-up PR I recommend, separately

**Extract the mechanism to `tools/check-evidence-only.sh` with real unit tests
— as its own PR, not this one.** The test suite is already written: Codex's
thirteen change-record cases (review lines 1000–1014) plus the twenty-three
pathname cases (lines 710–742) plus R6-M1's evil-merge case. Committing them as
fixtures turns a discarded review table into a permanent regression suite, and
puts §3.4's mechanism where `vitest`/CI can reach it — closing the gate-coverage
gap that both #137 and #139 measured and neither fixed. Keeping it out of #139
is deliberate: adding executable code to a docs-only governance PR is itself the
over-reach failure this PR keeps committing, and under §3.4(2) a `tools/` change
draws its own narrow round anyway.

### What I recommend against

- **Merging with the residue documented.** Codex ruled the R5-M1 residue not
  acceptable with the merge because _"it controls whether behaviour-bearing
  repair history receives independent review"_, and R6-M1 shows the repaired
  mechanism is still config-dependent. Merging now ratifies a rule with a known
  latent bypass.
- **Invoking a §3.3 rollback.** No trigger has fired — Codex verified this in
  all five rounds and I found no evidence to the contrary. All ten findings were
  real and held on verification; the invariant is doing its job. **The cost sits
  in the artifact's design, not in the review.** Rolling back class (d) would
  discard REV-IMPL's measured justification (#137's M1) to solve a problem
  caused by putting a shell pipeline in a constitution.

### And the process change that predicts the pattern

The two clauses twice-proposed for
`drawer_practice_review_a4985584018e52ed44d6de54` and still unfiled — **(a) the
self-check must exercise the mechanism's actual population, not a narrower one
that is easy to query, and (b) prove an extracted check is live before trusting
a silent result** — should be filed once the owner rules on this PR. §4.1 of
this audit gives that rule its strongest evidence yet: **three consecutive
rounds in which the author wrote the winning test case into his own commission
and handed it away.** A fourth clause is now earned: **run the commission before
you send it, and if the cadence does not allow that, the cadence is the defect.**

---

## Conflict of interest

The deliverables audited here were written by prior sessions of the same model
now auditing them. Every load-bearing claim is therefore backed by a command in
this document, and the author's own account is tested against primary sources
in §4.1–4.2 rather than adopted. **This audit is itself an unreviewed change
artifact and carries no independent review.** Under §3.4(2) it is not
evidence-only — it is a `.md` directly under `docs/reviews/`, which _is_ on the
allowlist, so it does not by itself require a follow-up round; the round 6 owed
for `3db6c4d` is unaffected either way.

## MemPalace drawer candidates

- `havdm/patterns` — **[PATTERN] The complete five-round anatomy of PR #139.**
  Ten merge-blocking findings plus two non-blocking notes; two lineages (the
  §3.4 mechanical test, 5 findings across rounds 1–5; the MP-LEASE destination,
  3 findings across rounds 1–4) with lineage B contained inside A, unlike
  #137's stagger. **The paragraph carrying five of the ten did not exist at the
  reviewed commit — it was born in `bcba77a`, the round-1 fix, exactly as
  #137's `tools/f5-load-path-sweep.sh` was.** Three defects were co-resident in
  `c4fd0a4` and found one per round as the reviewer's instrument deepened.
  §3.4 grew 30 → 154 lines (33% of the document), 63 of them guards and case
  law for one shell pipeline.
- `practice/review` — **The commission is a prediction, and handing it over is
  not running it.** On HAVDM PR #139, in each of rounds 3, 4 and 5 the author
  wrote the exact case that became that round's merge-blocking finding into the
  commission he sent the reviewer, and ran none of them
  (`round3.md:163-164`, `round4.md:177-179`, `round5.md:165-170`). Sharpens
  `drawer_practice_review_a4985584018e52ed44d6de54`: the failure is not absent
  imagination, it is an unexecuted self-check, and a fix-turnaround cadence
  measured at a 9-minute median is what made executing it unaffordable.
- `practice/verification` — **A clearance is scoped to the command it was given,
  and a repair that changes the command voids it.** Codex cleared `$2`-as-
  destination-mode for `git diff A..B` while naming combined records as a
  constraint on any history form; the repair adopted `git log … -m` and reused
  `$2`; under `log.diffMerges=combined`/`dense-combined`, `-m` emits combined
  records and the assertion silently passes a symlink at an allowed path.
  Extends substitution 6 of
  `drawer_practice_verification_8cccc05dfb795cb31d2ce3a6`. **Pin what you
  delegate to config: `--diff-merges=separate`, not `-m`.**
- `havdm/governance` — **R6-M1, reported not repaired.** Latent, not live
  (`log.diffMerges` unset at repo/global/system on the maintainer's machine;
  effective default `separate`). Needs a non-default config plus a merge commit
  in the range whose object-type change appears only in the merge's own record.
  One-word fix verified against all four config values.
