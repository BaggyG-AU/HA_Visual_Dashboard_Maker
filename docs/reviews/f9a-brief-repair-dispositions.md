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

---

## Round 2 — 2026-09-09

Follow-up: `docs/reviews/f9a-brief-codex-review-followup.md` (`a27df25`), verdict
**CLEAR-WITH-FINDINGS** — the round-1 blocker is gone and there is no SEV 1.
Closures confirmed by the reviewer: **P1, P2, P4 RESOLVED**. Live: **P3
PARTIALLY RESOLVED (SEV 2)**, **P5 PARTIALLY RESOLVED (SEV 3)**, and a new
**P6 (SEV 3)** against the round-1 radius declarations themselves.

All three were independently verified against source before dispositioning and
all three were confirmed correct. The owner ruled **fix-now on all three** by
Ref on 2026-09-09 before any repair was committed (SEV-CAL-2 ruling 6). ⚠ On P6
the reviewer recommended fix-later; the author recommended **fix-now** and said
so, on the ground that this Round 2 section was being written for P3 and P5
regardless, so correcting the radius account here costs nothing over deferring
it to a board item. The owner took fix-now.

⚠ **Round 1's rows are NOT edited.** This file is append-only; Round 1 stands as
the historical record, including its inaccurate "Upstream: none" cells, and this
section supersedes them.

| Ref | Severity | Owner ruling                                                                                                               | Disposition  | Repair                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Blast radius — **reliances, not edits**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --- | -------- | -------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P3  | SEV 2    | **Fix now** (agreed with reviewer)                                                                                         | **RESOLVED** | The round-1 repair replaced one wrong claim with another; both are now retired. F5 states the **measured, lexical** condition: `resourceFolderFromUrl` returns the segment after the first `/hacsfiles/` occurrence and `''` when the marker is absent. Two errors are named explicitly — **HACS installation is not sufficient** (repository metadata fills only `versions`, `capabilityResolver.ts:68-72`, never `installedFolders`), and **"absolute URLs are excluded" is false** (`https://…/hacsfiles/<f>/x.js` yields `<f>`; so does a marker in a query string). The brief now records that it **cited a docblock as evidence of behaviour the implementation contradicts**, which is how the wrong claim survived a repair round. The dependants the follow-up said were missed are qualified: **§9.2's option A cost cell** and **§6 D-2**.                         | **Upstream reliances:** `capabilityResolver.ts:35-42` (extractor), `:56-60` (collection), `:68-72` (HACS metadata → `versions` only); `capabilityProfile.ts:63-77` (builder); `tests/unit/capabilityResolver.spec.ts:75-78` (what is actually pinned); the owner's option A ruling `drawer_havdm_decisions_cf0c188aaf75f2cd622faadc` ruling 2. **Downstream consumers:** §6 D-2, §9.2's option A cost cell and recommendation, and the future spec's derivation of the layout-card value. ⚠ **Also downstream and OUT OF THIS FILE:** ruling 2 of that same drawer repeats the retired "every captured profile" phrasing — corrected in the drawer this round, since the author is its authorised filer. **Not changed:** the resolver, the profile shape, option A, the carry-only scope, or the spec's ownership of the folder name. |
| P5  | SEV 3    | **Fix now** (agreed with reviewer)                                                                                         | **RESOLVED** | Two record defects, both the author's. **(a)** The round-1 repair deleted a sentence from §9.3's proposal while asserting the paragraph was "preserved unedited". The historical bullet is now **restored verbatim from commit `0bfeb6c`** — extracted programmatically from git and verified by containment, not retyped — and the dated correction is placed **outside** it. **(b)** The preservation claim, already narrowed once from four decisions to three, was still wrong. Measured against the page: **§9.2 alone reproduces its alternatives** (A/B/C); §9.1 and §9.3 preserve the reasoning as put but not the enumerated alternatives; push is an outcome only. §11's repeated claim is corrected to match. **No alternative has been reconstructed anywhere** — the original instrument survives in no artifact or drawer, and both reviewer and author say so. | **Upstream reliances:** commit `0bfeb6c` (the only source of the historical §9.3 text); `drawer_havdm_decisions_cf0c188aaf75f2cd622faadc` ruling 4 (push); the round-1 repair diff `926c0a8..c0c0125`, which is the evidence of the deletion. **Downstream consumers:** §11's verification row; any reader treating §9 as the history behind a locked brief. **Not changed:** the selected reviewer, option A, the adopted header fields, the push outcome, the reviewer-seat correction, or P2's now-explicit warning requirement. ⚠ The restored sentence is **historical text, not current guidance** — the correction note that follows it controls.                                                                                                                                                                               |
| P6  | SEV 3    | **Fix now** — ⚠ reviewer recommended fix-later; author recommended fix-now and disagreed on the record; owner took fix-now | **RESOLVED** | Round 1 wrote "Upstream: none" on four of five rows, conflating _nothing upstream was **changed**_ with _nothing upstream is **relied on**_. `OPERATING_AGREEMENT.md:270-272` defines the radius as "**upstream reliances** and downstream consumers". The defect is self-evident in P1's own row, which names a reliance ("§8 restates the owner's three named legs") in the same sentence that declares none. The corrected account for all five round-1 rows is below this table; the two rows in this section state reliances directly.                                                                                                                                                                                                                                                                                                                                   | **Upstream reliances:** `OPERATING_AGREEMENT.md:270-272` (the definition), and the five round-1 rows themselves. **Downstream consumers:** every future scoped follow-up on this branch, which is scoped by these declarations. **Not changed:** the round-1 rows (append-only), the historical owner rulings, or any source behaviour. ⓘ The reviewer's own row-by-row dependency table (`f9a-brief-codex-review-followup.md` §3) independently derived the same reliances; this section is not its only record.                                                                                                                                                                                                                                                                                                                      |

### The round-1 radius rows, corrected (P6)

Round 1's cells stand unedited above. What they should have said:

| Round-1 Ref | Upstream **reliances** that were present all along                                                                                                                                                                                                              |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1          | `OPERATING_AGREEMENT.md:66-73` (the qualified red-leg rule the repair quotes); ruling 3 of `drawer_havdm_decisions_bdef071e2ead9ed0a5ff8d9c` (the owner's three named legs); F2/F3/F6's measured export baseline, which is what makes legs 2 and 3 green today. |
| P2          | _(correct in round 1 — it named its upstream authorities.)_                                                                                                                                                                                                     |
| P3          | The resource-extraction → resolver → profile-builder → capture/save chain (`capabilityResolver.ts:35-79`, `capabilityProfile.ts:63-77`, `main.ts:588-605`); option A and its cost explanation in `drawer_havdm_decisions_cf0c188aaf75f2cd622faadc`.             |
| P4          | `cardAvailability.ts` (the resolver's precedence and its null-version branch) and both consumer bodies, `CardPalette.tsx:269` and `BaseCard.tsx:302`.                                                                                                           |
| P5          | Commit `0bfeb6c` (the original brief) and `drawer_havdm_decisions_cf0c188aaf75f2cd622faadc`, particularly push ruling 4 — the records without which the preservation claim cannot be checked at all.                                                            |

### What this round did NOT establish

- Still docs-only: `git diff --name-only main..HEAD | grep -cv '^docs/'` = 0.
- **No real installation was surveyed.** P3's repair bounds a _claim_ about what
  a capture can contain. Whether real users' layout-card installs satisfy that
  condition is unmeasured, and the brief now says so.
- **The original multiple-choice instrument was not recovered.** P5's repair
  narrows a claim to the available sources; it does not reconstruct what is
  missing.
- No runtime behaviour was executed by the author this round. The reviewer ran
  both probes; those results are its evidence.

### Follow-up owed

Three repairs exist, so **STRAT-D7 owes a further scoped follow-up** by the same
reviewer — scope is this round's repair diff **plus the reliances declared
above**, including the corrected round-1 account. ⚠ The round-1 radius was
itself found defective, so the radius in this section is the natural first thing
for that round to attack.

---

## Round 3 — 2026-09-09

Follow-up: `docs/reviews/f9a-brief-codex-review-followup2.md` (`fda8059`),
verdict **CLEAR-WITH-FINDINGS**, no SEV 1. **P5 and P6 RESOLVED** — the
reviewer verified the historical restoration byte-for-byte (975 bytes matching
`0bfeb6c`, present exactly once, and **absent at `a27df25`**, so the check
detects the earlier false claim), confirmed all 10,268 prior disposition bytes
unchanged, and traced both radius accounts. **P1, P2, P4 remain resolved.**

One live finding: **P3, PARTIALLY RESOLVED, SEV 2** — the third statement of the
same claim was still insufficient.

### The owner's ruling, and why it differs from the reviewer's recommendation

The reviewer recommended **accepting the residual** and proceeding to the spec,
judging another brief-only round disproportionate. The author **disagreed and
recommended deleting the claim outright**, and the owner ruled **delete**.

The reason is the recurrence, not the wording. The same sentence has now been
written three times and been wrong three times:

| Attempt | Claim                                                           | Why it was insufficient                                                                                                                                      |
| ------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1       | "already in **every captured profile**"                         | Only `/hacsfiles/`-marked resources produce a folder at all                                                                                                  |
| 2       | "**installed through HACS**"                                    | HACS repository metadata fills only `versions`, never `installedFolders`                                                                                     |
| 3       | "captured resource list **contained a URL bearing the marker**" | Two captures both bearing the marker produce **identical profiles**, neither carrying the target; a bare `/hacsfiles/` bears the marker and yields no folder |

Each survived a review round. The project's own practice rule
(`drawer_practice_claims_1fcfbf72537d81a3cdb9bc69`) governs exactly this shape:
**when the same defect recurs across successive fixes, remove the mechanism that
generates it rather than restating it more carefully.** A fourth wording would
have been the same instrument with a tuned parameter. ⓘ The reviewer's
proportionality judgement was reasonable on its own terms — its "concrete fix"
was another qualification, and it did not consider deletion.

| Ref | Severity | Owner ruling                                                                                                                                  | Disposition  | Repair                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Blast radius — reliances, not edits                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P3  | SEV 2    | **Delete the claim** — ⚠ reviewer recommended accept-as-residual; author recommended deletion and disagreed on the record; owner ruled delete | **RESOLVED** | The derivability claim is **removed from the brief**, not reworded. F5 now states plainly that **this brief makes NO claim about whether a layout-card fact is derivable from an existing capture, and that the question is OPEN and the spec's to answer with evidence** — naming what the spec must establish (which folder identifies layout-card, whether a capture carries that evidence, what the export does when it cannot answer) and stating that a marker somewhere in a capture is not proof of presence. The three failed attempts are recorded in F5 as the reason for deleting rather than rewording. Carried through to **§6 D-2** and the **§9.2 option A cost cell**, whose "derived from data already stored" half is explicitly **withdrawn**: A remains the smallest of the three options, but how cheap it is in absolute terms is now **unmeasured**. The same withdrawal is made in `drawer_havdm_decisions_cf0c188aaf75f2cd622faadc` ruling 2. **Every MEASURED fact is kept** — the lexical extractor behaviour, HACS-metadata-fills-only-`versions`, absolute/query-string retention, the docblock-disagrees-with-implementation note, and the absence of a layout-card constant. | **Upstream reliances:** `capabilityResolver.ts:35-42` (extractor), `:56-60` (collection), `:68-72` (metadata → `versions` only); `capabilityProfile.ts:63-77` (builder); `tests/unit/capabilityResolver.spec.ts:75-78`; the reviewer's paired-capture probe, re-run by the author on this checkout; the owner's option A ruling. **Downstream consumers:** §6 D-2, §9.2's option A cost cell, `drawer_havdm_decisions_cf0c188aaf75f2cd622faadc` ruling 2, and the future spec's derivation of the layout-card value — which now inherits an explicitly OPEN question instead of a wrong answer. ⚠ **Not changed:** option A, one object carrying both facts, the F9a/F9b split, the adopted header fields, or the accurate-warning obligation. **No detector, migration or instance survey is added or implied.** |

### What this round did NOT establish

- Still docs-only: `git diff --name-only main..HEAD | grep -cv '^docs/'` = 0.
- **Deleting a claim is not the same as answering it.** Whether a layout-card
  fact is derivable from an existing capture remains **unknown**, and the brief
  now says so instead of guessing. That is the point of the repair.
- No real installation was surveyed, and no canonical layout-card folder name
  was established — both are explicitly the spec's work.

### Follow-up owed

A repair exists, so **STRAT-D7 owes one further scoped follow-up**. ⓘ The
reviewer noted it "does not grant an exemption" if the owner elects a repair.
This one should be cheap: the repair is a **deletion plus an explicit statement
of ignorance**, which is easier to verify than any wording. If that round is
clean, the chain ends and the brief is ready for the owner to lock.
