Author: Claude Fable 5 (repair author; interested party)
Reviewer: OpenAI Codex / GPT-5.6 Sol (same reviewer, per Operating Agreement §3.4)
Owner gate: micah/BaggyG-AU merges only after this follow-up; this review decides nothing on its own

# Scoped follow-up — PR #148 F1 repair, round 1

**Verdict: CONFIRMS-REPAIR — F1 is RESOLVED; no regression or introduced
finding.**

The review stayed inside commit `881ef2b`: its three-file repair diff plus the
declared radius in
`docs/reviews/governance-codification-d1-d18-repair-dispositions.md`. I did not
re-review the D1–D18 codification already approved in
`docs/reviews/governance-codification-d1-d18-codex-review.md`.

## Round-1 disposition

| Finding                                                                                       | Author disposition | Follow-up result                                                         |
| --------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| F1 — the ledger falsely said the old commission quotation already carried a PR-#139-era label | **RESOLVED**       | **RESOLVED.** The repair closes F1 exactly and introduces no regression. |

## Minimal follow-up trace

### 1. Closure

**Confirmed.** The banner at
`docs/reviews/self-pass-gate-codex-commission.md:424-429` is dated 2026-08-19,
identifies PR #148 F1, identifies the quotation as PR-#139-era text, and points
to current Operating Agreement §3.4. That section says STRAT-D7 replaced the
old default with universal same-reviewer scoped follow-up
(`docs/governance/OPERATING_AGREEMENT.md:240-256`).

The old quotation at commission lines 421–423 is byte-identical to parent
`5838cdd` (SHA-256
`8ffa214b4d5f8266cca589a8519eed99b34067aa5c3ddf9e9dc897e0064daaba`). The
ledger now says exactly what happened: C39 was already labelled; the commission
quotation was not; F1 caught that false claim; and the owner chose the dated
banner repair (`docs/reviews/self-pass-gate-author-ledger.md:367-375`). Nothing
in the repair diff refutes its own closure claim.

### 2. Behaviour, governed text, and disposition accuracy

**Confirmed unchanged.** `git diff --name-status 5838cdd..881ef2b` enumerates
exactly the commissioned three files, all under `docs/reviews/**`: two modified
records and the new disposition artifact. It touches no governed fingerprint
path (`docs/governance/**`, `docs/templates/**`, `ai_rules.md`, or `CLAUDE.md`),
changes no behaviour, and leaves the certificate declaration at
`8b4eb5d26986`.

The disposition table accurately names the repair, owner ruling, upstream
reliance, downstream readers, parser boundary, and unchanged governed radius.
The commission's 60-row `Commissioned checks` section is byte-identical to
`5838cdd` (SHA-256
`eaea7f98458006681442e3f923bbec4ebedefd3a9f093ed602663dc8bec0649f`), so
`parseCommission()` receives the same population.

The instrument note is honest. Repo-root `rg` respected `.gitignore` and found
15 in-tree `docs/reviews/**` hits while skipping `prompts/`; targeting the
ignored directory explicitly found nine prompt hits. The exact non-ignore-aware
grep now enumerates 24 total because the committed PR-3 review itself adds one
historical quotation. The disposition does not claim the repaired tree still
has 23: it preserves the original review-time 23-hit classification and names
the now-committed review as a current-tree hit. The live Operating Agreement has
zero old-default hits.

### 3. Introduced-defect sweep

**No issue found.** The new banner accurately describes the supersession and
does not present the old quotation as current law. The rewritten ledger
sentence neither overclaims that the label was always present nor underclaims
the owner's repair. The new disposition file preserves the reviewer-authorship
boundary and does not alter any prior review.

### 4. Radius verification and checks

- `npx vitest run tests/unit/author-ledger.spec.ts` — exit 0; 1 file and **9/9
  tests passed**. This exercised the unchanged commission population and the
  certificate leg with fingerprint `8b4eb5d26986`.
- `npx prettier --check` on all three repair files — exit 0; all matched files
  use Prettier formatting.
- Byte comparisons — the historical quotation and the complete commissioned-
  checks section are unchanged from `5838cdd`.
- `./tools/checks` — **UNRUN; not warranted.** The repair changes records only,
  touches neither code nor governed rule text, and the targeted gate covers the
  only claimed parser/fingerprint radius.
- E2e, integration, Electron, Chromium, UAT, packaging, and live-HA checks —
  **UNRUN and not owed** for this records-only follow-up.

The designed proportional cost was achieved: this scoped follow-up took
minutes, not hours.

No Owner Decision Brief is required because this follow-up introduces no
finding and routes no new decision to the owner. The existing merge gate remains
the owner's.

## MemPalace drawer candidate

The write was refused because the MemPalace transport closed. Under MP-LEASE,
the write-enabled author may file this in `havdm / governance` with
`added_by="codex"`:

> PR #148 STRAT-D7 first live scoped follow-up: Codex confirmed repair commit
> 881ef2b closes review finding F1. The self-pass commission now carries a
> dated PR #139-era supersession banner pointing to current Operating Agreement
> §3.4, while the historical quoted rule remains byte-identical. The ledger
> sentence is literally true. No governed surface or behavior changed; the
> governed fingerprint remains 8b4eb5d26986; the author-ledger gate passed 9/9.
> Verdict CONFIRMS-REPAIR; round-1 disposition RESOLVED.

---

## Workflow State

| Field                | Value                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Task**             | Scoped round-1 follow-up of PR #148 repair commit `881ef2b`                                                                           |
| **Status**           | Complete                                                                                                                              |
| **Just completed**   | Confirmed F1 RESOLVED with no regression or introduced finding; independently verified the declared radius.                           |
| **Next action**      | The owner may merge after applying the remaining owner gate.                                                                          |
| **Performed by**     | User                                                                                                                                  |
| **Reference**        | `docs/reviews/governance-codification-d1-d18-codex-followup-r1.md`                                                                    |
| **Verification**     | Ledger gate 9/9; all three repair files Prettier-clean; repair quotation and commissioned-checks section byte-identical to `5838cdd`. |
| **MemPalace drawer** | N/A — transport closed; exact candidate recorded above under MP-LEASE                                                                 |
