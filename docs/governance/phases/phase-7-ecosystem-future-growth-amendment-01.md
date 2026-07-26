Phase Name: Phase 7 – Ecosystem & Future Growth
Amendment: 01
Amends: docs/governance/phases/phase-7-ecosystem-future-growth-blueprint.md
Date: 2026-07-26
CURRENT_VERSION: 0.7.5-beta.10
Governance Mode: HARD MODE++
Authority: `docs/governance/PHASE_WORKFLOW.md` Step 2 — "If blueprint must change: create amendment file"
References:

- ai_rules.md
- docs/governance/PHASE_ORCHESTRATION_FRAMEWORK.md
- docs/refresh/PROJECT_REFRESH_PLAN_2026-07.md

# Phase 7 Amendment 01 — Withdraw Slices G and H; Resolve Version Progression

## 0) Why this file exists

The Phase 7 blueprint is **immutable once execution begins** (blueprint §24,
`PHASE_WORKFLOW.md` Step 2). Slices A–D and F have shipped, so the blueprint is
not editable in place. This amendment is the authoritative record of two scope
decisions taken on 2026-07-26. Where this file and the blueprint disagree, **this
file wins**; the blueprint carries pointer notes at §12, §17 and §21 directing
readers here.

Both decisions were taken by the project owner (micah / BaggyG-AU) after a
read-only investigation, and are deliberate amendments — **not** silent skips.

---

## 1) Amendment A — Slices G and H are WITHDRAWN

### 1.1 What changes

| Slice                                   | Blueprint status          | Amended status |
| --------------------------------------- | ------------------------- | -------------- |
| G — Dashboard Analytics                 | Planned (§12, §13 prompt) | **WITHDRAWN**  |
| H — Plugin System Architecture Scaffold | Planned (§12, §13 prompt) | **WITHDRAWN**  |

The §13 slice prompts for G and H remain in the blueprint as historical record.
They are **not executable artifacts** for this phase any more. No code, tests,
services or docs are to be written against them under Phase 7.

Neither slice was ever started. `src/services/analyticsService.ts`,
`src/services/pluginService.ts` and `src/features/plugin-system/` do not exist,
and a repository-wide grep for `analyticsService`, `pluginService` and
`plugin-system` across `src/` and `tests/` returns zero hits. Withdrawal
therefore removes nothing that exists and leaves no dead code behind.

### 1.2 Rationale — Slice G (Dashboard Analytics)

1. **No consumer exists for the data.** The slice's own _Forbidden_ clause
   states "no telemetry exfiltration beyond declared local/storage behavior
   unless explicitly scoped", so slice G is **local-only** analytics. HAVDM is a
   single-developer desktop application with no distribution telemetry pipeline
   and no aggregation backend. Counters would accumulate on one machine and be
   read by nobody. The feedback loop that makes usage analytics valuable does not
   exist, and building the instrument before the loop inverts the order.

2. **It instruments the highest-risk render path in the codebase for zero
   delivered value.** The slice names `src/components/GridCanvas.tsx` and
   `src/components/BaseCard.tsx` as its instrumentation points. That is the exact
   render path behind HAVDM's worst historical defect class: the blank-app
   React #185 failure caused by the PropertiesPanel form → card → `cardToYaml`
   → Monaco `setValue` → `onDidChangeModelContent` → parse feedback cycle, plus
   an App-level infinite
   render loop (fixed in PR #31; the reason all view-level editing was moved out
   of `PropertiesPanel.tsx` into a separate portal modal during slice 4.6a,
   PR #75, merged `aaf3ccb`). Adding render-timing instrumentation there runs
   directly into blueprint §22's per-commit stop condition "significant render
   churn or UI lock introduced" — accepting a real regression risk in exchange
   for data no one reads.

3. **Its one genuinely user-facing idea is already served, and belongs
   elsewhere.** "Dashboard health scoring inputs" is the part of slice G with a
   real user in front of it. HAVDM already computes that class of signal through
   different machinery: `src/services/exportSelfCheck.ts` (extended to view and
   dashboard level by WS3 slice F, PR #80, feature commit `7c1752d`),
   `src/services/exportWarnings.ts`, `src/services/exportWarningSummary.ts` and
   `src/services/capabilityProfileService.ts`. If dashboard health is wanted as a
   product feature it should be built as a user-facing surface on top of those
   services in WS4 — not as a telemetry service instrumenting the render path.

### 1.3 Rationale — Slice H (Plugin System Architecture Scaffold)

1. **It is an API designed before its first user.** The slice is explicitly
   scoped as a scaffold with no execution runtime — blueprint §20 defers "full
   plugin runtime execution sandbox beyond architecture scaffold", and the slice
   prompt's own decision tree says "if any runtime execution model appears, stop
   and produce security design first". A manifest schema, registration lifecycle
   and capability boundary with **zero consumers** cannot be validated against
   any real requirement. The reliable outcome of designing an extension API with
   no extensions is an API that must be broken once a real plugin arrives.

2. **HAVDM already has the extension point this describes.**
   `src/services/cardRegistry.ts` plus the 15 `src/features/<name>/` folders are
   the working, exercised mechanism for adding card capability to HAVDM. Slice H
   would add a second, parallel, unused extension mechanism beside it.

3. **The ecosystem HAVDM must track is not a HAVDM plugin ecosystem.** The
   relevant third-party artifacts are **HACS custom cards** (Bubble Card,
   button-card, apexcharts-card, mushroom, card-mod and the rest). Those are not
   HAVDM plugins and never will be: per the ratified product vision
   (MemPalace `drawer_havdm_decisions_d4f0886c7035390d30c1d1a7`) HAVDM is a
   **superset design tool** whose job is to _translate_ those upstream cards into
   working HA config and honestly _mark_ what it cannot translate. A HAVDM-native
   plugin system is a different, unrequested product.

4. **It degrades the architecture-clarity measure the phase is judged on.**
   Blueprint §22 lists "architecture clarity decreases (rising coupling, unclear
   boundaries)" as a **phase-level stop condition**. A consumer-free plugin
   boundary spanning `src/features/plugin-system/**`,
   `src/services/pluginService.ts`, the card registry and the Electron IPC
   boundary is exactly that, in exchange for nothing shipped.

### 1.4 Strategic rationale (applies to both)

`docs/refresh/PROJECT_REFRESH_PLAN_2026-07.md` §4.4 records that Home
Assistant's built-in editor is steadily absorbing former custom-card territory,
and that HAVDM's durable value is the **cross-card visual composition +
templating + preset ecosystem + AI generation** layer. WS4 ("2026 ecosystem
catch-up") sequences that work: Sections grid → Tile card → entity-first
creation with live previews → the 4-tab per-element editor. Two sessions spent
on local analytics with no reader and a plugin API with no plugin are two
sessions not spent closing that gap while it is still closable.

### 1.5 Honest statement of the cost

This reduces what Phase 7 delivers. "We withdrew it with reasons" is a weaker
claim than "we shipped it", and anyone reading the blueprint's §0 executive
summary will see analytics and plugin scaffolding listed as phase intent. That
is the trade being made knowingly. It is mitigated, not erased, by re-homing
both ideas rather than abandoning them (§1.6) and by recording the decision
here rather than letting the slices quietly never happen.

### 1.6 Where the ideas go

| Withdrawn idea                                     | Re-homed as                                                                                                                                                                                |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dashboard health scoring (the valuable half of G)  | **WS4 candidate** — a user-facing surface over the existing `exportSelfCheck.ts` / `exportWarnings.ts` / `capabilityProfileService.ts` signals. Not telemetry, not render instrumentation. |
| Usage counters / render timing (the rest of G)     | **Dropped.** Revisit only if HAVDM acquires a distributed user base and a consented aggregation path — which would be its own governed phase, with a privacy design up front.              |
| Plugin manifest / lifecycle / capability model (H) | **Deferred until a concrete consumer exists.** The trigger to revisit is a real, named extension that `cardRegistry.ts` plus `src/features/<name>/` demonstrably cannot host.              |

### 1.7 Consequential edits to the blueprint

- **§12 Ordered Feature Slice Plan** — slices G and H marked `WITHDRAWN — see
amendment-01`. Remaining executable order: A, B, C, D, E, F, I.
- **§17 Phase Definition of Done**, first bullet — "All eight Phase 7 feature
  slices delivered within scoped boundaries" is amended to:

  > **All six scoped Phase 7 feature slices (A–F) delivered within scoped
  > boundaries. Slices G and H are withdrawn by amendment-01.**

  Every other §17 bullet is unchanged and still binding: no unresolved P0/P1
  regressions; required unit/integration/e2e gates pass with evidence; YAML and
  IPC compatibility preserved; performance and UX budgets within tolerance;
  Medium Gate yields an explicit Go/No-Go with documented rationale; governance
  artifacts complete and archived.

  > ⚠ **A–F is the amended SCOPE, not a claim that A–F are all delivered.**
  > Building the §18 tracking doc for this amendment surfaced that **Slice C
  > (Card Duplication & Cloning) was never implemented** — commit `f17be4d`,
  > which is titled "slices-c-d", actually delivers Slice D and labels it
  > "Slice C". See `docs/governance/phases/phase-7-tracking.md` §"Finding 1".
  > Phase 7's Definition of Done is therefore **not yet met**, and slice I
  > cannot return GO until Slice C is either delivered or itself withdrawn by a
  > further amendment. That is an open decision for the project owner, not
  > something this amendment resolves.

- **§21 HARD MODE++ Packaging Plan**, commit sequence — items 7
  (`feat(phase-7): add dashboard analytics instrumentation and controls`) and 8
  (`feat(phase-7): scaffold plugin architecture with capability boundaries`) are
  removed. The remaining sequence is items 1–6 and 9.

- **§13 slice prompts for G and H** — retained verbatim as historical record,
  demoted from executable artifacts. §13a's "Section 13 prompts are
  authoritative execution artifacts for this phase" is read as applying to the
  prompts for A–F and I only.

- **§19 Medium Gate Audit Prompt** — requirement 2 ("Validate slice completion
  against Section 12 and Section 13 prompts") is satisfied by validating A–F and
  I. Its stop condition "security boundary uncertainty for plugin/version-control
  slices" now applies to the version-control slice (E) only.

### 1.8 Remaining Phase 7 work

**C** (open — see the tracking doc, Finding 1; deliver or withdraw by a further
amendment) → **E** (version-control integration boundaries) → **I** (Medium Gate
packaging and release readiness).

Slice I is terminal by construction — its own Definition of Done requires
"packaging is complete and scope-pure" — so it runs after the last feature
slice, not before it. This is also why running the Medium Gate early, as a way
to discover what v1.0.0 demands, was rejected: §19's audit measures what exists
against §12/§13, which is a release-readiness question, not a product-scope one.
The scope questions (G, H, and now C) are decided on their merits and then
gated, not the other way round.

---

## 2) Amendment B — Version progression resolved

### 2.1 The inconsistency

`ai_rules.md` §0b (Version Integrity Rule) requires validated, non-guessed
version progression. Three sources disagreed:

| Source                                                | Says                         |
| ----------------------------------------------------- | ---------------------------- |
| `package.json`                                        | `0.7.5-beta.10`              |
| Blueprint header + §16 `INITIATION_VERSION`           | `0.7.7-beta.0`               |
| `docs/refresh/PROJECT_REFRESH_PLAN_2026-07.md` §7 WS3 | "Target **v1.0.0** at close" |

The blueprint's `0.7.7-beta.0` initiation bump was **never applied** — slices
A–D and F all shipped on `0.7.5-beta.10`, and `package.json` still reports it.
Blueprint §16's own rule ("no mid-slice version changes; apply
initiation/release bump at designated packaging milestones only") means the
window to apply an _initiation_ bump closed once slice A shipped.

### 2.2 Resolution

**`0.7.5-beta.10` → `1.0.0`, applied once, at the slice I packaging milestone.**

- The unapplied `INITIATION_VERSION: 0.7.7-beta.0` is **superseded**. It is
  recorded here as historical intent, not as a pending action. No retroactive
  `0.7.7-beta.0` bump will be applied.
- `1.0.0` is the WS3 close target from the refresh plan §7 and is a valid
  monotonic SemVer progression from `0.7.5-beta.10` (pre-release → stable major).
- Bump classification per `ai_rules.md` §0b: **Major (1.x.y)** — the first
  stable release, leaving the beta line.
- Timing per blueprint §16 and the slice I prompt's Versioning Rules ("apply
  designated phase version bump only at packaging milestone, never mid-slice"):
  the bump happens **inside slice I**, not before.
- Scope of the bump when it happens: `package.json`, `.nvmrc`-adjacent metadata
  if applicable, `docs/RELEASES.md` current-version line, and a new
  `docs/releases/RELEASE_NOTES_v1.0.0.md`. An annotated `v1.0.0` git tag follows
  the `docs/RELEASES.md` "Cut a release" procedure.
- Gate dependency: the bump is **conditional on a GO** from the Medium Gate. A
  NO-GO outcome means the version stays at `0.7.5-beta.10` until the remediation
  list is cleared.

This resolves the §0b inconsistency as of this amendment. The blueprint header's
`INITIATION_VERSION: 0.7.7-beta.0` line is left in place as archived input and
must be read against this section.

---

## 3) Amendment C — `tools/checks` corrected

Not a scope change, but recorded here because it changes what a Phase 7 gate
command actually verifies.

`./tools/checks` is the **first verification command in the slice I prompt**
(blueprint §13, Slice I) and the Medium Gate / Slow Gate command in
`docs/testing/TESTING_STANDARDS.md`. As found on 2026-07-26 it ran `npm run lint`,
then a commented-out `#npm run typecheck`, then `npm ci`, then
`npm run test:unit`.

Three defects:

1. **`typecheck` was still commented out.** WS2 of the refresh plan added the
   `typecheck` npm script and made it a blocking CI step, and §7 WS2.2 of
   `PROJECT_REFRESH_PLAN_2026-07.md` explicitly asked to "uncomment it in
   `tools/checks`" — that half was missed. The type-debt burndown took the
   codebase from 279 errors to 0 with `strictNullChecks` on; the gate script was
   not checking it.
2. **No `format:check`.** Prettier was adopted in the same refresh and gated in
   CI; the gate script did not run it.
3. **`npm ci` in the middle of a check script.** `npm ci` deletes and reinstalls
   `node_modules`. It is a bootstrap step, not a check, and running it between
   lint and unit tests makes the script slow and destructive to an active
   working session.

Corrected to match the blocking CI job's order and content
(`.github/workflows/ci.yml`: lint → format:check → typecheck → unit → build):

```bash
npm run lint
npm run format:check
npm run typecheck
npm run test:unit
```

`npm run package` (CI's build step) is deliberately **not** included: the e2e
`globalSetup` packages the app when needed, and blueprint-era practice bans
starting a separate concurrent build while an e2e run is live. Slice I runs
`npm run package` as its own explicit step instead.

Nothing executes `tools/checks` programmatically — no npm script, no CI workflow,
no test references it; only documentation does. The change is therefore
behaviour-affecting for humans and agents running the gate, and inert everywhere
else.

---

## 4) Traceability

- Slice status board and per-slice evidence:
  `docs/governance/phases/phase-7-tracking.md` (blueprint §18 tracking doc).
- Slice E IPC command contract, narrowed before implementation as the Slice E
  prompt's Operator Decision Tree requires:
  `docs/governance/phases/phase-7-slice-e-command-contract.md`.
- MemPalace `[DECISION]` drawer recording this amendment: filed in wing `havdm`,
  room `decisions`, on 2026-07-26.
