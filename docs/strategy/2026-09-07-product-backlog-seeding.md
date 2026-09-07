# HAVDM Product Backlog — the board-seeding roadmap (B7)

**Status:** Draft — rev 1 (2026-09-08), repaired on the owner's per-Ref rulings after
GPT-6 Astra's review; awaiting the same reviewer's scoped follow-up (OA §3.4)
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

**What this is.** The product needs recorded in the sources §2 enumerates,
grouped into **epics** (a feature area or a problem area) with the **candidate
stories** under each, in a proposed order. Every line names where it came from;
where a line proposes more than its source says, the line says so.

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

**Three questions, all ruled** (§7): the Phase 8 "ecosystem catch-up" epics seed
now, at the bottom of the order (Q1, 2026-09-07); the parked canvas-fidelity
work stays parked inside E03 with its trigger named (Q2, 2026-09-08); the 2026-02
popup / Bubble Card alignment intent is not carried, superseded by the vision
(Q3, 2026-09-08).

---

## 1. Purpose and standing

- **Board item B7** asks for a roadmap document, owner-approved, that seeds the
  board's product epics. The board has carried **no product stories** since it
  was adopted (on 2026-09-07 `gh project item-list 2 --owner BaggyG-AU` showed
  every item as process, watch or test infrastructure except F9a's, created that
  day; the board's earlier history was not measured). The remediation order's
  product items were recorded as "board items now" and never created. This
  document closes that gap.
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

Every story below traces to one of these. **How the population was built (rev 1,
honest form).** Rev 0 listed S-A…S-J from the drawers the session was handed and
a directory listing of `docs/`; the independent review (P1) found nine recorded
intentions that listing missed. Rev 1 re-enumerated by command —
`git ls-files 'docs/product/*.md' 'docs/refresh/*.md' 'docs/features/*.md' 'docs/architecture/*.md' 'docs/governance/phases/*.md' 'docs/releases/*.md'`
(64 files), plus every tracked `docs/**/*.md` outside `docs/reviews/` and the UAT
session/plan folders matching
`grep -liE "post-1\.0|post 1\.0|\bdeferred\b|phase 8|follow-up needing|revisit trigger|future release|post-release"`,
each hit read by hand, plus every DECISIONS entry of the `havdm`-wing drawer
index (`drawer_havdm_state_29d3ff6a697fbbcccaa521a9`). The grep is a discovery
aid, not completeness evidence; `docs/archive/` and unindexed drawers were not
swept. The result is S-A…S-T below plus the "reviewed and not carried" list. A
source missing from both is still a finding.

| #   | Source                                                                                                                                                              | What it contributed                                                                                                                                                                                                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S-A | The owner's remediation order and rulings R1–R7, ARB-R8 (`drawer_havdm_decisions_6e8d4788d9513ccce593c378`)                                                         | Items 8–13 (F8, F9, F6, F10, F11, F12); items 1–7 are delivered and excluded                                                                                                                                                                                                                                                      |
| S-B | The F9a split ruling (`drawer_havdm_decisions_bdef071e2ead9ed0a5ff8d9c`)                                                                                            | F9a / F9b split; the order F9a → F6 → F10; the product inventory it ruled on                                                                                                                                                                                                                                                      |
| S-C | Phase 7 history — the thirteen round-3 failures and their corrected root causes (`drawer_havdm_testing_ad358a7d31912bba2419205d`)                                   | Which round-3 defects are fixed (HA-07, FILE-06, THEME-02, EXPORT-04, VIEWS-04) and which remain (below)                                                                                                                                                                                                                          |
| S-D | Round-3 triage, `docs/testing/uat/reports/uat_triage_v1.0.0-r3_2026-08-03.md` §6 (recommended order) and §7                                                         | The order-of-work rationale; the open owner question THEME-03/04 untested (its live-HA write question was answered by amendment-04: a writable test instance, the reference instance read-only outside the UAT envelope)                                                                                                          |
| S-E | The code map's STILL-OPEN list (`drawer_havdm_src_3488d55dd69286718dfaddce`)                                                                                        | Ten entries: five editor defects → E04; entity rows → S03.1; the file bridge → S06.1; code signing → S06.2; the ~25 live-preview placeholders (test debt) and the ungated `tools/*.sh` (tooling debt) are NOT product work and are excluded here. ⚠ Its "no type-specific property forms" line was false when written — see S04.1 |
| S-F | UAT feature-request register, `docs/testing/uat/FEATURE_REQUESTS.md`                                                                                                | FR-01, FR-02, FR-03 (FR-04 delivered by PR #123)                                                                                                                                                                                                                                                                                  |
| S-G | Phase 7 tracker, `docs/governance/phases/phase-7-tracking.md` §1; amendment-01 §1.6; amendment-02                                                                   | Slice E delivered read-only (commit deferred); slice C's action withdrawn with its guarantee delivered (amendment-02); G's telemetry half dropped and its health-scoring half kept as a WS4 candidate (→ S-T); H withdrawn                                                                                                        |
| S-H | Refresh plan, `docs/refresh/PROJECT_REFRESH_PLAN_2026-07.md` §4.4 and §7 WS4                                                                                        | The Phase 8+ ecosystem opportunities A–J and their ruled order                                                                                                                                                                                                                                                                    |
| S-I | Parity requirements, `docs/product/HA_NATIVE_DASHBOARD_EDITOR_PARITY_REQUIREMENTS.md` §5.1–§5.2                                                                     | The sections-view MVP parity set that Phase 8 epic A expands into                                                                                                                                                                                                                                                                 |
| S-J | GitHub Issues (`gh issue list --state open`, 2026-09-07)                                                                                                            | #159 (F9a) — the one open product Issue; #145 is the nightly-suite watch, process                                                                                                                                                                                                                                                 |
| S-K | Owner ruling 2026-08-02, card-support breadth (`drawer_havdm_decisions_c620dc788ac8d47d7911a6ee`); scope ruling (`drawer_havdm_decisions_01d44adf92567391b79a2a4d`) | "A prioritised card-coverage backlog ranked by HACS popularity … should be written down as a roadmap item" — post-1.0; the seven palette orphans were NOT that backlog → **E19** (rev 1)                                                                                                                                          |
| S-L | Ruling R5's post-1.0 half (in S-A)                                                                                                                                  | An in-app Recent Files surface with real tooltips, tracked alongside FR-01 → S05.4 (rev 1)                                                                                                                                                                                                                                        |
| S-M | F5 spec, `docs/features/F5_SECTIONS_PALETTE_DROP_SPEC.md:931–935`                                                                                                   | Sections-container nesting, deferred by the owner 2026-08-06, "not silently dropped" → a named E09 candidate (rev 1)                                                                                                                                                                                                              |
| S-N | Render-fidelity plan, `docs/features/RENDER_FIDELITY_PLAN.md` Phases B–E; the isolation ruling (`drawer_havdm_decisions_0f9619ea3f92e3bcf04a531f`)                  | Phase B canvas accuracy (post-1.0) → recorded beside S03.4; C1 → S06.1; C2 tighten `shell:openExternal` → S06.4; D spike + E real-card rendering → **E20** (rev 1)                                                                                                                                                                |
| S-O | Capability inventory design, `docs/refresh/HA_CAPABILITY_INVENTORY_DESIGN_2026-07.md:168`                                                                           | Slices I5 (HA-version built-in matrix; `cardAvailability.ts:26` still defers to it) and I6 (reconnect diff + notification) → S01.4, S01.5 (rev 1)                                                                                                                                                                                 |
| S-P | Export boundary design, `docs/refresh/HA_EXPORT_BOUNDARY_DESIGN_2026-07.md:357`, `:387`; vision answer 7                                                            | The strict HA-fidelity schema driving the deploy gate (two-schema split, ratified 2026-07-21) → S01.6 (rev 1); not delivered (`grep -rl fidelity src/` returns theme files only)                                                                                                                                                  |
| S-Q | v1.0.0 release notes, `docs/releases/RELEASE_NOTES_v1.0.0.md:30`, `:58`                                                                                             | "A theme editor and full theme application are candidates for a post-1.0 release" → a named E18 candidate (rev 1)                                                                                                                                                                                                                 |
| S-R | `docs/features/HACS_CARD_ALIGNMENT_REFACTOR_PLAN.md:331`; `docs/features/HAVDM_ADVANCED_FEATURES_PHASES_SUMMARY.md:360`                                             | Popup / Bubble Card alignment (2026-02). **Not carried — Q3, owner 2026-09-08:** superseded by the vision's answers 3 and 9 (popup is canvas-only, placeholder on deploy); revivable by ruling                                                                                                                                    |
| S-T | Phase 7 amendment-01 §1.6, `docs/governance/phases/phase-7-ecosystem-future-growth-amendment-01.md:139`                                                             | "Dashboard health scoring (the valuable half of G) — WS4 candidate: a user-facing surface over the existing `exportSelfCheck.ts` / `exportWarnings.ts` / `capabilityProfileService.ts` signals" → S01.7 (rev 1)                                                                                                                   |

**Deliberately not sources:** `havdm.kanban` (non-authoritative, D9/C1);
`docs/product/PROJECT_PLAN.md` (frozen at 0.2.0-beta.1 and self-deprecated);
the UAT card-correction register (`CARD_CORRECTIONS.md` — test wording, not
product); the verdict re-mark ledger (owner rulings on test verdicts, not
product).

**Reviewed and not carried (rev 1)** — pre-refresh plans whose intentions the
2026-07 refresh plan and the 2026-07-21 vision superseded, listed so the
population statement is honest; the owner may revive any by ruling:
`docs/product/UPDATE_PLAN.md` (January 2026 component-update plan; WS1 is its
successor); `docs/product/SUPPORTED_VERSIONS.md` and
`docs/product/VERSION_COMPARISON.md` (version records — ⚠ their "Phase 8" is the
January advanced-features plan's phase, not the refresh plan's Phase 8);
`docs/features/ENTITY_TYPE_DASHBOARD_GENERATOR.md:188` (four deferred generator
ideas; AI-suggested layouts is E17); `docs/features/ADVANCED_YAML_EDITOR_IMPLEMENTATION.md:372`
(code-only editor mode, deferred by the owner's own workflow choice);
`docs/architecture/ARCHITECTURE_ROADMAP.md` (non-functional and code-organisation
targets); the Phase 7 blueprint's §20 "explicitly deferred" items (renderer-wide
state rewrite, canvas architecture replacement, plugin runtime — architecture,
not product; slice H is withdrawn per amendment-01); `docs/research/BUBBLE_CARD_V3_1_RESEARCH.md`
(research); and S-R above (Q3).

## 3. Reading the epics

- **ID** — `E01`… for epics, `S01.1`… for candidate stories. Stable, never
  reused, gaps deliberate (D8).
- **Class** — the STRAT-D6 depth dial: **capability** (shared machinery:
  services, store, BaseCard, cardRegistry, test DSLs, CI) takes the full chain;
  **content** (a renderer, a panel, a dialog) takes the light process;
  **test-only**, **docs** and **release** name work that is not product code.
  ⚠ A story's class is a proposal here; it is **declared at spec time** in the
  spec's Classification line, where the reviewer checks it.
- **Depends on** — a ruling or a code fact that must land first. Empty means no
  such prerequisite exists; it is not implementation authorisation, and every
  story still needs its brief, spec and owner sign-off. Preferred ORDER is stated
  in §5, never in this column (rev 1, review P4).
- **Source** — the row in §2.

The order in §4 is the **proposed** order of the board's epic column. §5 states
the reasoning. You can change it on the board the day after it is seeded.

## 4. The epics, in proposed order

### E01 — The export tells the truth about what Home Assistant will render

**Outcome.** A dashboard exported or deployed from HAVDM renders on the user's
Home Assistant as HAVDM showed it, or the user is told exactly what could not be
carried across. This is the product vision's central promise ("translate what
has an HA target, honestly mark what does not") applied at the export boundary.
**Class:** capability. **Source:** S-A items 9, S-B, S-C, S-O, S-P, S-T.

| Story | Plain English                                                                                                                                                                                                                                                 | Class      | Depends on | Source / notes                                                                                                                                                                                                                                                                                                 |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S01.1 | The export reads ONE captured capability object for BOTH card-mod and layout-card: when card-mod is absent, card-mod-only styling is stripped and the existing warning shown; the layout-card flag is honoured the same way; never-connected stays permissive | capability | —          | **Issue #159 exists.** S-B ruling 1 (quoted in full, rev 1). Remediation item 9 / Codex N2. Facts for its brief: five production export call sites; the never-connected signal                                                                                                                                 |
| S01.2 | HAVDM views export as native `sections` views wherever the geometry fits; `custom:grid-layout` only when it cannot AND layout-card is installed (or the user explicitly opts in); always warn when lossy; dead `view_layout` keys removed                     | capability | S01.1      | Ruling R3 (its opt-in exception restored, rev 1), Codex N6. S-A, S-C ("HA is more forgiving of HAVDM's output than HAVDM is")                                                                                                                                                                                  |
| S01.3 | A flat-canvas (scaffold) view can become a real masonry or sections view: today the scaffold marker survives every conversion, so the export still treats the view as internal                                                                                | capability | —          | S-C. Narrowed (rev 1): sections→masonry conversion exists (`App.tsx` → `flattenSectionsView`); `normalizeViewType` maps a scaffold to `masonry` so choosing masonry is a no-op, and neither `convertViewToSections` nor `flattenSectionsView` clears `_havdm_scaffold`. Order after S01.2 is a preference (§5) |
| S01.4 | Built-in cards are marked available or not by the connected instance's HA version, not assumed always available                                                                                                                                               | capability | —          | S-O slice I5 (rev 1)                                                                                                                                                                                                                                                                                           |
| S01.5 | After a reconnect, the user is told what changed in the instance's capabilities since the last capture                                                                                                                                                        | capability | —          | S-O slice I6 (rev 1)                                                                                                                                                                                                                                                                                           |
| S01.6 | The deploy gate validates against a strict HA-fidelity schema derived from the capability inventory and per-card known keys, separate from the permissive editor schema                                                                                       | capability | —          | S-P, vision answer 7 (rev 1)                                                                                                                                                                                                                                                                                   |
| S01.7 | A dashboard health score surfaces the export self-check, export warnings and capability signals the app already computes                                                                                                                                      | content    | —          | S-T (rev 1) — the retained half of Phase 7 slice G                                                                                                                                                                                                                                                             |

### E02 — Round-3 canvas and dialog defects the tester hit

**Outcome.** The four remaining round-3 findings that are self-contained
interface gaps are closed, so the next UAT round starts without them.
**Class:** content (each story). **Source:** S-A items 10–11, S-C, S-D.

| Story | Plain English                                                                                                                                                      | Class   | Depends on | Source / notes                                                                                                                                                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S02.1 | Right-clicking empty canvas opens a context menu offering Paste, and only what makes sense with no card under the cursor, on both the flat and the sections canvas | content | —          | CLIP-01 (High). Remediation item 10 = F6. S-C: "a missing feature, not a breakage" — the canvas div has no `onContextMenu`. The triage names Paste; any further entry (add card, view settings) is a candidate for the brief, not the source's (rev 1) |
| S02.2 | The entity picker's "Show diagnostic & config" text becomes an in-place control that reveals the hidden matches, with a badge showing how many                     | content | —          | PROPS-03 (Medium, no re-mark — ruling R4). Remediation item 11 = F10                                                                                                                                                                                   |
| S02.3 | When auto-map declines to map a missing entity, the remap dialog offers a way forward instead of a dead end                                                        | content | —          | HA-04 (High) second half. S-C: "the auto-map refusal is CORRECT … the real defect is the second half"                                                                                                                                                  |
| S02.4 | In the light theme the header bar, inactive tab labels, file path and the properties panel's prompt are readable — no dark-on-dark text                            | content | —          | THEME-01 contrast half (High). S-C names the lead: antd's `Layout.headerBg` default. S-D §6 item 11 called for an audit                                                                                                                                |

### E03 — Dashboards downloaded from Home Assistant render faithfully in HAVDM

**Outcome.** A user who downloads an existing dashboard sees it as Home
Assistant shows it: entity rows render, entity state reaches the cards, and
templates are not shown as literal text. **Class:** capability. **Source:** S-A
item 8, S-C (HA-03, HA-06), the remediation order's ruling R7.

| Story | Plain English                                                                                                                                                                                | Class      | Depends on                                 | Source / notes                                                                                                                                                                                                                                                                                                             |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S03.1 | Entities cards can host the row types real dashboards use (`divider`, `custom:template-entity-row`, and the other rows)                                                                      | capability | **Board B6** — the R7 three-way split plan | HA-03 finding 1: 24 live uses on the reference instance do not render. Ruling R7: split plan first, each part owner-signed                                                                                                                                                                                                 |
| S03.2 | Entity state reaches the cards of a downloaded dashboard                                                                                                                                     | capability | B6                                         | HA-03 finding 2                                                                                                                                                                                                                                                                                                            |
| S03.3 | Templates in downloaded cards are never shown as literal template text — they are marked, per the third part of the R7 split (template marking); whether any are evaluated is B6's to decide | capability | B6                                         | HA-03 finding 3 — "displaying WRONG content, worse than hiding it". Ruling R7 names "template marking" (rev 1: "render as values" withdrawn)                                                                                                                                                                               |
| S03.4 | The canvas consumes Home Assistant theme variables so a chosen theme changes what the user sees (the canvas-fidelity contract)                                                               | capability | —                                          | HA-06 (High). **PARKED** — ruled again 2026-09-08 (§7 Q2). Trigger (strategy 2026-08-18 §8): when this contract is scheduled, its spec session opens with the fidelity-standard choice. The render-fidelity plan's Phase B canvas accuracy (S-N, post-1.0) belongs to the same family and is recorded here, parked with it |

### E04 — Editor correctness debts with no UAT card behind them

**Outcome.** Known defects the code map records as STILL OPEN, none of which a
tester has yet hit, are closed before they become round-4 findings. **Source:**
S-E.

| Story | Plain English                                                                                                                                                                                                                                                                                                             | Class      | Depends on | Source / notes                                                                                                                                                                                                                                                                                           |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S04.1 | Each of the eleven HA-03 cards gets an honest, complete property form: today the four core cards (tile, heading, entity, statistics-graph) have only the generic fallback; six palette cards have partial forms; `custom:fold-entity-row` has guidance only; and the panel still says "not yet implemented" for all seven | content    | —          | S-E, **corrected from measurement 2026-09-08** (review P2): `src/components/PropertiesPanel.tsx` branches at `:6138`, `:6215`, `:6275`, `:6390`, `:6446`, `:6499`, `:6532` (all since `eaa9efa`, 2025-12-26) and the notice at `:6718`. The code map's blanket "no forms" was already false when written |
| S04.2 | The properties form stops writing `icon_color_mode: default` into cards that never set it                                                                                                                                                                                                                                 | content    | —          | S-E                                                                                                                                                                                                                                                                                                      |
| S04.3 | Undo and redo restore the document's file path along with its content                                                                                                                                                                                                                                                     | capability | —          | S-E; also named by FR-01's design note (S-F)                                                                                                                                                                                                                                                             |
| S04.4 | Downloading a dashboard from Home Assistant warns before discarding unsaved work                                                                                                                                                                                                                                          | content    | —          | S-E: `handleDashboardDownload` has no dirty guard                                                                                                                                                                                                                                                        |
| S04.5 | Loading a dashboard never silently drops a malformed card — the user is told what was skipped and why                                                                                                                                                                                                                     | capability | —          | S-E: `asCardRecord` silent drop. The "told what was skipped" outcome is the author's candidate, from the vision's "never silently destroy user data", not the source's (rev 1)                                                                                                                           |

### E05 — What the tester asked for

**Outcome.** The three open requests from the UAT feature-request register are
delivered or explicitly declined, and ruling R5's post-1.0 remainder has a home.
**Source:** S-F, S-L.

| Story | Plain English                                                                                            | Class   | Depends on | Source / notes                                                                                                                                                                                                  |
| ----- | -------------------------------------------------------------------------------------------------------- | ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S05.1 | File → Close returns to the Welcome screen without quitting, with the same unsaved-changes guard as Open | content | —          | FR-01 — raised in round 2, lost, raised again in round 3. The register's design note names the guard and an interaction with the undo/redo file-path defect (S04.3) to design for — not a landing order (rev 1) |
| S05.2 | Find (and replace) in the YAML editor                                                                    | content | —          | FR-02 — Monaco ships a find widget; measure whether this is enabling, not building                                                                                                                              |
| S05.3 | Document that undo inside the YAML editor requires the editor to have focus                              | docs    | —          | FR-03 — a documentation request, not a behaviour change                                                                                                                                                         |
| S05.4 | An in-app Recent Files surface with real tooltips showing each file's full path                          | content | —          | S-L, ruling R5's post-1.0 half, tracked alongside FR-01 (rev 1)                                                                                                                                                 |

### E06 — Release 1.0 gates

**Outcome.** The two ship-gates the owner ruled formal (R6) are met, and the
UAT pass bar is reachable. **Source:** S-A item 13, ruling R6, S-C (amendment 03
pass bar), S-D §7, S-N Phase C.

| Story | Plain English                                                                                                                      | Class      | Depends on                                                                                                                                  | Source / notes                                                                                                                                                            |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S06.1 | The app's file read/write bridge accepts only paths the user chose, with a written threat model (today it takes any absolute path) | capability | —                                                                                                                                           | Ruling R6a = F12a. Codex's caution: "recent-file-listed" must not become ambient permission                                                                               |
| S06.2 | The Windows build is signed under the owner's credentials and signing policy — the formal 1.0 distribution gate                    | release    | owner credentials                                                                                                                           | Ruling R6b = F12b. The CLIP-02 Acronis alert is why the gate exists; whether security software still flags a signed build is measured after signing, not promised (rev 1) |
| S06.3 | UAT round 4 runs against the pass bar; THEME-03's blank skip reason and THEME-04's untested state are resolved first               | process    | `UAT_STRATEGY.md` §3.1 (gate green; full e2e + integration captured and triaged; packaged app launches) plus the fix PRs the round verifies | S-C amendment 03 §3.1 criterion 5 breached twice; S-D §7 Q2. Listed so the release has a home; not a product story (prerequisite completed, rev 1)                        |
| S06.4 | The app's "open external link" bridge accepts only links the app itself produced (today it opens any URL the renderer passes)      | capability | —                                                                                                                                           | S-N Phase C2 (rev 1); `src/main.ts:205` passes the URL straight to `shell.openExternal`                                                                                   |

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

### E09 – E20 — Phase 8: the 2026 ecosystem catch-up, plus two post-1.0 programmes

The refresh plan's §4.4 opportunities, in the order WS4 ruled (S-H), each as an
epic whose stories are **not yet enumerated** — they need a brief each, and the
parity requirements document (S-I) is the brief material for E09 — followed by
the two post-1.0 programmes the review recovered (E19, E20; rev 1). Listed here
so the board holds the whole plan, at the bottom of the order. **Ruled (§7 Q1):
seeded now, as bottom-of-order Todo items, no new board status.**

| Epic | Outcome, in plain English                                                                                                                                                                          | Refresh-plan ref       | Size (plan's estimate)             |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------- |
| E09  | The sections grid is HAVDM's primary layout: the parity set in S-I §5.1 (create/reorder sections, drag within sections, HA-style resize, visibility conditions, heading card)                      | §4.4 A                 | Large                              |
| E10  | The Tile card is a first-class, richly configurable output                                                                                                                                         | §4.4 B                 | Medium                             |
| E11  | Entity-first card creation with live previews                                                                                                                                                      | §4.4 C                 | Medium                             |
| E12  | Per-element four-tab editing (General / Actions / Logic / Design), Jinja2, attribute-level conditional visibility                                                                                  | §4.4 D                 | Large                              |
| E13  | The preset / template marketplace is finished (Phase 7 slice A started it)                                                                                                                         | §4.4 G                 | Medium                             |
| E14  | Areas, labels and floors as first-class primitives, with an unassigned-devices workflow                                                                                                            | §4.4 E                 | Medium                             |
| E15  | New native card and badge types: shortcut, button badges, distribution, redesigned gauge, markdown actions                                                                                         | §4.4 F                 | Small each                         |
| E16  | Auto / dynamic entity population (area, domain, label, attribute, regex filters)                                                                                                                   | §4.4 I                 | Medium                             |
| E17  | AI-assisted layout generation                                                                                                                                                                      | §4.4 H                 | Large                              |
| E18  | Styling output aligned to the Tile design language and HA theme variables (ongoing)                                                                                                                | §4.4 J                 | Ongoing                            |
| E19  | HAVDM supports many more core and HACS cards, prioritised by HACS popularity, each provable with an offline fixture; third-party card code never runs in the main app                              | S-K (rev 1)            | Not estimated                      |
| E20  | Real Home Assistant cards rendered in an isolated, preload-less window — a time-boxed spike whose output is a go / no-go decision; rendering only if the spike says go, and only after S06.1 lands | S-N Phases D–E (rev 1) | Spike small; feature not estimated |

**Named candidates already recorded for these epics (rev 1)** — each still needs
its brief: under **E09**, sections-container nesting (S-M, deferred by the owner
2026-08-06 because a nested child has no address in the `(sectionIndex,
cardIndex)` model); under **E18**, a theme editor and full theme application
(S-Q, post-1.0). E19's and E20's stories are not enumerated here.

## 5. Why this order

Sequenced by what unblocks the most, the same principle the round-3 triage used
(S-D §6), and by the owner's existing rulings where they bind:

1. **The first three product PRs are ruled, not proposed** (S-B ruling 2):
   **S01.1 (F9a), then S02.1 (F6), then S02.2 (F10)** — stories, not epics. E01
   leads the epic column because export honesty is the vision's central promise
   and the remaining piece of the HA-09 finding; its other stories follow F6 and
   F10, they do not precede them. Preferred order inside E01: S01.2 then S01.3
   (a preference — the conversion code S01.3 needs already exists). E09
   (sections grid) is easier once the export carries sections faithfully — a
   reason for the order, not a landing dependency (rev 1).
2. **E02 next** — four contained interface stories, two of them the owner's
   ruled F6 and F10; each is a candidate first content-class run of the light
   process.
3. **S03.1–S03.3** wait on B6 (the R7 split plan) by ruling; they are the largest
   surface among the round-3 findings. S03.4 is parked (Q2), not waiting on B6
   (rev 1).
4. **E04 and E05** are small, independent, and the cheapest way to keep the
   next UAT round from re-finding known things. S05.1 (File → Close) is preferred
   after S04.3 because the two touch the same file-path state; either may land
   first (rev 1).
5. **E06** is release work; its two gates need the owner's credentials and a
   threat model respectively, and they gate 1.0 rather than any feature.
6. **E07, E08** are self-contained and can be slotted anywhere.
7. **E09–E18** follow the refresh plan's own ruled order (D3: close out Phase 7
   first, then WS4 led by the sections grid); **E19 and E20** sit after them —
   both are post-1.0 by their own rulings, and E20 also waits on S06.1 (rev 1).

**What is excluded, and why.** Delivered work: remediation items 1–7 (F1, F2,
F3 interim, F4, F5, F7, FR-04) and the round-3 findings they closed (HA-07,
FILE-06, THEME-02, EXPORT-04, VIEWS-04). Phase 7 slice H (withdrawn), slice C's
per-card actions (withdrawn; its state-safety guarantee was delivered) and slice
G's telemetry half (dropped) — S-G; revived only by an owner ruling. The
"reviewed and not carried" plans in §2, including the popup / Bubble Card
alignment (Q3). UAT card corrections HA-05, HA-06, PROPS-03 (test wording,
applied at plan generation). The nightly-suite watch (#145), the two non-product
STILL-OPEN entries (S-E), and every B-item on the board (process).

## 6. Seeding plan — what happens on approval

1. For **each epic** in §4, one **draft** board item: title `E0n: <outcome>`,
   Kind `product`, Status `Todo`, body = the outcome sentence, the candidate
   story table (IDs, plain English, class, depends-on), and links to this
   document and the §2 sources. No rationale on the card (D11).
2. Items are created in the §4 order so the epic column reads top to bottom as
   the proposed priority; E09–E20 last, as ordinary Todo items — no new status,
   field or label (the pause on new mechanisms). Reordering is yours, on the
   board, any time.
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

### Q1 — Seed the Phase 8 epics (E09–E18, now E09–E20) now, or hold them? — RULED

| Option                                                | For                                                                                         | Against                                                                                                                                                    |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Seed all, at the bottom (recommended)**         | The board holds the whole plan in one place, which is D11's point; nothing is lost in a doc | Twelve more items that will not move for a while — three Large, five Medium, one Small-each, one Ongoing, two not estimated (the table's own sizes, rev 1) |
| **B — Seed E01–E08 only; Phase 8 in a later session** | A shorter board that matches the work immediately ahead (no capacity estimate exists)       | The Phase 8 plan stays only in the refresh document — a frozen reference, not a live surface (C1 forbids a LIVE roadmap beside the board) — until then     |

**Ruled: A (owner, 2026-09-07).** Presentation ruled 2026-09-08 (review P5):
bottom-of-order Todo draft items, Kind product; no "unscheduled" status or field
is added — that would be a new board mechanism under the pause.

### Q2 — Does the canvas-fidelity contract (S03.4) stay parked? — RULED

The remediation order parked the deep HA-06 fix behind an interim badge (F3,
PR #142). **The recorded trigger** (strategy 2026-08-18 §8, arbitration point 5):
when the canvas-fidelity contract is scheduled, its spec session opens with the
fidelity-standard choice — exact visual parity, bounded preview fidelity,
structural parity, or layered tolerances. Scheduling fires it; nothing has
scheduled it. Grouping (inside E03 or its own epic) is a separate choice from
scheduling. **Options were:** keep parked inside E03 marked PARKED with the
trigger named (recommended); keep parked as its own epic; unpark now.
**Ruled: parked inside E03, trigger named (owner, 2026-09-08).** Keeping it
parked keeps the current preview limitation; no fidelity standard is chosen.

### Q3 — The 2026-02 popup / Bubble Card alignment intent (S-R) — RULED

A February 2026 plan wanted `custom:popup-card` aligned to Bubble Card. The
2026-07-21 vision (answers 3 and 9) made the popup card canvas-only, replaced by
a placeholder on deploy. **Options were:** not carried, recorded as superseded
(recommended); carried as a candidate under E15; carried as its own epic.
**Ruled: not carried (owner, 2026-09-08).** Revivable only by a later ruling.

## 8. What this document does not claim

- It does not estimate effort beyond the refresh plan's own sizes for E09–E18.
  Estimates belong in briefs and specs.
- It does not assert that the story list under any epic is complete, nor that
  §2 is the whole universe of recorded intent — §2 states exactly what was
  enumerated and how. Each epic's brief will re-enumerate from source; a story
  missing here is added on the board, not by editing this document.
- Its "delivered" and "open" statements were read from the sources named in §2
  on 2026-09-07, on `main` = `eb5c918`; anything merged after that date is not
  reflected.

## 9. Revision history

| Date       | Rev | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | By               |
| ---------- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 2026-09-07 | 0   | Draft from S-A … S-J; awaiting GPT-6 Astra's review                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Claude Fable 5.1 |
| 2026-09-08 | 1   | Repaired on the owner's per-Ref rulings on `docs/reviews/b7-product-backlog-codex-review.md` (P1–P8, all "as recommended"; record in `docs/reviews/b7-product-backlog-repair-dispositions.md` Round 2): §2 population statement rewritten, sources S-K…S-T added, "reviewed and not carried" list; S04.1 restated from measurement; S01.1/S01.2/S03.3/S02.1 returned to their rulings; depends-on column reduced to prerequisites and §5 states the ruled first three PRs; S01.4–S01.7, S05.4, S06.4, E19, E20 added; freeze event = seeding (C1); S06.2 states the gate, not an outcome; S-E/S-G/S-D/Q1 records corrected; Q1–Q3 recorded as ruled | Claude Fable 5.1 |

## 10. Sign-off chain

1. **Author** — Claude Fable 5.1, this document, on `feature/b7-product-backlog`.
2. **Reviewer** — GPT-6 Astra, independently, on this branch, as
   `docs/reviews/b7-product-backlog-codex-review.md`, under
   `docs/templates/ADVERSARIAL_REVIEW.md` §1 / §1a / §4. Findings are
   hypotheses; dispositions go to
   `docs/reviews/b7-product-backlog-repair-dispositions.md`; SEV 2/3 to the
   owner by Ref.
3. **Owner** — reads document and review together, rules on §7 by Q, approves.
   **The approval is the seeding authorisation** (§6). Seeding the board freezes
   the document (C1, §6 step 5); the owner's merge of this branch lands the
   frozen record.
