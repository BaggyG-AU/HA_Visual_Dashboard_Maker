# F9a brief — repair dispositions

**Author:** Claude Opus 5 (1M context) — routine-upstream seat
(`docs/governance/OPERATING_AGREEMENT.md` §3.6). Author of the reviewed brief.
**Reviewer:** OpenAI Codex / GPT-6 Astra — author of the review these rows
answer, `docs/reviews/f9a-brief-codex-review.md` (commit `926c0a8`).
**Owner gate:** micah / BaggyG-AU ruled every SEV 2 and SEV 3 finding by Ref on
2026-09-09 before any repair was committed (SEV-CAL-2 ruling 6). The rows below
record those rulings; they are not the author's choices.

Governed by `docs/governance/OPERATING_AGREEMENT.md` §3.4. One dated section per
round, appended, never rewritten.

---

## Round 1 — 2026-09-09

Review: `docs/reviews/f9a-brief-codex-review.md` (`926c0a8`), verdict
**BLOCKED-ON: §8 red-before-green requirement**. Five findings: one SEV 1, two
SEV 2, two SEV 3.

**Every finding was independently verified against source before it was
dispositioned.** All five were confirmed correct. The verification commands are
in the rows.

**Owner rulings, 2026-09-09, by Ref.** P1 is SEV 1 and is not a fix-or-defer
choice — §3.4 allows a SEV 1 to leave OPEN only as RESOLVED or by a recorded
owner ruling accepting the residual. P2–P5 were each put to the owner with
fix-now / defer / accept-residual, their costs, and the author's recommendation
including where it **disagreed** with the reviewer. The owner ruled **fix now on
all four**. On P4 and P5 the reviewer recommended fix-later; the author
recommended fix-now and said so explicitly; the owner took fix-now.

| Ref | Severity | Owner ruling                                                                                                               | Disposition  | Repair                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Blast radius                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --- | -------- | -------------------------------------------------------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | SEV 1    | Not a choice — SEV 1 must resolve                                                                                          | **RESOLVED** | §8's "Each leg must be shown RED against today's code first" is replaced. Leg 1 is now named as the only valid red leg; legs 2 and 3 are stated as controls **expected to pass**, with an explicit instruction not to manufacture a failure. The qualified standing rule is quoted (`OPERATING_AGREEMENT.md:66-73` — "where a valid red leg exists … the controlling test is whether a valid red leg exists"), and the alternative evidence it demands is named: a passing baseline recorded before the change and re-run after. | **Upstream:** none — §8 restates the owner's three named legs from `drawer_havdm_decisions_bdef071e2ead9ed0a5ff8d9c` ruling 3, and those legs are unchanged. **Downstream:** the F9a spec's test design (Sonnet) and the implementation review that checks it. No `src/`, no test, no governance text changed. The brief/spec seat boundary is unchanged — the spec still chooses the concrete tests.                               |
| P2  | SEV 2    | **Fix now** (agreed with reviewer)                                                                                         | **RESOLVED** | §9.3's proposal paragraph is **preserved unedited** as the record of what was put on 2026-09-08. A dated correction note after it states the controlling reading: the layout-card fact is **required** by option A (§2, §6 D-2), and the pre-deploy warning must agree with what was stripped — F4 measured that `App.tsx:2580` produces those words independently, so content-only changes would leave "Nothing had to be adjusted" over adjusted content. Boot-window handling (D-6) remains genuinely outside the bar.        | **Upstream:** the owner's option A ruling and the adopted cheapest-acceptable-outcome header field — both unchanged; this repair reconciles §9.3 **to** them rather than altering them. **Downstream:** the spec's scope section. ⚠ The correction narrows what a spec may omit; it does not widen F9a into F9b, and the F9a/F9b split is untouched.                                                                                |
| P3  | SEV 2    | **Fix now** (agreed with reviewer)                                                                                         | **RESOLVED** | F5's "an installed layout-card's folder is already in every captured profile" is replaced with the measured, narrower claim: true for HACS-installed resources; a manual `/local/` resource leaves no folder and would not be detectable this way. Cites `capabilityResolver.ts:35-42`, its docblock at `:32-33`, and the existing pin `tests/unit/capabilityResolver.spec.ts:75-78`. The unmeasured part is now labelled: this brief did not survey how users install layout-card.                                              | **Upstream:** none — the ruled scope (option A, carry the fact) is unchanged. **Downstream:** §9.2's cost argument, which rested on this claim, and the spec's decision on where the layout-card value comes from (D-2), which now inherits a bounded confidence instead of an overstated one. ⚠ **No new detection, capture machinery or profile migration is added or implied** — the repair narrows a sentence, not the feature. |
| P4  | SEV 3    | **Fix now** — ⚠ reviewer recommended fix-later; author recommended fix-now and disagreed on the record; owner took fix-now | **RESOLVED** | F7's heading "only in the palette" is corrected to "in the UI but not in the export". Both consumers are named — `CardPalette.tsx:269` and `BaseCard.tsx:302` (placed-card marking, F4/#129) — with the enumerating command. The source line is corrected from `cardAvailability.ts:41` to `:40`.                                                                                                                                                                                                                                | **Upstream:** none. **Downstream:** the spec's reading of where the profile is already consumed — the reason the author argued against deferring: a spec author would have read a false statement about the code. The export-path gap that F9a closes is restated and unchanged; no consumer behaviour, and no resolver behaviour, is asserted to change.                                                                           |
| P5  | SEV 3    | **Fix now** — ⚠ reviewer recommended fix-later; author recommended fix-now and disagreed on the record; owner took fix-now | **RESOLVED** | §9's "keeps the options as they were put" is scoped to the **three** decisions that have subsections (§9.1–§9.3). The fourth — push — is stated as an outcome-only record, its options **not reconstructed**, pointing at ruling 4 of `drawer_havdm_decisions_cf0c188aaf75f2cd622faadc` as authoritative. The §11 row repeating the claim is corrected to match.                                                                                                                                                                 | **Upstream:** none — no ruling's substance changes; the push outcome stands. **Downstream:** §11's verification table only. ⚠ **No original options were invented.** The reviewer noted the original multiple-choice transcript was unavailable to it; it was not reconstructed here either, which is why the claim was narrowed rather than the record extended.                                                                   |

### What this round did NOT establish

- No `src/`, test, governance, template, board, Issue or `[STATE]` **text**
  change was made by these repairs. The branch remains docs-only:
  `git diff --name-only main..HEAD | grep -cv '^docs/'` = 0.
- No runtime behaviour was executed by the author this round. The reviewer ran
  a pure-module probe (its §3b); its result is the reviewer's evidence, not
  re-derived here.
- P3's repair bounds a **claim**. It does not measure how many real users
  install layout-card outside HACS — that remains unmeasured and is now
  labelled as such in F5.

### Follow-up owed

Five repairs exist, so **STRAT-D7 applies: a scoped follow-up by the same
reviewer** (OpenAI Codex / GPT-6 Astra), scope = this repair diff **plus the
declared blast radius above**, confirming the claimed closures, sweeping the
repairs for introduced defects, and independently verifying the radius
declaration. A wrong or missing radius is itself a finding.
