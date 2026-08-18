Author: Claude Fable 5 (repair author)
Reviewer: OpenAI Codex / GPT-5.6 Sol (same reviewer — scoped follow-up per `docs/governance/OPERATING_AGREEMENT.md` §3.4)
Owner gate: micah/BaggyG-AU ruled F1 option (a) on 2026-08-19; the scoped follow-up review confirms the repair before merge

# Repair dispositions — PR #148 (governance codification of D1–D18)

Per Operating Agreement §3.4 (STRAT-D7): the author answers every finding in
a committed RESOLVED/REGRESSED disposition table carrying, per repair, a
blast-radius statement. One dated section per round, appended, never
rewritten. ⓘ **This file is the first live use of the STRAT-D7 lifecycle,
running on the branch that introduces it.**

## Round 1 — 2026-08-19

Review: `docs/reviews/governance-codification-d1-d18-codex-review.md`
(verdict APPROVE; one SEV 2 finding).

| Finding                                                                                                                                                        | Severity | Disposition                                       | Repair                                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1 — the second ledger addendum claimed both old-rule quotations carry a PR #139-era label; `C39` does, the self-pass commission's class-(d) quotation did not | SEV 2    | **RESOLVED** — owner ruled option (a), 2026-08-19 | (1) A dated supersession banner added beside the quotation in `docs/reviews/self-pass-gate-codex-commission.md` (required-reading section; the quoted rule text itself unedited). (2) The ledger addendum sentence rewritten to be literally true, naming the finding and the ruling (`docs/reviews/self-pass-gate-author-ledger.md`) |

**Blast-radius statement (per repair):**

- **Upstream reliances:** none. No rule text, template, or code consumes
  either edited sentence. The self-pass gate derives its required rows from
  the commission's "Commissioned checks" table only, which is untouched —
  proven by the post-repair gate run below, not asserted.
- **Downstream consumers:** readers of the two documents (the banner is the
  repair's whole purpose); the gate's `parseCommission()` population is
  unchanged (banner sits in required reading, outside the parsed table). No
  shared-DSL surface is touched, so the `ai_rules.md` §4b consumer inventory
  is not applicable to this records-only repair.
- **Governed rule surfaces:** none touched. Both edited files live under
  `docs/reviews/`, outside the governed fingerprint set — the certificate's
  governed fingerprint remains `8b4eb5d26986`, and the ledger-spec run below
  confirms the certificate leg still passes.

**Evidence, measured after the repair:**

- `npx vitest run tests/unit/author-ledger.spec.ts` → 1 file passed, **9/9
  tests** (certificate and freshness legs green with the repair in the tree).
- The commissioned Q4 sweep re-run: over the **committed tree** the
  case-insensitive `no automatic follow.?up` enumeration returns hits only in
  `docs/reviews/` historical records (the PR #142 f3-theme-canvas arc, the
  PR #139 review record, `C39`, the now-bannered commission quotation, and
  the PR-3 review itself quoting the replaced default) — the live Operating
  Agreement returns zero. ⚠ Honest instrument note, kept rather than
  smoothed: the author's repo-root sweep tool respects `.gitignore` and so
  silently skipped the gitignored `prompts/` directory; targeting `prompts/`
  explicitly surfaces the old PR/round prompt records the reviewer counted
  (plus each commission's self-quote of the sweep command itself). Those are
  uncommitted, filename-dated round records, not live authority — consistent
  with the reviewer's 23-hit classification, which stands as the fuller
  enumeration.
- `npx prettier --check` clean on both edited files.

**What was deliberately not changed** (per the review's "must not change"
rail): the historical quoted rule text, row `C39`, the byte-protected §3.4
paragraphs, D7's universal trigger, and every reviewer-authored file.
