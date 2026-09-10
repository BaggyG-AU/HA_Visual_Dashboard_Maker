# Review-loop trial — owner refinements for Fable's response

**Status:** proposed refinement of [the agreed recommendation](2026-09-10-review-loop-agreed-recommendation.md), following the owner's six-point response. The earlier agreement remains the baseline; the additions below await Fable's response and final owner adoption. No board item, operating rule or implementation has been changed by this document.

## 1. Definition of Done drives the work and the closing decision

The owner requires an explicit Definition of Done (DoD) for each deliverable, including the board story. Put the story's observable outcomes on the board, linked to the detailed acceptance evidence in its existing brief/specification. Give each deliverable its own appropriate finish condition: a brief settles intent and boundaries; a specification is implementable and testable; an implementation demonstrates the agreed behavior and preserves relevant working behavior. Do not require a brief to prove code that does not yet exist.

At closure, state whether the DoD is met and where the evidence lives. For a remaining finding explain whether it:

- prevents an agreed outcome;
- reveals a material omission in the DoD, requiring an explicit scope/acceptance decision;
- leaves the DoD satisfied and has no consequence worth another repair round.

This avoids both moving the goalposts silently and accepting an important unexpected defect because the checklist forgot it. Keep the owner summary plain: **Does it meet the DoD? What happens if we proceed? What do you recommend, and what would another round cost?** Unknown evidence stays unknown.

## 2. Author self-review already exists; investigate its execution

The owner's recollection is correct. MemPalace's current rule `drawer_practice_review_d73e10b60b5f38111c7049e3` requires the author to execute its review commission before handoff, retain its strength and check real behavior. It explicitly rejects a zero-findings objective. Existing [repair follow-up rules](../governance/OPERATING_AGREEMENT.md#34-implementation-slices--the-review-lifecycle) also require the reviewer to verify the declared radius independently. Adding another instruction to “check carefully” is insufficient.

Two concrete tensions need Fable's assessment:

- The self-review rule's application clause 8 says a risk that can be fixed in the time taken to describe it was being deferred. This prices the edit, while the proposed trial prices the full correction and review cycle. Project-level owner dispositions already take precedence; the wording can still pull the author toward low-value repairs.
- That rule invites the author to publish weakest claims and invite findings by name; `drawer_practice_review_cd820ef37a0e24108988e150` says not to supply suspicions that lead the reviewer. These duties need a practical boundary, not another long checklist.

**Proposed execution:** plan and run a consolidated self-review, bundle justified/authorized corrections, then verify the repaired work and affected behavior. If the same defect class recurs or new consequential defects keep appearing, report the unresolved condition and request the existing continue/residual/park decision. Do not silently restart the entire commission until context is exhausted. This bounds uncontrolled repetition, not required validation; incomplete checking does not become a pass.

Ask Fable to trace one available self-review episode from actual records: check performed → defect found → correction → newly necessary check → reason for continuing. Separate required verification, report-writing overhead, repeated work and tool failures. State what cannot be reconstructed. A retrospective explanation of private reasoning is not evidence, and no token rate should be invented.

## 3. Review prompts are navigation aids, not the acceptance authority

Whoever drafts the commission can influence what the reviewer examines. The retained F9a first commission names weakest claims; the [review template](../templates/ADVERSARIAL_REVIEW.md#1-verdict-first) records a prior case where supplied verdict wording influenced the verdict. Neither observation proves that an individual F9a miss was caused by its prompt.

**Proposed boundary:** use the existing review template with factual scope, the exact revision, links to the story/DoD and governing sources, and evidence locations. The reviewer derives its coverage from those sources and the actual change before comparing it with the author's self-check and risk notes, within the same review. Known limitations remain disclosed. Author assertions such as “already verified” are evidence claims to examine, not permission to omit checks. Access to canonical sources is preferable to expanding an author-written summary; quote inaccessible authority accurately when needed.

The reviewer must remain independent of the substantive artifact. These obligations apply to roles, including Codex when authoring. F9a's current [issue #159](https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker/issues/159) records Sonnet specification → Codex specification review and implementation → Opus implementation review. The trial does not silently replace that chain with “Claude always implements, Codex always reviews.”

## 4. Product consequence, owner choices and the repair boundary

The owner's fix-now choices contributed to continuation. Agent recommendations that called edits cheap without costing their verification and review made those choices understandable. The remedy is better advice: recommend accepting a harmless historical miscount as-is when it has no consequential reader. Do not create deferred cleanup work without a reason to do it. If a review count is used to assess this trial, correct the relevant measurement because it affects that decision; this need not reopen product review. False evidence supporting acceptance is consequential even when stored in a document.

For an authorized bundle of fixes, the author first identifies the affected behavior and its callers/consumers, addresses other instances within the authorized scope, and checks valid behavior as well as the failing case. Expand checking when shared code, new failures or the actual change justify it. Finish with evidence for the final bundle, not evidence from before the last edit. A blanket test run or a statement that the “blast radius was checked” is not a substitute. Additional findings outside the authorized scope return as recommendations rather than automatic fixes.

## 5. Recommended named cohort

The live GitHub project was read on 2026-09-10. F9a is issue #159, In Progress. F6/S02.1 and F10/S02.2 are candidate stories in epic E02, not separate issue cards. F9b/S01.2 is in epic E01 and depends on F9a. The [frozen backlog's order](../strategy/2026-09-07-product-backlog-seeding.md#5-why-this-order) and owner ruling `drawer_havdm_decisions_bdef071e2ead9ed0a5ff8d9c` already select F9a → F6 → F10.

| Trial story        | Observable outcome to refine into its DoD                                                                                                                                                                                               | Why include it                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| F9a / S01.1 / #159 | Export/deploy uses captured card-mod capability: absent strips the relevant styling and warns; present preserves it; never-connected remains permissive. Its existing brief also carries the layout-card fact without consuming it yet. | Shared export behavior exercises broader regression responsibility.            |
| F6 / S02.1         | Right-clicking empty flat or sections canvas offers Paste, with clipboard behavior and existing card interactions checked.                                                                                                              | A contained interface change exercises the lighter workflow.                   |
| F10 / S02.2        | The entity picker's diagnostic/config control reveals hidden matches in place and shows the appropriate count.                                                                                                                          | Another observable interface change provides a repeat of the lighter workflow. |

Recommend this mixed cohort. Selecting F9b instead is a legitimate owner reprioritization, but samples two related export changes and postpones a previously selected smaller feature. The rows above are starting outcomes, not replacements for the existing detailed contracts. F9a's already completed brief is historical baseline; do not reopen it merely to make the trial look prospective from the beginning.

Count the trial by these three stories and link every contributing PR. Keep that separate from the existing pause's three-product-PR trigger; a story can span more than one PR. Do not silently change the pause's counting rule.

## 6. Draft board story — Assess the review-loop trial

**Purpose:** decide whether the revised workflow ships satisfactory product with less rework and less owner effort.

**Depends on:** the selected three product stories reaching a recorded outcome. If a story is parked or the trial is stopped early, assess that outcome instead of waiting indefinitely or dropping it from the sample. This assessment is not a fourth product story.

**Evidence:** one compact close-out entry on each story, using existing records: DoD outcome and evidence; internal self-review/repair cycles; independent review and repair-check rounds, separated by deliverable; owner interventions; elapsed time and active effort where available, distinguished; tokens/context usage only where actually recorded; repair regressions and consequential escaped defects; brief explanation of what helped or caused repetition. Preserve available cycle/cost observations in the existing session handoff while doing the work, rather than reconstructing them from commit counts afterward. An internal cycle is a self-review followed by a repair and renewed checking, not every drafting correction. Mark unavailable measurements unknown. Count a failed or parked attempt too. Baseline comparisons must name their source and recognize differences in scope; the old F9a brief alone is not a matched product baseline.

**Definition of Done:** the three story outcomes have been compared; Fable and Codex have reviewed the conclusion; the owner receives a short keep/change/stop recommendation explaining delivery quality, time and interruptions, with uncertainty; the owner's decision and any selected follow-up are recorded. Fewer reviews alone are not success if important defects escape. Reuse this assessment for the pause retrospective where appropriate, without adding a parallel reporting exercise.

## Verification and MemPalace drawer candidates

Evidence is the cited repository text, named current memory rules and a read-only GitHub Projects snapshot. This is a proposal and draft board content, not executed product validation or a diagnosis of unavailable session activity. Formatting and local-link checks apply; runtime tests do not establish these recommendations.

Handoff candidate: the owner added explicit DoDs, bounded author self-review, neutral review commissioning, product-impact advice, complete repair regression checks and per-story trial evidence. Codex recommends F9a/F6/F10 and has drafted the assessment story here. Fable's response on these refinements and its self-review episode analysis remain pending; `drawer_havdm_review_ad6411e4b3302877d597375d` records agreement on the earlier, narrower recommendation, not these additions. No standing rule, board item or live state has changed.
