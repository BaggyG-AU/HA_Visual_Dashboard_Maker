# Live Home Assistant Test Capability — Requirements

**Status:** requirements only. ⚠ **No tests are built by this document.**
**Raised by:** the project owner, 2026-08-03, during round-3 UAT triage
**Governed by:** `UAT_STRATEGY.md` §7 · `TESTING_STANDARDS.md` · amendment-03 §4
**Companion:** `uat/reports/uat_triage_v1.0.0-r3_2026-08-03.md`

---

## The ask

> "I want you to do a deep dive on how we might be able to test the things that
> keep failing in UAT. I suspect you will need to have access to the live HA
> instance and actually deploy and view the live HA dashboards. You don't need to
> create the tests in this PR but we need to be clear on the requirements so you
> can spec them."

This document states what such a capability would have to do, what it would cost,
and the decisions the owner must make before any of it is built.

---

## 1. Why the existing layers cannot catch these

HAVDM has three automated layers — **94 unit spec files, 23 integration, 165
e2e**, ~1,215 unit tests and ~530 Electron tests. That is substantial coverage,
and it is not the problem.

**The problem is that all three share the same three blind spots**, and every
recurring UAT defect lives in one of them.

### Blind spot A — nothing connects to a real Home Assistant

**Measured:** no test in `tests/` opens a connection to `ha.home.local`. The
handful of files mentioning it do so in **comments recording where a fixture came
from**, not in live calls. Every HA interaction is a `FakeSocket`, a `vi.mock`, or
a captured fixture.

That is the right default — tests must not depend on a VPP-enrolled production
instance. But it means **no layer has ever observed HAVDM talking to Home
Assistant.**

⭐ Round 2 already proved how much this hides. `lovelace/dashboards/delete` takes
a `dashboard_id`; HAVDM passed a `url_path`; the two are **never** the same
string. An `ipcMain.handle` mock went green against a command HA would refuse,
while three orphaned dashboards accumulated on the real instance.

### Blind spot B — nothing observes a Home Assistant _render_

Even asserting the exact frame HAVDM sends only proves HA **accepted** the config.
It cannot answer the question UAT exists to answer: **does the dashboard the user
designed actually look right?**

That is amendment-03 §1's third argument for UAT verbatim — "the output is
correct, not merely well-formed" — and it is the one gap no amount of protocol
testing closes.

### Blind spot C — nothing asserts what survives a restart

**This is the blind spot round 3 discovered, and it was invisible until the
tester's own `config.json` was read.** Three of the six round-3 "regressions"
live entirely in persisted state:

| Defect             | Persisted-state cause                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| EXPORT-04          | `capabilityProfile` is **never written** — a connected user is treated as never-connected, permanently |
| THEME-01/02, HA-06 | `selectedTheme` names an **HA-instance theme** that does not resolve at startup                        |
| FILE-06            | Save As never writes the file into `recentFiles`                                                       |

Every e2e test starts from a **fresh profile**. Nothing has ever asserted what a
_second_ launch sees.

⭐⭐ **This is the generalisation of VCS-02's round-2 root cause** — "the repo
root persists, so round 1 and round 2 entered different dialog branches of the
same build." Persisted state is the hidden independent variable across UAT rounds,
and it is the **cheapest** of the three blind spots to close.

### Blind spot D — nothing launches what the user installs

**Measured:** nothing under `tests/` launches `out/HA Visual Dashboard Maker.exe`.
The e2e project drives a dev build. Amendment-03 §1 names this as the first thing
UAT exists to cover, and it remains uncovered. ⓘ Included for completeness; it is
**not** where the recurring defects live and is the lowest priority of the four.

---

## 2. Which recurring defects each tier would have caught

⭐ **The most important finding in this document: three of the four proposed
tiers need no live instance at all, and they cover more defects than the live tier
does.** The live tier is necessary but should not be built first.

| Defect                         | Tier 1 persisted-state | Tier 2 fixture-fidelity | Tier 3 live round-trip | Tier 4 render observation |
| ------------------------------ | :--------------------: | :---------------------: | :--------------------: | :-----------------------: |
| EXPORT-04                      |       ✅ **yes**       |            —            |        partial         |             —             |
| THEME-01 / 02 / HA-06          |       ✅ **yes**       |            —            |           —            |    partial (contrast)     |
| FILE-06                        |       ✅ **yes**       |            —            |           —            |             —             |
| HA-07 (sections deploy)        |           —            |       ✅ **yes**        |         ✅ yes         |             —             |
| HA-03 (rows, state, templates) |           —            |       ✅ **yes**        |        partial         |          ✅ yes           |
| HA-04 (remap guidance)         |           —            |       ✅ **yes**        |           —            |             —             |
| PROPS-03 (disclosure)          |        partial         |       ✅ **yes**        |           —            |             —             |
| CLIP-01, VIEWS-04, CANVAS-03   |           —            |            —            |           —            |        — ⚠ see §6         |
| HA-09 (does it render)         |           —            |            —            |         ✅ yes         |        ✅ **yes**         |

⚠ **CLIP-01, VIEWS-04 and CANVAS-03 are not addressed by any tier here.** They
are pointer-interaction defects and need a different instrument — §6.

---

## 3. Tier 1 — Persisted-state / restart tests ⭐ build first

**No live HA. No new infrastructure. Highest defect yield of any tier.**

**Requirement.** Launch Electron with a **seeded** user-data directory, or launch
twice against the same one, and assert what the second launch sees.

Must cover:

1. A capability capture **persists** and is present on next launch (EXPORT-04).
2. A persisted `selectedTheme` naming an **unavailable** theme does not leave
   `currentTheme` null; a built-in is substituted and the substitution is visible
   (THEME-01/02, HA-06).
3. Save As writes the new path into `recentFiles` and it is there next launch
   (FILE-06).
4. ⭐ **A general guard: for every key HAVDM persists, a restore where the
   referent no longer exists must degrade visibly rather than silently.** That is
   the class, and it is what all three defects above have in common.

**Cost:** **S–M.** The launcher already accepts options; this needs a seeded
profile fixture and a re-launch helper.
**Risk:** low. Runs in CI unchanged.

⭐ **This tier alone would have caught four of the round-3 Highs and one Medium.**

---

## 4. Tier 2 — Fixture-fidelity tests against captured real configs

**No live HA at run time. One read-only capture, committed as a fixture.**

**Requirement.** Capture real dashboard configs from `ha.home.local` **once**,
read-only, commit them under `tests/fixtures/`, and drive them through HAVDM's
real load and export paths.

Must cover:

1. **Every card type present in the fixture renders** — or is honestly marked.
   ⭐ Round 3 measured 29 distinct card types across the instance's 11 dashboards,
   of which **`divider` (18 uses) and `custom:template-entity-row` (6 uses)** have
   no renderer (HA-03).
2. **Entity state reaches the rendered card.** HA-03's screenshot showed
   `unknown` for entities carrying real values.
3. **No template or icon expression escapes as display text** (HA-03).
4. **A `sections` view survives deploy validation** — the exact HA-07 defect,
   catchable with no instance at all:
   `View "…" must have a "cards" array (can be empty).`
5. **A round-trip claim needs a round-trip test** (§7) — assert through the real
   parse/export path, never by hand-building the intermediate object.

⚠ **The capture must be refreshed deliberately, not automatically.** A fixture
that silently re-syncs stops being a regression baseline. Record the capture date
and the instance's HA version alongside it.

**Cost:** **M.** The capture is minutes; the renderer assertions are the work.
**Risk:** low. Fully offline once captured.

---

## 5. Tier 3 — Live round-trip ✅ UNBLOCKED 2026-08-04

> ⭐⭐ **STATUS UPDATE — THE BLOCKER BELOW HAS BEEN RESOLVED, AND NOT THE WAY THIS
> SECTION ANTICIPATED.** The owner did not widen amendment-03 §4 for
> `ha.home.local`. Instead, on 2026-08-04 they provided a **second, disposable
> instance — `ha-test.home.local`** — and authorised agent writes to it, by
> `docs/governance/phases/phase-7-ecosystem-future-growth-amendment-04.md`.
> **`ha.home.local` remains read-only, exactly as §4 left it.**
>
> Built and passing: `tests/live/ha-deploy-render.spec.ts`, in an opt-in
> `live-ha` Playwright project that runs in neither `./tools/checks` nor a
> default suite run. Support: `tests/support/liveHa.ts`, which asserts the
> hostname on every connection so these helpers cannot be repointed at
> production by a later edit.
>
> ⭐ **Measured parity (amendment-04 §3.1):** the test instance is a snapshot of
> the reference — same HA version (2026.7.4), all 11 HACS Lovelace resources,
> identical 5 themes, and the same absent domains (no `light`/`fan`/`vacuum`/…).
> That is what makes a green result there transferable.
>
> ⭐⭐ **The largest win was not in this tier list at all:** a disposable instance
> lets HACS resources be **installed and uninstalled**, which finally makes the
> capability layer testable — including whether card-mod's strip-and-warn branch
> fires when card-mod is _removed_, currently dead code that the reference
> instance masks precisely because card-mod is installed there.

### ⚠⚠ The governance blocker as originally stated (retained for the record)

Amendment-03 §4 grants **one bounded exception** to the live-HA read-only rule,
and scopes it to **UAT rounds** — explicitly _"for ordinary development and
agent-run testing, live HA access remains STRICTLY READ-ONLY."_

**An automated test tier is agent-run testing. It is outside the exception as
written.** Building it requires the owner to widen §4 by amendment. **That
decision is not the agent's to make and is not assumed here.**

Forbidden regardless of any widening, per §4: any production dashboard;
`haWsSaveDashboardConfig` against an existing user dashboard; **any
Modbus/inverter/VPP/Remote-EMS surface**; any automation, script or helper
mutation. ⚠ `ha.home.local` is VPP-enrolled via Amber Electric SmartShift.

### Requirements, if granted

1. **Throwaway dashboards only**, with a reserved, recognisable url_path prefix
   (e.g. `havdm-autotest-`), never a name a human might pick.
2. ⭐⭐ **Teardown that cannot silently not happen.** Round 2 left three orphans
   because teardown was a step nobody verified — and `teardownConfirmed: false`
   sat unread in the export. An automated tier must **delete in a fixture
   teardown that runs on failure**, **assert the deletion by re-listing**, and
   **fail the run if an orphan survives**. ⚠ A test that leaks a dashboard is
   worse than no test: it writes to production and reports success.
3. ⭐ **A pre-flight orphan sweep** that fails fast if a previous run leaked, so
   leaks surface immediately rather than accumulating.
4. **Resolve ids by reading, never by deriving.** HA requires a hyphen in
   `url_path` and stores the id with underscores; deriving one from the other is
   exactly the HA-08 defect.
5. **Credentials** from the environment, never committed. The tier must **skip
   with a clear reason** when unset — never fail, and never fall back to a
   default instance.
6. **Unreachable instance ⇒ skip, not fail.** Recorded in
   `SKIPPED_TESTS_REGISTER.md` per existing convention.
7. ⚠ **Never in the default `npm test` path.** A separate Playwright project
   (`live-ha`), opt-in, off by default, excluded from the Regression Gate Matrix's
   Slow gate.

**Cost:** **M–L**, most of it in teardown robustness rather than the tests.
**Risk:** ⚠ **the highest of any tier** — it writes to a production home
automation instance.

---

## 6. Tier 4 — Render observation, and the honest limits

**The question no other tier answers: does it _look_ right?**

Three options, and the recommendation is to **defer all three**:

| Option                              | What it buys                      | Why not now                                                                                                                            |
| ----------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Read the config back over WebSocket | HA stored what we sent            | ⭐ already covered by Tier 3; **not a render check**                                                                                   |
| Drive a browser at the HA dashboard | a real HA render, screenshottable | needs auth automation + a live dashboard; HA's own render churns across versions, so snapshots are fragile                             |
| Embed HA in HAVDM and screenshot    | render inside the product         | ⚠ **blocked** — HA serves `X-Frame-Options: SAMEORIGIN` (measured), and restoring embedding is an owner-deferred **security** decision |

⭐ **Recommendation: Tier 4 stays the human's job, and that is the correct
answer rather than a concession.** Amendment-03 §1 argues that whether a
translation is faithful "is a judgement about how the card renders in HA… only a
person can say the dashboard looks right." Automating a fragile pixel comparison
against someone else's frontend would spend a lot of effort to weaken, not
strengthen, that judgement.

> ⭐⭐ **2026-08-04 REFINEMENT — THIS RECOMMENDATION IS NARROWED, NOT REVERSED.**
> Amendment-04 §3.2 splits the question in two, because the recommendation above
> conflates them. **"Does it look right" is a judgement and stays human.** But
> _"did six cards render, is this a sections view, is there an 'Unknown type
> encountered' tile"_ is a **DOM query**, not a judgement — and it is the exact
> class of question that, left unmeasured, produced a wrong High-severity finding
> on 2026-08-04 (an agent asserted HA would render a view's cards invisible; HA
> does not).
>
> So the mechanical half is now automated (`tests/live/ha-deploy-render.spec.ts`)
> and the judgement half is not. ⚠ **Note what is still NOT done, deliberately:
> no pixel snapshots.** The second row's objection — HA's own render churns
> across versions, so snapshots are fragile — stands unchallenged and the spec
> asserts element counts and text, never images.
>
> ⭐ The middle row's "needs auth automation" is solved and cost little: inject
> `hassTokens` into `localStorage` with `clientId: null` (see
> `tests/support/liveHa.ts`). The third row stays blocked — `X-Frame-Options` and
> the deferred embedding decision are unchanged.

**What genuinely helps instead is FR-04** — a known-good fixture dashboard, so the
human's judgement is exercised against a controlled input.

### ⚠ The three defects no tier here addresses

**CLIP-01, VIEWS-04 and CANVAS-03 are pointer-interaction defects** — a missing
context menu, a refused HTML5 drop, an unreproduced drag snap-back. They need
**real mouse-gesture e2e coverage**, which is a gap in the _existing_ e2e layer,
not a live-HA problem.

⭐⭐ **The pattern behind all three is already on record and is worth naming here:
the specs that "covered" them drove the DSL instead of the user.**
`sections-canvas.spec.ts` adds palette cards programmatically, so it could never
find that a palette _drag_ is refused. `bulk-operations.spec.ts` never opens a
context menu. VIEWS-05's spec called `selectCard()` first — performing the user's
missing step for them.

**Requirement (separate from this document's tiers):** real-gesture e2e coverage —
`dragTo`, `click({button:'right'})`, hover — for the canvas affordances, plus the
multi-select drag **stress** coverage the tester explicitly asked for on
CANVAS-03. ⚠ Assert computed style and `document.elementFromPoint`, not
`toBeVisible()` — Playwright counts an `opacity: 0` element as visible.

---

## 7. Recommended sequence

| #   | Tier                                   | Live HA?     | Cost | Catches                                |
| --- | -------------------------------------- | ------------ | ---- | -------------------------------------- |
| 1   | **Persisted-state / restart**          | no           | S–M  | EXPORT-04, THEME ×3, FILE-06           |
| 2   | **Fixture-fidelity (captured config)** | capture only | M    | HA-07, HA-03, HA-04, PROPS-03          |
| 3   | **Real-gesture canvas e2e** (§6)       | no           | M    | CLIP-01, VIEWS-04, CANVAS-03           |
| 4   | **Live round-trip**                    | ⚠ **writes** | M–L  | HA-09, HA-07 end-to-end                |
| 5   | **Render observation**                 | yes          | L    | ⭐ recommend deferring — keep it human |

⭐⭐ **Tiers 1–3 need no write access to Home Assistant and would have caught ten
of the thirteen round-3 failures.** The live tier — the one the ask assumed would
be needed first — is fourth, and it is the only one requiring a governance change.

⚠ **Prerequisite for tiers 2 and 4: FR-04**, the known-good dashboard. Four of
the round-3 Highs ran against an uncontrolled fixture; building tests on the same
footing would bake that in.

---

## 8. Decisions required before anything is built

1. ✅ **RESOLVED 2026-08-04 — does amendment-03 §4's write exception extend to an
   automated test tier?** Answered by **amendment-04**, and answered better than
   this question framed it: rather than widening §4 for `ha.home.local`, the
   owner supplied a **separate disposable instance** (`ha-test.home.local`) and
   authorised writes there. `ha.home.local` is untouched. ⭐ The lesson worth
   keeping is that the question assumed the only lever was loosening the rule on
   production; a second instance was the better answer and did not require
   loosening anything.
2. **Is a captured real-instance config acceptable as a committed fixture?** It
   contains entity ids and dashboard structure from a private home instance.
3. **Should tiers 1–3 proceed independently of that decision?** They need no
   write access and carry the highest yield. ⭐ **Recommended: yes.**
4. **Which tier, if any, joins the Regression Gate Matrix**, and at which gate.

---

## 9. What this document does not claim

- ⚠ **No estimate here is measured.** Costs are judgements, unlike the defect
  attributions in the triage document, which are measured.
- ⚠ **No tier is claimed to prevent a class of defect outright.** Each is claimed
  to catch **specific, named round-3 failures**, and that claim is checkable
  against the triage document.
- ⚠ **None of this substitutes for UAT.** Amendment-03's argument stands: a
  readiness gate answers "do the tests pass?", never "does the product work for a
  human?" These tiers exist to stop UAT rediscovering the same defects — not to
  replace the round.
