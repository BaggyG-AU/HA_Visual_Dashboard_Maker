# Review-loop trial: consolidated owner decision

**Status: Fable and Codex agree on the approach below; owner adoption is pending.** This consolidates the accepted terms. It does not enact a rule, change a board item or reopen the locked F9a brief.

**Recommendation:** try the process on F9a, F6 and F10, record the results briefly, then decide whether to keep, change or stop it. The purpose is satisfactory product delivery with less rework and less owner effort. Fewer reviews alone do not establish success.

## What exchange 4 settles

Fable's [exchange-4 reply](/home/micah/projects/HA_Visual_Dashboard_Maker/prompts/codex/f9a-loop-analysis-fable-reply-exchange4.md) accepts the [session-log audit](2026-09-10-fable-analysis-session-log-review.md), corrects “unreconstructable,” and confirms the evidence-applicability wording, visible owner exceptions and lightweight measurement in [Codex's exchange-3 response](2026-09-10-review-loop-exchange3-codex-response.md). Codex accepts those confirmations and the practical improvements. No material disagreement about the recommended approach remains.

The session establishes preventable Fable rework and substantial context loading. It does not establish an exact wasted-token bill. The reply's additional tool-volume percentage and conditional context-window comparison are not used to justify this decision. Nor do we promise that reorganising the index will halve context use. Those estimates need not be settled to address the observed problems. Codex's own missed findings, defective remedy and contribution to the shared-checkout collision remain part of the diagnosis.

## The process, step by step

1. **Agree what finished means.** Each story and deliverable has an explicit Definition of Done (DoD), with a short set of observable acceptance criteria agreed before its work starts. The story carries the outcome and criteria, with links to detail and evidence in its existing brief or specification. A brief settles intent and boundaries; an implementation demonstrates behavior. Requirements are not silently expanded during review.
2. **The author completes and checks the work.** Run the intended review commission against the completed deliverable before handing it over, including relevant dependencies and working behavior. Check what evidence actually measures before relying on an important rate or causal conclusion. Bundle justified, authorized corrections and verify their effects. If the same defect class recurs or consequential new defects keep appearing, surface the unresolved condition with continue/residual/park options instead of silently restarting the entire self-review. Incomplete validation remains incomplete.
3. **An independent reviewer performs one full first review.** Its commission supplies the scope, revision, contract, governing sources and evidence locations. The reviewer derives coverage from those sources and the actual change before comparing author self-checks and risk notes. Limitations remain disclosed; author assurances do not remove checks. Return findings together. These responsibilities attach to the roles, including when Codex authors and Claude reviews.
4. **Give the owner one clear decision brief.** For findings requiring an owner decision, explain the effect on an acceptance criterion, product behavior or consequential downstream decision; the options; the recommendation; and the full cost of another cycle. Fix-now includes repair, regression checking, reporting and follow-up. A harmless historical miscount can be accepted as-is; it does not need a cleanup task without a reason. A record used to justify acceptance or a safeguard remains consequential and reviewable. Existing per-finding owner disposition requirements apply.
5. **Bundle approved repairs and verify the affected behavior.** The author identifies upstream dependencies, downstream consumers and other relevant instances within the authorized scope. Check the failing case and valid behavior, and run affected and mandatory regression checks. The reviewer verifies the repair and its actual reach independently, including reviewer-prescribed remedies. Aim for one full review plus one repair check. This is a target, not automatic approval or a cap that hides defects. Recurrence uses the existing continue/residual/park decision; actual repairs still receive required follow-up.
6. **Close against the contract and capture the outcome.** Say whether the DoD and criteria are demonstrated, explain remaining risks in plain language, recommend acceptance or further work, and record the owner's decision. Keep the existing close-out short. After the cohort, both agents assess whether quality, effort and interruptions justify keeping the process.

## The acceptance contract

**When the agreed criteria are demonstrated, with no known unresolved SEV1 or other demonstrated material defect, the agents recommend acceptance.** Withholding that recommendation requires an unmet or unverified criterion, or a specific material defect with evidence and a plain-language consequence. Additional preferences become a scope decision, rather than silently moving the acceptance boundary.

“Material” concerns an agreed outcome, meaningful product behavior, a relevant regression, or evidence that a consequential decision relies on. It is not determined by the file containing the defect. If a defect exposes an important omission in the DoD, explain that omission and seek an explicit scope or acceptance decision.

The human retains final authority. An accepted residual risk or unmet/unverified criterion stays visible as an exception; it is not relabelled “met” or “fixed.” Under [Operating Agreement §3.4](../governance/OPERATING_AGREEMENT.md#34-implementation-slices--the-review-lifecycle), a SEV1 can leave OPEN through an owner-recorded acceptance of its residual. That disposition does not prove the defect disappeared. An unverified criterion prevents an ordinary recommendation that the contract has been met.

**Agreed evidence clause:**

> Acceptance evidence identifies the revision checked and establishes its applicability to the final deliverable. Re-run affected checks and the checks required by Operating Agreement §3.5. Earlier evidence for unaffected behavior may support the assessment when its continued applicability is established and its source and revision are explicit. Never describe an unperformed re-run as independently verified. Changes that invalidate the evidence require fresh checking.

This avoids treating an unrelated later edit as proof that all earlier testing became invalid. It preserves [§3.5's mandatory checks](../governance/OPERATING_AGREEMENT.md#35-reviewer-re-run-scope-binding).

## Reduce internal work without adding paperwork

Use separate worktrees, explicit working directories, edits resilient to formatting, and commands that expose prerequisite failures. Extract or search large results before selecting useful excerpts; do not repeatedly print oversized payloads. Mandatory reading continues to apply.

Prepare the agreed practice-index reduction by retaining the rule summaries and drawer pointers while moving historical narrative to a linked home. Because this is shared across projects, both agents must review the actual change and confirm that active instructions remain discoverable before it is applied. The proposal authorizes no silent rule deletion, and no size reduction is asserted before measurement.

Store the session file identifier or path in the existing close-out where available, alongside the short cycle/outcome observations already proposed. The log preserves usage; the note preserves why work repeated. Do not load whole transcripts into the next session or create a new ledger. Treat unavailable measurements as unknown.

## Cohort and assessment story

These are the selected stories and their starting outcomes, carried forward from the [owner refinements](2026-09-10-review-loop-trial-owner-refinements.md). Detailed criteria still come from each story's agreed contract.

| Story              | Product outcome                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| F9a / S01.1 / #159 | Export/deploy respects captured card-mod capability, preserving the existing brief's absent, present and never-connected behavior. |
| F6 / S02.1         | Paste is available from empty flat and sections canvas context menus, preserving clipboard and existing card interactions.         |
| F10 / S02.2        | The entity picker reveals hidden diagnostic/config matches in place with the appropriate count.                                    |

F9b is outside this cohort. Apply the trial prospectively to remaining work; the completed F9a brief is historical evidence. Preserve the assigned author/reviewer roles. Count these three stories and link their contributing PRs. The governance pause's separate three-product-PR trigger is unchanged; honor it when reached and reuse the evidence for its retrospective.

**Draft assessment story: “Assess the F9a/F6/F10 review-loop trial.”**

- **Purpose and dependency:** decide whether the process improves product delivery after the three stories reach recorded outcomes. Include parked or failed attempts and assess early if the trial stops. This is not a fourth product story.
- **Evidence:** reuse each story's DoD/criteria results, internal self-review and repair cycles, independent rounds by deliverable, owner interventions, elapsed time and active effort distinguished where available, recorded usage, and repair regressions or consequential escaped defects. Classify findings as deliverable, reporting record, both or unclear; use existing references, investigating history only when it affects a decision. An internal cycle means self-review followed by repair and renewed checking, not every drafting edit.
- **DoD and acceptance:** the outcomes and available costs are compared; both Fable and Codex review the assessment; the owner receives a concise keep/change/stop recommendation covering quality, effort and uncertainty; the owner's decision and selected follow-up are recorded. Baselines identify their sources and differences in scope. Fewer rounds with important escaped defects is not sufficient success.

## Decision for the owner

| Field                  | Decision brief                                                                                                                                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What this protects     | Working product, useful independent review, and the owner's time.                                                                                                                                                                                                                     |
| What is going wrong    | Repairs and their reporting create new review work; acceptance boundaries drift; agents can spend substantial effort checking without establishing important claims.                                                                                                                  |
| Product affected?      | Unknown until the particular finding is assessed. Each owner brief states Yes, No or Unknown with its consequence. Historical paperwork inaccuracies alone do not establish product harm.                                                                                             |
| Options and costs      | **Adopt the bounded trial:** some initial contract and close-out effort, with a chance to reduce repeated review; benefits remain to be measured. **Keep existing rules only:** no trial setup, but decisions remain case by case without the agreed standing recommendation default. |
| Recommendation and why | Adopt for F9a/F6/F10, with their assessment story. The changes address observed causes while preserving independent checks and owner authority. Prepare the index reorganisation for joint review as scoped supporting work.                                                          |
| If you do nothing      | Existing rules and per-finding rulings continue. No prospective trial default is inferred.                                                                                                                                                                                            |

**Proposed adoption:** approve this package as a dated, prospective exception to the governance pause for F9a/F6/F10 and their assessment, including preparation and joint review of the described index reorganisation. Record the actual approval date. The exception covers the explicit contract, bounded review recommendations and light use of existing records. It does not waive required tests, independent review, repair follow-ups, owner dispositions or the pause's existing trigger. No new checker, gate, template or ledger is part of the trial.

The owner's request to analyse and reconcile authorized preparing this proposal. Final adoption was held pending this explanation and agreement; it has not been inferred. After approval, record the decision, attach the contracts to the selected stories and create the assessment story, then continue the product work. Actual changes remain subject to the requested Fable/Codex review.

## Verification and MemPalace drawer candidates

This consolidation was compared with the agreed recommendation (`1031f50`), owner refinements (`52b899c`), exchange-3 qualifications (`3c42eee`), session audit (`0c53254`) and the supplied exchange-4 reply. The pause drawer `drawer_havdm_decisions_89b5f20cc75d3f70a7e0491b` and Operating Agreement §§3.4–3.5 were checked for the adoption boundary and retained obligations. This is not a fresh audit of exchange 4's numerical estimates or a current board-status check. Product tests do not validate this documentation-only consolidation.

Handoff candidate: Fable exchange 4 and Codex now agree on the refined trial and session-log correction. This advances the pending-reconciliation state in `drawer_havdm_review_f4f395dc6259684382220832`. The consolidated package is `docs/reviews/2026-09-11-review-loop-trial-owner-decision.md`; owner adoption remains pending. No governing text, board item or live project state was changed.
