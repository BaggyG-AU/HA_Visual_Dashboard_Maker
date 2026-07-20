# HAVDM Project Refresh Plan — July 2026

> **Purpose:** Restart development on HAVDM (Home Assistant Visual Dashboard Maker) after a ~5‑month pause, on a freshly cloned machine, by (1) auditing current state, (2) porting proven governance/QA/tooling from the `promptmi` project, and (3) closing the gap to the 2026 Home Assistant + Ultra Card ecosystem.
>
> **Status:** Draft for review. Produced 2026‑07‑19. **No source/code changed** in producing this plan.
> **Last commit before pause:** `f17be4d` (2026‑02‑17), branch `feature/ecosystem-future-growth`.
> **Version:** `0.7.5-beta.10` · Phase 7 (Ecosystem & Future Growth) in progress, ~40–50% delivered.

---

## 1. Executive Summary

HAVDM is in **good structural health** but has drifted from a fast-moving ecosystem and from the more mature engineering discipline you since built in `promptmi`. The refresh is best sequenced as three overlapping workstreams:

1. **Machine & repo readiness** (hours) — confirm the app builds/tests on this PC, clean up committed cruft, decide the Node baseline.
2. **Engineering-discipline uplift** (days) — port from promptmi: MemPalace persistent memory over MCP, the governance/decision-log/spec-first method, the reusable Claude skill toolkit, settings.json enforcement hooks, and a real CI gate (typecheck + lint + tests). Modernize the stale lint/TS-strictness stack.
3. **Ecosystem catch-up** (weeks, feature work) — HA's dashboard model moved decisively to **Sections grid**, the **Tile card** is now the hero card, card creation is **entity-first with live previews (2026.6)**, and Ultra Card has matured into a modular page-builder with AI layout generation. These define the Phase 7+ feature roadmap.

The single highest-leverage port is **MemPalace over MCP** (already installed on this machine via pipx) plus the **governance method**; the highest-leverage code-health fix is **wiring typecheck + tests into a blocking CI gate** and modernizing the **EOL lint stack**. The biggest product bet is **adopting the Sections grid as the primary layout target**.

---

## 2. Machine & Environment Readiness (this PC)

Findings from probing the WSL environment on this newly-cloned machine:

| Item                                      | State                                                                                                                       | Action                                                                                                                                                                                                                                     |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Node                                      | **v20.19.6** (Node 20 reached EOL ~Apr 2026)                                                                                | Decision point — bump to **Node 22 LTS** (see §8‑D1).                                                                                                                                                                                      |
| npm                                       | 10.8.2 ✅                                                                                                                   | Fine.                                                                                                                                                                                                                                      |
| pnpm (via corepack)                       | ❌ fails — pnpm 11 needs Node ≥22.13                                                                                        | Not required (HAVDM uses npm). Resolves if Node 22 adopted.                                                                                                                                                                                |
| yarn                                      | 1.22.22 ✅ (unused)                                                                                                         | Ignore.                                                                                                                                                                                                                                    |
| git                                       | 2.43.0 ✅                                                                                                                   | Fine.                                                                                                                                                                                                                                      |
| HAVDM `node_modules`                      | present (installed Mar 7) ✅                                                                                                | Re-run `npm ci` to be safe against lockfile drift.                                                                                                                                                                                         |
| **MemPalace binary**                      | **already installed** via pipx (`~/.local/share/pipx/venvs/mempalace/`, v3.5.0); global palace at `~/.mempalace/palace/` ✅ | Configure for HAVDM (see §6.1) — no install needed.                                                                                                                                                                                        |
| Global Claude skills (`~/.claude/skills`) | **missing on this machine**                                                                                                 | Recover skill files from the old machine / promptmi (see §6.3). Note: promptmi analysis reports several skills live on the **Windows-side** `~/.claude/skills` at `/mnt/c/Users/micah/.claude/skills/` — verify and symlink/copy into WSL. |
| `claude` CLI on PATH (WSL shell)          | not on PATH in a bare shell                                                                                                 | Cosmetic; works inside the harness. Add to PATH for hook scripts.                                                                                                                                                                          |

**Immediate smoke test before anything else:** `npm ci && npm run start:wsl` (the WSL start script already passes `--no-sandbox --disable-gpu`) and `npm run test:unit` to confirm the 5‑month‑old tree still runs on this box.

---

## 3. Audit Findings — Current State of HAVDM

### 3.1 Tech stack (healthy core, one stale corner)

- **Modern & current:** React `19.2`, Ant Design `6.1`, Electron `39.2.7`, TypeScript `5.9`, Vite `5.4`, Playwright `1.57`, Vitest `4.0`, zustand `5`, `home-assistant-js-websocket 9.6`. This is a genuinely current stack — good.
- **Stale / EOL (the one real dependency-health gap):** **ESLint `8.57` is EOL** (v9 flat-config is current) and **`@typescript-eslint/* 5.62`** is three majors behind (v8 line) against TS 5.9; `eslint-plugin-react-hooks 4.6` is a major behind. This is the top code-health item.
- **TypeScript is not strict:** `tsconfig.json` sets only `noImplicitAny`, uses legacy `module: commonjs` / `moduleResolution: node`, and **there is no `typecheck` npm script** (the line is commented out in `tools/checks`).
- **No Prettier / no formatting enforcement.**

### 3.2 Architecture (solid, two monoliths)

- `src/` = **~200 files, ~47k LOC**. Clean hybrid organization: `components/cards/` (**44 card renderers**), `services/` (28), `features/` (15 folders), zustand `store/`, `schemas/`, `types/`, `utils/`.
- **Two monoliths growing under Phase 7:** `App.tsx` (**~67 KB / ~1,900+ lines**, +255 in the last slice) and `main.ts` (24 KB). Refactor candidates before they get worse.
- TODO/FIXME density is **very low** (2 in all of `src/`) — the code is not littered with debt markers.

### 3.3 Testing (strong approach, no coverage gate)

- DSL-first, two-runner split: **Vitest** (~61 unit specs), **Playwright** `electron-e2e` (61 specs incl. paired `*.visual.spec.ts` visual-regression with committed PNG baselines) + `electron-integration` (13 specs). **39 DSL classes** in `tests/support/dsl/`, one per feature. ~28k test LOC. Good discipline, documented standards (`TESTING_STANDARDS.md`, `PLAYWRIGHT_TESTING.md`).
- **Gaps:** no coverage tooling/threshold despite an aspirational "95% for new code" bar; **4 active skips** tracked in `SKIPPED_TESTS_REGISTER.md`, including a **`test.fixme` on the bulk-edit test**. _(Investigated Jul 20, 2026. The suspicion recorded here was doubly wrong: the Slice C/D commit never claimed a fix — "tie off" meant documented — and undo granularity was never broken. Bulk edits already record one history entry and one undo already restores every edited card. The real defect is a stale properties form after undo; a fix attempt destabilised the panel's YAML feedback cycle and was reverted. See `SKIPPED_TESTS_REGISTER.md`.)_

### 3.4 CI / tooling (weak gate, drift)

- `ci.yml` on PR → **lint only** (no typecheck, no tests, no build). `test.yml` is **cron/dispatch-only, non-blocking (`continue-on-error`), on windows-latest + Node 18** — inconsistent with `engines >=20` and `ci.yml`'s Node 20. **Net effect: tests do not gate merges.**
- `tools/`: `feature-start`/`feature-finish`/`test-start`/`test-finish`/`checks` scripts (the `checks` script has `typecheck` commented out). **`tools/check-e2e-guardrails.sh` is referenced by the `test:e2e:guardrails` npm script but is missing** — likely broken.
- **No Prettier, no pre-commit hooks (`.husky/`).**

### 3.5 Governance & docs (already mature)

- **102 markdown files** under `docs/`, well-organized (`governance/`, `governance/phases/`, `features/`, `architecture/`, `testing/`, `security/`, `releases/`, `archive/`). A formal "HARD MODE++" phase-orchestration framework already exists (`PHASE_ORCHESTRATION_FRAMEWORK.md`, `PHASE_WORKFLOW.md`, slice wrappers). `ai_rules.md` at root. This is a strong base that promptmi's method can _tighten_, not replace.
- Phases 1–6 complete/merged; **Phase 7 in progress** (branch `feature/ecosystem-future-growth`): blueprint defines 9 slices A–I; **~3 of 8 feature slices delivered** (A Preset Marketplace, B Theme Manager, C+D bulk-select/clone). **Not started:** E version-control, F import/export hardening, G analytics, H plugin scaffold, I medium gate. Roadmap targets **v1.0.0** at Phase 7 close.

### 3.6 Repo hygiene (cruft to remove)

- Committed artifacts that should not be in the tree: `gitignored_files_migration.tar.gz` (**9.8 MB**), `bash.exe.stackdump`, a stray `Control Panel (control_panel)` (23 KB), plus loose `CODEX_SUMMARY.md` / `PR_NOTES.md` / `analyze-test-results.js` at root.
- **Kanban (`havdm.kanban`) is not in-repo** — it lives on OneDrive (`/mnt/c/Users/micah/OneDrive/Documents/havdm.kanban`), so board state isn't version-controlled.
- **~24 stale remote branches** on origin (chore/_, feature/_) — prune after confirming merge status.

---

## 4. Ecosystem Gap Analysis — HA 2026 & Ultra Card

The dashboard world moved substantially since Feb 2026. HA ships monthly; latest is **2026.7** (your server is on 2026.3). Key shifts and the opportunities they create (full citations in the research appendix, §10):

### 4.1 Home Assistant — what changed that affects a dashboard builder

- **Sections grid is now the default, and the only drag-and-drop, view type.** A builder still emitting legacy vertical/horizontal-stack views feels dated. Must model: `type: sections` → `grid` sections → `cards[]` with **`grid_options`** (column span + rows), **auto-height** (2026.4), **precise mode**, **dense placement**, **section background color/opacity** (2026.4), **per-section theme override**, **section visibility conditions**, **heading cards**, and **sticky footer cards** (2026.3).
- **The "Home" dashboard is the new default** (2026.2) with auto summary + "For You" cards.
- **Tile card is the hero card** and evolves every release: inline feature positioning, media-player remote controls (source/sound-mode dropdowns, reorderable playback, mute/shuffle/repeat/volume — 2026.5/2026.6), weather-forecast features, **favorites** (light colors/cover positions — 2026.4), per-format timestamps (2026.7).
- **Entity-first card creation with live previews (2026.6)** — pick an entity, see cards that fit it rendered with real data. Custom cards opt in via a new **`getEntitySuggestion`** hook.
- **New card/badge types:** Shortcut card + shortcut badges (2026.5), heading-card button badges (2026.2), distribution card (2026.2), redesigned gauge (2026.4), markdown-card actions (2026.4). Area card can pick specific entities (2026.2).
- **Visibility conditions** now support entity **attributes** and self-referencing state (2026.5). **Template autocomplete** overhaul + new functions (`entity_name`, `state_attr_translated`) (2026.4/2026.5).
- **Floors / areas / labels are first-class targeting primitives** with entity-expansion counts (2026.6). "Advanced mode" toggle removed entirely (2026.6).
- **Integration path caveat (unchanged but reconfirm):** HA dashboards default to **storage mode** (JSON via WebSocket); your instance is storage-mode. A YAML-emitting builder must target YAML-mode dashboards **or** write via the WebSocket API.

### 4.2 Custom-card ecosystem

- **Mushroom 5** realigned its Template Card to the **official Tile design language** — a breaking change (theme vars/colors dropped). Signals ecosystem **convergence on Tile**; generating output that inherits HA theme variables reduces breakage.
- **Bubble Card v3** added a **Module Store + Module Editor**. The trend is visual, modular **page-builder cards** plus the official frontend absorbing former custom-card niches.

### 4.3 Ultra Card (HAVDM's inspiration) — where it is now

- Repo `WJDDesigns/Ultra-Card`, docs `ultracard.io`. Modular no-YAML page-builder: **Card → Rows → Columns → Modules** with unlimited nesting (Horizontal/Vertical/Grid/Tabs/Accordion/Stack Overlay containers). **~36–51 modules** (counts vary by source as it grew fast).
- **Per-module 4-tab editor: General / Actions / Logic / Design** — the interaction model users now expect. Full **Jinja2** templating (CodeMirror), **Card Appearance Templates** (whole-card styling from one template, 3.5.0), per-module conditional visibility.
- **Integrated online Preset Marketplace** (browse, preview-before-install, one-click, community submission).
- **v3.5.0 (Jun 2026): "Smart Card" AI layout generation from plain-language prompts.** v3.4.0 added Alarm Panel, Solar Analytics, **Auto Entities List** (dynamic filtering), Stack Overlay, and a unified-editor visual redesign across 51 modules.
- Pro tier: cloud config sync + 30-day backups + premium animated modules.

### 4.4 Prioritized feature opportunities (Phase 7+ candidates)

| #     | Opportunity                                                                                                    | Why                                                             | Effort     |
| ----- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------- |
| **A** | **Sections grid as primary layout target**                                                                     | HA default + only drag-drop layout; biggest "feels current" win | Large      |
| **B** | **Tile card as first-class, richly-configurable output**                                                       | HA's hero card; evolves monthly                                 | Medium     |
| **C** | **Entity-first card creation + live previews** (mirror 2026.6)                                                 | Native-feeling UX; consider `getEntitySuggestion`               | Medium     |
| **D** | **Per-element 4-tab editing (General/Actions/Logic/Design) + Jinja2 + attribute-level conditional visibility** | The expected modular-builder model                              | Large      |
| **E** | **Areas / Labels / Floors as first-class primitives** (+ unassigned-devices workflow)                          | Matches HA's own direction                                      | Medium     |
| **F** | New card/badge types: Shortcut, button badges, distribution, redesigned gauge, markdown actions                | Cheap "stay current" wins                                       | Small each |
| **G** | **Preset/template marketplace** (already started as Phase 7 Slice A)                                           | Differentiator + stickiness; finish it                          | Medium     |
| **H** | **AI-assisted layout generation** (à la Ultra Card Smart Card)                                                 | Desktop app has room to do this better than an in-browser card  | Large      |
| **I** | Auto/dynamic entity population (area/domain/label/attr/regex filter)                                           | Keeps dashboards current without manual edits                   | Medium     |
| **J** | Align styling output to official Tile design language / HA theme vars                                          | Reduce breakage as ecosystem converges                          | Ongoing    |

**Strategic note:** HA's built-in editor is encroaching on custom-card territory. HAVDM's durable value is the **cross-card visual composition + templating + preset ecosystem + AI generation** layer that HA's native editor still doesn't match — not re-implementing individual card types.

---

## 5. Reconfirm before building (validation tasks)

- Confirm current **HA version** on your server (memory says 2026.3; latest is 2026.7) and whether the app targets storage-mode (WebSocket) or YAML-mode output.
- Verify the app's YAML/JSON output still round-trips against a **2026.7** dashboard, especially Sections `grid_options`.
- Verify the **undo-granularity fixme** (§3.3) — is it closed or still open?

---

## 6. Porting from `promptmi` (engineering-discipline uplift)

`promptmi` is a Godot/GDScript game, so its _code-level_ QA is engine-specific — but its **governance, memory tooling, Claude skills, and process** are language-agnostic and are the real assets to port.

### 6.1 MemPalace over MCP — the headline port (highest value)

Persistent, searchable, cross-session AI memory backed by a local ChromaDB "palace" (wings → rooms → drawers), no API key. Already installed on this machine. It supersedes HAVDM's current `MEMORY.md` auto-memory (which becomes the "bootstrap-only fallback" MemPalace is designed to replace).

**Stand-up steps for HAVDM:**

1. Write a `mempalace.yaml` room map matching HAVDM folders (`src/components/cards/`, `src/services/`, `src/features/`, `tests/`, `docs/`).
2. `mempalace init` (or hand-write the map) → `mempalace mine` to ingest files + transcripts.
3. Register MCP: `claude mcp add mempalace -- mempalace-mcp` (and the `codex mcp add …` variant if using Codex).
4. Allow-list the `mcp__mempalace__*` tools in `.claude/settings.local.json` (~25 tools: status, search, add/update/delete_drawer, diary_read/write, list_rooms/wings, kg_* knowledge-graph, traverse, etc.).
5. Adopt promptmi's **CLAUDE.md §6 save cadence**: session-start `status`+`search`+`diary_read`; session-end cold-readable `diary_write` handoff; auto-file `[DECISION]`/`[STATE]`/`[PATTERN]`/`[INVESTIGATION]` drawers with **supersede-don't-delete**.

### 6.2 Governance method & templates (drop-in, engine-neutral)

- **`DECISION_LOG.md`** — append-only, fixed-table, supersede-don't-delete decision record. Prevents conflicting AI instructions across sessions.
- **`PHASE_WORKFLOW.md` lifecycle** (Activation → Blueprint → Archival → Execution → Stop Conditions → Medium Gate → Close-Out) with **immutable approved blueprints** — a tighter version of HAVDM's existing phase framework.
- **`AI_AGENT_WORKFLOW.md` independent-review invariant** — no agent approves an artifact it authored.
- **`docs/templates/*`** — FEATURE_SPEC, DESIGN_BRIEF, BUG_REPORT, IOR (independent-review), STRATEGY_SESSION — copy directly.
- **CLAUDE.md / AGENTS.md hard-rule structure** — numbered non-overridable session rules + a tripwire phrase + mandatory pre-reads (draft-PR-first, spec-before-prompt, never commit to `main`, never mark PR ready without explicit human instruction). HAVDM already has a CLAUDE.md/MEMORY.md; formalize it to this shape and mirror to `AGENTS.md` for Codex.

### 6.3 Reusable Claude skill toolkit

Recover these from the old machine / Windows-side `~/.claude/skills` and lightly de-target from promptmi wording: `whereami` (status orientation), `write-spec`, `commit-review`, `pr-notes`, `status-hygiene`, `sync-ff` (post-merge git hygiene: ff main + prune merged branches), `post-merge`, `strategy-session`, `cross-ai-prompt`. **`playwright-electron-testing` and `home-assistant-manager` already exist there** and are directly HAVDM-relevant. Pipeline: `whereami → write-spec → commit-review → status-hygiene → pr-notes → sync-ff`.

### 6.4 settings.json enforcement hooks

Port promptmi's two hooks (swap PowerShell→bash for WSL): a **`Stop` hook** (rate-limited to ~30 min) reminding the agent to file a MemPalace drawer/diary checkpoint, and a **`PostToolUse` hook** on `mempalace_add_drawer` reminding to verify `[STATE]` supersession/dedup.

### 6.5 Testing _philosophy_ (not the framework)

Lift the six principles from promptmi's `TESTING_STANDARDS.md`: tests fail only on behavior change (not refactor/UI churn); tests read like scenarios; one assertion per behavior; **no arbitrary waits** (signals/await/state, never sleep); actionable failures; determinism is testable. These sharpen HAVDM's existing DSL-first Playwright approach. **Do not port** GUT/`gdlintrc`/Godot CI internals/`godot-ai` MCP/the voxel asset pipeline.

---

## 7. The Improvement Plan — Sequenced Workstreams

Recommended order. WS0–WS2 are the "refresh" (unblock development); WS3+ is the resumed feature roadmap.

### WS0 — Machine & repo readiness _(0.5–1 day)_

1. `npm ci`; smoke-test `npm run start:wsl` and `npm run test:unit`.
2. Decide Node baseline (§8‑D1); if Node 22, update `engines`, add `.nvmrc`, align both CI workflows.
3. Repo hygiene: remove committed cruft (`gitignored_files_migration.tar.gz`, `bash.exe.stackdump`, `Control Panel (control_panel)`), gitignore them; move `havdm.kanban` into the repo (or document its OneDrive location); prune stale origin branches after checking merge status.
4. Fix or remove the missing `tools/check-e2e-guardrails.sh` reference.

### WS1 — Engineering-discipline uplift (promptmi port) _(2–4 days)_

1. **MemPalace + MCP** (§6.1) — highest value; do first so all subsequent work is memory-backed.
2. Recover & de-target the **Claude skill toolkit** (§6.3); wire the **enforcement hooks** (§6.4).
3. Formalize **CLAUDE.md → hard-rule structure + AGENTS.md mirror**; add **`DECISION_LOG.md`** and the **doc templates** (§6.2).

### WS2 — Code-health & CI gate _(2–3 days)_

1. **Modernize lint stack:** ESLint 8 → 9 (flat config), `@typescript-eslint` 5 → 8, `eslint-plugin-react-hooks` 4 → 5. Add **Prettier**.
2. **TypeScript strictness:** enable `strict` (incrementally if needed), modern `moduleResolution`; add a **`typecheck` npm script** (`tsc --noEmit`) and uncomment it in `tools/checks`.
3. **Real CI gate** (port promptmi's CI _shape_): PR → **typecheck + lint + unit + integration + build**, pinned Node, sensible timeout. Make the e2e/visual suite blocking (or at least a required nightly with triage), on a single Node version. Add a **coverage threshold**.
4. Optional: add **husky pre-commit** (lint-staged + typecheck) so the gate runs locally too.
5. Address the **`App.tsx` / `main.ts` monoliths** — plan an incremental extraction (this is prep, not a WS3 blocker).

### WS3 — Finish Phase 7 _(feature work)_

Complete the remaining blueprint slices with the now-tightened process: **E** version-control integration, **F** import/export hardening, **G** analytics, **H** plugin scaffold, **I** medium gate. Verify/close the **undo-granularity** gap first (§3.3). Target **v1.0.0** at close.

### WS4 — 2026 ecosystem catch-up _(feature roadmap; Phase 8+)_

Sequence by §4.4 priority: **A Sections grid** (foundational — do first) → **B Tile card** → **C entity-first + live previews** → **D 4-tab per-element editor + Jinja2 + attribute conditions** → **G finish preset marketplace** → **E areas/labels/floors** → **F new card/badge types** → **I auto-entities** → **H AI layout generation** → **J Tile-design-language alignment** (ongoing). Gate each behind the §5 validation against HA 2026.7.

---

## 8. Decisions

**Resolved 2026‑07‑19:**

- **D1 — Node baseline → Node 22 LTS.** ✅ Bump `engines`, add `.nvmrc`, align **both** CI workflows to Node 22 (removes the current 18/20 split). Do this in WS0.
- **D2 — Integration path → add WebSocket storage-mode read/write.** ✅ Invest in reading/writing dashboards against the live (storage-mode) instance via the WS API — not YAML-only. HAVDM already ships `home-assistant-js-websocket` + `src/services/haWebSocketService.ts`, so this extends existing infra rather than starting cold. This becomes a first-class WS4 workstream (and gates the §5 round-trip validation against HA 2026.7).
- **D3 — Sequencing → close out Phase 7 first.** ✅ Order is WS0 → WS1 → WS2 → **WS3 (Phase 7 to v1.0.0)** → WS4 (ecosystem catch-up, led by Sections grid).

**Still open:**

- **D4 — Memory system.** Fully adopt **MemPalace as source of truth** (demote `MEMORY.md` to bootstrap fallback, per promptmi's model), or run both in parallel for a transition period?
- **D5 — Governance depth.** Adopt promptmi's full hard-rule + DECISION_LOG + independent-review method, or a lighter subset given HAVDM already has a phase framework?

---

## 9. Recommended Immediate Next Steps (this week)

1. **WS0** smoke test + Node decision (D1) + repo cleanup.
2. **Stand up MemPalace for HAVDM** (WS1.1) — biggest single leverage, and makes the rest of the refresh memory-backed.
3. **Wire the CI gate + modernize lint/TS** (WS2.1–2.3) — stops regressions before feature work resumes.
4. **Answer D2/D3** — they determine whether the roadmap leads with Sections-grid (WS4‑A) or Phase 7 close-out (WS3).

---

## 10. Appendix — Research Sources (HA & Ultra Card)

HA releases: [2026.1](https://www.home-assistant.io/blog/2026/01/07/release-20261/) · [2026.2](https://www.home-assistant.io/blog/2026/02/04/release-20262/) · [2026.3](https://www.home-assistant.io/blog/2026/03/04/release-20263/) · [2026.4](https://www.home-assistant.io/blog/2026/04/01/release-20264/) · [2026.5](https://www.home-assistant.io/blog/2026/05/06/release-20265/) · [2026.6](https://www.home-assistant.io/blog/2026/06/03/release-20266/) · [2026.7](https://www.home-assistant.io/blog/2026/07/01/release-20267/). Sections: [docs](https://www.home-assistant.io/dashboards/sections/). Tile card: [discussion #489](https://github.com/orgs/home-assistant/discussions/489). Heading card: [docs](https://www.home-assistant.io/dashboards/heading/).

Custom cards: Mushroom [repo](https://github.com/piitaya/lovelace-mushroom) / [Tile-realign issue #1771](https://github.com/piitaya/lovelace-mushroom/issues/1771) · Bubble Card [repo](https://github.com/Clooos/Bubble-Card/).

Ultra Card: [repo](https://github.com/WJDDesigns/Ultra-Card) · [docs](https://ultracard.io/) · [modules](https://ultracard.io/modules/) · [releases](https://github.com/WJDDesigns/Ultra-Card/releases).

_(Ultra Card module counts vary across its own sources — README "19+", homepage "12", modules page ~36, 3.4.0 notes "51" — because the project grew rapidly through 2026; treat ~36–51 as current.)_
