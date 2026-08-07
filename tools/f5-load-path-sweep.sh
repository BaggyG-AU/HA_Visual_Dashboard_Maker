#!/usr/bin/env bash
# f5-load-path-sweep.sh — enumerate the SOURCE-SIDE population for F5's
# `loadDashboard` regression sweep. It does NOT produce a consumer mapping;
# see section 3 for why that is deliberate.
#
# WHY THIS EXISTS. PR #137's original sweep grepped TEST-FILE SPELLING and
# reported the resulting 20 files as proof of "every load path, zero
# under-inclusion". That command enumerates specs that MENTION a token; it
# cannot enumerate specs that REACH a production `loadDashboard` call site,
# because a spec that clicks a template tile never spells the word.
#
# ⚠⚠⚠ AND THEN THIS SCRIPT REPEATED THAT ERROR TWICE MORE, WHICH IS THE REAL
# LESSON AND THE REASON IT IS SHAPED THE WAY IT IS NOW.
#   round 1 finding — files containing a loadDashboard-ish TOKEN.
#   round 2 finding — files containing a control TESTID ("a mention is not a
#                     drive": a spec asserting a tile is VISIBLE was credited
#                     with driving the load path behind it).
#   round 3 finding — an action within THREE LINES of a control testid. It
#                     dropped a real driver whose `.click()` sat four lines
#                     away, and credited entry-tile clicks that only open a
#                     wizard and never reach the call site.
# ⭐⭐⭐ EACH "FIX" REPLACED ONE TEXTUAL PROXY FOR REACHABILITY WITH A SLIGHTLY
# BETTER TEXTUAL PROXY. REACHABILITY IS A CONTROL-FLOW PROPERTY AND IS NOT
# LEXICAL; NO GREP CAN DECIDE IT, AND A WIDER WINDOW ONLY MOVES THE PROXY.
#
# ⭐ THE RULE THIS SCRIPT NOW ENCODES: BE MECHANICAL WHERE MECHANISM IS
# POSSIBLE, AND STOP — LOUDLY — WHERE IT IS NOT. Section 1 (the production call
# sites) is fully mechanical and has been correct in every review round. The
# consumer mapping is a HAND TRACE, and it lives in
# docs/testing/F5_LOAD_PATH_SWEEP.md labelled as traced rather than generated,
# so no reader mistakes a judgement for a derivation. A script that emits a
# confident wrong answer is worse than one that admits where it stops.
#
# ⚠ No count of consumers is printed or quoted anywhere. A summarised count is
# a second source of truth that drifts the moment a row changes, and this sweep
# has already paid for that twice.
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
echo "3. CONTROLS -> CALL SITE: MECHANICAL LISTING ONLY, NOT A MAPPING"
echo "=============================================================="
echo "  ⚠⚠⚠ THIS SECTION DELIBERATELY DOES NOT ANSWER \"WHICH SPEC REACHES"
echo "     WHICH CALL SITE\". THREE ATTEMPTS TO MAKE IT DO SO ALL FAILED:"
echo "       round 1 — files containing a loadDashboard-ish TOKEN;"
echo "       round 2 — files containing a control TESTID;"
echo "       round 3 — an action within THREE LINES of a control testid."
echo "     Each was a textual proxy for a CONTROL-FLOW REACHABILITY property,"
echo "     and each failed in both directions: it dropped a real driver whose"
echo "     .click() sat four lines away, and it credited an entry-tile click"
echo "     that only opens a wizard and never reaches the call site."
echo "     ⭐ PROXIMITY DOES NOT PROVE CONTROL FLOW, AND A WIDER WINDOW ONLY"
echo "     MOVES THE PROXY. REACHABILITY IS NOT LEXICAL — NO GREP CAN DECIDE IT."
echo
echo "  So this script now stops where mechanism stops. It lists the entry"
echo "  controls and every line that ACTS on one; deciding which of those"
echo "  actions TERMINATES in a loadDashboard call is a hand trace, recorded"
echo "  and labelled as such in docs/testing/F5_LOAD_PATH_SWEEP.md."
echo "  ⚠ Treat the lines below as CANDIDATES REQUIRING A TRACE, never as the"
echo "    answer. An intermediate click looks identical to a terminal one here."
for testid in \
  toolbar-open-file \
  welcome-open-local-file \
  menu:open-file \
  menu:open-recent-file \
  new-dashboard-blank-option \
  new-dashboard-sections-option \
  new-dashboard-template-option \
  new-dashboard-entity-type-option \
  preset-marketplace-import \
  yaml-apply-button; do
  echo "  --- $testid ---"
  files=$(grep -rl -- "$testid" tests/e2e tests/integration tests/support --include=*.ts 2>/dev/null | sort)
  if [ -z "$files" ]; then
    echo "      ⚠ NOT REFERENCED ANYWHERE"
    continue
  fi
  echo "$files" | sed 's/^/      mentions: /'
  # Whole-file action listing, so a driver is never dropped for sitting more
  # than N lines from its locator. Over-inclusive BY DESIGN and labelled so.
  #
  # ⚠⚠⚠ THIS LOOP CARRIED A `head -4` UNTIL ROUND 4 FOUND IT — WHICH MEANT THE
  # LISTING SILENTLY DROPPED CANDIDATES (INCLUDING L16, L17 AND ROW 8's TERMINAL
  # ACTIONS) WHILE THE COMMENT DIRECTLY ABOVE CLAIMED NOTHING WAS EVER DROPPED.
  # NEVER CAP A LISTING WHOSE WHOLE PURPOSE IS COMPLETENESS. If output volume
  # ever becomes a problem, print a COUNT and say what was withheld — a cap a
  # reader cannot see is indistinguishable from an empty result.
  for f in $files; do
    grep -nE '\.(click|dblclick|fill|press|hover|dragTo|selectOption|check|dispatchEvent|send)\(' "$f" \
      | sed "s|^|      candidate: $f:|"
  done
done

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
