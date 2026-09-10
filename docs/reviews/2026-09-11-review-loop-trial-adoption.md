# Review-loop trial: owner adoption and setup

**Adopted 2026-09-11 (Australia/Sydney).** The owner said: **“Decision package approved.”** The approved package is [the consolidated decision](2026-09-11-review-loop-trial-owner-decision.md), version `b08bc41`. This is the authority to run the dated, prospective trial for F9a/F6/F10 and their assessment, and to prepare and jointly review the practice-index reorganisation.

The explicit DoD and acceptance contract, bounded review recommendations and light use of existing records are adopted. Required tests, independent review, repair follow-ups, owner dispositions and the governance pause's separate trigger remain in force. No new checker, gate, template or ledger is introduced. The locked F9a brief is not reopened.

## Board setup completed

| Record                                                                                                               | Setup                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [F9a / S01.1 / #159](https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker/issues/159)                              | Added the DoD, critical criteria from the locked brief, acceptance/evidence expectations and trial close-out. Preserved the assigned Sonnet → Codex → owner → Codex → Opus chain. |
| [F6 / S02.1](https://github.com/users/BaggyG-AU/projects/2?pane=issue&itemId=244904104)                              | Created a product draft card with DoD, critical criteria and trial close-out.                                                                                                     |
| [F10 / S02.2](https://github.com/users/BaggyG-AU/projects/2?pane=issue&itemId=244904119)                             | Created a product draft card with DoD, critical criteria and trial close-out.                                                                                                     |
| [Assess the F9a/F6/F10 review-loop trial](https://github.com/users/BaggyG-AU/projects/2?pane=issue&itemId=244904133) | Created the process draft with dependencies, DoD, acceptance criteria and the approved process summary.                                                                           |

The E02 epic now points to its two story cards. The existing pause watch records the dated exception and points to the assessment. The new cards use existing Kind and Todo fields; existing item statuses were preserved. No Issue was created or converted.

The board is the working home for these contracts and close-outs. The story criteria carry the approved intent; they are not a claim that the product work is complete. [Fable's independent setup review](2026-09-11-review-loop-trial-setup-fable-review.md) is complete: CLEAR-WITH-FINDINGS, with no blocking finding. Each brief/specification must still settle its open details and its own appropriate DoD before implementation. F9a's source and treatment of unknown layout-card information, for example, remain the Sonnet specification's work.

## Supporting change prepared

The [practice-index proposal](2026-09-11-practice-index-reorganisation-proposal.md) includes an actual before/after bundle and a history draft. Codex checked text preservation, rule identifiers and the active instructions at the history boundary; Fable has independently reviewed it and found it safe to apply. Application awaits a write-enabled session. The proposed index contains about 35% fewer characters; this is not a measured token saving.

The review bundle is `/home/micah/.codex/review-loop-index-proposal/`. The independent-review prompt is `/home/micah/projects/HA_Visual_Dashboard_Maker/prompts/fable/START_REVIEW_LOOP_TRIAL_SETUP_REVIEW.md`. This request checks the concrete setup; it does not reopen the owner's adoption decision.

## Verification and remaining work

Read-back comparisons confirmed the intended board bodies and cross-links, the new card fields, preservation of the original F9a/E02/pause content, and unchanged existing statuses and unrelated items. Local snapshots are at `/home/micah/.codex/havdm-review-loop-adoption/` for the pending review and recovery, not a new reporting ledger. The source board is GitHub Projects #2; no current product acceptance is claimed and no product tests were run for this setup.

Fable filed the approval as `drawer_havdm_decisions_e2f130d23c11e6dacf94f42d` and updated the live-state pointer to v233. Codex's subsequent attempt to file the reviewed index history was refused by the peer-writer lease; the live index remains unchanged. The [setup-review response](2026-09-11-review-loop-trial-setup-codex-response.md) records the result and the remaining application handoff.

Next: Sonnet writes the F9a specification under the locked brief and adopted contract, followed by Codex review and owner sign-off. A write-enabled session applies the reviewed index relocation as supporting work; it does not gate the specification. Fable does not write the Sonnet specification itself. No additional owner approval of the adopted trial is requested.

## Historical filing — completed by Fable

**[DECISION] Owner adopted the review-loop trial on 2026-09-11**, saying “Decision package approved,” referring to `docs/reviews/2026-09-11-review-loop-trial-owner-decision.md` at `b08bc41`. The prospective exception to pause drawer `drawer_havdm_decisions_89b5f20cc75d3f70a7e0491b` is limited to F9a/F6/F10, their assessment and preparation/joint review of the index reorganisation. Required validation, review, repair follow-ups, owner disposition and the pause trigger remain. The new assessment is project item `PVTI_lAHOBFbZhs4BgtcWzg6Y8MU`; F6 is `PVTI_lAHOBFbZhs4BgtcWzg6Y8Kg`; F10 is `PVTI_lAHOBFbZhs4BgtcWzg6Y8Lc`; F9a stays issue #159. Contracts and the assessment are on the board. Actual index application and Fable's setup check remain pending. This supersedes pending-adoption statements in `drawer_havdm_review_f4f395dc6259684382220832` and the prior comparison documents. Current record: `docs/reviews/2026-09-11-review-loop-trial-adoption.md` on `feature/codex-review-loop-analysis`, worktree `/home/micah/projects/HA_Visual_Dashboard_Maker-codex-review-loop`.
