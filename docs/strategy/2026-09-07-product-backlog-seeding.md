# HAVDM Product Backlog — the board-seeding roadmap (B7)

**Status:** Draft — rev 0, awaiting the independent review
**Author:** Claude Fable 5.1 — the strategy / briefs seat
(`docs/governance/OPERATING_AGREEMENT.md` §3.6, STRAT-D4: "high-stakes upstream:
strategy, briefs, governance authoring")
**Reviewer:** GPT-6 Astra (OpenAI Codex) — the owner's choice, 2026-09-07; review
lands on this branch as `docs/reviews/b7-product-backlog-codex-review.md`. The
owner pastes the commission.
**Owner gate:** owner approval of this document authorises seeding the board
(strategy D9/D11, correction C1). Nothing is seeded before that approval.
**Branch:** `feature/b7-product-backlog` · **Created:** 2026-09-07
**Board item:** B7 — `PVTI_lAHOBFbZhs4BgtcWzg2-6PU` ("Roadmap document: authored +
owner-approved, then seeds the board's product epics (frozen once seeded — D9/C1)")

---

## 0. Owner summary — plain English first

**What this is.** The list of everything we know the product needs, gathered from
every place it has been written down, grouped into **epics** (a feature area or a
problem area) with the **candidate stories** under each, in a proposed order.
Every line names where it came from. Nothing here is my invention.

**What you decide.** Whether this list is the right starting point, in the right
order, with the right things left out. You rule by epic ID. When you approve it,
I create one **draft** board item per epic; you convert the ones you want into
Issues, as you did for F9a.

**Not written in stone — and how that squares with "frozen".** You said the
whole point of working this way is to add, reprioritise or deprioritise stories
as we learn. The ratified rules already say the same thing, in two halves:
this **document** is a one-time seeding input that is not edited after it seeds
the board (correction C1: "a live roadmap document beside the board would
recreate the two-surfaces defect D9 exists to end"), and the **board** is the
sole live plan (D11), where items are added, reordered, split and shelved
freely. So: the document freezes, the plan does not. Priorities change on the
board, by you, at any time. Only story **identities** stay stable — an ID is
never reused and a retired ID leaves a gap (D8).

**Two questions for you** (§7): whether to seed the Phase 8 "ecosystem
catch-up" epics now, at the bottom of the order, or hold them back; and whether
the parked canvas-fidelity work stays parked.

---

## 1. Purpose and standing

- **Board item B7** asks for a roadmap document, owner-approved, that seeds the
  board's product epics. The board has carried **no product stories** since it
  was adopted (measured 2026-09-07: every item is process, watch or test
  infrastructure; the only product item is F9a's, created that day). The
  remediation order's product items were recorded as "board items now" and
  never created. This document closes that gap.
- **What the board holds after seeding (D11):** an ordered epic column. Stories
  become Issues **at spec approval**, as sub-issues of their epic; the approval
  is the creation authorisation. Issue #159 (F9a) already exists at story level
  and is linked to its epic below rather than recreated.
- **What a card carries:** a title, the epic's plain-English outcome, the
  candidate stories, and links to the source. "Rationale never lives on cards —
  links only" (D11).
- **This is not a spec, a brief or a plan for any single item.** Each epic's
  stories still go through the ratified chain when their turn comes: brief
  (Opus, or Fable for high-stakes) → spec (Sonnet) → spec review (Codex) → owner
  sign-off → implementation (Codex for capability-class, Sonnet for
  content-class) → implementation review (Opus) → owner merge.
- **The governance pause is unaffected.** This document proposes no rule, gate,
  checker, template or procedure; it fills a ledger the rules already define.

## 2. Sources — the population, enumerated

Every story below traces to one of these. If a source is not listed here, its
content is not in this backlog, and that is a finding the reviewer should raise.

| #   | Source                                                                                                                            | What it contributed                                                                                      |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| S-A | The owner's remediation order and rulings R1–R7, ARB-R8 (`drawer_havdm_decisions_6e8d4788d9513ccce593c378`)                       | Items 8–13 (F8, F9, F6, F10, F11, F12); items 1–7 are delivered and excluded                             |
| S-B | The F9a split ruling (`drawer_havdm_decisions_bdef071e2ead9ed0a5ff8d9c`)                                                          | F9a / F9b split; the order F9a → F6 → F10; the product inventory it ruled on                             |
| S-C | Phase 7 history — the thirteen round-3 failures and their corrected root causes (`drawer_havdm_testing_ad358a7d31912bba2419205d`) | Which round-3 defects are fixed (HA-07, FILE-06, THEME-02, EXPORT-04, VIEWS-04) and which remain (below) |
| S-D | Round-3 triage, `docs/testing/uat/reports/uat_triage_v1.0.0-r3_2026-08-03.md` §6 (recommended order) and §7                       | The order-of-work rationale; the open owner questions (THEME-03/04 untested, live-HA write scope)        |
| S-E | The code map's STILL-OPEN list (`drawer_havdm_src_3488d55dd69286718dfaddce`)                                                      | Six known editor defects with no UAT card behind them                                                    |
| S-F | UAT feature-request register, `docs/testing/uat/FEATURE_REQUESTS.md`                                                              | FR-01, FR-02, FR-03 (FR-04 delivered by PR #123)                                                         |
| S-G | Phase 7 tracker, `docs/governance/phases/phase-7-tracking.md` §1                                                                  | Slice E delivered read-only (commit deferred); slices C, G, H withdrawn                                  |
| S-H | Refresh plan, `docs/refresh/PROJECT_REFRESH_PLAN_2026-07.md` §4.4 and §7 WS4                                                      | The Phase 8+ ecosystem opportunities A–J and their ruled order                                           |
| S-I | Parity requirements, `docs/product/HA_NATIVE_DASHBOARD_EDITOR_PARITY_REQUIREMENTS.md` §5.1–§5.2                                   | The sections-view MVP parity set that Phase 8 epic A expands into                                        |
| S-J | GitHub Issues (`gh issue list --state open`, 2026-09-07)                                                                          | #159 (F9a) — the one open product Issue; #145 is the nightly-suite watch, process                        |

**Deliberately not sources:** `havdm.kanban` (non-authoritative, D9/C1);
`docs/product/PROJECT_PLAN.md` (frozen at 0.2.0-beta.1 and self-deprecated);
the UAT card-correction register (`CARD_CORRECTIONS.md` — test wording, not
product); the verdict re-mark ledger (owner rulings on test verdicts, not
product).

## 3. Reading the epics

- **ID** — `E01`… for epics, `S01.1`… for candidate stories. Stable, never
  reused, gaps deliberate (D8).
- **Class** — the STRAT-D6 depth dial: **capability** (shared machinery:
  services, store, BaseCard, cardRegistry, test DSLs, CI) takes the full chain;
  **content** (a renderer, a panel, a dialog) takes the light process;
  **test-only**, **docs** and **release** name work that is not product code.
  ⚠ A story's class is a proposal here; it is **declared at spec time** in the
  spec's Classification line, where the reviewer checks it.
- **Depends on** — what must land first. Empty means it can start any time.
- **Source** — the row in §2.

The order in §4 is the **proposed** order of the board's epic column. §5 states
the reasoning. You can change it on the board the day after it is seeded.

## 4. The epics, in proposed order

### E01 — The export tells the truth about what Home Assistant will render

**Outcome.** A dashboard exported or deployed from HAVDM renders on the user's
Home Assistant as HAVDM showed it, or the user is told exactly what could not be
carried across. This is the product vision's central promise ("translate what
has an HA target, honestly mark what does not") applied at the export boundary.
**Class:** capability. **Source:** S-A items 9, S-B, S-C.

| Story | Plain English                                                                                                                                                                                            | Class      | Depends on | Source / notes                                                                                                                                |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| S01.1 | When the captured profile says card-mod is absent, the export strips card-mod-only styling and shows the existing warning; never-connected stays permissive                                              | capability | —          | **Issue #159 exists.** S-B. Remediation item 9 / Codex N2. Facts for its brief: five production export call sites; the never-connected signal |
| S01.2 | HAVDM views export as native `sections` views wherever the geometry fits; `custom:grid-layout` only when it cannot AND layout-card is installed; always warn when lossy; dead `view_layout` keys removed | capability | S01.1      | Ruling R3, Codex N6. S-A, S-C ("HA is more forgiving of HAVDM's output than HAVDM is")                                                        |
| S01.3 | A user can make a real masonry view in the app, and converting a view to sections clears HAVDM's scaffold marker so the export keeps `type: sections`                                                    | capability | S01.2      | S-C: "there is no in-app way to make a real masonry view"; `convertViewToSections` never clears `_havdm_scaffold`                             |

### E02 — Round-3 canvas and dialog defects the tester hit

**Outcome.** The four remaining round-3 findings that are self-contained
interface gaps are closed, so the next UAT round starts without them.
**Class:** content (each story). **Source:** S-A items 10–11, S-C, S-D.

| Story | Plain English                                                                                                                                  | Class   | Depends on | Source / notes                                                                                                             |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| S02.1 | Right-clicking empty canvas opens a context menu (paste, add card, view settings) on both the flat and the sections canvas                     | content | —          | CLIP-01 (High). Remediation item 10 = F6. S-C: "a missing feature, not a breakage" — the canvas div has no `onContextMenu` |
| S02.2 | The entity picker's "Show diagnostic & config" text becomes an in-place control that reveals the hidden matches, with a badge showing how many | content | —          | PROPS-03 (Medium, no re-mark — ruling R4). Remediation item 11 = F10                                                       |
| S02.3 | When auto-map declines to map a missing entity, the remap dialog offers a way forward instead of a dead end                                    | content | —          | HA-04 (High) second half. S-C: "the auto-map refusal is CORRECT … the real defect is the second half"                      |
| S02.4 | In the light theme the header bar, inactive tab labels, file path and the properties panel's prompt are readable — no dark-on-dark text        | content | —          | THEME-01 contrast half (High). S-C names the lead: antd's `Layout.headerBg` default. S-D §6 item 11 called for an audit    |

### E03 — Dashboards downloaded from Home Assistant render faithfully in HAVDM

**Outcome.** A user who downloads an existing dashboard sees it as Home
Assistant shows it: entity rows render, entity state reaches the cards, and
templates are not shown as literal text. **Class:** capability. **Source:** S-A
item 8, S-C (HA-03, HA-06), the remediation order's ruling R7.

| Story | Plain English                                                                                                                  | Class      | Depends on                                 | Source / notes                                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| S03.1 | Entities cards can host the row types real dashboards use (`divider`, `custom:template-entity-row`, and the other rows)        | capability | **Board B6** — the R7 three-way split plan | HA-03 finding 1: 24 live uses on the reference instance do not render. Ruling R7: split plan first, each part owner-signed                   |
| S03.2 | Entity state reaches the cards of a downloaded dashboard                                                                       | capability | B6                                         | HA-03 finding 2                                                                                                                              |
| S03.3 | Templates in downloaded cards render as values, not as literal template text                                                   | capability | B6                                         | HA-03 finding 3 — "displaying WRONG content, worse than hiding it"                                                                           |
| S03.4 | The canvas consumes Home Assistant theme variables so a chosen theme changes what the user sees (the canvas-fidelity contract) | capability | —                                          | HA-06 (High). **PARKED** by the remediation order (item 7: interim badge shipped as F3, #142; deep fix parked with a revisit trigger). §7 Q2 |

### E04 — Editor correctness debts with no UAT card behind them

**Outcome.** Known defects the code map records as STILL OPEN, none of which a
tester has yet hit, are closed before they become round-4 findings. **Source:**
S-E.

| Story | Plain English                                                                                         | Class      | Depends on | Source / notes                                                  |
| ----- | ----------------------------------------------------------------------------------------------------- | ---------- | ---------- | --------------------------------------------------------------- |
| S04.1 | The eleven newer card types get their own property forms instead of the generic one                   | content    | —          | S-E: "NO type-specific property forms for the eleven new cards" |
| S04.2 | The properties form stops writing `icon_color_mode: default` into cards that never set it             | content    | —          | S-E                                                             |
| S04.3 | Undo and redo restore the document's file path along with its content                                 | capability | —          | S-E; also named by FR-01's design note (S-F)                    |
| S04.4 | Downloading a dashboard from Home Assistant warns before discarding unsaved work                      | content    | —          | S-E: `handleDashboardDownload` has no dirty guard               |
| S04.5 | Loading a dashboard never silently drops a malformed card — the user is told what was skipped and why | capability | —          | S-E: `asCardRecord` silent drop                                 |

### E05 — What the tester asked for

**Outcome.** The three open requests from the UAT feature-request register are
delivered or explicitly declined. **Source:** S-F.

| Story | Plain English                                                                                            | Class   | Depends on | Source / notes                                                                                                                         |
| ----- | -------------------------------------------------------------------------------------------------------- | ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| S05.1 | File → Close returns to the Welcome screen without quitting, with the same unsaved-changes guard as Open | content | S04.3      | FR-01 — raised in round 2, lost, raised again in round 3. The register's own design note names the guard and the file-path interaction |
| S05.2 | Find (and replace) in the YAML editor                                                                    | content | —          | FR-02 — Monaco ships a find widget; measure whether this is enabling, not building                                                     |
| S05.3 | Document that undo inside the YAML editor requires the editor to have focus                              | docs    | —          | FR-03 — a documentation request, not a behaviour change                                                                                |

### E06 — Release 1.0 gates

**Outcome.** The two ship-gates the owner ruled formal (R6) are met, and the
UAT pass bar is reachable. **Source:** S-A item 13, ruling R6, S-C (amendment 03
pass bar), S-D §7.

| Story | Plain English                                                                                                                      | Class      | Depends on        | Source / notes                                                                                                     |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| S06.1 | The app's file read/write bridge accepts only paths the user chose, with a written threat model (today it takes any absolute path) | capability | —                 | Ruling R6a = F12a. Codex's caution: "recent-file-listed" must not become ambient permission                        |
| S06.2 | The Windows build is code-signed so security software stops flagging it                                                            | release    | owner credentials | Ruling R6b = F12b. Evidence: the CLIP-02 Acronis alert (verdict re-mark ledger)                                    |
| S06.3 | UAT round 4 runs against the pass bar; THEME-03's blank skip reason and THEME-04's untested state are resolved first               | process    | E01–E02 as ruled  | S-C amendment 03 §3.1 criterion 5 breached twice; S-D §7 Q2. Listed so the release has a home; not a product story |

### E07 — Canvas reliability instrumentation

**Outcome.** The one round-3 High that could not be reproduced (CANVAS-03,
"drag a card and the position sticks") gets a stress suite that would catch it
if it recurs — instrument before fix. **Source:** S-A item 12 (= F11), S-C.

| Story | Plain English                                                                         | Class     | Depends on | Source / notes                                                        |
| ----- | ------------------------------------------------------------------------------------- | --------- | ---------- | --------------------------------------------------------------------- |
| S07.1 | A repeatable drag stress suite runs in CI; no product change until it shows a failure | test-only | —          | "15 real-mouse drag rounds = ZERO snap-backs. INSTRUMENT BEFORE FIX." |

### E08 — Version control from inside the app

**Outcome.** A user can commit a dashboard to the repository they keep it in
without leaving HAVDM. **Source:** S-G (Phase 7 slice E delivered read-only;
`commitFiles` deferred).

| Story | Plain English                                                        | Class      | Depends on | Source / notes                |
| ----- | -------------------------------------------------------------------- | ---------- | ---------- | ----------------------------- |
| S08.1 | Commit the current dashboard file with a message, from the File menu | capability | —          | Slice E's deferred write half |

### E09 – E18 — Phase 8: the 2026 ecosystem catch-up

The refresh plan's §4.4 opportunities, in the order WS4 ruled (S-H), each as an
epic whose stories are **not yet enumerated** — they need a brief each, and the
parity requirements document (S-I) is the brief material for E09. Listed here so
the board holds the whole plan, at the bottom of the order. §7 Q1 asks whether to
seed them now.

| Epic | Outcome, in plain English                                                                                                                                                     | Refresh-plan ref | Size (plan's estimate) |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------- |
| E09  | The sections grid is HAVDM's primary layout: the parity set in S-I §5.1 (create/reorder sections, drag within sections, HA-style resize, visibility conditions, heading card) | §4.4 A           | Large                  |
| E10  | The Tile card is a first-class, richly configurable output                                                                                                                    | §4.4 B           | Medium                 |
| E11  | Entity-first card creation with live previews                                                                                                                                 | §4.4 C           | Medium                 |
| E12  | Per-element four-tab editing (General / Actions / Logic / Design), Jinja2, attribute-level conditional visibility                                                             | §4.4 D           | Large                  |
| E13  | The preset / template marketplace is finished (Phase 7 slice A started it)                                                                                                    | §4.4 G           | Medium                 |
| E14  | Areas, labels and floors as first-class primitives, with an unassigned-devices workflow                                                                                       | §4.4 E           | Medium                 |
| E15  | New native card and badge types: shortcut, button badges, distribution, redesigned gauge, markdown actions                                                                    | §4.4 F           | Small each             |
| E16  | Auto / dynamic entity population (area, domain, label, attribute, regex filters)                                                                                              | §4.4 I           | Medium                 |
| E17  | AI-assisted layout generation                                                                                                                                                 | §4.4 H           | Large                  |
| E18  | Styling output aligned to the Tile design language and HA theme variables (ongoing)                                                                                           | §4.4 J           | Ongoing                |

## 5. Why this order

Sequenced by what unblocks the most, the same principle the round-3 triage used
(S-D §6), and by the owner's existing rulings where they bind:

1. **E01 first** because the owner ruled the order F9a → F6 → F10 (S-B), because
   export honesty is the vision's central promise and the remaining piece of the
   HA-09 finding, and because E09 (sections grid) builds on an export that can
   carry sections faithfully.
2. **E02 next** — four contained interface stories, two of them the owner's
   ruled F6 and F10; each is a candidate first content-class run of the light
   process.
3. **E03** waits on B6 (the R7 split plan) by ruling; its stories are the largest
   surface among the round-3 findings.
4. **E04 and E05** are small, independent, and the cheapest way to keep the
   next UAT round from re-finding known things.
5. **E06** is release work; its two gates need the owner's credentials and a
   threat model respectively, and they gate 1.0 rather than any feature.
6. **E07, E08** are self-contained and can be slotted anywhere.
7. **E09–E18** follow the refresh plan's own ruled order (D3: close out Phase 7
   first, then WS4 led by the sections grid).

**What is excluded, and why.** Delivered work: remediation items 1–7 (F1, F2,
F3 interim, F4, F5, F7, FR-04) and the round-3 findings they closed (HA-07,
FILE-06, THEME-02, EXPORT-04, VIEWS-04). Withdrawn Phase 7 slices C, G and H
(S-G) — revived only by an owner ruling. UAT card corrections HA-05, HA-06,
PROPS-03 (test wording, applied at plan generation). The nightly-suite watch
(#145) and every B-item on the board (process).

## 6. Seeding plan — what happens on approval

1. For **each epic** in §4, one **draft** board item: title `E0n: <outcome>`,
   Kind `product`, Status `Todo`, body = the outcome sentence, the candidate
   story table (IDs, plain English, class, depends-on), and links to this
   document and the §2 sources. No rationale on the card (D11).
2. Items are created in the §4 order so the epic column reads top to bottom as
   the proposed priority. Reordering is yours, on the board, any time.
3. **Issue #159** (F9a) is the existing S01.1 story; it is referenced from E01's
   card rather than duplicated. Its board item stays as is.
4. **No Issue is created by the agent.** You convert an epic to an Issue when
   you want it tracked as one; stories become Issues at spec approval (D11).
5. After seeding, this document is **frozen** (C1). A later strategy session
   produces a new dated document if the plan needs re-baselining; day-to-day
   changes are made on the board.
6. B7 is discharged when the items exist; the agent proposes the status move,
   the owner makes it (draft items need a human status move — `[STATE]` 7a).

## 7. Open questions for the owner

### Q1 — Seed the Phase 8 epics (E09–E18) now, or hold them?

| Option                                                | For                                                                                         | Against                                                                                      |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **A — Seed all, at the bottom (recommended)**         | The board holds the whole plan in one place, which is D11's point; nothing is lost in a doc | Ten large items on the board that will not move for a while                                  |
| **B — Seed E01–E08 only; Phase 8 in a later session** | A shorter board that matches the next few months                                            | The Phase 8 plan stays only in the refresh document, a second surface until the next session |

**Recommendation: A.** If you rule B, §6 step 1 applies to E01–E08 only and this
document still records E09–E18 for the next seeding.

### Q2 — Does the canvas-fidelity contract (S03.4) stay parked?

The remediation order parked the deep HA-06 fix behind an interim badge (F3,
PR #142) with a revisit trigger. **Options:** keep it parked and seed it inside
E03 marked PARKED (recommended — the trigger has not fired), or unpark it as its
own epic. **If you do nothing:** it seeds inside E03, marked PARKED.

## 8. What this document does not claim

- It does not estimate effort beyond the refresh plan's own sizes for E09–E18.
  Estimates belong in briefs and specs.
- It does not assert that the story list under any epic is complete. Each epic's
  brief will re-enumerate from source; a story missing here is added on the
  board, not by editing this document.
- Its "delivered" and "open" statements were read from the sources named in §2
  on 2026-09-07, on `main` = `eb5c918`; anything merged after that date is not
  reflected.

## 9. Revision history

| Date       | Rev | Change                                              | By               |
| ---------- | --- | --------------------------------------------------- | ---------------- |
| 2026-09-07 | 0   | Draft from S-A … S-J; awaiting GPT-6 Astra's review | Claude Fable 5.1 |

## 10. Sign-off chain

1. **Author** — Claude Fable 5.1, this document, on `feature/b7-product-backlog`.
2. **Reviewer** — GPT-6 Astra, independently, on this branch, as
   `docs/reviews/b7-product-backlog-codex-review.md`, under
   `docs/templates/ADVERSARIAL_REVIEW.md` §1 / §1a / §4. Findings are
   hypotheses; dispositions go to
   `docs/reviews/b7-product-backlog-repair-dispositions.md`; SEV 2/3 to the
   owner by Ref.
3. **Owner** — reads document and review together, rules on §7 by Q, approves.
   **The approval is the seeding authorisation** (§6). The owner's merge of this
   branch freezes the document.
