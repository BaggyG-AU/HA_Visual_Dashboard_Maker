# F9a brief — third scoped repair follow-up, 2026-09-09

**Author:** OpenAI Codex / GPT-6 Astra — same independent reviewer; author of neither the brief nor its repairs.

**Reviewer:** n/a — no second-model cross-check commissioned or performed.

**Owner gate:** micah / BaggyG-AU decides dispositions and whether to lock the brief. Recommendations below are not owner decisions.

**Scope:** `prompts/codex/f9a-brief-review-followup3.md`; diff `fda8059..0a771ab` and Round 3's declared dependencies. Reviewed head `0a771abec8186b09926abafe8c334fb6cc4b4b63` matched `origin/feature/f9a-brief` after fetch and fast-forward pull. “Brief” means `docs/features/F9A_EXPORT_CAPABILITY_PROFILE_BRIEF.md`; “dispositions” means `docs/reviews/f9a-brief-repair-dispositions.md`. Coordinates refer to that head.

**Restrictions:** this review is the only repository edit. No target, source, test, governance, Issue, board or `[STATE]` change; no push, merge or HA contact. No new governance mechanism proposed.

## 1. Verdict

**CLEAR-WITH-FINDINGS**

The unsupported derivability guidance is withdrawn, and deletion preserves the measured facts the spec needs. P3 is **PARTIALLY RESOLVED**, now **SEV 3**: the remaining defects concern the cost explanation and its recorded dependencies, not the capability guidance. No SEV 1 or SEV 2 remains; I recommend accepting this record-only residual and locking the brief.

## 1a. Owner Summary Table

| Ref | What is wrong, in plain English                                                                                                       | Severity | Blocks | Fix complexity (1–5) | Recommendation |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ | -------------------- | -------------- |
| P3  | The cost explanation still uses withdrawn evidence and calls the chosen option cheapest while another option is described as cheaper. | SEV 3    | None   | 1                    | Accept as-is   |

**Owner Decision Brief:** **Protects:** an accurate account of the chosen scope and its cost. **Problem:** the evidence withdrawal did not fully reach the recommendation paragraph, and the new comparison conflicts with the options table. **Product affected:** no behaviour changes; option A and the requirement to establish the layout fact remain explicit. **Options/costs:** accept the documented record discrepancy and proceed to the spec; defer correction; or correct the existing cost passages, with the scoped follow-up required for a repair. **Recommendation:** accept as-is at the brief stage. **Do nothing without disposition:** P3 remains live in this review, although the earlier capability-evidence risk is removed.

## 2. Method and verification

Read the complete repair diff, F5, D-2, all §9.2 options and recommendation, Round 3, and the actual ruling-2 drawer correction. Re-read the applicable practice rules and severity contract. Checked the source extractor, collector, metadata path, profile builder and cited tests; re-ran the module probe reproduced in `f9a-brief-codex-review-followup2.md`, exit 0. Its eleven extraction cases and paired-profile comparison still pass. These are synthetic module observations, not a real installation survey.

`git diff --name-status fda8059..0a771ab` lists only the brief and dispositions. The corresponding diff over `src`, `tests`, governance and templates is empty. A byte-prefix comparison against `git show fda8059:docs/reviews/f9a-brief-repair-dispositions.md` confirmed **all 23,534 prior bytes unchanged**, followed by the Round 3 append. Programmatic passage comparisons also confirmed that F5's pre-existing factual portion, F6–F10, §8 and §9.3 are unchanged.

**Gate:** `./tools/checks` returned **REAL_EXIT=0**: lint, format check, typecheck and unit tests passed; **0 errors / 145 warnings; 1559 tests across 105 files**. Log: `/tmp/havdm-f9a-followup3-checks.log`. The review file's separate `prettier --check` also passed.

**Limits:** no Electron, e2e, integration, packaged-app, live-HA or store-file run; none is required for this docs-only repair. No canonical layout-card folder, actual installation coverage, implementation cost or eventual spec was established. Earlier reviews' runtime boundaries still apply. The gate checks repository health, not the truth of the prose.

## 3. Claim ledger and six commissioned checks

| Check                       | Result and evidence                                                                                                                                                                                                                                                                                                                                                                                                                                   | Tag                        |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Claim withdrawal everywhere | F5:299–319 and D-2:433–438 explicitly leave derivation open. The A-cost cell at :607 and ruling 2 of `drawer_havdm_decisions_cf0c188aaf75f2cd622faadc` expressly withdraw the old claim. The recommendation at :614–618 still uses its old premise: P3 below. Historical descriptions of withdrawn claims are not new assertions of their truth.                                                                                                      | MEASURED / JUDGEMENT       |
| Measured facts retained     | F5:277–297 is unchanged: lexical extraction, metadata filling only `versions`, absolute/query-string retention and docblock disagreement remain. `src/services/capability/capabilityResolver.ts:35–42`, :56–72 and `tests/unit/capabilityResolver.spec.ts:75–78` agree with the retained account. `rg -n 'layout' src/services/capability/resourceElementMap.ts` returned no matches, exit 1; the absent-constant statement remains at brief:317–319. | MEASURED                   |
| Replacement over-correction | No issue found. “Open” describes what this brief has not established; it does not claim derivation is impossible or remove the retained evidence of matching-folder retention. The spec still must establish the name, evidence in a given capture and unanswered-capture behaviour. D-2 retains the required unconsumed layout fact.                                                                                                                 | JUDGEMENT                  |
| Cost consequences           | Relative ordering and unknown absolute cost can coexist. This particular ordering is inconsistent: A is newly called smallest of all three, B remains “Smallest of all,” and the recommendation still says B saves work. P3.                                                                                                                                                                                                                          | MEASURED / JUDGEMENT       |
| Round 3 radius              | The extractor, collection, metadata, builder, cited tests, paired probe and option A are real reliances; D-2, the A-cost cell, drawer explanation and future derivation are real consumers. However, dispositions:161 omits the still-dependent §9.2 recommendation, which Round 2's row at :86 correctly included. This omission belongs to P3's incomplete cost cleanup.                                                                            | INFERRED from a hand trace |
| Append-only history         | All 23,534 bytes of the prior disposition file remain intact, including Rounds 1 and 2. No issue found.                                                                                                                                                                                                                                                                                                                                               | MEASURED                   |

**Weakest claims:** the dated cost withdrawal can be read as controlling the old recommendation too; that mitigates the surviving sentence but does not make the record consistent. “Smallest” may have intended the least work compatible with the settled scope, but the new text expressly says “of the three options.” No actual comparative effort was measured.

**Other scope and cosmetics:** no unrelated source or feature change found. The drawer's disclosed backslashes affect presentation only; I agree with leaving them alone. The prior P1/P2/P4/P5/P6 closures remain valid for their reviewed repairs; this round's omitted cost consumer is reported under P3 rather than counted again as a separate radius finding.

## 4. P3 — PARTIALLY RESOLVED; remaining SEV 3

Blocks: None

**What closed:** F5 and D-2 no longer answer the layout derivability question. The drawer's correction is present and makes the same withdrawal. The owner's deletion was appropriate: it removes the unsupported conclusion while preserving the facts and the spec's required work.

**Remaining evidence/problem:**

1. Brief:615–617 still says the cost is small **because F5 measured that the underlying data is already persisted**. F5 now expressly declines that conclusion. The nearby dated withdrawal mitigates this as stale decision-record wording; it does not justify reporting the recommendation as an unaffected consumer. Dispositions:161 omits this consumer despite its earlier identification at :86.
2. Brief:607 newly says **“A remains the smallest of the three options”**, while B's cost at :608 is **“Smallest of all”** and the recommendation at :616–617 says B saves work. The new assertion is repeated in dispositions:161 and the live ruling-2 drawer. A is the selected option that preserves the settled scope; that does not establish that it is cheaper than B, which explicitly drops part of that scope.

**Severity per construction:** the stale cost premise, inconsistent relative ordering and omitted cost-consumer declaration are each SEV 3. The operative capability claim is explicitly withdrawn, option A is settled, and these corrections change no product behaviour. This is not a remaining unqualified instruction to infer layout-card presence or a reason to regrade the brief as blocked.

**Concrete fix if elected:** bring the existing recommendation into line with the withdrawal, and remove or correctly scope the relative-cost assertion. Carry that correction through the current disposition account and drawer copy, including the recommendation in the declared consumers. No fresh estimate or replacement derivability claim is needed.

**Must not change:** option A, the one-object requirement, the F9a/F9b split, the adopted header fields, accurate warnings, the measured source facts or the append-only disposition history. Do not reintroduce a derivability promise to support the price argument.

**Class/same seam swept:** behaviour = presenting the cost implications of the layout fact. Read F5 and D-2, all three option rows, the full recommendation, Round 3 and the complete ruling-2 explanation, corroborated by `rg -n 'deriv|migration|already stored|already persisted|smallest|cheap|cost|F5'` over the brief. B/C's scope descriptions remain unchanged; the cost premise and new ordering above are the affected constructions. This is the cost portion of the existing P3 seam, retained under its original Ref. **Complexity 1:** existing-record wording only; no product pivot.

## 5. Directions and proportionality

The brief is substantively ready to lock **with an owner disposition of the SEV 3 P3 residual**. I recommend acceptance and progression to the spec; I do not recommend another brief-only round for these record inconsistencies. This is not a clean verdict or an acceptance made on the owner's behalf. If the owner elects another repair, the standing follow-up requirement still applies.

I agree with deletion over my previous narrower qualification or acceptance proposal: no measured fact needed by the spec was lost, and no new implementation work was imposed. The new ranking and missed recommendation are defects in carrying the deletion through its cost explanation, not evidence that deletion itself was the wrong choice. No new rule, gate or procedure is proposed.

## MemPalace drawer candidates

The preceding review was read back at `drawer_havdm_review_be81b829f801c52b9d6c06e0`. This round's single `mempalace_add_drawer` attempt was refused: “Peer MCP writer active; this server is read-only for mutating tools.” No retry, lease override, process kill or separate local memory file. Under MP-LEASE, the write-enabled author may file the following text verbatim: wing `havdm`, room `review`, `added_by="codex"`, source `docs/reviews/f9a-brief-codex-review-followup3.md`.

> [INVESTIGATION] HAVDM F9a brief third scoped follow-up, 2026-09-09 — OpenAI Codex / GPT-6 Astra reviewed fda8059..0a771ab and Round 3's dependencies. Deliverable: docs/reviews/f9a-brief-codex-review-followup3.md. Verdict CLEAR-WITH-FINDINGS: P3 PARTIALLY RESOLVED, remaining SEV 3 only; no SEV 1 or SEV 2. Deletion appropriately withdraws the derivability guidance from F5/D-2 and the live ruling-2 drawer while retaining the measured extractor, metadata, URL and constant facts. All 23534 prior disposition bytes remain unchanged. Remaining cost-record issues: the recommendation still invokes the withdrawn persisted-data premise; the new assertion that A is smallest of all three conflicts with B's smallest-of-all row and the statement that B saves work; the ordering repeats in Round 3 and the drawer. Round 3's radius also omits the recommendation consumer named in Round 2. These are the cost portion of P3, not a renewed capability inference or product blocker. Reviewer recommends accepting the documented record residual and locking the brief, with no further brief-only round; owner disposition remains required. Deletion itself was sound, and the disclosed drawer backslashes are cosmetic. No target, source, test, governance, Issue, board or state edit; no HA contact. Full evidence and validation are in the committed review.
