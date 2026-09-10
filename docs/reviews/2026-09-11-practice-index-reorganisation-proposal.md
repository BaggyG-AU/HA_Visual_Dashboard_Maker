# Practice index: proposed history relocation

**Status:** prepared and self-reviewed by Codex; [Fable's independent review](2026-09-11-review-loop-trial-setup-fable-review.md) is complete with no blocking finding. The owner approved the trial package on 2026-09-11. The live index has not been changed; application awaits a write-enabled session. The reviewed placement and text below are retained.

## Outcome and scope

Reduce compulsory context loading while preserving active instructions and access to their sources. This is a relocation of existing history, not a rewrite of the rules. The current index is `drawer_practice_charter_a914959dbe8a1120cffad334`; its callers and ID stay unchanged.

The local review bundle is at `/home/micah/.codex/review-loop-index-proposal/`:

- [Source content and drawer ID](/home/micah/.codex/review-loop-index-proposal/source.json) and [readable original](/home/micah/.codex/review-loop-index-proposal/index.before.txt).
- [Proposed index](/home/micah/.codex/review-loop-index-proposal/index.proposed.txt) and [diff](/home/micah/.codex/review-loop-index-proposal/index.diff).
- [Proposed history drawer](/home/micah/.codex/review-loop-index-proposal/history.proposed.txt) and [measured sizes](/home/micah/.codex/review-loop-index-proposal/metrics.json).

Source content SHA-256: `00364a78aa90a11efd9bd093f4b13370963f81f2212e9a81dbc1dc9b2a6cb829`. Hash the drawer's content string encoded as UTF-8, not the MCP response envelope.

## Proposed change

Retain the complete prefix before `=== PROVENANCE ===`, including usage instructions, active rule entries and supersession notices. Move the provenance narrative into one historical drawer and replace it with a pointer. Retain the final “NO DRAWER COUNT IS PUBLISHED HERE” instruction in the index.

The history also contains an explicit admission instruction: “DO NOT FILE A RULE OUT OF A MECHANISM THAT HAS NOT YET SURVIVED AN INDEPENDENT REVIEW.” Preserve it verbatim in the index, linked to the existing counterparty-anchor rule entry that already carries that lesson. This avoids weakening an imperative while relocating its narrative setting.

Proposed archive home: `havdm / investigations`, recording this owner-approved maintenance action and preserving the old narrative, including its cross-project founding context. The practice charter (`drawer_practice_charter_f9efb6904018fb7a2021bd64`) separates reusable rules from full case histories. No new rule drawer is proposed. The existing historical statements are preserved rather than newly verified or corrected.

The proposed index is 43,402 characters versus 66,588 before, using the temporary `{{HISTORY_DRAWER_ID}}` placeholder: about 35% less content. This is a character measurement, not a token-cost estimate or a guarantee about tool limits. Final size changes slightly when the real drawer ID is substituted.

## Definition of Done and acceptance criteria

**DoD:** both agents have reviewed the actual relocation; the live index retains its instructions and working rule pointers; the history remains retrievable; application is verified against the reviewed content.

1. No known unresolved SEV1 or material omission weakens the index's instructions or discoverability.
2. Original rule entries, usage instructions, supersession notices and the final maintenance instruction are preserved. The admission instruction above remains explicit.
3. The historical body is preserved and accessible through a real drawer pointer. No placeholder is published.
4. The change does not overwrite another session's additions. Verification uses the current source before writing and the actual content read back afterward.
5. Fable and Codex review the change before it is applied. The proposed reduction is not treated as an already completed change.

## Application after joint review

1. Fetch the current index by ID and compare its content hash with the reviewed source. If it has changed, reconcile the new content before applying; do not overwrite it from this snapshot.
2. A write-enabled session files the reviewed history, obtains its real drawer ID and substitutes that ID in the proposed index. Never guess an identifier or bypass the writer lease.
3. Update the index and immediately read back both drawers. Compare the index to the intended text and the history to the reviewed text. Confirm the prefix, retained instructions and rule pointers, and that the history pointer resolves.
4. Record the application result and actual sizes briefly. If writing is refused or verification fails, report the actual state rather than calling the relocation complete. Preserve the before snapshot for recovery; do not overwrite unrelated intervening edits during recovery.

## Codex verification and handoff

Codex read the moved narrative and checked the boundaries. A local comparison confirmed the original prefix and final active instruction remain verbatim, the admission instruction remains explicit, the historical body is preserved verbatim, and every original `drawer_practice_…` identifier remains in the proposed index. These checks establish text preservation; Fable's review must assess whether the relocation preserves its meaning and retrieval behavior. No live index write or product test was performed.

Fable has completed the independent review. The [Codex response](2026-09-11-review-loop-trial-setup-codex-response.md) retains the reviewed content and placement, and records the writer-lease refusal. The next step is application by a write-enabled session, using the steps above.
