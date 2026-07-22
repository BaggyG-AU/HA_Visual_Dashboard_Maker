---
name: headless-electron-testing
description: Run this project's Electron Playwright suites HEADLESS under Xvfb so the app windows never steal focus on WSL2/WSLg. Use whenever you are about to run, launch, background, or triage the electron-e2e or electron-integration suites, or when the user reports test windows stealing focus. Covers the npm wrappers, background+poll for the full run, and the 203/9/2 (WSLg) vs 204/8/2 (Xvfb) baseline triage.
---

# Headless Electron testing (Xvfb, WSL2)

**Standing rule for this project:** run `electron-e2e` and `electron-integration`
**under Xvfb — never raw.** The dev host is WSL2 + WSLg; a raw run renders every
Electron window Playwright launches onto the real Windows desktop and **steals
focus**, so the user can't use the machine while a suite runs (~16–19 min for the
full e2e). Xvfb is a headless in-memory X server — the windows render off-screen.
Source of truth for the rule: MemPalace `havdm` decision
`drawer_havdm_decisions_c5b0048f3b5d65f2dd125371` + the live `[STATE]` drawer.

## How to run

Prefer the npm wrappers (they call `tools/test-headless.sh`):

```bash
npm run test:e2e:headless           # electron-e2e under Xvfb
npm run test:integration:headless   # electron-integration under Xvfb
npm run test:headless               # all projects under Xvfb

# A single spec / any Playwright args (forwarded verbatim):
bash tools/test-headless.sh tests/e2e/sparkline.spec.ts --workers=1
```

The wrapper is exactly:

```bash
env -u WAYLAND_DISPLAY xvfb-run -a --server-args="-screen 0 1920x1080x24" \
  npx playwright test "$@"
```

Two parts matter: `env -u WAYLAND_DISPLAY` drops Wayland so Electron/Chromium
takes the X11 path (otherwise it ignores `$DISPLAY` and goes back to WSLg);
`xvfb-run -a` starts an Xvfb server on a free display (e.g. `:99`) and tears it
down after. The fixed `1920x1080` screen is big enough for the app window and
avoids the WSLg dynamic-resize artifact behind some viewport-clamp flakes.

Requires `xvfb` (`sudo apt-get install -y xvfb`, ships `xvfb-run`) — already
installed on this host.

**Only** `test:headed` / `test:ui` / `test:debug` stay raw — use those solely
when the user wants to _watch_ the window.

## Running the full suite (always background + poll)

The full electron-e2e is ~16–19 min under Xvfb, and the Bash tool caps at ~10 min
(2 min for compound foreground commands). So **never run it in the foreground** —
run it in the background and poll:

1. Launch `npm run test:e2e:headless` as a background command, redirecting output
   to a log file.
2. You are re-invoked automatically when it finishes; then read the log tail for
   the tally and the failing-test list.
3. For a quick progress read, count completed lines: `grep -cE '^\s*(✓|✘|-)\s+[0-9]+ ' <log>` against the suite total (~214).

Any change to a deploy/canvas path, any UI-render change, and **any**
`PropertiesPanel.tsx` change (it has historically blanked the app) require a
**full** electron-e2e run, not just integration.

## Triaging results (do NOT blind-rebaseline)

The suite has a stable, documented flake envelope. **A failure that is already in
the known set — or a new failure that reproduces only under load — is not a
regression.** Always confirm the live numbers against the `[STATE]` drawer's
**SUITE TRUTH** section before trusting anything here.

- **Baseline count:** `203/9/2` raw WSLg; `204/8/2` under Xvfb. The _count_ is
  stable ±1; the exact _set_ of failures rotates by load.
- **Visual baselines HOLD under Xvfb** (verified) — do not rebaseline snapshots
  just because a run is headless. Xvfb's fixed screen tends to make the Family-A
  viewport-clamp visual flakes (`progress-ring:39`, `weather-forecast:35`,
  `calendar.visual:49`) _pass_.
- **Timing flakes are slightly amplified under Xvfb's software renderer.**
  Known: `multi-entity.spec.ts:71` (realtime aggregate) passes raw under WSLg but
  flaked 2-of-3 under Xvfb. Under Xvfb, allow **one isolated retry** before
  suspecting a real problem.

**Method for any unexpected failure** (from the project disciplines):

1. Reproduce it **quiet + isolated**: `bash tools/test-headless.sh <spec>:<line> --workers=1` (retry once for a timing flake under Xvfb).
2. Confirm scope: `git diff --name-only <base> HEAD -- src/` — if your change
   didn't touch code the failing spec exercises, it's not your regression.
3. For an export-only change nothing rendered, so zero visual regressions are
   possible. For a UI/deploy/PropertiesPanel change, verify the **specific** specs
   that touch the changed surface pass (e.g. after a gauge/sparkline field change,
   check `gauge-card-pro` + `sparkline` pass).

If a genuinely new failure survives that, then investigate it as a real
regression — otherwise record it as a flake and move on.
