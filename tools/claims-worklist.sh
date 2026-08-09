#!/usr/bin/env bash
# claims-worklist.sh — emit the CLAIM CANDIDATES a branch introduces, so the
# author must DISPOSITION each one rather than remember to look for them.
#
# WHY THIS EXISTS. Across PR #139's six review rounds and PR #140's first, 19
# defects were attributable to the author and 13 of them had a check he had
# already WRITTEN DOWN and did not run. The recurring sub-class is a numeral or
# a universal asserted in the same breath as the check that "verified" it. The
# author reliably NOTICES claims and unreliably RECORDS them, so this script
# generates the population rather than leaving it to memory.
#
# ⚠⚠ WHAT THIS IS, STATED PRECISELY — overstating an instrument is the exact
# defect it exists to catch:
#   - It is a GREP. It emits CANDIDATES. It CANNOT decide whether a claim is
#     true, nor whether a universal is normative ("never set X" is a RULE) or
#     empirical ("never have" is a CLAIM ABOUT HISTORY).
#   - Deciding that is the author's job, one word per row, in the ledger.
#   - It does NOT find every claim. No fixed key can. It reports what its stated
#     patterns matched, and its key is published below so a reviewer can attack
#     the key rather than guess at it.
#
# ⚠⚠⚠ WHAT CHANGED IN THIS SECOND ATTEMPT. The first version was withdrawn from
# PR #140 after an adversarial review returned five merge-blockers
# (docs/reviews/self-pass-gate-adversarial-review-codex.md, c8678d2). Two of
# them land in this file:
#   M4  Committed-change discovery used default `git diff --name-only`, and git
#       emits ONLY THE DESTINATION of a rename. A governed file renamed out of
#       docs/governance/ therefore vanished from the population. This version
#       uses `--name-status -M -z` and emits BOTH SIDES of every rename, parsed
#       NUL-safe so paths with spaces or newlines cannot split a field.
#   M5  The live PR body was optional and FAIL-OPEN: `gh pr view … || true`
#       swallowed a read failure and returned the local output, so a ledger row
#       could claim the body was scanned when nothing was read. `--require-pr`
#       now propagates the failure and exits non-zero.
#
# USAGE:
#   bash tools/claims-worklist.sh                  # local surfaces, base=origin/main
#   bash tools/claims-worklist.sh --with-pr        # also the live PR body, best-effort
#   bash tools/claims-worklist.sh --require-pr     # also the live PR body, MANDATORY
#   bash tools/claims-worklist.sh --changed-only   # print the governed-change population
# Exit 0 on success. Exit 2 if --require-pr was given and the body could not be
# read — silence must never be mistaken for "no candidates".

set -uo pipefail
cd "$(dirname "$0")/.."

BASE="${HAVDM_BASE_REF:-origin/main}"
WITH_PR=0
REQUIRE_PR=0
CHANGED_ONLY=0
PR_NUM=""

for arg in "$@"; do
  case "$arg" in
    --with-pr) WITH_PR=1 ;;
    --require-pr)
      WITH_PR=1
      REQUIRE_PR=1
      ;;
    --changed-only) CHANGED_ONLY=1 ;;
    '' | *[!0-9]*) ;;
    *) PR_NUM="$arg" ;;
  esac
done

# --------------------------------------------------------------------------
# BASE REF — fail closed. A missing base ref means the population is unknown,
# and an unknown population must never present as an empty one.
if ! git rev-parse --verify --quiet "$BASE" >/dev/null; then
  echo "FATAL: base ref '$BASE' does not resolve." >&2
  echo "  A shallow or single-branch clone leaves no base ref. Fetch it first:" >&2
  echo "    git fetch --no-tags --depth=0 origin main" >&2
  echo "  Refusing to emit an empty worklist that would read as 'no candidates'." >&2
  exit 2
fi
MERGE_BASE="$(git merge-base "$BASE" HEAD)"

# --------------------------------------------------------------------------
# THE CHANGED POPULATION — M4. `--name-status -M -z` gives NUL-separated
# records; a rename record is `R<score>\0<old>\0<new>`, every other status is
# `<X>\0<path>`. Both sides of a rename are emitted, so a governed file moved
# OUT of a governed directory is still in the population.
changed_paths() {
  local status old new
  while IFS= read -r -d '' status; do
    case "$status" in
      R* | C*)
        IFS= read -r -d '' old || break
        IFS= read -r -d '' new || break
        printf '%s\n%s\n' "$old" "$new"
        ;;
      *)
        IFS= read -r -d '' new || break
        printf '%s\n' "$new"
        ;;
    esac
  done < <(git diff --name-status -M -z "$MERGE_BASE"...HEAD)
  # Uncommitted and untracked work counts too: running this pre-submit on a
  # dirty tree is the moment it is most useful.
  git diff --name-only -z HEAD | tr '\0' '\n'
  git ls-files --others --exclude-standard -z | tr '\0' '\n'
}

mapfile -t CHANGED < <(changed_paths | grep -v '^$' | sort -u)

if [ "$CHANGED_ONLY" -eq 1 ]; then
  printf '%s\n' "${CHANGED[@]}"
  exit 0
fi

# Author-content markdown only. Reviewer deliverables are the reviewer's
# artifact, and this commission is the author's own input to the gate.
AUTHOR_MD=()
for f in "${CHANGED[@]}"; do
  case "$f" in
    *.md) ;;
    *) continue ;;
  esac
  case "$f" in
    docs/reviews/*-review.md) continue ;;
  esac
  [ -f "$f" ] && AUTHOR_MD+=("$f")
done

echo "=============================================================="
echo "claims-worklist — candidates to disposition"
echo "=============================================================="
echo "  base ref:    $BASE"
echo "  merge base:  $MERGE_BASE"
echo "  changed:     ${#CHANGED[@]} path(s), of which ${#AUTHOR_MD[@]} author markdown"
echo

# THE KEY, PUBLISHED SO IT CAN BE ATTACKED. A bare numeral is almost always a
# reference (a PR number, a date, a line, a drawer hex). What distinguishes a
# COUNT CLAIM is a quantity BINDING A PLURAL NOUN; what distinguishes a
# UNIVERSAL is a quantifier binding a word.
COUNT_RE='[^0-9a-zA-Z_]([0-9]{1,6})[[:space:]]+(specs?|files?|tests?|paths?|rows?|call sites?|drawers?|cards?|legs?|commits?|rounds?|surfaces?|passed|failed|skipped|warnings?|errors?)\b'
UNIV_RE='\b(only|every|all of|none of|never|always|zero|exhaustive|completely|every single)\b'

emit() { # emit <label> <file-or-marker> <text>
  printf '  [%s] %s\n' "$1" "$2"
  printf '%s\n' "$3" | sed 's/^/      /'
}

for f in "${AUTHOR_MD[@]}"; do
  OUT="$( (grep -nEo "$COUNT_RE" "$f"; grep -nEi "$UNIV_RE" "$f" | cut -c1-140) 2>/dev/null || true)"
  [ -n "$OUT" ] && emit CANDIDATE "$f" "$OUT"
done

# Every commit message on the branch. This surface is why M1 existed: it comes
# into being AFTER a pre-commit run, so the detector's target must cover it.
MSGS="$(git log --format='%H%n%B' "$MERGE_BASE"..HEAD 2>/dev/null || true)"
if [ -n "$MSGS" ]; then
  OUT="$( (printf '%s\n' "$MSGS" | grep -nEo "$COUNT_RE"; printf '%s\n' "$MSGS" | grep -nEi "$UNIV_RE" | cut -c1-140) 2>/dev/null || true)"
  [ -n "$OUT" ] && emit CANDIDATE "branch commit messages" "$OUT"
fi

# --------------------------------------------------------------------------
# THE LIVE PR BODY — M5. Not a file, gated by nothing, and where a stale count
# survived five consecutive rounds on PR #137.
if [ "$WITH_PR" -eq 1 ]; then
  if ! command -v gh >/dev/null 2>&1; then
    echo "  ⚠ gh not installed; live PR body NOT read"
    [ "$REQUIRE_PR" -eq 1 ] && {
      echo "FATAL: --require-pr given but gh is unavailable." >&2
      exit 2
    }
  else
    [ -z "$PR_NUM" ] && PR_NUM="$(gh pr view --json number --jq .number 2>/dev/null || true)"
    BODY=""
    BODY_OK=0
    if [ -n "$PR_NUM" ] && BODY="$(gh pr view "$PR_NUM" --json body --jq .body 2>/dev/null)"; then
      BODY_OK=1
    fi
    if [ "$BODY_OK" -eq 0 ]; then
      echo "  ⚠ live PR body could not be read (pr='${PR_NUM:-none}')"
      if [ "$REQUIRE_PR" -eq 1 ]; then
        echo "FATAL: --require-pr given but the live PR body could not be read." >&2
        echo "  Refusing to exit 0 — that is the fail-open path M5 identified." >&2
        exit 2
      fi
    else
      echo "  live PR body: #$PR_NUM ($(printf '%s' "$BODY" | wc -l) lines) — READ FROM THE LIVE PR"
      OUT="$( (printf '%s\n' "$BODY" | grep -nEo "$COUNT_RE"; printf '%s\n' "$BODY" | grep -nEi "$UNIV_RE" | cut -c1-140) 2>/dev/null || true)"
      [ -n "$OUT" ] && emit CANDIDATE "LIVE PR BODY #$PR_NUM" "$OUT"
      # Correction 5: use PR #138's DECIDABLE SHA check rather than another
      # grep proxy. Whether a SHA is HEAD, an ancestor, or unknown is a fact.
      if [ -x tools/check-pr-evidence.sh ]; then
        echo
        echo "  --- decidable SHA check, delegated to tools/check-pr-evidence.sh (PR #138) ---"
        bash tools/check-pr-evidence.sh "$PR_NUM" 2>/dev/null |
          sed -n '/3. COMMIT SHAs IN THE PR BODY/,/^====/p' | sed 's/^/  /'
      fi
    fi
  fi
fi

echo
echo "=============================================================="
echo "  ⚠ CANDIDATES, NOT DEFECTS. Disposition each one in the ledger."
echo "  ⚠ NOT EXHAUSTIVE: this is what the published key matched. No fixed"
echo "    word list finds every claim, and the key is stated above so a"
echo "    reviewer can attack it rather than guess at it."
echo "=============================================================="
exit 0
