#!/usr/bin/env bash
# f5-load-path-sweep.sh — regenerate the SOURCE-SIDE population for F5's
# `loadDashboard` regression sweep, and the consumer mapping derived from it.
#
# WHY THIS EXISTS. PR #137's published sweep grepped TEST-FILE SPELLING —
# `grep -rlE "loadDashboard|loadYaml|openFile|..." tests/e2e tests/integration` —
# and reported the resulting 20 files as proof of "every load path, zero
# under-inclusion". That command enumerates specs that happen to MENTION those
# tokens. It cannot enumerate the specs that REACH a production `loadDashboard`
# call site, because a spec that clicks a template tile never spells the word.
#
# ⚠⚠ AND THE FIRST VERSION OF THIS SCRIPT MADE THE SAME MISTAKE ONE LEVEL UP. It
# listed every file CONTAINING a control's testid and called them consumers, so
# a spec that merely asserts a tile is VISIBLE was credited with driving the load
# path behind it. Round 2 of the review caught it. Section 3 now reports only
# lines that ACT on a control. No count of consumers is printed or quoted
# anywhere — run the script and read the list; a summarised count is a second
# source of truth that drifts the moment a row changes, and this sweep has
# already paid for that twice.
#
# ⭐ THE RULE IT ENCODES: a population claim needs an enumeration of the
# POPULATION, and the enumeration has to be mechanical and re-runnable. Start at
# the production call sites — the thing the change actually touches — and walk
# outward to the controls that reach them and the specs that drive those
# controls. A count of files containing a token is not a count of files
# exercising a behaviour.
#
# ⚠ WHAT THIS SCRIPT DOES NOT DO. Step 3's control-to-spec hop is mechanical but
# not exhaustive on its own: a spec can reach a control through a DSL method, so
# the script reports BOTH the direct spec references and the DSL files, and the
# DSL files must then be resolved to their callers. Every hop it cannot make is
# printed rather than silently skipped.
#
# USAGE:  bash tools/f5-load-path-sweep.sh
set -uo pipefail
cd "$(dirname "$0")/.."

echo "=============================================================="
echo "1. PRODUCTION loadDashboard CALL SITES (the population)"
echo "=============================================================="
grep -rnE '\bloadDashboard\s*\(' src/ --include=*.ts --include=*.tsx \
  | grep -v 'loadDashboard: ' \
  | grep -vE '^\S+:[0-9]+:\s*(//|\*)' \
  | sort -t: -k2 -n

echo
echo "=============================================================="
echo "2. ENTRY CONTROLS that reach those call sites"
echo "=============================================================="
for testid in \
  toolbar-open-file \
  menu:open-file \
  menu:open-recent-file \
  toolbar-new-dashboard \
  new-dashboard-blank-option \
  new-dashboard-sections-option \
  new-dashboard-template-option \
  new-dashboard-entity-type-option \
  preset-marketplace-import \
  yaml-apply-button; do
  printf '  %-34s -> ' "$testid"
  grep -rl "$testid" src/ --include=*.tsx | tr '\n' ' '
  echo
done

echo
echo "=============================================================="
echo "3. CONSUMERS — who ACTUALLY DRIVES those controls, not who mentions them"
echo "=============================================================="
echo "  ⚠⚠ A MENTION IS NOT A DRIVE, and the first version of this script"
echo "     conflated them. It listed every file CONTAINING a testid, so"
echo "     templates.spec.ts (which only asserts the Entity Type tile is"
echo "     VISIBLE) was reported as the consumer of the entity-type load path,"
echo "     and recent-files.spec.ts was named for a handler it never invokes."
echo "     That is the round-1 finding — searching test-file spelling instead of"
echo "     behaviour — repeated one level up. A driver must ACT on the control:"
echo "     .click(), .dblclick(), .fill(), .press(), .hover(), .dragTo() or a"
echo "     dispatched event. Lines below are the ACTING lines only."
for testid in \
  toolbar-open-file \
  menu:open-file \
  menu:open-recent-file \
  toolbar-new-dashboard \
  new-dashboard-blank-option \
  new-dashboard-sections-option \
  new-dashboard-template-option \
  new-dashboard-entity-type-option \
  preset-marketplace-import \
  yaml-apply-button; do
  echo "  --- $testid ---"
  # An acting line either chains an action onto the locator, or is followed
  # within three lines by one (the DSL's usual `const x = ...` then `x.click()`).
  hits=$(grep -rn -A3 -- "$testid" tests/e2e tests/integration tests/support \
           --include=*.ts 2>/dev/null \
         | grep -E '\.(click|dblclick|fill|press|hover|dragTo|selectOption|check|dispatchEvent|send)\(' \
         | sed 's/-\([0-9]*\)-/:\1:/' | sort -u)
  if [ -n "$hits" ]; then
    echo "$hits" | sed 's/^/      DRIVES: /'
  else
    echo "      ⚠ NO DRIVER — this control is mentioned but never acted on."
  fi
done
echo
echo "  ⓘ A DSL hit means the driver is a helper; resolve it to its callers with"
echo "     grep -rl '<methodName>(' tests/e2e tests/integration --include=*.spec.ts"

echo
echo "=============================================================="
echo "4. THE mode:'edit' BOUNDARY — does anything cross the Apply confirm?"
echo "=============================================================="
echo "  Only the OK handler of the Apply confirmation reaches"
echo "  handleApplyYamlChanges -> loadDashboard(..., { mode: 'edit' })."
echo "  Specs that click it:"
grep -rn 'Apply & Reload' tests/ --include=*.ts | sed 's/^/      /' \
  || echo "      (NONE — the mode:'edit' load path has no end-to-end consumer)"

echo
echo "=============================================================="
echo "5. FOR CONTRAST — the token-spelling list PR #137 originally published"
echo "=============================================================="
grep -rlE 'loadDashboard|loadYaml|openFile|dashboard-generator|handleCardDropIntoContainer|onCardDropIntoContainer' \
  tests/e2e tests/integration --include=*.spec.ts | sort | sed 's/^/      /'
