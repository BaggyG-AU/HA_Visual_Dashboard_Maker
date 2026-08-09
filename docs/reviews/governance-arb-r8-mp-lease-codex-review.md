Author: OpenAI Codex, 2026-08-09
Reviewer: REQUIRED — a different model; not yet run
Owner gate: BaggyG-AU adjudicates this review and remains the sole merger of PR #140

# Independent artifact review — PR #140 round 1

## Verdict

**CHANGES-REQUIRED — high confidence.** The ARB-R8 extraction is faithful, and
the disclosed §3.3 clarification was deliberately and coherently left with
REV-IMPL on PR #139. MP-LEASE is not yet carried consistently: the operational
protocol still offers a writer-lease bypass to the reviewer, and the rulings
index points at an evidence review rather than the existing owner-decision
drawer.

**Artifact reviewed:** PR #140, branch
`feature/governance-arb-r8-mp-lease`, content commit
`62d382b37c0701c00840932838b7b6b816def625` against `main` at
`a6ce103c560ac45331321c8956bb445c789fa9d0`.

## Findings

### M1 — MERGE-BLOCKING: the operational protocol still offers a lease-bypassing reviewer write

The new highest-precedence rule says the review file is the independent
reviewer's **single destination** whenever MemPalace cannot take the reviewer's
write (`ai_rules.md:325-331`). The Operating Agreement says the trigger is the
writer lease refusing the reviewer (`docs/governance/OPERATING_AGREEMENT.md:94-119`).

The operational document linked from the repaired refusal paragraph still
says:

> `checkpoint` is not in the server's `_MUTATING_TOOLS` set, so a
> read-only-latched server can still write through it. Useful in an emergency

and then instructs the reader to restart after `checkpoint` succeeds while
`add_drawer` refuses
(`docs/governance/MEMPALACE_PROTOCOL.md:129-136`). That is a second action for
the exact lease-refused state MP-LEASE is meant to settle: bypass the lease and
write from the reviewer, rather than record the candidate in the committed
review file for the author to file with reviewer provenance. Calling the bypass
an unintended hole does not remove the adjacent “Useful in an emergency”
permission.

**Class swept:** every tracked instruction I found that governs where a
reviewer's drawer candidates go, or how the reviewer proceeds after a refused
write. I read `ai_rules.md` §11, the complete `CLAUDE.md`, the complete
Operating Agreement, the complete adversarial-review template, and the complete
MemPalace protocol. The four direct rule files and the template select the
review file; `MEMPALACE_PROTOCOL.md` is the affected operational member. The
author's search for files that _name a destination_ was narrower than the class
of instructions that _provide an alternate route to write the notes_.

Starting enumeration:

```bash
git grep -n -i -E \
  'drawer.?candidate|MemPalace.{0,80}(unavailable|absent)|writes? (are|is )?refused|writer lease|local-memory' \
  -- '*.md' ':!docs/reviews/**' ':!docs/archive/**'
```

**Required correction:** amend `docs/governance/MEMPALACE_PROTOCOL.md` §5.2 to
say that an independent reviewer must not use the `checkpoint` bypass after a
writer-lease refusal and instead follows MP-LEASE via its committed review
file. Preserve the emergency note, if retained, for roles and circumstances
that do not contradict the reviewer-specific ruling.

### M2 — MERGE-BLOCKING: the MP-LEASE authority cell points at evidence, not the owner ruling

The Agreement promises that it “points at the authoritative MemPalace drawer
for each ruling's full narrative”
(`docs/governance/OPERATING_AGREEMENT.md:15-22`), and §4 says the Authority
column is the record rather than narrative supplied by the index itself
(`:193-199`). The MP-LEASE row instead cites `this document §2` plus
`drawer_havdm_review_65aecb8d3cb0de6511b03648` (`:216`). The drawer resolves,
but it is the round-1 review of PR #137. Its own lease section applies the old
PR-body fallback and recommends making a convention standing; it is evidence
for the collision, not the owner's later ruling.

The actual owner ruling resolves at
`drawer_havdm_decisions_9f91fa0a88ed9df5b21c2482`. Its MP-LEASE section states
the committed-review-file destination, `added_by="<reviewer>"`, and both
prohibitions verbatim. I found it by searching the `havdm/decisions` room and
then fetched it by canonical ID; the current row does not point to it.

**Class swept:** the two new §4 rows and their full-narrative authorities.
ARB-R8 points to its owner-decision drawer and that drawer states ARB-R8.
MP-LEASE is the affected row.

**Required correction:** make the MP-LEASE Authority cell point to
`drawer_havdm_decisions_9f91fa0a88ed9df5b21c2482`. The PR #137 review may
remain as separately labelled evidence, but it must not stand in for the owner
ruling.

### N1 — NON-BLOCKING: the commission and PR evidence were not refreshed after the amended commit

The prompt pins `ba6492a` and 90 insertions / 17 deletions. The live PR and
checkout instead identify one content commit at `62d382b`, with 93 insertions /
18 deletions. The amended commit contains the disclosed three-line
`CLAUDE.md` repair, so the self-pass claim that `CLAUDE.md` is byte-identical to
PR #139 is false; `diff -q` reports it different. `ai_rules.md` and the
adversarial-review template remain byte-identical.

The header-history result is substantively sound but its population label is
also wrong: the local graph contains 21 `ai_rules.md` revisions and 10
`CLAUDE.md` revisions, 31 file-revision pairs but 24 unique commits. No checked
revision carried the header, and the Operating Agreement control did.

```bash
git rev-parse HEAD
git diff --stat main...62d382b
diff -q CLAUDE.md \
  <(git show feature/governance-review-invariant-implementation:CLAUDE.md)
git log --all --format=%H -- ai_rules.md CLAUDE.md | sort -u | wc -l
```

Correct the live PR evidence and future copies of the commission. This does not
change the two rulings' operative carriage, so it is not a merge blocker.

### N2 — NON-BLOCKING, PRE-EXISTING: one literal path in a changed file is already stale

`ai_rules.md:15` tells the reader to open `docs/releases/RELEASES.md`. That path
does not exist at `main` or at the reviewed commit; the tracked file is
`docs/RELEASES.md`. Blame traces the bad path to `939d4b5a`, outside PR #140's
edited hunk, so it is not an extraction regression and should not block these
rulings.

```bash
git cat-file -e 62d382b:docs/releases/RELEASES.md  # fails
git cat-file -e 62d382b:docs/RELEASES.md           # succeeds
git blame -L 15,15 main -- ai_rules.md
```

## Commissioned answers

### §A — Did the extraction drop anything operative?

**No accidental omission found.** I read the complete #139-to-#140 Operating
Agreement diff as a behavioral extraction, not just the supplied token search.
The disclosed sentence saying one clean approval is not the three-consecutive
zero-finding spec-review trigger is independent of class (d), but it was
deliberately left. The owner-decision drawer records that clarification inside
the REV-IMPL ruling, while PR #140 is scoped to ratifying ARB-R8 and MP-LEASE.
Keeping it with PR #139 is therefore coherent rather than an extraction defect.
If #139 is abandoned the clarification will be lost, but that risk is disclosed
and does not silently broaden #140.

The positive extraction checks also hold:

- the Operating Agreement front matter plus §§1–2 are byte-identical to #139;
- the §3 preamble, §3.2 and §3.3 are byte-identical to `main`;
- the ARB-R8 §3.1 paragraph is byte-identical to #139; and
- `ai_rules.md` and the adversarial-review template are byte-identical to #139.

`CLAUDE.md` is intentionally different because of the disclosed repair; N1
corrects the stale contrary claim.

### §B — Did it leave a dangling pointer?

**No pointer to §3.4, §3.5, REV-IMPL, REV-RERUN or class (d) remains in the four
changed files.** The zero-result extraction was proven live against #139:

```bash
pattern='REV-IMPL|REV-RERUN|class \(d\)|class-\(d\)|§3\.4|§3\.5|evidence-only'
for path in CLAUDE.md ai_rules.md docs/governance/OPERATING_AGREEMENT.md \
  docs/templates/ADVERSARIAL_REVIEW.md; do
  grep -Ec "$pattern" "$path" || true
done
git show feature/governance-review-invariant-implementation:docs/governance/OPERATING_AGREEMENT.md |
  grep -Ec "$pattern"
```

The current files return `0, 0, 0, 0`; the #139 control returns `22`. The ten
full drawer IDs present in the four changed files all resolved through
`mempalace_get_drawer`. The carriage-related file and section pointers resolve,
and `gh pr view 139` confirms the cited PR #139 record is currently open and
addressable. M2 is a semantic authority-target defect rather than a missing
drawer, and N2 is the one pre-existing unrelated literal path found by the
broader file sweep.

## Checks, confidence, and limits

I read all four changed files end to end, including all 216 lines of the
Operating Agreement; read `MEMPALACE_PROTOCOL.md` end to end; inspected
`git diff main...62d382b` and the complete Operating Agreement delta against
PR #139; fetched the governing decision/review drawers; and inspected the live
PR metadata for #139 and #140.

`git diff --stat main...62d382b -- src/ tests/` is empty. I did not run e2e,
integration, UAT, a packaged application, or live Home Assistant: none can
decide this docs-only carriage question. `./tools/checks` is reported below
after running it against the tree containing this review document.

Confidence is **high**. The weakest judgement is M1's scope: the higher-
precedence reviewer exception can be reconstructed despite the protocol, but a
linked operational procedure that advertises a bypass is not faithful carriage
of a ruling whose purpose is to settle what the reviewer does after that exact
refusal.

## Verification

The first `./tools/checks` run returned **REAL_EXIT=1** at step 2: lint completed
with 0 errors / 145 warnings, then Prettier identified this new review file; the
run did not reach typecheck or unit and was not 4/4. After applying the
repository formatter, the complete rerun returned **REAL_EXIT=0, 4/4 steps**:
lint 0 errors / 145 warnings; format clean; typecheck clean; unit 1335 passed
across 101 files.

The normal `mempalace_add_drawer` filing attempt returned peer-writer error
`-32001` and identified this server as read-only. I did not retry, use the
`checkpoint` bypass, kill the holder, or set
`MEMPALACE_MCP_ALLOW_PEER_WRITER`; the candidate below is the MP-LEASE handoff.

## MemPalace drawer candidates

- `wing="havdm"`, `room="review"`, `added_by="codex"` — `[REVIEW] CODEX
INDEPENDENT REVIEW OF PR #140 (ARB-R8 AND MP-LEASE), ROUND 1 —
CHANGES-REQUIRED, HIGH CONFIDENCE. Reviewed content commit 62d382b against
main a6ce103. ARB-R8 extraction is faithful; PR #139's single-clean §3.3
clarification was deliberately and coherently left with REV-IMPL. Two
merge-blockers remain in MP-LEASE carriage: MEMPALACE_PROTOCOL.md §5.2 still
advertises checkpoint as a writer-lease bypass for the same refused-write
state that must route an independent reviewer to its committed review file;
and the §4 MP-LEASE authority cell cites PR #137 review evidence rather than
the existing owner-ruling drawer
drawer_havdm_decisions_9f91fa0a88ed9df5b21c2482. Non-blocking: the live PR
evidence still pins pre-amend ba6492a/stats and falsely calls CLAUDE.md
byte-identical to #139; its 31 population is file-revision pairs, not unique
commits. The pre-existing ai_rules.md path docs/releases/RELEASES.md is also
stale; docs/RELEASES.md exists. Review document:
docs/reviews/governance-arb-r8-mp-lease-codex-review.md. Only the owner
adjudicates and merges. Verification after formatting: ./tools/checks
REAL_EXIT=0, 4/4 steps, lint 0 errors / 145 warnings, format clean, typecheck
clean, unit 1335 passed across 101 files.`
