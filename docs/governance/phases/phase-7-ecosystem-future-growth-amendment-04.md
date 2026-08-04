Phase Name: Phase 7 – Ecosystem & Future Growth
Amendment: 04
Amends: docs/governance/phases/phase-7-ecosystem-future-growth-blueprint.md
Supersedes-in-part: docs/governance/phases/phase-7-ecosystem-future-growth-amendment-03.md §4
(the live-HA write envelope is widened to a SECOND, SEPARATE instance; the rule for
`ha.home.local` is unchanged)
Date: 2026-08-04
CURRENT_VERSION: 0.7.5-beta.10
Governance Mode: HARD MODE++
Authority: `docs/governance/PHASE_WORKFLOW.md` Step 2 — "If blueprint must change: create amendment file"
References:

- ai_rules.md
- docs/governance/phases/phase-7-ecosystem-future-growth-amendment-03.md
- docs/testing/LIVE_HA_TEST_CAPABILITY_REQUIREMENTS.md
- docs/testing/UAT_STRATEGY.md
- docs/testing/uat/KNOWN_GOOD_DASHBOARD.md

# Phase 7 Amendment 04 — A Dedicated Writable Home Assistant Test Instance

## 0) Summary

Amendment-03 §4 permitted live Home Assistant **writes** only inside a UAT round,
against a temporary dashboard, and said so explicitly: the exception "does not
relax the rule for ordinary development or agent-run testing, where live HA
access stays strictly read-only."

That left one class of question unanswerable. HAVDM's entire value proposition is
that **what comes out of Export renders in Home Assistant the way the canvas
promised** — and every claim of that kind is a claim about a system the project
had never once measured. The consequence was not hypothetical: on 2026-08-04 an
agent derived a High-severity "silent data loss" finding from an assumption about
Home Assistant's behaviour, wrote it into a commit message, a PR body, a spec
comment, a tester-facing document and a memory drawer, and was wrong. Home
Assistant does not behave the way the finding assumed.

**Resolution, authorised by the project owner (micah / BaggyG-AU) on 2026-08-04:**
a second, disposable Home Assistant instance — **`ha-test.home.local`
(192.168.1.190:8123)** — is provided, and the agent MAY write to it freely for
development and agent-run testing. The owner's framing was that it does not
matter if it breaks.

This amendment does three things:

1. **Adds a writable lane** for `ha-test.home.local`, scoped by hostname.
2. **Leaves `ha.home.local` exactly as amendment-03 §4 left it** — read-only,
   with the bounded UAT-round temp-dashboard exception and nothing more.
3. **Unblocks Tier 3** (live round-trip) of
   `docs/testing/LIVE_HA_TEST_CAPABILITY_REQUIREMENTS.md`, which that document
   recorded as un-buildable without this widening, and **narrows Tier 4** (render
   observation) — see §3.2.

⚠ **A numbering trap, corrected here so it stops propagating.** The tier list is
Tier 1 persisted-state · Tier 2 fixture-fidelity · **Tier 3 live round-trip** ·
**Tier 4 render observation**. Two other records get this wrong: the live `[STATE]`
drawer summarises Tier 3 as "real-gesture canvas e2e" and Tier 4 as "live
round-trip", and the requirements document's own §8 decision-1 said "Tier 4
cannot be built" when its §5 correctly attributes the blocker to Tier 3. **The
document's section headings are authoritative.**

---

## 1) The boundary — scoped by HOSTNAME, not by "test versus production"

| Instance                                      | Reads | Writes                                                        |
| --------------------------------------------- | ----- | ------------------------------------------------------------- |
| **`ha-test.home.local`** (192.168.1.190:8123) | ✅    | ✅ **permitted** — development and agent-run testing          |
| **`ha.home.local`** (192.168.1.70:8123)       | ✅    | ❌ **forbidden**, except amendment-03 §4's UAT-round envelope |

⚠ **The risk this clause exists to prevent is not a broken test instance. It is a
later reader generalising "the agent may write to live Home Assistant" out of this
amendment.** `ha.home.local` is VPP-enrolled via Amber Electric SmartShift;
Modbus writes are blocked and Remote EMS cannot be enabled there.

**Therefore: every future statement of this rule must name the host.** "Live HA is
writable now" is a false summary of this amendment and must never be written.

### 1.1 Separate credentials are mandatory

The test instance's token is stored **outside the repository** at
`~/.havdm/ha-test-token` (mode `600`, in a `700` directory). The reference
instance's token remains where it was, in `~/.claude/settings.json`.

⭐ **Measured 2026-08-04: the reference instance's token returns HTTP 401 against
`ha-test.home.local`.** Home Assistant tokens are instance-specific, so the two
hosts cannot be confused by an accidental credential swap — **provided each is
read from its own distinct location.** No single configuration value may ever
serve both hosts, so that a misconfiguration cannot point a write at production.

---

## 2) What this is for — and an honest statement of its size

⚠ **This must not be oversold.** `LIVE_HA_TEST_CAPABILITY_REQUIREMENTS.md`'s
central finding — independently confirmed by the 2026-08 adversarial review — is
that **three of its four tiers need no live instance at all, and would have caught
ten of round 3's thirteen failures.** This amendment enables Tier 3 (live
round-trip) and the mechanical half of Tier 4 (render observation) — between them
the smallest slice of that document by defect yield.

**It must not displace Tier 1 (persisted-state / restart) or Tier 2
(fixture-fidelity), which are cheaper and catch more**, nor the separate
real-gesture axis the adversarial review recommended (review §6, P2).

What it uniquely closes:

1. **Claims about what Home Assistant does with HAVDM's output.** Not a small
   class — it is the whole fidelity half of the product vision.
2. **The deploy path end to end** — HA-07's actual consequence rather than its
   error string, and HA-09's render.
3. ⭐ **Capability testing, which is the largest win and appears in no tier.** On
   a disposable instance, HACS resources can be **installed and uninstalled**.
   That makes the capability layer testable for the first time: whether the
   palette truly marks an absent card unavailable, and whether card-mod's
   strip-and-warn branch fires when card-mod is **removed** — currently dead code
   that no production caller reaches, and which the reference instance masks
   precisely because card-mod is installed there.

---

## 3) Two conditions on its use

### 3.1 Every test must declare whether it wants PARITY or DIVERGENCE

The two uses pull in opposite directions:

- **Fidelity checking** ("does our export render correctly") wants **parity**
  with the reference instance. Without it, a green result is weaker evidence than
  it appears — a dashboard that renders on a bare instance can still fail on the
  tester's for a capability reason, which would manufacture false confidence.
- **Capability testing** wants deliberate **divergence** — resources removed on
  purpose.

**Requirement:** the resource set must be snapshot-and-restorable, and each test
must state which mode it is in.

⭐ **Parity measured 2026-08-04, read-only, and it is close enough to rely on:**

|                         | reference | `ha-test`                       |
| ----------------------- | --------- | ------------------------------- |
| HA version              | 2026.7.4  | **2026.7.4**                    |
| HACS Lovelace resources | 11        | **11**                          |
| Themes                  | 5         | **5** (identical names)         |
| Entities                | 877       | 808                             |
| Entity-registry rows    | 1,579     | 1,504                           |
| Domains                 | 31        | 30 (`counter` absent, 1 entity) |

The absent domains match on both — no `light`, `fan`, `vacuum`, `plant`,
`humidifier`, `water_heater`, `siren` or `valve`. That matters more than the
entity-count difference, because PROPS-03, HA-04 and the FR-04 content rules all
turn on those domains being absent.

### 3.2 The mechanical question is automated; the judgement stays human

`LIVE_HA_TEST_CAPABILITY_REQUIREMENTS.md` recommended deferring render
observation and keeping it human. This amendment **refines rather than reverses**
that:

- **Automated** — did N cards appear; did the sections view render _as_ sections;
  is there an "Unknown type encountered" error tile. These are DOM assertions,
  and they are exactly what would have caught the 2026-08-04 error.
- **Human** — "does this look right." That is what UAT is for. ⭐ A screenshot an
  agent takes is not a person looking at it.

---

## 4) Required practice

1. **Teardown by default.** Every live test removes what it created, in a
   `finally`, so a failure cannot leak a dashboard. The override
   (`HAVDM_LIVE_KEEP=1`) exists for deliberate inspection and must never be the
   default in committed code.
2. **Live specs live in their own opt-in Playwright project** (`live-ha`) and run
   in **neither `./tools/checks` nor a default suite run**. Otherwise the
   regression mass becomes network-dependent and flaky, which is the opposite of
   what the DSL suite is for.
3. **A live spec must skip cleanly, not fail, when the instance or token is
   absent.** Another machine must be able to run the suite.
4. **Reads of `ha.home.local` remain always permitted** and remain the right tool
   for enumerating the reference instance.

---

## 5) ⚠ What this does NOT change

- It does not relax `ha.home.local` in any way.
- It does not make live testing a substitute for UAT. Per the standing pattern, a
  readiness gate answers "do the tests pass?", never "does the product work for a
  human?"
- It does not replace the cheaper offline tiers, and must not become the reason
  they are skipped.
- ⭐ **It does not repair the discipline failure that motivated it.** A live
  instance would have caught the 2026-08-04 error — but so would a ten-minute
  read-only check that was available the whole time and was not run. **The
  instance removes a class of guessing; it does not remove the obligation to
  measure before claiming.**

---

## 6) Traceability

| Item           | Value                                                                      |
| -------------- | -------------------------------------------------------------------------- |
| Authorised by  | Project owner (micah / BaggyG-AU), 2026-08-04                              |
| Instance       | `ha-test.home.local` → 192.168.1.190:8123                                  |
| Credential     | `~/.havdm/ha-test-token` (mode 600), outside the repository                |
| Amends         | amendment-03 §4 (widened for a second host; unchanged for `ha.home.local`) |
| Unblocks       | `LIVE_HA_TEST_CAPABILITY_REQUIREMENTS.md` Tier 3; narrows Tier 4           |
| First use      | `tests/live/ha-deploy-render.spec.ts`                                      |
| Version impact | **None.** This amendment applies no version bump.                          |
