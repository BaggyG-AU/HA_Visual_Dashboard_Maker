# F9a brief — fourth scoped repair follow-up, 2026-09-09

**Author:** OpenAI Codex / GPT-6 Astra — same independent reviewer; author of neither the brief nor its repairs.

**Reviewer:** n/a — no second-model cross-check commissioned or performed.

**Owner gate:** micah / BaggyG-AU decides dispositions and whether to lock the brief. Recommendations below are not owner decisions.

**Commissioned by:** owner, through `prompts/codex/f9a-brief-review-followup4.md`.

**Scope:** `c81b34b..b608a52`, both repair commits and Round 4's dependencies. Reviewed head `b608a5236d1f2c939fa19288c09d2392454d5232` matched `origin/feature/f9a-brief` after fetch and fast-forward pull. “Brief” means `docs/features/F9A_EXPORT_CAPABILITY_PROFILE_BRIEF.md`; “dispositions” means `docs/reviews/f9a-brief-repair-dispositions.md`. File coordinates refer to that head. Drawer coordinates below use the ID plus the named paragraph because drawers have no source-file line numbers.

**Restrictions:** this review is the only repository edit. No target, source, test, governance, Issue, board or `[STATE]` change; no push, merge or HA contact. No new governance mechanism proposed.

## 1. Verdict

**CLEAR-WITH-FINDINGS**

**P3 is RESOLVED:** the dated note controls the historical cost explanation, and the drawer supersession withdraws the unsupported ranking. The wider sweep still missed three record-accuracy defects, P7–P9, each **SEV 3**; no SEV 1 or SEV 2 remains. **The brief is ready to lock with an owner disposition of these residuals; I recommend accepting them.**

## 1a. Owner Summary Table

| Ref | What is wrong, in plain English                                                                                                             | Severity | Blocks | Fix complexity (1–5) | Recommendation |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ | -------------------- | -------------- |
| P7  | Two earlier passages still say every measurement happened on September 8, while the new correction says that account is no longer accurate. | SEV 3    | None   | 1                    | Accept as-is   |
| P8  | The summaries count saving an exported file as sending its contents to Home Assistant. The detailed account correctly distinguishes them.   | SEV 3    | None   | 1                    | Accept as-is   |
| P9  | The current handoff labels its lessons as three, then lists four.                                                                           | SEV 3    | None   | 1                    | Accept as-is   |

**Owner Decision Brief:** These findings protect the accuracy of the written handoff. **Product affected: No by these discrepancies** — the measured paths and the agreed scope remain explicit; this is not a claim that the unimplemented feature works. P7 concerns measurement dates, P8 concerns the description of export destinations, and P9 concerns a heading's count. For each, accepting the documented residual costs no repair; correcting the existing wording is small but creates another repair subject to the standing follow-up requirement. Deferral would also leave the discrepancy recorded. **Recommendation: accept P7, P8 and P9 and lock**, because none changes the spec's required work. Without a disposition, the three remain live findings here; acceptance is the owner's decision.

## 2. Method and verification

Read the entire current brief, the full repair diff, Round 4 and its addendum, and the governing review contract. Read the practice index by ID and the full rules on sweeping a finding's behavioural class and matching verification to the property claimed. Re-read the current decision drawer, superseding review drawer and `[STATE]` item 11. After the two date declarations surfaced, swept the brief's measurement/provenance claims end to end; after the export summary surfaced, followed each of the five callers to its immediate output consumer and checked the corresponding summaries.

**Preservation, measured programmatically:** all **33,589 bytes** of dispositions at `c81b34b` remain an identical prefix, followed by the Round 4 append. Thus Rounds 1–3 are byte-for-byte intact. The original §9.2 recommendation is **308 identical bytes** from `0bfeb6c`. All nine original A/B/C cell texts survive as prefixes after trimming table padding. The table as a whole is **not byte-identical**: the A-cost cell carries dated annotations and table padding changed. That is disclosed annotation around retained original wording, not loss or reconstruction of an option. The header fields, the brief before the options table, F6 through §8, and §9.3 are unchanged from `c81b34b`.

`git diff --name-only c81b34b..b608a52` contains only the brief and dispositions; all twelve commits from `691c8d1` to the reviewed head change only documentation. No source or test change calls for repeating the earlier synthetic capability probe in this round.

**Gate:** `./tools/checks` returned **REAL_EXIT=0**: lint, format check, typecheck and unit tests passed; **0 errors / 145 warnings; 1559 tests across 105 files**. Log: `/tmp/havdm-f9a-followup4-checks.log`. The new review's separate Prettier check also passed. Reproduction: `./tools/checks` and `npx prettier --ignore-path /dev/null --check docs/reviews/f9a-brief-codex-review-followup4.md`.

**Limits:** no Electron, e2e, integration, packaged-app, live-HA or store-file run. The caller evidence below is a source trace, not an observed transmission. I did not observe the author's earlier commands or the original owner questionnaire, establish actual installation coverage, identify a canonical layout-card folder, estimate implementation cost, or review an eventual spec. Historical gate claims are not retroactively certified by today's green gate. No exhaustive palace-wide or unrelated-state audit was commissioned; the source-backed drawer checks are the three records named below. Repository checks establish repository health, not prose accuracy.

## 3. Claim ledger — the ten declared members and the additional checks

Drawer names in this table refer to these records, read in full this round:

- **Decision:** `drawer_havdm_decisions_cf0c188aaf75f2cd622faadc`.
- **Supersession:** `drawer_havdm_review_87ecc867259c0577d931dd3f`.
- **State:** `drawer_havdm_state_a15b0af78e0814cfd19cf627`, item 11.

| Declared member / check     | Result and evidence                                                                                                                                                                                                                                                                            | Tag                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| F5                          | No issue found in the retained withdrawal: brief:299–319 makes derivability open and preserves the measured source facts. Unchanged this round.                                                                                                                                                | MEASURED / JUDGEMENT         |
| §6 D-2                      | No issue found: brief:430–438 keeps the unconsumed layout fact required while leaving its derivation for the spec.                                                                                                                                                                             | MEASURED                     |
| §9.2 A-cost cell            | No issue found with the repair: brief:607 explicitly withdraws the author's added “smallest of the three” assertion and points to the external note.                                                                                                                                           | MEASURED / JUDGEMENT         |
| §9.2 recommendation         | No issue found with placement or controlling meaning: brief:620–632 immediately follows the preserved recommendation and withdraws its evidentiary premise. The spec inherits an unknown cost, not an estimate.                                                                                | MEASURED / JUDGEMENT         |
| A/B option labels           | No issue found with the historical treatment: brief:633–639 discloses the collision and preserves the chosen scope. Preservation is measured in §2; this is not a claim that the entire annotated table is unchanged bytes.                                                                    | MEASURED / JUDGEMENT         |
| §11                         | Its two dated corrections are present at brief:750 and :752. The addendum honestly overturns dispositions:225 rather than rewriting it. The date correction missed two other declarations: P7.                                                                                                 | MEASURED                     |
| §9.3 cheapest outcome       | No issue found. Read the whole section, not just the field name: brief:682–696 still requires the layout fact and accurate warnings; :698–708 and header:32–40 retain the adopted outcome and stop-rule. Neither depends on the deleted cost estimate.                                         | MEASURED / JUDGEMENT         |
| State item 11               | The narrow no-current-cost-claim verdict is sound: it expressly links the supersession and grounds A in the approved scope. It does not establish that the whole item is clean: P8 and P9 below.                                                                                               | MEASURED / JUDGEMENT         |
| Decision ruling 2           | The old assertion remains, but Supersession explicitly identifies the sentence, withdraws its first half and supplies the unmeasured-cost reading. State points directly to that supersession. No issue found with this mechanism.                                                             | MEASURED / JUDGEMENT         |
| Prior review drawers        | Historical review findings are not current assertions of the withdrawn premise and are not the author's to rewrite. No issue found with that exclusion. Supersession's author-added account is separately checked above; its initial sweep report is pinned to `34eaf8e`, before the addendum. | JUDGEMENT from dated records |
| Additional semantic sweep   | The uncovered date declarations and stale lesson count concern claims about the evolving document itself. The export destination shorthand is older, found while attacking the supposedly clean State item. None is another dependency on the cost premise.                                    | MEASURED / INFERRED          |
| Append-only history / scope | All 33,589 prior disposition bytes survive; the repair diff changes two documents only. No unrelated feature or governance change found.                                                                                                                                                       | MEASURED                     |

**Weakest claims:** P7 establishes an inconsistent current account, not the actual date of every private measurement. Re-measuring a fact later would not, by itself, disprove an earlier measurement; the problem is that the author's explicit withdrawal of the blanket account is repeated in §11 but absent from two earlier current declarations. For P8, “what HA receives” might mean what a user eventually imports from a saved file; no such later import is part of this call path, and State's “send bytes” wording makes that interpretation especially loose. Lock readiness is a judgement about this brief's fitness to guide the spec, not implementation approval.

## 4. Findings and prior closures

**P3 — RESOLVED.** Both the cost premise and the added ranking are now expressly withdrawn at their current interpretation points. The original recommendation remains legible as history, with a directly adjacent controlling correction. The decision drawer's own instruction calls for supersession; the named superseding record actually performs it, and the current handoff links it. I do **not** recommend a third in-place edit. No further cost-dependent member was found in the reviewed brief, dispositions or these live records.

**P1, P2, P4, P5 and P6 — RESOLVED, prior closures retained.** The control-leg instructions, required scope and warning consistency, corrected availability reference, preserved history and corrected dependency account remain intact. This round does not claim a fresh full review of their unchanged source dependencies.

### P7 — SEV 3 — the measurement-date correction has two unrepaired copies

Blocks: None

**Evidence/problem:** brief:62–65 says every §4 reference was re-measured on September 8; brief:149–151 says every fact below was measured that day. Brief:750 now says the original blanket September 8 account was falsified by the repairs, and dispositions:260–264 gives the same correction. The two earlier declarations have no dated qualification. This is the additional kind of class member the commission asked for: a claim about the document whose accuracy changes as its evidence changes, outside the originally searched cost passages.

**Class/same seam swept:** behaviour = representing the provenance and execution status of the brief's evidence after repair. Read §0, every F1–F10 passage and command, the dated corrections, all §11 rows, Round 4 and the three drawer accounts; searched dates, measurement, tracing, runtime and verification as locators. The brief has three blanket September 8 declarations about §4: :62–65, :149–151 and :750. Only the last is qualified. No further unqualified “no runtime executed” declaration survives in that scope; F3/F4 remain expressly hand traces, and F9's store-path limit does not claim a store observation. Historical review and decision dates are not rewritten as current measurement dates.

**Severity:** each of the two surviving declarations is SEV 3. The dated correction supplies the accurate current qualification, the code base is unchanged, and a wording correction changes no product requirement.

**Bounded remedy if elected:** reconcile both earlier declarations with the existing dated qualification. **Upstream reliance:** the already-recorded measurement history, not a new measurement campaign. **Downstream consumers:** readers entering §4 through either introduction and the author's completeness account. **Must not change:** measured source facts, base commit, execution limits or append-only history. **Complexity 1:** existing prose only; no new test or mechanism is needed.

### P8 — SEV 3 — content producers are described collectively as HA senders

Blocks: None

**Evidence/problem:** State item 11 says “only FOUR of the five send bytes to HA.” The same shorthand appears in brief:235–238's table framing and :246–247, and Decision's “three code facts” paragraph (a), which says sites 1, 2, 3 and 5 decide what HA receives. All five call sites were checked:

| Site                                       | Immediate output consumer, traced from source                                                                        |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `src/App.tsx:426`                          | `deployReport.config` → `App.tsx:3515` → `src/components/DeployDialog.tsx:173–185` → HA save API.                    |
| `src/App.tsx:748`                          | Serialized YAML → `fileService.saveFileAs` at :757 → `src/services/fileService.ts:97–104`, a file write.             |
| `src/App.tsx:2481`                         | Sanitized config → HA temporary-dashboard creation at :2480.                                                         |
| `src/App.tsx:2580`                         | Only `warnings` are consumed at :2581. The later :2625 call passes dashboard paths, using previously stored content. |
| `src/components/HADashboardIframe.tsx:197` | Sanitized config → HA temporary-dashboard update at :200–203.                                                        |

There are **four content producers: three feeding HA and one feeding a file**, plus one warnings-only call. Brief:241 already labels the file producer correctly, and header:33–34 expressly includes both destinations. This is loose summary wording, not a missing export path or a reason to remove file export from scope.

**Class swept:** descriptions that turn the five-call-site inventory into a destination or content/warning summary, throughout the brief, dispositions, four earlier review files and the three named drawer bodies. Affected current prose is State item 11, the F4 framing/conclusion and Decision paragraph (a). The detailed five-row inventory and the header/§9.3 “HA or file” statements are correct. My initial review already gave the correct split at `docs/reviews/f9a-brief-codex-review.md:66`, but did not flag this shorthand. **This is an older record miss, not a regression caused by the cost repair.**

**Severity per construction:** the State assertion and both copies of the shorthand are each SEV 3, mitigated by the explicit file row and unchanged acceptance scope.

**Bounded remedy if elected:** distinguish content generation from its HA/file destinations in the existing summaries; use supersession for the old decision record if correcting that copy. **Upstream reliance:** the five consumer traces above. **Downstream consumers:** the brief's reader and State's handoff. **Must not change:** five-call-site coverage, the warning/content distinction, any source behaviour or historical review files. **Complexity 1:** wording only; no runtime test is needed to correct the summary.

### P9 — SEV 3 — the lesson heading was not updated with its contents

Blocks: None

**Evidence/problem:** State item 11's “THE THREE LESSONS” introduces explicitly labelled **(a), (b), (c), (d)**. The fourth concerns the accumulated sweep failures. It is another statement about the record that the expanded contents have outgrown.

**Class swept:** lesson-count headings and their complete lists in Round 4 and the three named drawers; the sole mismatched lesson heading is this one. The four members are repair-as-new-work, reliances versus edits, deleting the repeatedly wrong claim, and evidencing a completeness assertion. This does not change the separate historical counts of review rounds or failed claim wordings.

**Bounded remedy if elected:** align the heading with its four members, or remove the count. **Reliance/consumer:** the list itself / the next reader of State. **Must not change:** the lessons, owner rulings or historical records. **Severity and complexity:** SEV 3, complexity 1 — a stale count with no behavioural effect.

## 5. Directions and proportionality

**The brief is ready to lock, subject to the owner's disposition of P7–P9. I recommend accepting all three residuals and proceeding to the spec.** P3's substantive and cost-record repairs are complete; the remaining issues do not change the one-object requirement, layout-fact obligation, F9a/F9b split, truthful warnings or the spec's responsibility to establish evidence and cost.

No product or architectural pivot is needed. I do not recommend another brief-only repair round for these records. If the owner chooses correction, the standing scoped follow-up requirement still applies; this recommendation creates no exemption and makes no owner decision. The bounded remedies above identify the affected claims without writing the author's replacement prose or proposing new governance.

## 6. Disagreements

I agree with the author's P3 closure and with retaining historical text under an explicit correction. I disagree that the expanded assessment has exhausted the claims affected by accumulated edits: P7 and P9 remain. The cost-specific clean findings for §9.3 and State are sound, but the latter is not a certificate for State's other contents; P8 is an additional older discrepancy uncovered there. The present findings do not justify reversing my recommendation to lock.

## MemPalace drawer candidates

The single `mempalace_add_drawer` attempt was refused: “Peer MCP writer active; this server is read-only for mutating tools.” No retry, lease override, process kill or separate local memory file. Under MP-LEASE, the write-enabled author may file the following text verbatim: wing `havdm`, room `review`, `added_by="codex"`, source `docs/reviews/f9a-brief-codex-review-followup4.md`.

> [INVESTIGATION] HAVDM F9a brief fourth scoped follow-up, 2026-09-09 — OpenAI Codex / GPT-6 Astra reviewed c81b34b..b608a52, Round 4 and its addendum, the full brief, and the live decision/supersession/state dependencies. Deliverable: docs/reviews/f9a-brief-codex-review-followup4.md. Verdict CLEAR-WITH-FINDINGS. P3 RESOLVED: the adjacent dated note controls the preserved cost rationale; the unsupported ranking is explicitly withdrawn, including by legitimate supersession in drawer_havdm_review_87ecc867259c0577d931dd3f. No third in-place decision edit recommended. All 33589 prior disposition bytes remain intact; the original recommendation is 308 identical bytes and original option-cell text survives with disclosed annotations. P1/P2/P4/P5/P6 closures retained. New record-only findings, each SEV 3 and complexity 1: P7, two blanket September 8 measurement declarations survive outside the corrected verification table; P8, State and corresponding brief/decision summaries conflate four content producers with HA senders, whereas three feed HA and one writes a file, with a fifth warnings-only call; P9, State's three-lessons heading introduces four labelled lessons. P8 predates the repair and was not flagged by the initial review despite its correct destination enumeration. No SEV 1 or SEV 2. Reviewer recommends accepting P7/P8/P9 and locking the brief, subject to owner disposition; no further brief-only round recommended, no exemption if repair is chosen. Gate REAL_EXIT=0, 0 errors/145 warnings, 1559 tests/105 files. No target, source, test, governance, Issue, board or State edit; no push, merge or HA contact. Full evidence, limits and bounded remedies are in the review.
