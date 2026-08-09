Author: Claude Opus (claude-code)
Reviewer: OpenAI Codex
Owner gate: micah/BaggyG-AU

# Author execution ledger — the self-pass gate, second attempt

**REGENERATED for this branch. Nothing here is copied from PR #140** — that
ledger was withdrawn with the rest of the mechanism in `03c817c` and is not on
this branch in any form. Every row below records a check run on
`feature/self-pass-gate`.

One row per commissioned check in
`docs/reviews/self-pass-gate-codex-commission.md`.
`tests/unit/author-ledger.spec.ts` derives the required row set from that
commission and goes red on a missing row, a duplicate row, an orphan row, an
`UNRUN` row, or an unrecognised disposition.

governed fingerprint: `ef6adc60b8e4`

## Rows

| ID  | Check                                         | Disposition | Evidence                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | --------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| C01 | Commit messages inside the certified scope    | FIXED       | Branch commit messages are now a CHECKED POPULATION: the `M1` test extracts count candidates from `git log --format=%H%n%B base..HEAD` and fails on any not mentioned in this ledger. ⚠ Deliberately NOT hashed into the fingerprint — recording a new hash needs another commit, whose message changes the hash again, an infinite regress. CI with `fetch-depth: 0` runs this suite on the committed head. |
| C02 | Fail closed with no base ref; CI resolves one | FIXED       | Constructed a `--depth 1 --single-branch` clone with no `main`/`origin/main`: detector **FAILED** (was: `it.skip` with exit 0). Generator with `HAVDM_BASE_REF=refs/heads/does-not-exist` exits **2**. `.github/workflows/ci.yml` now checks out `fetch-depth: 0`.                                                                                                                                           |
| C03 | Required rows derived from the commission     | FIXED       | Required IDs are parsed from the tracked commission's `Commissioned checks` table, not from this file. Control leg: complete ledger → **GREEN**. Known-bad: deleted row `C07` → **RED**. Both run against the real spec via `HAVDM_LEDGER_REPO`.                                                                                                                                                             |
| C04 | Renames decomposed; preimage visible          | FIXED       | Fixture renamed `docs/governance/thing.md` → `docs/reviews/thing.md`. `git diff --name-only` emits only `docs/reviews/thing.md`; `--name-status -M` emits `R100 docs/governance/thing.md docs/reviews/thing.md`. Detector now takes the second and went **RED** as required.                                                                                                                                 |
| C05 | Fingerprint sees untracked additions and mode | FIXED       | Baseline `8fa10c60a8bb`. Untracked `docs/governance/untracked.md` → `14985034dd70`. Removed → back to `8fa10c60a8bb` (control). `chmod +x` on identical content → `15e245c9633f`.                                                                                                                                                                                                                            |
| C06 | Live PR-body read mandatory; `gh` propagates  | FIXED       | `--require-pr 999999999` exits **2** with an explicit refusal; best-effort `--with-pr 999999999` exits 0 and says the body was not read. The old `\|\| true` fail-open path is gone. Decidable SHA checking is delegated to `tools/check-pr-evidence.sh` (PR #138) rather than re-implemented as a grep.                                                                                                     |
| C07 | Gate goes RED on a removed commissioned row   | FIXED       | Demonstrated, not asserted — see C03's known-bad leg. This is the one the prior review required be proven on known-bad input.                                                                                                                                                                                                                                                                                |
| C08 | Ledger regenerated, not copied                | PASS        | `git log --all --oneline -- docs/reviews/governance-arb-r8-mp-lease-author-ledger.md` finds no such file on this branch; every row here cites a run performed on `feature/self-pass-gate`.                                                                                                                                                                                                                   |
| C09 | PR body does not claim the M1 class is closed | PASS        | The append-only observation control (correction 6) is deliberately NOT built here, at the owner's direction. The PR body says so explicitly and claims only the five repairs.                                                                                                                                                                                                                                |
| C10 | No normative text added to governed paths     | PASS        | `git diff --name-only -M origin/main...HEAD` plus `git status --porcelain`, filtered against `docs/governance/`, `docs/templates/`, `ai_rules.md`, `CLAUDE.md`: **0 matches**. A defect in this PR is ordinary PR evidence, not a governance amendment.                                                                                                                                                      |

## Commit-message claim candidates (the M1 leg, demonstrated)

This branch's content commit turned a green pre-commit run **RED**. That is the
whole point of M1: on PR #140 the author filled the ledger, ran the gate before
committing, reported green, and the commit then introduced 13 undispositioned
candidates that the certificate could not see. Here the commit invalidated the
run, and these three had to be dispositioned before the gate would pass again.

| Candidate      | Disposition | Evidence                                                                                                                   |
| -------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `1342 tests`   | PASS        | `./tools/checks` on this branch: 1342 passed. New baseline, up from 1335 on `9e95e4c`; the +7 are this PR's own spec.      |
| `102 files`    | PASS        | Same run: 102 test files, up from 101. The +1 is `tests/unit/author-ledger.spec.ts`.                                       |
| `145 warnings` | PASS        | Same run: `✖ 145 problems (0 errors, 145 warnings)` — unchanged from the `9e95e4c` baseline, so this PR adds no lint debt. |

## `tools/check-pr-evidence.sh` against the LIVE PR body (the PR #138 DoD item)

`docs/testing/TESTING_STANDARDS.md` makes running this a definition-of-done
item: every candidate must be justified or removed. Run against the live body of
PR #141 — not a local copy — it reported **8 candidates**. None is a defect, and
each is justified here rather than left to the reviewer to re-derive.

| Candidate                                                                 | Justification                                                                                                                                                                   |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0 errors`, `145 warnings`, `1342 passed`, `102 files`                    | All four are MEASURED on this branch by the `./tools/checks` run reported in the body, and the last three are dispositioned row-by-row above.                                   |
| "the validator read **only** rows the author supplied"                    | Quotation of the prior review's M3 finding, not a fresh claim.                                                                                                                  |
| "`--name-only` emits **only** a rename's destination"                     | MEASURED in the fixture: `--name-only` → `docs/reviews/thing.md`; `--name-status -M` → `R100 docs/governance/thing.md docs/reviews/thing.md`.                                   |
| "**never** read the commission at all"                                    | MEASURED against attempt one's source: it contains no reference to `prompts/`, which `.gitignore` ignores wholesale.                                                            |
| "it **cannot** see a question the author never wrote"                     | A stated LIMIT of the mechanism, deliberately universal. It weakens the claim rather than strengthening it, which is the direction that needs no enumeration.                   |
| "returns to baseline when reverted"                                       | MEASURED control leg: `8fa10c60a8bb` → `14985034dd70` → `8fa10c60a8bb`.                                                                                                         |
| SHAs `c8678d2`, `03c817c` flagged "ancestor of HEAD — STALE if 'current'" | Both are deliberate IMMUTABLE pins to historical artifacts — the adversarial review document and the withdrawal commit. Neither sentence implies "current". Correct as written. |

⚠ The body pins **no head SHA at all**, which is that script's own advice: a head
SHA in prose goes stale on the next commit. An earlier draft of this ledger did
pin the content commit, and amending the commit invalidated it within minutes —
so the reference was replaced with wording that pins nothing.

## A defect this gate found in itself, during this PR

Writing `PLACEHOLDER00` into the fingerprint line above **passed**. The
assertion keyed its regex on `[0-9a-f]{12}`, so a malformed value simply failed
to match and the check was skipped in silence — an unparseable certificate
behaving as a no-op instead of a failure. It now matches the declaration first
and validates the shape separately, and the same input is a loud failure.

Recorded rather than quietly fixed, because it is the exact class this
mechanism exists to catch: **a check that cannot fail is not evidence**, and it
was found by running the thing rather than reasoning about it.

## What this ledger does not establish

- **It cannot see a question that was never written.** The commission is tracked
  so a written question cannot be silently dropped and its deletion is a visible
  diff. That is visibility, not completeness.
- **Row atomicity is mechanical; row honesty is not.** Nothing stops a broad or
  evasive assertion inside a row.
- **`fetch-depth: 0` is verified against the workflow file and a constructed
  shallow clone, not against a hosted runner**, and not for forked PRs.
- **The append-only observation control is not built**, so the PR #140 M1 class
  is not addressed and is not claimed to be.
