Author: Claude Opus 5 (claude-code), 2026-08-09
Reviewer: this is the author's own execution record, not a review — it is the
input a reviewer checks, per `docs/reviews/pr139-author-process-review-codex.md`
Owner gate: BaggyG-AU merges PR #140; the agent never merges

# Author execution ledger — PR #140 (ARB-R8 + MP-LEASE), repair round

AUTHOR SELF-PASS: COMPLETE; target=05780a57bb4d; OPEN=0

Enforced by `tests/unit/author-ledger.spec.ts`, which runs inside
`npm run test:unit` → `./tools/checks` → `.github/workflows/ci.yml`. `target`
is a content fingerprint over the governed paths from
`bash tools/claims-worklist.sh --fingerprint`; it changes the moment any
certified file changes, so it cannot survive an amend.

## A. Commissioned checks — the findings this round answers

| ID      | Probe                                                                                                                                    | Expected (declared before running)                            | Actual                                                                                                                                                                 | Disposition |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| M1      | Does `MEMPALACE_PROTOCOL.md` still offer the reviewer a lease bypass? `grep -ci checkpoint` on each of the four originally-changed files | 0 in all four, so the prohibition never names it              | 0, 0, 0, 0 — MP-LEASE's prohibitions name only process-kill and the env var                                                                                            | FIXED       |
| M1b     | Read §5.2 end to end; does it sanction a write after refusal?                                                                            | It calls the hole unsanctioned but adjacently permits it      | "Useful in an emergency"; reached from the paragraph repaired in `62d382b`                                                                                             | FIXED       |
| M1c     | Class sweep: any OTHER text offering the reviewer a write route?                                                                         | Possibly `ai_rules.md` §11                                    | `ai_rules.md:329` lists `mempalace_checkpoint` as a filing route — a real class member Codex did not name                                                              | PASS        |
| M1d     | Does `:325-327`'s single-destination clause already displace `:329`?                                                                     | Yes, it precedes it and is explicit                           | Confirmed by reading §11 straight through; §5.2 was the only text attaching refusal semantics to the bypass, so it is the only edit                                    | PASS        |
| M2      | Is `drawer_havdm_review_65aecb8d3cb0de6511b03648` the owner's MP-LEASE ruling?                                                           | Suspected evidence, not ruling — published as weakest claim 3 | Fetched: it is Codex's round-1 review of PR #137; its lease section applies the OLD PR-body fallback and RECOMMENDS the convention                                     | FIXED       |
| M2b     | Does `drawer_havdm_decisions_9f91fa0a88ed9df5b21c2482` state MP-LEASE?                                                                   | Yes                                                           | Fetched: states the review-file destination, `added_by="<reviewer>"`, and both prohibitions                                                                            | PASS        |
| M2c     | Does that drawer say something now false?                                                                                                | Unknown                                                       | It says PR #139's merge ratifies all four rulings — false for these two after the split; a superseding drawer is owed; superseding drawer named in this round's report | DISCLOSED   |
| N2      | `ai_rules.md:15` path resolves?                                                                                                          | Unknown                                                       | `docs/releases/RELEASES.md` missing, `docs/RELEASES.md` exists; blame `939d4b5a`, outside this PR's hunk; Codex ruled it non-blocking — one defect, one PR             | DISCLOSED   |
| PR-BODY | Re-read the LIVE body at the current fingerprint and check every claim in it                                                             | Stale: it predates both repairs                               | Stale on three counts, all corrected in this round's push                                                                                                              | FIXED       |
| GATE    | `./tools/checks`, real exit code and 4/4 step count                                                                                      | exit 0, 4/4                                                   | see Verification below                                                                                                                                                 | PASS        |
| RED     | Does `author-ledger.spec.ts` fail with no ledger present?                                                                                | Must fail, else it proves nothing                             | Failed: "Expected exactly one docs/reviews/<branch>-author-ledger.md"                                                                                                  | PASS        |
| LIVE-1  | Does `claims-worklist.sh` fail loudly on bad input rather than printing nothing?                                                         | Non-zero exits                                                | bad base → 3, bad arg → 2, empty result → 0                                                                                                                            | PASS        |
| LIVE-2  | Is the fingerprint stable across ledger edits and broken by governed edits?                                                              | Stable / breaks                                               | `e9d7f062b820` unchanged after a `docs/reviews/` edit; `83140c97e279` after touching `ai_rules.md`; restored                                                           | PASS        |

## B. Claim candidates — generated, not remembered

Population from `bash tools/claims-worklist.sh` (35 rows). NORMATIVE = a rule or
a quoted prohibition, not an empirical claim.

| ID  | Probe                                                                                               | Expected         | Actual                                                                                                                     | Disposition |
| --- | --------------------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------- |
| C01 | "31 commits" — unique commits or file-revision pairs?                                               | 31 unique        | **21 + 10 = 31 PAIRS across 24 UNIQUE commits**; 7 touch both. Conclusion (0 headers) holds, the number did not            | FIXED       |
| C02 | "31 lines" below — re-measure after my own repair                                                   | 31               | **33** — the repair added two lines to that paragraph                                                                      | FIXED       |
| C03 | "all four" changed files / surfaces                                                                 | 4                | **5 governed files now** (MEMPALACE_PROTOCOL.md joined); the "all four surfaces state one rule" form was already withdrawn | FIXED       |
| C04 | "all six" rounds of PR #137 refused the lease                                                       | 6 of 6           | Confirmed against the #137 round-1 record and the [STATE] drawer                                                           | PASS        |
| C05 | "never have" carried an `Author:` header                                                            | none ever        | Enumerated over 24 unique commits: 0 hits; loop returns 1 on the OA control                                                | PASS        |
| C06 | "216 lines" — OA length after the M2 edit                                                           | 216              | `wc -l` = 216 (the edit changed a cell inline)                                                                             | PASS        |
| C07 | "101 files" / "0 errors" / "145 warnings"                                                           | baseline         | From the real gate run below                                                                                               | PASS        |
| C08 | "4 steps" — the 4/4 step count                                                                      | 4                | Verified by the documented `grep -cE` on the log                                                                           | PASS        |
| C09 | "six rounds" on PR #139                                                                             | 6                | Six reviewer commits: `bfcc01a`,`446271d`,`04bd02a`,`34fbc1c`,`818b9d2`,`723fcfe`                                          | PASS        |
| C10 | "two rulings" ship here / "three rulings" first proposed                                            | 2 and 3          | 2 shipped (ARB-R8, MP-LEASE); the 3-ruling claim is quoted as the corrected error                                          | PASS        |
| C11 | "two branches" / "two documents"                                                                    | 2 each           | #139 and #140; `ai_rules.md` and `CLAUDE.md`                                                                               | PASS        |
| C12 | "0 ship-gates" (ARB-R6 row: gates, not UAT cards)                                                   | quoted row       | Unchanged pre-existing index text                                                                                          | NORMATIVE   |
| C13 | "none carries" an Author header                                                                     | see C05          | Same enumeration                                                                                                           | PASS        |
| C14 | "only one" process holds the writer lease                                                           | true             | `MEMPALACE_PROTOCOL.md` §5.1, MemPalace issue #1818                                                                        | PASS        |
| C15 | "never kill" / "never set" / "never merges" / "never writes" / "never uses"                         | rules            | Quoted prohibitions from MP-LEASE and the autonomy agreement                                                               | NORMATIVE   |
| C16 | "never re-evaluates" / "never succeed"                                                              | server behaviour | §5.1's measured latch behaviour, unchanged by this PR                                                                      | NORMATIVE   |
| C17 | "every agent" / "every non-reviewing" / "every form" / "every time" / "every release" / "every uat" | rules            | Scope statements in the invariant and cadence, not counts                                                                  | NORMATIVE   |
| C18 | "always warn" (ARB-R3 lossy export)                                                                 | rule             | Pre-existing index row                                                                                                     | NORMATIVE   |
| C19 | "only if" / "only when" / "only here"                                                               | rules            | Conditional scoping in §2 and §11                                                                                          | NORMATIVE   |

## C. What this ledger does NOT reach

- It cannot decide whether a claim is TRUE — only that one was dispositioned.
- It would **not** have caught M1. That surface was examined and dropped without
  being written down; no generator enumerates an unrecorded thought. The
  append-only observations discipline (runner-up 1 of the process review) is the
  answer to that and is not yet mechanised.
- `NORMATIVE` is a one-word escape hatch. Nothing stops it being over-used; the
  reviewer sees the ledger and can attack any row.
- The generator is a grep. Its key is published in `tools/claims-worklist.sh`
  so a reviewer can attack the key rather than guess it. Measured: the naive
  "any 2+ digit number" key returned 185 hits on 435 lines and was unusable.

## Verification

`./tools/checks` — reported below with its real exit code and step count.
