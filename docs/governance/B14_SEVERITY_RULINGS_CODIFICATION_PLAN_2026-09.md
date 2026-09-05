# B14 — Codify the severity rulings and end the review revolving door (governance change plan)

**Status:** Draft — revision 1, 2026-09-06 · awaiting the SPEC-BEFORE-CODE plan review
**Author:** Claude Fable 5.1 (governance-authoring seat per `docs/governance/OPERATING_AGREEMENT.md` §3.6 STRAT-D4; owner's seat choice recorded 2026-09-06)
**Reviewer:** OpenAI Codex (GPT-5.6 Sol) — plan review BEFORE any governance document is edited (`CLAUDE.md` SPEC-BEFORE-CODE); the same seat holds the ratification review of the edits (§3 class (b)). No Opus session may hold either seat (§3.6).
**Owner gate:** micah/BaggyG-AU approves this plan before any governance document is edited; the owner's merge of the PR ratifies the amended text (§3(b)). This document decides nothing on its own.
**Branch:** `feature/b14-severity-rulings-codification` off `main` = `fa685ef` (Merge PR #154) · **Story:** GitHub Issue #156 (board B14, In Progress)
**Classification:** governance change — `docs/governance/OPERATING_AGREEMENT.md` §3 class (b); fix lane under `CLAUDE.md` SPEC-BEFORE-CODE (§3.7). Not a slice; the capability/content dial does not apply.
**Parent objective:** the owner's goal, stated 2026-09-06 — "we are spending more time reviewing and fixing than creating production code"; non-blocking, low-impact defects are to be recorded and triaged for a later cleanup sweep, with nothing a reviewer may REPORT reduced and nothing a SEV 1 means weakened. · **Cheapest acceptable outcome:** rulings 1–6 landed (component-scoped blocking, reachability, the Owner Summary Table, the derived verdict, the two non-repair disposition states, owner decides per Ref); rulings 7–9 could fall to a follow-up story without losing the round-count effect. · **Cost stop-rule:** if plan review plus edits plus ratification review exceed three review rounds in total, or one working week of wall-clock, work halts and re-asks the owner (mirrors §3.3's wall-clock trigger).

**Everything headless, and nothing to run.** This branch changes Markdown only. No e2e, integration, Electron or live-HA process is owed or will be run; `./tools/checks` and the author-ledger spec are the whole gate (§7).

---

# PART 1 — FOR THE OWNER

## 1.1 What this fixes, in one paragraph

Reviews on this project keep coming back "changes required" for defects that do not block anything, the author fixes them all inside the pull request, and every fix correctly earns another review round. PR #154 spent eight implementation review rounds and about two days on findings none of which blocked. This plan writes nine rules into the two documents every review is judged against so that: a review's verdict is derived from its severities instead of chosen; a non-blocking finding can be closed by **your** decision without a repair (deferred to a cleanup sweep, or accepted as a pinned residual); the reviewer's "Fix now" becomes advice you rule on, per finding, with the agent's pros and cons in front of you; and a reviewer who keeps finding the same seam one layer at a time must sweep the seam and bring you a stop-or-continue choice. Nothing here changes what a reviewer may report, and nothing changes the rule that every repair gets a follow-up.

## 1.2 What I verified before writing this

| Fact                                                                                                                                               | How it was measured                                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| PR #154's eight implementation rounds found 0 SEV-1, 7 SEV-2 and 13 SEV-3; seven rounds returned `CHANGES-REQUIRED`                                | `grep -E '^### P[0-9]+' docs/reviews/plan-consistency-c3-parser-implementation-review*.md`; verdict is line 5 of each file                                                                       |
| Rulings 1–3 were already applied to all eight rounds through the commissions                                                                       | `prompts/codex/plan-consistency-c3-parser-implementation-review.md` §10 quotes all three; every review file opens with an Owner Summary Table                                                    |
| 17 of the 20 findings were fixed inside the PR; 3 were declared residuals by owner ruling; no owner fix-or-defer ruling was recorded for any SEV-2 | `grep -E '^\| P(1[2-9]\|2[0-9]\|3[0-2]) ' docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md`; `git log 016cd03..2e95904` commit bodies mention "owner" only for P21/P24/P27                        |
| Seven repair rounds (nine fix commits) produced seven follow-ups                                                                                   | `git log --format='%h %s' 016cd03..2e95904` — nine `fix(governance)` commits in seven repair rounds, each round followed by exactly one `docs(review)` follow-up                                 |
| The review template defines no verdict vocabulary                                                                                                  | `docs/templates/ADVERSARIAL_REVIEW.md:100-101` — "The headline conclusion in three sentences or fewer"                                                                                           |
| The Operating Agreement's disposition table allows RESOLVED/REGRESSED only                                                                         | `docs/governance/OPERATING_AGREEMENT.md:267-268`                                                                                                                                                 |
| All seven SEV-2s sit in one seam and every round wrote "Class swept"                                                                               | `grep -n 'Class swept' docs/reviews/plan-consistency-c3-parser-implementation-review*.md` (one per round); seam trace in §5, labelled as a hand trace                                            |
| The live governed plan has never contained a YAML directive                                                                                        | `git log --oneline --all -S'%YAML' -- docs/testing/SPACING_HELPER_PRESET_PLAN.md docs/testing/SPACING_HELPER_PRESET_PLAN_HISTORY.md` returns nothing, and neither file contains the string today |

The first six rows are MEASURED; the seam classification in §5 is a hand trace and is labelled as one.

## 1.3 The nine behaviours you are approving

| #   | Behaviour, in plain words                                                                                                                                                     | Where it lands         |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1   | A blocking finding names the smallest thing it blocks. Nothing blocks "the PR".                                                                                               | Template §4            |
| 2   | To block, a reviewer must also show the input that reaches the defect, and that it exists or is a plausible future edit. A made-up input alone cannot block.                  | Template §4; OA §4 row |
| 3   | Every review opens with a one-row-per-finding table you can act on without reading code.                                                                                      | Template §1a           |
| 4   | The verdict is computed from the severities: blocked on named components if a proven SEV 1 exists, otherwise clear with findings. No other verdict words exist.               | Template §1; OA §4 row |
| 5   | You can close a finding without a repair: defer it to a named cleanup sweep on the board, or accept it as a residual pinned by a test. Neither triggers a follow-up round.    | OA §3.4                |
| 6   | For every non-blocking finding the agent gives you pros, cons and a recommendation; you decide fix-now, defer or accept, by reference. Nothing is repaired before you rule.   | OA §3.4                |
| 7   | If a follow-up finds the same seam again, the reviewer must sweep the whole seam and the agent must bring you a continue / declare-residual / park choice before fixing more. | OA §3.4; Template §4   |
| 8   | The severity grades get a plain reading for code reviews, beside the existing one written for document reviews.                                                               | Template §4            |
| 9   | One finding per behaviour; bundled constructions are graded one by one.                                                                                                       | Template §4            |

## 1.4 What this costs you, and what happens if you do nothing

**Cost.** Every SEV 2, 3 and 4 finding now arrives on your desk as a short brief you rule on by reference. On PR #154 that would have been about twenty rulings over eight rounds; under these rules the same PR is projected at two or three rounds and roughly eight rulings (§5, labelled judgement). Deferral moves work to a cleanup sweep rather than deleting it, except where you declare a seam a residual — for PR #154 the whole seam guarded inputs nobody has written, so declaring it would have removed the work.

**If you do nothing.** The next multi-round arc is already predictable: the reviewer grades correctly, recommends fixing, the agent fixes, and every fix buys a round. Rulings 1–3 alone were live for all eight rounds of PR #154 and did not change that.

## 1.5 What I am doing differently from PR #154's plan

- **Every change is quoted before and after** (§3), so the reviewer attacks text, not intent.
- **The runnable companion is a replay of real findings** (§5) with the command that regenerates its table, not a claim that the rules "would" help.
- **Counts appear once.** The sweep count lives in §3.6 only; the PR #154 figures live in §1.2 only. Nothing restates them.
- **The protected span is named and diffable** (§3.3, §6 AC-4): the STRAT-D7 trigger text must come out byte-identical and the command that proves it is given.

---

# PART 2 — TECHNICAL DETAIL

## 2. Background and authority

- The three 2026-09-03 rulings and their measurement: `drawer_havdm_decisions_9585602957964a59bf9571be`.
- The six 2026-09-06 rulings, the goal statement and the seat: `drawer_havdm_decisions_38993740c044247b0cf10527`.
- The round-count root cause this plan answers: `drawer_havdm_investigations_6c862ee0d8b64cb14e7d5018`.
- PR #154's complete record (13 rounds, 45 findings): `drawer_havdm_investigations_8fbb5d79fb6e5cd72d7763d5`.
- STRAT-D7 final form — the rule this plan must not touch: `drawer_havdm_decisions_bd49cedc80cb93cafabc0f86`; `OPERATING_AGREEMENT.md` §3.4 records that two attempts to narrow its trigger each became the next review's finding and that the boundary was "removed, not redrawn".
- STRAT-D18 as originally ruled: `drawer_havdm_decisions_8464ae812b9803e14aed517a`; `docs/strategy/2026-08-18-model-roles-and-workflow-adoption.md:312-325`.
- The story, refreshed 2026-09-06 with rulings 4–9: GitHub Issue #156.

## 2.1 Finding coverage

| Ruling (Issue #156)                        | Addressed in | Edit target(s)                                                         |
| ------------------------------------------ | ------------ | ---------------------------------------------------------------------- |
| 1 — `Blocks: <component>`; token withdrawn | §3.2         | `docs/templates/ADVERSARIAL_REVIEW.md` §4                              |
| 2 — reachability, fourth proof element     | §3.2, §3.4   | template §4; `OPERATING_AGREEMENT.md` §4 STRAT-D18 row + SEV-CAL-1 row |
| 3 — Owner Summary Table                    | §3.1         | template new §1a                                                       |
| 4 — derived verdict                        | §3.1, §3.4   | template §1; OA §4 SEV-CAL-2 row                                       |
| 5 — DEFERRED / ACCEPTED-RESIDUAL           | §3.3         | OA §3.4 disposition bullet                                             |
| 6 — owner decides per Ref, agent pros/cons | §3.3, §3.2   | OA §3.4 new bullet; template §4 SEV 2 line                             |
| 7 — same-seam rule                         | §3.3, §3.2   | OA §3.4 new bullet; template §4 class-swept paragraph                  |
| 8 — implementation reading of the grades   | §3.2         | template §4                                                            |
| 9 — bundling                               | §3.2         | template §4                                                            |
| Strategy §6 D18 preserved + pointer        | §3.5         | `docs/strategy/2026-08-18-model-roles-and-workflow-adoption.md`        |
| Sweep of every restatement, count reported | §3.6         | enumeration only; 3 live surfaces edited, the rest untouched           |
| Author-ledger fingerprint                  | §3.7         | `docs/reviews/self-pass-gate-author-ledger.md`                         |
| Cleanup-sweep board item                   | §3.8         | GitHub Projects board (draft item)                                     |

## 3. The edits, quoted before and after

Line numbers are those of `main` = `fa685ef`. Prettier will reflow tables; prose is preserved (`proseWrap` defaults to `preserve`).

### 3.1 `docs/templates/ADVERSARIAL_REVIEW.md` §1 — the derived verdict, and the Owner Summary Table as §1a

**BEFORE (`:100-101`):**

```markdown
## 1. Verdict first

The headline conclusion in three sentences or fewer, before any evidence.
```

**AFTER:**

```markdown
## 1. Verdict first

One verdict line, then the headline conclusion in three sentences or fewer,
before any evidence.

**The verdict is DERIVED from §4's severities, never chosen (owner ruling
SEV-CAL-2, 2026-09-06).** Exactly one of:

- `BLOCKED-ON: <component>[, <component>…]` — if and only if at least one
  finding is SEV 1 carrying its full four-part proof. List every `Blocks:`
  scope a SEV 1 names, and nothing wider. The owner decides the merge.
- `CLEAR-WITH-FINDINGS` — no SEV 1; one or more SEV 2–4 findings, reported in
  full below.
- `CLEAR` — no finding at any severity. A legitimate result (§0 rule 5).

No other verdict token is valid. `CHANGES-REQUIRED`, `SEV-1-BLOCKED`,
`PARTIALLY-CONFIRMS` and `APPROVE` are retired as verdicts: on PR #154 the
verdict tracked whichever token the commission supplied, and seven rounds
returned `CHANGES-REQUIRED` with no SEV 1 present. A follow-up round reports
each prior finding's closure — RESOLVED / PARTIALLY RESOLVED / REGRESSED /
OPEN — as disposition lines in §4; a prior finding that is REGRESSED or OPEN is
re-graded and counts toward the verdict like any other finding. ⚠ A
commission may add requirements to a review (strategy D10) but may not define,
add or vary a verdict token or a severity grade — those belong to this
template alone.

## 1a. Owner Summary Table

**Before any technical detail (owner ruling SEV-CAL-1, 2026-09-03).** The
owner is a non-developer who arbitrates every finding personally; a review
that can only be actioned by reading code has not been delivered. One row per
finding:

| Ref | What is wrong, in plain English | Severity | Blocks | Fix complexity (1–5) | Recommendation |
| --- | ------------------------------- | -------- | ------ | -------------------- | -------------- |
|     |                                 |          |        |                      |                |

- **Ref** — `P1`, `P2`, `P3`… in finding order, stable for the life of the
  review and never reused, because the owner replies by reference ("P1
  accept, P3 defer"). A follow-up round continues the sequence; it never
  restarts it.
- **Plain English** — judgeable by someone who has never read the code. No
  identifiers, no line numbers, no domain or grammar jargon in this column;
  those belong in §4.
- **Blocks** — the `Blocks:` scope for a SEV 1; `None` otherwise.
- **Fix complexity** — 1 = a wording change or one-line edit; 3 = a contained
  change plus its tests; 5 = a redesign, a new dependency, or a blast radius
  beyond the module. Justified in one clause in §4.
- **Recommendation** — one of **Fix now / Fix later / Accept as-is / Owner
  judgement needed**; for the last, say what the choice is between. ⚠ This
  column is INPUT to the owner's decision under
  `docs/governance/OPERATING_AGREEMENT.md` §3.4 (SEV-CAL-2 ruling 6), never
  the decision itself.

Anything routed to the owner beyond this table — a contested classification,
a residual to declare, a stop-or-continue choice — uses the Owner Decision
Brief (STRAT-D15) named in the header, immediately after this table.
```

### 3.2 `docs/templates/ADVERSARIAL_REVIEW.md` §4 — the severity contract

**BEFORE (`:132-150`):**

```markdown
**Severity contract (STRAT-D18, owner-ruled 2026-08-18 — binding for any
document whose function is to evaluate another artifact, however
commissioned):** every finding is tagged **SEV 1–4**.

- **SEV 1 — blocks the affected decision/artifact only.** The target as
  recorded is internally contradictory, contradicts a binding ruling it does
  not explicitly supersede, rests on a demonstrably false factual claim, or
  is unexecutable as written — **and** the finding must carry the three-part
  proof: (1) the decision or claim broken, (2) the violated fact or text at
  `path:line`, (3) why no recorded mitigation covers it. Missing any part →
  at most SEV 2.
- **SEV 2 — does not block.** Rests on an unverified or overstated claim, or
  an unmitigated risk. Each goes to the owner as an Owner Decision Brief.
- **SEV 3/4 — recorded, no round-trip.**
- **The authority boundary:** owner judgment calls are not reviewable defects
  above SEV 4 — attack the facts a choice rests on, never the authority to
  make it. Contested classifications go to the owner as briefs.
- The severity model governs what **blocks**, never what may be **reported**:
  report full signal, tagged. This template's machinery applies in full, and
  commissions may add requirements, never subtract (strategy D10).
```

**AFTER:**

```markdown
**Severity contract (STRAT-D18, owner-ruled 2026-08-18, as amended by
SEV-CAL-1 on 2026-09-03 and SEV-CAL-2 on 2026-09-06 — binding for any
document whose function is to evaluate another artifact, however
commissioned):** every finding is tagged **SEV 1–4**. SEV 1 and SEV 2 each carry
two readings with identical blocking semantics: the DOCUMENT reading (STRAT-D18's
original, for specs, plans, strategy and governance text) and the
IMPLEMENTATION reading (SEV-CAL-2 ruling 8, for code, tests, tooling and
checkers).

- **SEV 1 — blocks the affected COMPONENT only, never the pull request.**
  Document reading: the target as recorded is internally contradictory,
  contradicts a binding ruling it does not explicitly supersede, rests on a
  demonstrably false factual claim, or is unexecutable as written.
  Implementation reading: the artifact's stated contract is violated on an
  input that exists today, or on a future input the reviewer has ARGUED to be
  plausible. **Every SEV 1 carries the four-part proof:** (1) the decision,
  claim or contract broken; (2) the violated fact or text at `path:line`;
  (3) why no recorded mitigation covers it; (4) **REACHABILITY — the input
  that reaches this defect, and whether such an input exists today.** Missing
  any part → at most SEV 2. **A finding whose only demonstration is a
  synthetic input nobody has written caps at SEV 2** — reported in full, never
  blocking. ⚠ The safety-gate exemption must be ARGUED, not assumed: where the
  artifact's whole job is catching the not-yet-written, a synthetic
  demonstration may still carry SEV 1 only if the reviewer states why the
  construction is a PLAUSIBLE future edit rather than merely a constructible
  one; an unargued exemption grades SEV 2. Calibration: "someone adds a second
  totals block" is plausible; "someone puts a tab before the fence" is not.
  **Every SEV 1 states `Blocks: <component>`** on its own line — the narrowest
  thing that cannot ship as recorded (`Blocks: C3 blocking half`, never
  `Blocks: PR #154`); a whole-change block must justify why the narrower scope
  is insufficient. The whole-PR token `SEV-1-BLOCKED` is withdrawn. The
  reviewer decides severity and scope; **the owner decides the merge.**
- **SEV 2 — does not block.** Document reading: rests on an unverified or
  overstated claim, or an unmitigated risk. Implementation reading: the
  contract is violated only on a constructible input nobody has written (the
  reachability cap), or the claim about the code is unverified or overstated.
  Each goes to the owner as an Owner Decision Brief, and **the owner decides
  fix-now / defer / accept-residual per finding, by Ref**
  (`docs/governance/OPERATING_AGREEMENT.md` §3.4).
- **SEV 3 — recorded; no round-trip is owed.** Documentation, comment or
  record accuracy; a stale or inconsistent statement whose correction changes
  no behaviour. The owner may still elect a fix under §3.4.
- **SEV 4 — recorded; no round-trip is owed.** Style, wording preference, or
  an improvement with no defect behind it.
- **The authority boundary:** owner judgment calls are not reviewable defects
  above SEV 4 — attack the facts a choice rests on, never the authority to
  make it. Contested classifications go to the owner as briefs.
- **Bundling (SEV-CAL-2 ruling 9):** one finding per behaviour. Where several
  constructions are bundled under one finding, state the severity per
  construction; the finding's headline severity is the highest that carries
  its own four-part proof.
- The severity model governs what **blocks**, never what may be **reported**:
  report full signal, tagged. This template's machinery applies in full, and
  commissions may add requirements, never subtract (strategy D10) — but a
  commission may not define, add or vary a verdict token (§1) or a severity
  grade.
```

**BEFORE (`:154-158`, the class-swept paragraph):**

```markdown
Add **class swept:** per finding — the class the instance belongs to and
whether every member was checked (§0 rule 1). "Class: all 23 test legs —
swept, 3 affected" closes the class; "class not swept" tells the author to
sweep it before fixing. This is what stops the next round re-reporting the
same defect one instance later.
```

**AFTER (one paragraph appended; the existing paragraph is unchanged):**

```markdown
Add **class swept:** per finding — the class the instance belongs to and
whether every member was checked (§0 rule 1). "Class: all 23 test legs —
swept, 3 affected" closes the class; "class not swept" tells the author to
sweep it before fixing. This is what stops the next round re-reporting the
same defect one instance later.

⚠ **The same-seam rule (SEV-CAL-2 ruling 7).** If a finding in a scoped
follow-up sits in the same seam as the finding whose repair you are
reviewing, state the seam as a BEHAVIOUR, sweep every member of it — or
declare it unsweepable and say why — before reporting. One more instance is
not a report. Measured basis: PR #154's seven SEV-2s were one seam; every
round wrote "Class swept" with the class drawn one layer wide, and the next
round found a sibling.
```

### 3.3 `docs/governance/OPERATING_AGREEMENT.md` §3.4 — disposition states, the owner's decision, the same-seam rule

⚠ **Protected span, byte-identical before and after:** the `(d)` blockquote (`:251-256`), the "first round is a full review" paragraph (`:258-263`), the **"The repair lifecycle (STRAT-D7):"** line (`:265`), the **"The scoped follow-up"**, **"Depth is proportional"** and **"Honest cost"** bullets (`:276-292`), and both ⚠ paragraphs that follow them through the end of §3.4 (`:294-312`). Only the **"The disposition table"** bullet (`:267-275`) is replaced, and two bullets are inserted: one after it, one after "The scoped follow-up". The verification command is AC-4 in §6.

**BEFORE (`:267-275`):**

```markdown
- **The disposition table.** The author answers every finding in a committed
  RESOLVED/REGRESSED disposition table carrying, per repair, a
  **blast-radius statement**: upstream reliances and downstream consumers —
  for shared-DSL work, the `ai_rules.md` §4b consumer inventory. It lives in
  its own committed artifact on the branch,
  `docs/reviews/<branch-shortname>-repair-dispositions.md`, one dated section
  appended per round and never rewritten. (Home settled at PR-3 drafting per
  the strategy's open sub-question 6: the reviewer's own file is never
  amended by the author, so the table cannot live there.)
```

**AFTER (replacement bullet, then the inserted owner-decision bullet):**

```markdown
- **The disposition table.** The author answers every finding in a committed
  disposition table — one row per finding, keyed by the review's `Ref`, in
  exactly one of five states (SEV-CAL-2 ruling 5, owner-ruled 2026-09-06):
  **RESOLVED** (repaired; the row carries a **blast-radius statement** —
  upstream reliances and downstream consumers, for shared-DSL work the
  `ai_rules.md` §4b consumer inventory); **REGRESSED**; **DEFERRED →
  `<board debt item>`** (strategy D11 — the item belongs to a named cleanup
  sweep and carries the Ref, the plain-English line, the severity and the
  review file path); **ACCEPTED-RESIDUAL → `<KNOWN-OPEN test, or the
documented residual where no test can pin it>`**; or **OPEN** (awaiting the
  owner). It lives in its own committed artifact on the branch,
  `docs/reviews/<branch-shortname>-repair-dispositions.md`, one dated section
  appended per round and never rewritten. (Home settled at PR-3 drafting per
  the strategy's open sub-question 6: the reviewer's own file is never
  amended by the author, so the table cannot live there.)
- **The owner's fix-or-defer decision (SEV-CAL-2 ruling 6).** Before
  committing any repair for a SEV 2, SEV 3 or SEV 4 finding, the author puts
  each such finding to the owner by Ref with the pros and cons of fix-now,
  defer and accept-residual and a recommendation, stating whether it agrees
  with the reviewer's recommendation and why. The owner rules and tells the
  agent; the ruling is recorded in the row. A finding the owner has not yet
  ruled on stays OPEN and no repair for it is committed. **DEFERRED and
  ACCEPTED-RESIDUAL are owner decisions, not repairs: they create no follow-up
  under STRAT-D7, whose trigger is unchanged — the only fact it consumes is
  still whether a repair exists.** A SEV 1 leaves OPEN only as RESOLVED, or
  by an owner ruling recorded in its row that accepts the residual with its
  reason; it is never deferred to a sweep. Measured basis: on PR #154 every
  SEV-2 "Fix now" was executed with no recorded owner decision, and seventeen
  in-PR fixes produced seven follow-up rounds
  (`drawer_havdm_investigations_6c862ee0d8b64cb14e7d5018`).
```

**INSERTED after the unchanged "The scoped follow-up" bullet:**

```markdown
- **The same-seam rule (SEV-CAL-2 ruling 7).** When a scoped follow-up finds a
  defect in the same seam as the finding whose repair it is reviewing, the
  reviewer states the seam as a behaviour and sweeps every member of it — or
  declares it unsweepable and says why — before reporting, and the author puts
  a **continue / declare-residual / park** brief to the owner before committing
  any further repair in that seam. Precedent: the owner's stop rule at PR
  #155's eighth plan round
  (`docs/reviews/spacing-helper-preset-plan-codex-followup7-commission.md`),
  now triggered by evidence rather than by a round number.
```

### 3.4 `docs/governance/OPERATING_AGREEMENT.md` §4 — the STRAT-D18 row amended, two rows appended

**BEFORE (`:470`, the STRAT-D18 row's Ruling cell):**

> Severity-gated review disposition: SEV 1 blocks the affected decision only and needs the three-part proof (decision + violated fact/text at `path:line` + why no recorded mitigation covers it); SEV 2 → Owner Decision Brief, non-blocking; SEV 3/4 recorded; owner judgment calls are not reviewable above SEV 4; the model governs what blocks, never what may be reported (binding template text: `docs/templates/ADVERSARIAL_REVIEW.md`)

**AFTER (Ruling cell; ID, Date, Status and Authority cells unchanged):**

> Severity-gated review disposition: SEV 1 blocks the affected decision only and needs the three-part proof (decision + violated fact/text at `path:line` + why no recorded mitigation covers it); SEV 2 → Owner Decision Brief, non-blocking; SEV 3/4 recorded; owner judgment calls are not reviewable above SEV 4; the model governs what blocks, never what may be reported. ⚠ **Amended by SEV-CAL-1 (2026-09-03) and SEV-CAL-2 (2026-09-06) — see those rows; the binding text is `docs/templates/ADVERSARIAL_REVIEW.md` §1/§1a/§4 and this document §3.4 as amended. The strategy document's §6 D18 is preserved as the 2026-08-18 record and carries a dated pointer.**

**APPENDED rows (after STRAT-D18):**

| ID        | Date       | Status   | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Authority                                                                                                                                                                                       |
| --------- | ---------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEV-CAL-1 | 2026-09-03 | Standing | Severity-matrix calibration, rulings 1–3: a SEV 1 blocks the COMPONENT it names (`Blocks: <component>` line; `SEV-1-BLOCKED` withdrawn); SEV 1 needs a FOURTH proof element, REACHABILITY, with the safety-gate exemption argued not assumed (synthetic-only caps at SEV 2); every review opens with an Owner Summary Table (Ref, plain English, severity, Blocks, fix complexity 1–5, recommendation). Binding text: template §1a/§4                                                                                                                                                                                                                                              | `drawer_havdm_decisions_9585602957964a59bf9571be`; measurement `drawer_havdm_investigations_b2c3e5450e814d1a88499043`                                                                           |
| SEV-CAL-2 | 2026-09-06 | Standing | Rulings 4–9: the verdict is DERIVED (`BLOCKED-ON: <components>` iff a fully-proved SEV 1, else `CLEAR-WITH-FINDINGS` / `CLEAR`; `CHANGES-REQUIRED`, `SEV-1-BLOCKED`, `PARTIALLY-CONFIRMS`, `APPROVE` retired as verdicts); disposition states DEFERRED → board item and ACCEPTED-RESIDUAL → KNOWN-OPEN pin, both owner decisions and neither a repair; the owner decides fix-now / defer / accept per Ref on the agent's pros/cons brief; the same-seam rule; an implementation reading of the grades beside the document reading; one finding per behaviour with severity per construction. STRAT-D7's trigger is untouched. Binding text: template §1/§1a/§4; this document §3.4 | `drawer_havdm_decisions_38993740c044247b0cf10527`; measurement `drawer_havdm_investigations_6c862ee0d8b64cb14e7d5018`; plan `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md` |

### 3.5 `docs/strategy/2026-08-18-model-roles-and-workflow-adoption.md` §6 D18 — preserved, with one dated pointer

**BEFORE (`:312-325`):** the D18 bullet as it stands. **Not edited.**

**AFTER — one paragraph inserted immediately after `:325`, before the "Arbitration-point accounting" paragraph:**

```markdown
⚠ **Pointer, 2026-09-06 — not an amendment of this record.** D18's severity
contract was amended by owner rulings SEV-CAL-1 (2026-09-03) and SEV-CAL-2
(2026-09-06). The text above is preserved as the record of what was ruled on
2026-08-18; the binding text now lives in `docs/templates/ADVERSARIAL_REVIEW.md`
§1/§1a/§4 and `docs/governance/OPERATING_AGREEMENT.md` §3.4 and §4 (rows
STRAT-D18, SEV-CAL-1, SEV-CAL-2).
```

### 3.6 The sweep — every document that restates the severity contract

**The class, stated as a behaviour:** every tracked document that tells a reader what severity means, what blocks, or what verdict a reviewer may return. Two enumerations, keyed differently, per `drawer_practice_review_ba6eb45cbbd7c581a68b6df0`.

**Enumeration 1 — token union (mechanical, re-runnable):**

```bash
git grep -l -F -e 'three-part proof' -e 'STRAT-D18' -e 'SEV-1-BLOCKED' \
  -e 'CHANGES-REQUIRED' -e 'recorded, no round-trip' -e 'blocks the affected'
```

| Population                                                                | Files | Disposition                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Total tracked files matching                                              |   100 | —                                                                                                                                                                                                                                                                                                                                                                                                                |
| `docs/reviews/**` — historical review, commission and disposition records |    87 | **Untouched** (append-never-rewrite; the story excludes them)                                                                                                                                                                                                                                                                                                                                                    |
| Live governed surfaces this plan edits                                    |     3 | `docs/governance/OPERATING_AGREEMENT.md`, `docs/templates/ADVERSARIAL_REVIEW.md`, `docs/strategy/2026-08-18-model-roles-and-workflow-adoption.md` (pointer only)                                                                                                                                                                                                                                                 |
| Historical plan/spec records quoting past verdicts                        |     6 | **Untouched**: `docs/features/F5_SECTIONS_PALETTE_DROP_SPEC.md`, `docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md`, `docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md`, `docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md`, `docs/testing/SPACING_HELPER_PRESET_PLAN.md`, `docs/testing/SPACING_HELPER_PRESET_PLAN_HISTORY.md` — the last two are the plan-consistency checker's governed subject and MUST NOT be edited |
| Governed historical record quoting a past verdict                         |     1 | **Untouched**: `docs/governance/PROMPTMI_GOVERNANCE_REVIEW_2026-08.md:143` quotes a promptmi review's verdict as history                                                                                                                                                                                                                                                                                         |
| Code comments quoting past verdicts                                       |     3 | **Untouched**: `tests/support/authorLedger.ts`, `tests/unit/author-ledger.spec.ts`, `tests/unit/author-ledger-fixtures.spec.ts` (doc comments narrating PR #141)                                                                                                                                                                                                                                                 |
| `CLAUDE.md`, `ai_rules.md`                                                |     0 | No key matches — measured, not assumed                                                                                                                                                                                                                                                                                                                                                                           |
| This plan, new on the branch                                              |     1 | The change artifact itself; it restates the contract by definition, so the branch count is 101                                                                                                                                                                                                                                                                                                                   |

**Enumeration 2 — behavioural read of the live surfaces (hand trace, labelled):** `OPERATING_AGREEMENT.md` §1–§4 and `ADVERSARIAL_REVIEW.md` were read end to end in the authoring session. Sentences that state what blocks, what a verdict is, or what a disposition may be: OA `:267-275` (edit target §3.3), OA `:470` (edit target §3.4), template `:100-101` and `:132-150` (edit targets §3.1/§3.2). Two look-alikes deliberately left alone: OA §3.3's "PR #137's round 6 returned APPROVE" is historical narrative, and the template's cross-check section's `CONFIRMED / PARTIALLY CONFIRMED / REFUTED / UNVERIFIABLE` are per-CLAIM verdicts on the §3 ledger, not review verdicts. The reviewer is asked to repeat this read (§8 Q3).

**Gitignored `prompts/` — a separate local pass, reported here and nowhere else:** 92 of 148 files match the token union. `grep -r -i -l -E 'scaffold|TEMPLATE' prompts/` returns only dated commissions and START prompts that use the word; **no reusable commission scaffold file exists** — the strategy document's "commission scaffold" is realised as `docs/templates/ADVERSARIAL_REVIEW.md` §0 and its standing header lines (measured: PR #148 landed the STRAT-D15 owner-profile line there). Every `prompts/` hit is therefore a historical commission and stays untouched. Future commissions inherit the new vocabulary from the template.

### 3.7 The author-ledger fingerprint

`tests/support/authorLedger.ts:68` names the governed set — `docs/governance/**`, `docs/templates/**`, `ai_rules.md`, `CLAUDE.md`. This plan (a new file under `docs/governance/`) and the §3.1–§3.4 edits both move the fingerprint, so `docs/reviews/self-pass-gate-author-ledger.md` is regenerated **twice on this branch**, exactly as PR #148 did (`5bbdcd6`, `662a094`, `ffa7b00`): once with the plan commit, once with the edits commit, each with a dated addendum recording what moved and `npx vitest run tests/unit/author-ledger.spec.ts` at 9 passed. The commissioned rows are not touched.

### 3.8 The cleanup-sweep board item

At the edits commit, the agent creates one **draft** board item, "Cleanup sweep — DEFERRED review findings", as the home DEFERRED findings point at (strategy D9 permits draft items; Issue creation stays owner-gated). It is empty at creation; the owner names its trigger when the first finding is deferred to it. Nothing from PR #154 or #155 is retro-filed into it (§4).

## 4. Out of scope — MUST NOT change

- **STRAT-D7's follow-up trigger** — the `(d)` blockquote and the three bullets named in §3.3. Byte-identical, proved by AC-4.
- **`ai_rules.md` and `CLAUDE.md`** — zero restatements found (§3.6); no edit.
- **`docs/reviews/**`** — the 87 historical records.
- **`docs/testing/SPACING_HELPER_PRESET_PLAN.md` and its `_HISTORY.md`** — the plan-consistency checker's governed subject.
- **No machine enforcement.** The derived verdict is a template rule a reader checks, not a script or CI gate (§3.3 names any proposal to machine-enforce the review invariant as a stop trigger).
- **No re-grading of PR #154 or #155.** §5 is evidence, not a re-opening.
- **`src/`, tests, tools, snapshots, baselines** — untouched; the only test-adjacent change is the ledger Markdown.

## 5. The runnable companion — PR #154's twenty implementation findings replayed

**Regenerate the source rows:**

```bash
for f in docs/reviews/plan-consistency-c3-parser-implementation-review*.md; do grep -E '^\| P[0-9]+ ' "$f"; done
grep -E '^\| P(1[2-9]|2[0-9]|3[0-2]) ' docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md
```

(The eighth round's table has a different column layout — Ref, status, severity, plain English, recommendation — and is read accordingly.)

| Ref | Round | SEV | Seam (hand trace)                             | Reviewer recommendation                           |  Cx | Actual disposition               |
| --- | ----: | --- | --------------------------------------------- | ------------------------------------------------- | --: | -------------------------------- |
| P12 |     1 | 2   | A — directive legality at the `yaml` boundary | Fix now                                           |   2 | FIXED                            |
| P13 |     1 | 3   | B — site-grouping order                       | Fix now                                           |   1 | FIXED                            |
| P14 |     1 | 3   | C — record/wording accuracy                   | Fix now                                           |   1 | FIXED (wording only)             |
| P15 |     1 | 3   | C                                             | Fix now                                           |   1 | FIXED                            |
| P16 |     2 | 2   | A                                             | Fix now                                           |   2 | FIXED                            |
| P17 |     2 | 3   | C                                             | Fix now                                           |   1 | FIXED                            |
| P18 |     2 | 3   | C                                             | Fix now                                           |   1 | FIXED (wording only)             |
| P19 |     3 | 2   | A                                             | Fix now                                           |   2 | FIXED                            |
| P20 |     4 | 2   | A                                             | Fix now                                           |   2 | FIXED                            |
| P21 |     4 | 3   | A (`%TAG` validity)                           | Decide and make explicit now                      |   3 | DECLARED RESIDUAL — owner-ruled  |
| P22 |     4 | 3   | C                                             | Correct with the behavioural fix                  |   1 | FIXED                            |
| P23 |     5 | 2   | A                                             | Fix now                                           |   2 | FIXED                            |
| P24 |     5 | 3   | A (`%TAG` validity)                           | Broaden and pin the ruling                        |   2 | RESIDUAL BROADENED — owner-ruled |
| P25 |     5 | 3   | C                                             | Correct with the behavioural repair               |   1 | FIXED                            |
| P26 |     6 | 2   | A                                             | Resolve at the parser boundary or declare it      |   4 | FIXED                            |
| P27 |     6 | 3   | A (`%TAG` validity)                           | Broaden the boundary and its pins                 |   2 | RESIDUAL REWORDED — owner-ruled  |
| P28 |     6 | 3   | C                                             | Escape the pipes or move the regex                |   1 | FIXED                            |
| P29 |     7 | 2   | A                                             | Resolve at the parser boundary or declare the gap |   4 | FIXED                            |
| P30 |     7 | 3   | A (comment accuracy at the boundary)          | Correct the comments                              |   1 | FIXED                            |
| P31 |     7 | 3   | C                                             | Change "four" to "five"                           |   1 | FIXED                            |
| P32 |     8 | 3   | C                                             | No round-trip; correct opportunistically          |   — | FIXED                            |

**Under the amended rules, MEASURED from the severities alone:** every one of the eight rounds derives to `CLEAR-WITH-FINDINGS`, because no round carries a SEV 1. That is the same fact the reviewer's own grading already stated; the amendment stops the verdict contradicting it.

**Round-count scenarios — JUDGEMENT, because they assume owner decisions the rules now make available:**

| Scenario                                                                                                                                                                                                       | Rounds | Owner rulings | What it shows                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -----: | ------------: | ------------------------------------------------------------------------------------------------ |
| A — the owner elects **Fix now** on every finding                                                                                                                                                              |      8 |            20 | The rules force nothing: every repair still earns its STRAT-D7 follow-up, unchanged              |
| B — the owner **defers or accepts** every non-blocking finding at round 1                                                                                                                                      |      1 |             4 | The floor: no repair, no follow-up; the four round-1 findings go to the sweep or a residual      |
| C — the owner fixes P12 (first sight of seam A) and defers the three round-1 SEV-3s; round 2 finds P16 in seam A; the same-seam rule triggers; the owner declares seam A a residual pinned by KNOWN-OPEN tests |      2 |       about 8 | The realistic middle: the seam that cost six further rounds is closed by one decision at round 2 |

Scenario C's "about 8" counts the four round-1 rulings, the round-2 continue / declare-residual / park brief, and the round-2 findings. The saving in B and C is real only because seam A guarded inputs the governed plan has never contained (§1.2); for a reachable seam the same decisions would ship a pinned gap, and that is the owner's call each time.

## 6. Acceptance criteria, each with its check

| AC   | Criterion                                                                                                    | Check                                                                                                                                                                                                                                  |
| ---- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | Rulings 1–9 codified in the files named in §2.1, dated and traceable; STRAT-D18 amended by row, not silently | Reviewer reads §3 against the diff; `git grep -n 'SEV-CAL-' -- docs/governance docs/templates docs/strategy` lists every landing site                                                                                                  |
| AC-2 | Every tracked restatement swept and the count reported; the `prompts/` pass reported separately              | §3.6's command reproduces 101 files on the edits commit — main's 100 plus this plan — partitioned 87 / 3 / 6 / 1 / 3 / 0 / 1 as in §3.6's table (the 3 live surfaces now match on the new tokens too; the count of FILES is unchanged) |
| AC-3 | Retired tokens appear in no template or scaffold as a verdict a reviewer may return                          | `git grep -n -E 'SEV-1-BLOCKED\|CHANGES-REQUIRED\|PARTIALLY-CONFIRMS' -- docs/templates CLAUDE.md ai_rules.md` returns only the §1 retirement sentence                                                                                 |
| AC-4 | The STRAT-D7 trigger text is byte-identical                                                                  | The command block below the table exits 0 with empty output for the blockquote and for each named bullet                                                                                                                               | awk '/^> \*\*\(d\) slice/,/exists\.\*\*$/') <(awk '/^> \*\*\(d\) slice/,/exists\.\*\*$/' docs/governance/OPERATING_AGREEMENT.md)` is empty; the same for the three named bullets, anchored on their bold titles |
| AC-5 | The replay (§5) is present with its regenerating command                                                     | Reviewer re-runs the two commands and checks 21 rows                                                                                                                                                                                   |
| AC-6 | Author-ledger regenerated; gate green                                                                        | `npx vitest run tests/unit/author-ledger.spec.ts` 9 passed; `./tools/checks` REAL_EXIT=0, 4/4 steps, unit 1559 passed / 105 files (docs-only: count unchanged)                                                                         |
| AC-7 | Independent ratification review conducted UNDER the new vocabulary; seat rule honoured                       | The review's first line is `BLOCKED-ON:` / `CLEAR-WITH-FINDINGS` / `CLEAR`; header names GPT-5.6 Sol; author header names Claude Fable 5.1; no Opus session                                                                            |

**AC-4 command** — run on the edits commit. Each span must extract a NON-ZERO number of lines (6, 4, 8 and 5 on `main`) and each `diff` must print nothing; a zero-line span is a failed check, not a pass.

```bash
span() { sed -n "/$1/,/$2/p"; }
for pair in '^> \*\*(d) slice|exists\.\*\*$' \
            '^- \*\*The scoped follow-up|itself a finding\.$' \
            '^- \*\*Depth is proportional|already records\.$' \
            '^- \*\*Honest cost|removed, not redrawn\*\*\.$'; do
  s="${pair%%|*}"; e="${pair##*|}"
  n=$(span "$s" "$e" < docs/governance/OPERATING_AGREEMENT.md | wc -l)
  [ "$n" -gt 0 ] && diff <(git show main:docs/governance/OPERATING_AGREEMENT.md | span "$s" "$e") \
                         <(span "$s" "$e" < docs/governance/OPERATING_AGREEMENT.md) \
    && echo "identical ($n lines): $s" || echo "FAIL ($n lines): $s"
done
```

## 7. Blast radius (OA §3.4)

**Upstream reliances.** No code reads these documents' content: `git grep -n -E 'OPERATING_AGREEMENT|ADVERSARIAL_REVIEW' -- src tests tools .github` returns three doc comments and one fixture path constant. `tests/support/authorLedger.ts` hashes the governed tree (§3.7) without reading it. The plan-consistency checker governs `docs/testing/SPACING_HELPER_PRESET_PLAN.md` only (`tests/unit/planConsistency.spec.ts:277-279`), so nothing here can move it.

**Downstream consumers.** Every future review commission (they are authored from the template) and every reviewer seat (§3.6) — the ratification review of this PR is the first live use of the vocabulary and is the acceptance test for it (AC-7). No skill under `.claude/skills/` cites §3.4 or the template (measured: `grep -rn -E '§3\.4|ADVERSARIAL_REVIEW' .claude/skills/` returns nothing); §3.4 keeps its number and heading regardless.

**Measured non-regression.** Docs-only: unit count unchanged at 1559 / 105; CI tier 1 selects `0 tests in 0 files` for `.md` changes (`.github/workflows/ci.yml:118-135`); `npx prettier --write` is run on every edited file because Prettier reformats Markdown tables. `bash tools/check-pr-evidence.sh <PR>` at PR-notes time.

**Accepted operational cost, stated rather than buried.** Two ledger regenerations on one branch (§3.7). Every SEV 2–4 finding on every future PR reaches the owner as a brief (§1.4).

## 8. Questions the reviewer is asked to answer, by number

1. **§3.1** — Is the derived verdict decidable as written? Name any review outcome that fits none of the three tokens.
2. **§3.3** — Does the OPEN state, combined with "no repair for it is committed", create a deadlock when the owner is unavailable and a SEV 1 needs repair alongside an unruled SEV 2? If so, propose the narrowest wording that avoids it without reintroducing a default the owner declined.
3. **§3.6** — Repeat the behavioural read of the two live governed surfaces and name any sentence that states what blocks, what a verdict is, or what a disposition may be that this plan does not edit.
4. **§3.3 protected span** — Does either inserted bullet change the MEANING of the unchanged STRAT-D7 bullets, even though their bytes are unchanged?
5. **§5** — Is the seam trace defensible? Name any finding you would move between seams A, B and C, and whether that changes scenario C.
6. **§3.2** — Does the implementation reading of SEV 1 ("an input that exists today, or an argued-plausible future input") leave a class of real defect ungradeable? Give the construction.

## 9. Open questions for the owner

None. The one default the agent proposed (SEV 3 defaults to DEFERRED) was declined on 2026-09-06 and is not in this plan; it is available as a later ruling if the per-finding brief becomes a burden.

## 10. Revision history

| Date       | Rev | Change                                                     | By               |
| ---------- | --- | ---------------------------------------------------------- | ---------------- |
| 2026-09-06 | 1   | First plan, for the SPEC-BEFORE-CODE review by GPT-5.6 Sol | Claude Fable 5.1 |
