/**
 * THE AUTHOR SELF-PASS GATE — the detector.
 *
 * WHY THIS EXISTS, MEASURED. Across PR #139's six review rounds and PR #140's
 * first, 19 defects were attributable to the author. Codex's process review
 * (`docs/reviews/pr139-author-process-review-codex.md`) measured that 14 of 16
 * named defects had an author-published check capable of exposing them; one of
 * those was actually run and caught it, so 13 were NAMED AND NOT RUN. Writing
 * "verified: grep returns 0" costs one line; constructing the hostile case
 * costs ten minutes and produces THE SAME ONE LINE. Nothing downstream could
 * tell them apart.
 *
 * ⚠⚠⚠ WHY THE DETECTOR LIVES HERE AND NOT IN THE SPEC. Round 1 of PR #141's
 * independent review (`docs/reviews/self-pass-gate-codex-review.md`) returned
 * CHANGES-REQUIRED with four fail-open classes, every one demonstrated by
 * driving the real spec against constructed Git state. Repairing them required
 * hostile fixtures to become part of the suite rather than a manual run
 * recorded in prose — a fixture nobody re-runs rots exactly like the
 * "named and not run" checks above. Extracting the detector lets
 * `tests/unit/author-ledger.spec.ts` (the blocking gate, run against this
 * repository) and `tests/unit/author-ledger-fixtures.spec.ts` (the hostile
 * cases, run against constructed repositories) drive IDENTICAL code. Neither
 * file re-implements a parser the other one uses.
 *
 * ⚠⚠⚠ ROUND 2 RETURNED CHANGES-REQUIRED AND THE OWNER CHOSE TO REDUCE
 * (`docs/reviews/self-pass-gate-codex-round2-review.md`). Two mechanisms the
 * round-1 fix added were CUT rather than repaired, because both were measured
 * to be green bypasses and both were new machinery rather than repairs:
 *   - the `docs/reviews/*-review.md` monotonic anchor (round-2 M2);
 *   - the `base commit` + `commit-message range` lifecycle certificate
 *     (round-2 M1).
 * Each cut is documented at the site it was cut from, with the measurement.
 * The rule that governed the choice is round 2's own: "Reduce the mechanism,
 * bind one simple complete target, and keep human reviewer authority outside
 * the self-authored gate."
 *
 * ⚠⚠ WHAT THIS CANNOT DO — read before describing it to anyone. This list got
 * LONGER after round 2, which is the honest direction for a reduced mechanism.
 *   - It cannot decide whether a claim is TRUE.
 *   - It cannot see a question the author never wrote down, NOR one deleted
 *     later. Round 1's fix claimed to close the second half; round 2 measured
 *     two bypasses and it was cut. The tracked commission makes a deletion a
 *     VISIBLE DIFF for the owner and the reviewer, and that is all it does.
 *   - It certifies the GOVERNED TREE ONLY. `src/`, tests, tools, the
 *     commission text and this ledger's evidence are all outside the
 *     fingerprint. Nothing here binds branch content or HEAD.
 *   - It cannot tell a re-run from an inherited evidence row.
 *     `checkLedgerFreshness()` proves the ledger was EDITED on this branch and
 *     nothing more.
 *   - Row atomicity is enforced as one unique ID per row. Whether a row's
 *     natural-language CONTENT is one question is not mechanically decidable;
 *     round 1 found three rows that bundled two, and round 2 measured that a
 *     question can be REPLACED under a retained ID.
 *   - A false claim that exists only in the live PR body is outside the
 *     blocking path. `tools/claims-worklist.sh --require-pr` reads it, but this
 *     detector does not invoke that script.
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, readlinkSync } from 'node:fs';
import { resolve, join } from 'node:path';

export const COMMISSION = 'docs/reviews/self-pass-gate-codex-commission.md';
export const LEDGER = 'docs/reviews/self-pass-gate-author-ledger.md';

/** Artifacts whose change obliges a ledger even with no commission present. */
const GOVERNED = [/^docs\/governance\//, /^docs\/templates\//, /^ai_rules\.md$/, /^CLAUDE\.md$/];

export const isGoverned = (p: string): boolean => GOVERNED.some((re) => re.test(p));

/**
 * SIX ENUMERATED AUTHOR ARTIFACTS. Changing one of them obliges a ledger for
 * the same reason changing governed text does: the author is the only one who
 * can say what they ran. Both the commission and the ledger are included, so a
 * branch that edits or deletes either cannot thereby escape owing one.
 *
 * ⚠⚠ ROUND-3 N1 — THIS IS A LIST, NOT A BOUNDARY, AND THE CLAIM IS NARROWED TO
 * SAY SO. It was previously described as "this gate's own files", which reads as
 * tamper resistance. It is not. The surfaces that decide whether these specs RUN
 * AT ALL are deliberately OUTSIDE it and are named here rather than left to be
 * discovered: `tools/checks`, the `test:unit` script in `package.json`,
 * `vitest.config.ts`, and `.github/workflows/ci.yml`. Deleting either spec is
 * outside it too.
 * ⚠ ADDING THEM WOULD NOT FIX THAT. A local Vitest check cannot enforce anything
 * once its own runner is disabled, so a longer regex list would buy the
 * appearance of protection and not the property — the round-2 lesson about
 * machinery that looks like a security control. The honest statement is that
 * this list catches EDITS TO THE SIX AUTHOR ARTIFACTS, and that runner,
 * configuration and test-deletion tampering are outside this mechanism entirely
 * and live at the human owner gate.
 */
const GATE_OWN = [
  /^tests\/support\/authorLedger\.ts$/,
  /^tests\/unit\/author-ledger\.spec\.ts$/,
  /^tests\/unit\/author-ledger-fixtures\.spec\.ts$/,
  /^tools\/claims-worklist\.sh$/,
  new RegExp(`^${COMMISSION.replace(/[.]/g, '\\.')}$`),
  new RegExp(`^${LEDGER.replace(/[.]/g, '\\.')}$`),
];

export const isGateOwn = (p: string): boolean => GATE_OWN.some((re) => re.test(p));

/**
 * The KIND of a commissioned question, parsed from the commission table.
 *
 * EMPIRICAL  a claim about what happens — answerable only by running something.
 * NORMATIVE  a rule or a quoted prohibition. There is nothing to run.
 */
export type Kind = 'EMPIRICAL' | 'NORMATIVE';
export const KINDS: readonly string[] = ['EMPIRICAL', 'NORMATIVE'];

/**
 * ⭐ ROUND-1 M2. Which dispositions may be awarded to which KIND — the whole
 * vocabulary in one table, so a disposition cannot be a pass route by being
 * absent from an assertion.
 *
 * The round-1 defect was structural: `DISCLOSED` and `NORMATIVE` were
 * unconditional members of a flat list, the only constraint was "not UNRUN with
 * non-empty evidence", and the test TITLED "DISCLOSED may not be self-awarded"
 * contained no assertion about `DISCLOSED` at all. Setting an empirical row to
 * `DISCLOSED` with evidence stating the defect was unresolved and unaccepted
 * returned exit 0, 7/7 passing.
 *
 * PASS / FIXED     the check RAN. Empirical rows only — a rule cannot pass.
 * NORMATIVE        a rule was recorded. Normative rows only — an empirical
 *                  question cannot be answered by declaring it a rule.
 * OWNER-ACCEPTED   the owner accepted the residue. Either kind, and the
 *                  evidence must cite "owner: <ref>". This is the ONLY route
 *                  by which an unresolved in-scope residue passes.
 * DISCLOSED        allowed for NO kind. A commissioned row is in scope by
 *                  definition, so disclosing it is not answering it. Disclose
 *                  OUT-OF-SCOPE observations in the ledger's prose sections,
 *                  which carry no `C<n>` id and are not parsed as rows.
 * UNRUN            allowed for no kind. Handoff is not permitted while a
 *                  commissioned question is unanswered.
 */
export const DISPOSITION_MATRIX: Readonly<Record<string, readonly Kind[]>> = {
  PASS: ['EMPIRICAL'],
  FIXED: ['EMPIRICAL'],
  NORMATIVE: ['NORMATIVE'],
  'OWNER-ACCEPTED': ['EMPIRICAL', 'NORMATIVE'],
  DISCLOSED: [],
  UNRUN: [],
};

export interface CommissionedRow {
  id: string;
  /** Raw cell text: validated against KINDS rather than trusted. */
  kind: string;
  check: string;
}

export interface LedgerRow {
  id: string;
  disposition: string;
  evidence: string;
}

export interface Certificate {
  fingerprint: string | null;
}

export interface GateContext {
  repo: string;
  base: string;
  mergeBase: string;
  head: string;
  /** Committed range, plus uncommitted and untracked work. */
  changed: string[];
  /** Commits ahead of the base, or a dirty tree. A fact, not an obligation. */
  hasBranchWork: boolean;
  /**
   * ⭐ ROUND-2: WHEN A LEDGER IS OWED, SCOPED.
   *
   * Branch work AND a change to a governed artifact or to this gate's own
   * files. ⚠ This is NOT "the input was missing so nothing is owed" — that
   * early return is the round-1 M1 defect, and it is why the condition is a
   * decidable fact about WHAT CHANGED rather than about whether the commission
   * happens to exist.
   *
   * Round 2 called the previous condition — any branch work at all — "a policy
   * mechanism introduced through an ordinary unit test", applying to every
   * contributor, dependency bump and reviewer-only branch in the repository
   * forever. The owner chose to reduce rather than escalate. A branch that
   * touches neither governed text nor this mechanism now owes nothing and the
   * gate says nothing about it.
   */
  owesLedger: boolean;
  commissionRaw: string | null;
  commission: CommissionedRow[];
  ledgerRaw: string | null;
  ledger: LedgerRow[];
}

function git(repo: string, ...args: string[]): string {
  return execFileSync('git', args, { cwd: repo, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
}

function tryGit(repo: string, ...args: string[]): string | null {
  try {
    return git(repo, ...args);
  } catch {
    return null;
  }
}

const sha1 = (b: Buffer | string) => createHash('sha1').update(b).digest('hex');
const sha256 = (b: Buffer | string) => createHash('sha256').update(b).digest('hex');

/**
 * M2 (round 0) — FAIL CLOSED. The first attempt resolved only `origin/main` or
 * `main` and deliberately `it.skip`ped when neither existed. Codex reproduced a
 * `--depth 1 --single-branch` clone in which both probes exit 1, the suite
 * skips, and VITEST_EXIT is 0 — so ordinary CI certified nothing while
 * appearing green. `.github/workflows/ci.yml` now checks out with
 * `fetch-depth: 0`; if a base ref is STILL unresolvable the population is
 * unknown, and an unknown population must never present as an empty one.
 */
export function baseRef(repo: string): string {
  const candidates = [process.env.HAVDM_BASE_REF, 'origin/main', 'main'].filter(
    Boolean,
  ) as string[];
  for (const ref of candidates) {
    if (tryGit(repo, 'rev-parse', '--verify', '--quiet', ref) !== null) return ref;
  }
  throw new Error(
    `No base ref resolves (tried: ${candidates.join(', ')}). ` +
      `A shallow or single-branch checkout leaves none. Fetch history before running this suite — ` +
      `failing rather than skipping is deliberate: this is merge-blocker M2 of ` +
      `docs/reviews/self-pass-gate-adversarial-review-codex.md.`,
  );
}

/**
 * M4 (round 0) — RENAME DECOMPOSITION, NUL-SAFE. Default `git diff --name-only`
 * emits ONLY THE DESTINATION of a rename, so `docs/governance/x.md ->
 * docs/reviews/x.md` left the governed PREIMAGE invisible and the detector took
 * its "nothing governed changed" branch. That defect was itself PR #139's R4-M1
 * repeating verbatim. `--name-status -M -z` gives NUL-separated records —
 * `R<score>\0<old>\0<new>` for renames and copies, `<X>\0<path>` otherwise — so
 * both sides are captured and a path containing a space or newline cannot split
 * a field.
 */
function parseNameStatus(raw: string): string[] {
  const fields = raw.split('\0').filter((f) => f.length > 0);
  const out: string[] = [];
  for (let i = 0; i < fields.length;) {
    const status = fields[i++];
    if (/^[RC]/.test(status)) {
      const from = fields[i++];
      const to = fields[i++];
      if (from) out.push(from);
      if (to) out.push(to);
    } else {
      const p = fields[i++];
      if (p) out.push(p);
    }
  }
  return out;
}

export function changedPaths(repo: string, mergeBase: string): string[] {
  const out = parseNameStatus(
    git(repo, 'diff', '--name-status', '-M', '-z', `${mergeBase}...HEAD`),
  );
  // Uncommitted and untracked work counts: a pre-submit run on a dirty tree is
  // the moment this is most useful, and the first version scanned nothing then.
  // ⚠ Both dirty legs use the same record parser as the committed range —
  // round 1's N2 was that the shell twin reverted to `--name-only` here and
  // emitted only a rename's destination.
  out.push(...parseNameStatus(git(repo, 'diff', '--name-status', '-M', '-z', '--cached')));
  out.push(...parseNameStatus(git(repo, 'diff', '--name-status', '-M', '-z')));
  for (const p of git(repo, 'ls-files', '--others', '--exclude-standard', '-z').split('\0'))
    if (p) out.push(p);
  return [...new Set(out)];
}

/**
 * ⭐ ROUND-1 M4 — THE FINGERPRINT MUST SEE THE WORKING TREE, NOT ONLY THE INDEX.
 *
 * `git ls-files -s` reports the mode and object id recorded in the INDEX. It
 * cannot observe an unstaged edit, an unstaged deletion, or an unstaged `chmod`
 * on an already-tracked file. Round 1 measured the consequence: a plain
 * `chmod +x docs/governance/OPERATING_AGREEMENT.md` appeared in `git status`
 * and left the spec at exit 0, 7/7 passing. The author's own mode fixture had
 * run `git add -A` first, so it had only ever exercised the STAGED state.
 *
 * The sharp part: `changedPaths()` above DID see the dirty file and obliged a
 * ledger, while the certificate went on certifying the old index bytes. Two
 * halves of one mechanism disagreeing about what "changed" means.
 *
 * So every governed path contributes THREE independent facts where they exist:
 *   I  the index entry     (mode + object id)   — staged and committed state
 *   W  the working tree    (type + mode + hash) — or `absent` if deleted
 *   U  untracked additions (type + mode + hash)
 * Type is recorded as well as mode, because replacing a file with a symlink is
 * a real change that a content-only hash misses.
 */
function worktreeFacts(repo: string, path: string): string {
  const abs = join(repo, path);
  let st;
  try {
    st = lstatSync(abs);
  } catch {
    return 'absent';
  }
  if (st.isSymbolicLink()) return `l 120000 ${sha1(readlinkSync(abs))}`;
  if (!st.isFile()) return `o ${(st.mode & 0o7777).toString(8)}`;
  const mode = st.mode & 0o111 ? '100755' : '100644';
  return `f ${mode} ${sha1(readFileSync(abs))}`;
}

export function governedFingerprint(repo: string): string {
  const entries: string[] = [];
  for (const line of git(repo, 'ls-files', '-s', '-z').split('\0')) {
    if (!line) continue;
    // "<mode> <oid> <stage>\t<path>"
    const tab = line.indexOf('\t');
    if (tab < 0) continue;
    const meta = line.slice(0, tab).split(/\s+/);
    const path = line.slice(tab + 1);
    if (!isGoverned(path)) continue;
    entries.push(`I ${meta[0]} ${meta[1]} ${path}`);
    entries.push(`W ${worktreeFacts(repo, path)} ${path}`);
  }
  for (const path of git(repo, 'ls-files', '--others', '--exclude-standard', '-z').split('\0')) {
    if (!path || !isGoverned(path)) continue;
    entries.push(`U ${worktreeFacts(repo, path)} ${path}`);
  }
  entries.sort();
  return sha256(entries.join('\n')).slice(0, 12);
}

/**
 * ⚠⚠⚠ WHAT ROUND 2 CUT FROM HERE, AND WHY — read before proposing it again.
 *
 * The round-1 fix added a `commit-message range` hash (sha256 over
 * `git log --no-merges --format=%B base..HEAD`) and a `base commit`
 * declaration, together billed as binding the certificate to a base/head
 * lifecycle. **Round 2 measured that they do not bind what the wording
 * claimed.** From a clean, certified head the reviewer staged a change to
 * tracked, non-governed `tools/claims-worklist.sh` and ran the prescribed
 * `git commit --amend --no-edit`. HEAD moved, the TREE moved, the message hash
 * was byte-identical, and the gate returned exit 0, 9 of 9. Source, tests,
 * tools, commission text and ledger evidence were all outside the binding.
 * That was not a determined history rewrite; it was the amend loop the
 * mechanism itself prescribed.
 *
 * ⓘ THE UNDERLYING FACT REMAINS TRUE AND IS NOT BEING RE-DENIED. A literal
 * message-range hash IS feasible; the round-0 "infinite regress" rationale was
 * false and stays corrected. The regress is real only for a HEAD SHA. What
 * round 2 established is narrower and decisive: **feasible is not sufficient.**
 * A hash that is deliberately stable across an amend is deliberately blind to
 * what that amend changed, so it can never be a tree certificate.
 *
 * The owner chose to REDUCE rather than escalate to a whole-tree digest or an
 * external CI attestation. What replaces it is two much smaller checks with
 * much smaller claims: `checkLedgerFreshness()` below, and the scoped
 * `owesLedger`. Neither claims to certify branch content.
 */
const COMMISSION_HEADING_RE = /^##\s+Commissioned checks\s*$/m;

export function parseCommission(body: string): CommissionedRow[] {
  const section = body.split(COMMISSION_HEADING_RE)[1] ?? '';
  const upToNextHeading = section.split(/^##\s/m)[0] ?? '';
  return [...upToNextHeading.matchAll(/^\|\s*(C\d+)\s*\|([^|]*)\|([^|]*)\|/gm)].map((m) => ({
    id: m[1],
    kind: m[2].trim(),
    check: m[3].trim(),
  }));
}

export function parseLedger(body: string): LedgerRow[] {
  return [...body.matchAll(/^\|\s*(C\d+)\s*\|([^|]*)\|([^|]*)\|([^|]*)\|/gm)].map((m) => ({
    id: m[1],
    disposition: m[3].trim(),
    evidence: m[4].trim(),
  }));
}

const CERT_RE = { fingerprint: /^governed fingerprint:\s*`([^`]*)`\s*$/m };

export function parseCertificate(body: string): Certificate {
  const m = body.match(CERT_RE.fingerprint);
  return { fingerprint: m ? m[1] : null };
}

function readIfPresent(repo: string, rel: string): string | null {
  const abs = join(repo, rel);
  return existsSync(abs) ? readFileSync(abs, 'utf8') : null;
}

export function loadContext(repoOverride?: string): GateContext {
  const repo = resolve(
    repoOverride ?? process.env.HAVDM_LEDGER_REPO ?? resolve(__dirname, '..', '..'),
  );
  const base = baseRef(repo);
  const mergeBase = git(repo, 'merge-base', base, 'HEAD').trim();
  const head = git(repo, 'rev-parse', 'HEAD').trim();
  const dirty = git(repo, 'status', '--porcelain', '-z').length > 0;
  const commissionRaw = readIfPresent(repo, COMMISSION);
  const ledgerRaw = readIfPresent(repo, LEDGER);
  const changed = changedPaths(repo, mergeBase);
  const hasBranchWork = mergeBase !== head || dirty;
  return {
    repo,
    base,
    mergeBase,
    head,
    changed,
    hasBranchWork,
    owesLedger: hasBranchWork && changed.some((p) => isGoverned(p) || isGateOwn(p)),
    commissionRaw,
    commission: commissionRaw === null ? [] : parseCommission(commissionRaw),
    ledgerRaw,
    ledger: ledgerRaw === null ? [] : parseLedger(ledgerRaw),
  };
}

// ---------------------------------------------------------------------------
// THE CHECKS. Each returns the list of failures it found — empty means clean.
// A check NEVER returns early on missing input; "the input was absent so
// nothing is owed" is the exact fail-open shape round 1 measured four times.
// ---------------------------------------------------------------------------

/** Round 0, M4 — a governed change obliges a commission via either side of a rename. */
export function checkGovernedObligation(ctx: GateContext): string[] {
  const failures: string[] = [];
  if (!ctx.changed.every((p) => p.length > 0)) {
    failures.push('the changed-path parser emitted an empty field — a NUL mis-parse');
  }
  const governed = ctx.changed.filter(isGoverned);
  if (governed.length > 0 && ctx.commissionRaw === null) {
    failures.push(
      `governed artifacts changed (${governed.join(', ')}) but ${COMMISSION} is absent`,
    );
  }
  return failures;
}

/**
 * ⭐ ROUND-1 M1 — THE COMMISSIONED POPULATION IS MANDATORY, UNIQUE AND TYPED.
 *
 * `commissionedIds()` used to return `[]` when the file, its exact heading, or
 * every parseable row was absent, and the caller treated zero IDs as "nothing
 * owed". Measured: commission deleted with the ledger retained returned exit 0,
 * 7/7 passing, and relabelling `C10` to a duplicate `C09` while deleting ledger
 * `C10` did the same — two questions collapsing into one obligation.
 */
export function checkCommissionInput(ctx: GateContext): string[] {
  const failures: string[] = [];
  if (!ctx.owesLedger) return failures;
  if (ctx.commissionRaw === null) {
    failures.push(
      `${COMMISSION} is absent, and this checkout has work to certify ` +
        `(base ${ctx.mergeBase.slice(0, 7)} != HEAD ${ctx.head.slice(0, 7)}, or a dirty tree). ` +
        `An absent commission must never read as "nothing owed" — round-1 M1.`,
    );
    return failures;
  }
  if (!COMMISSION_HEADING_RE.test(ctx.commissionRaw)) {
    failures.push(
      `${COMMISSION} has no "## Commissioned checks" heading — the table is unfindable`,
    );
    return failures;
  }
  if (ctx.commission.length === 0) {
    failures.push(`${COMMISSION}'s "Commissioned checks" table parses to zero rows`);
    return failures;
  }
  const seen = new Map<string, number>();
  for (const r of ctx.commission) seen.set(r.id, (seen.get(r.id) ?? 0) + 1);
  const duplicated = [...seen.entries()].filter(([, n]) => n > 1).map(([id]) => id);
  if (duplicated.length > 0) {
    failures.push(
      `${COMMISSION} has duplicate ids (${duplicated.join(', ')}); two questions would ` +
        `collapse into one ledger obligation`,
    );
  }
  const badKind = ctx.commission.filter((r) => !KINDS.includes(r.kind));
  if (badKind.length > 0) {
    failures.push(
      `${COMMISSION} rows must declare a Kind of ${KINDS.join(' or ')}; bad: ` +
        badKind.map((r) => `${r.id}="${r.kind}"`).join(', '),
    );
  }
  return failures;
}

/**
 * ⭐ ROUND-2 M2 — WHAT WAS HERE, AND WHY IT WAS CUT RATHER THAN REPAIRED.
 *
 * The round-1 fix added a pair of functions that found the newest commit
 * touching `docs/reviews/*-review.md`, read the commission as it stood there,
 * and refused any id that had since vanished. The idea was that a
 * self-authored artifact needs an anchor the author does not write, and that
 * the reviewer's own committed deliverable is one.
 *
 * ⚠⚠ ROUND 2 MEASURED TWO INDEPENDENT BYPASSES AND BOTH ARE DECISIVE:
 *   1. THE ANCHOR AUTHENTICATED A FILENAME, NOT A REVIEWER. The author writes
 *      `docs/reviews/author-self-review.md`, commits it, and it becomes the
 *      newest snapshot — containing whatever the commission says by then.
 *      Measured with a commissioned question already deleted: exit 0, 9 of 9.
 *   2. IT PROTECTED IDS, NOT QUESTIONS. Replacing a reviewed question's text
 *      with an unrelated one under the same id and kind: exit 0, 9 of 9. The
 *      property claimed — "narrowed and split, never deleted" — is not
 *      something an id comparison can express, and hashing the question text
 *      instead would forbid the legitimate narrowing this branch performed on
 *      C02, C05 and C06.
 *
 * ⚠ THE REPLACEMENT IS NOTHING. `OPERATING_AGREEMENT.md` §3 deliberately does
 * not machine-enforce author != reviewer; that invariant lives at the human
 * owner gate, and repo-local code cannot infer a counterparty from a path it
 * does not control. Deleting a question before the owner reads the diff is
 * therefore OUT OF SCOPE for this mechanism, stated plainly and pinned by the
 * `KNOWN-OPEN:` fixture rather than by a check that only appears to close it.
 *
 * ⚠⚠⚠ DO NOT RE-ADD A FILENAME, AUTHOR-NAME OR COMMIT-ORDER HEURISTIC HERE.
 * Round 2's own diagnostic: "Do not add a third round of reviewer-anchor
 * heuristics."
 */

/**
 * ⭐ ROUND-2 — THE LEDGER MUST BE AUTHORED ON THIS BRANCH.
 *
 * This is what remains of round-1's M3 lifecycle repair after the base/message
 * certificate was cut, and it is deliberately the smallest thing that keeps
 * round 1's MEASURED state red: a later branch that inherits the commission and
 * ledger unchanged and certifies nothing.
 *
 * ⚠ ITS CLAIM IS NARROW AND IS NOT TO BE WIDENED IN PROSE. It says the ledger
 * was EDITED on this branch. It does NOT say the checks were re-run, that the
 * evidence is fresh, or that branch content is certified — round 2 measured a
 * future branch passing with every evidence row inherited byte-for-byte, and
 * this check would still accept that. A one-character edit satisfies it. It
 * converts silent inheritance into a visible diff, which is visibility, not
 * completeness.
 */
export function checkLedgerFreshness(ctx: GateContext): string[] {
  if (!ctx.owesLedger) return [];
  if (ctx.ledgerRaw === null) return []; // checkLedgerCoverage owns absence
  return ctx.changed.includes(LEDGER)
    ? []
    : [
        `${LEDGER} was not touched by this branch (nothing in the range ` +
          `${ctx.mergeBase.slice(0, 7)}...HEAD, the index, the working tree or untracked ` +
          `files). A branch that owes a ledger may not inherit one unchanged.`,
      ];
}

/** Round 0, M3 — the required row set comes from the COMMISSION, not the ledger. */
export function checkLedgerCoverage(ctx: GateContext): string[] {
  const failures: string[] = [];
  if (!ctx.owesLedger) return failures;
  if (ctx.ledgerRaw === null) {
    failures.push(`${LEDGER} is absent, and this checkout has work to certify`);
    return failures;
  }
  const ids = ctx.commission.map((r) => r.id);
  if (ids.length === 0) {
    failures.push(
      `no commissioned ids parsed from ${COMMISSION}; the required set cannot be empty ` +
        `while there is work to certify (see the commission-input check for why)`,
    );
    return failures;
  }
  const seen = new Map<string, number>();
  for (const r of ctx.ledger) seen.set(r.id, (seen.get(r.id) ?? 0) + 1);

  const missing = ids.filter((id) => !seen.has(id));
  if (missing.length > 0)
    failures.push(`commissioned checks with no ledger row: ${missing.join(', ')}`);

  const duplicated = [...seen.entries()].filter(([, n]) => n > 1).map(([id]) => id);
  if (duplicated.length > 0)
    failures.push(`ledger rows must be unique and atomic; duplicated: ${duplicated.join(', ')}`);

  const orphan = [...seen.keys()].filter((id) => !ids.includes(id));
  if (orphan.length > 0)
    failures.push(`ledger rows with no commissioned check: ${orphan.join(', ')}`);

  return failures;
}

/** ⭐ ROUND-1 M2 — a disposition is legal only for the KIND it is awarded to. */
export function checkDispositions(ctx: GateContext): string[] {
  const failures: string[] = [];
  const kindById = new Map(ctx.commission.map((r) => [r.id, r.kind]));
  for (const r of ctx.ledger) {
    if (r.evidence.length === 0) failures.push(`row ${r.id} has no evidence`);
    if (!(r.disposition in DISPOSITION_MATRIX)) {
      failures.push(`row ${r.id} has unknown disposition "${r.disposition}"`);
      continue;
    }
    if (r.disposition === 'UNRUN') {
      failures.push(
        `row ${r.id} is UNRUN — handoff is not permitted while a question is unanswered`,
      );
      continue;
    }
    // An orphan row has no kind; checkLedgerCoverage owns that failure.
    const kind = kindById.get(r.id);
    if (kind === undefined) continue;
    const allowed = DISPOSITION_MATRIX[r.disposition];
    if (!allowed.includes(kind as Kind)) {
      failures.push(
        r.disposition === 'DISCLOSED'
          ? `row ${r.id} is DISCLOSED, which passes nothing: a commissioned row is in scope by ` +
              `definition, so disclosing it is not answering it. Use OWNER-ACCEPTED with an ` +
              `"owner:" citation, or answer it.`
          : `row ${r.id} is a ${kind} question dispositioned ${r.disposition}; ` +
              `${r.disposition} may only be awarded to ${allowed.join('/') || 'no kind'}`,
      );
    }
  }
  return failures;
}

/** OWNER-ACCEPTED is the only route by which an unresolved in-scope residue passes. */
export function checkOwnerAcceptance(ctx: GateContext): string[] {
  return ctx.ledger
    .filter(
      (r) => r.disposition === 'OWNER-ACCEPTED' && !r.evidence.toLowerCase().includes('owner:'),
    )
    .map((r) => `row ${r.id} claims OWNER-ACCEPTED without citing the owner`);
}

const COUNT_RE =
  /[^0-9a-zA-Z_]([0-9]{1,6})[ \t]+(specs?|files?|tests?|paths?|rows?|drawers?|cards?|legs?|commits?|rounds?|surfaces?|warnings?|errors?)\b/g;

/**
 * Round 0, M1 — branch commit messages are a CHECKED POPULATION. This catches
 * an undispositioned numeric claim, and it fired on this PR's own content
 * commit.
 *
 * ⚠ Round 1's boundary, recorded rather than overstated: this key matches only
 * count-shaped claims. A later commit whose whole message is `all checks
 * passed` goes undetected, and NOTHING ELSE CATCHES IT — the `commit-message
 * range` hash that used to was cut in round 2. That residue is ledger row C24,
 * `OWNER-ACCEPTED`. This leg is a candidate generator, not a semantic claim
 * detector.
 *
 * ⭐⭐ ROUND-3 M1 — THIS CHECK IS INSIDE THE SCOPE, AND IT WAS NOT.
 * Round 2 scoped the obligation to governed text and this gate's own files, and
 * four checks were given the `!ctx.owesLedger` return. This one was missed while
 * `runGate()` went on calling it unconditionally, so an ordinary branch that
 * owed nothing still went RED on a count-shaped commit message. Round 3
 * measured it: a later branch changing only the mode of unrelated
 * `package.json`, committed as `chore: 991 tests passed`, returned exit 1,
 * 8 of 9 — while the identical branch with a count-free message returned 9 of 9.
 * That falsified this mechanism's own published claim that an ordinary branch
 * owes nothing and the gate is silent about it.
 * ⚠ The paired control is deliberate and must stay: an OBLIGATED branch with a
 * count-shaped message is still red (`an undispositioned count candidate in a
 * commit message is red`), so this scoping cannot disable round-0 M1 globally.
 */
export function checkCommitMessageCandidates(ctx: GateContext): string[] {
  if (!ctx.owesLedger) return [];
  // ⚠ `git()`, not `tryGit()`. Round 1's N1 was a git command that DEFINES a
  // population failing silently, so the caller carried on with an empty one.
  // That finding named the shell twin; the same shape was here, and swapping a
  // swallow for a throw is what sweeping the class rather than the instance
  // means. A throw fails the suite, which is the correct reading of "the
  // population is unknown".
  const msgs = git(ctx.repo, 'log', '--format=%H%n%B', `${ctx.mergeBase}..HEAD`);
  if (!msgs.trim()) return [];
  const candidates = [...new Set([...msgs.matchAll(COUNT_RE)].map((m) => `${m[1]} ${m[2]}`))];
  if (candidates.length === 0) return [];
  const ledgerText = ctx.ledgerRaw ?? '';
  const undispositioned = candidates.filter((c) => !ledgerText.includes(c));
  return undispositioned.length === 0
    ? []
    : [
        `commit-message claim candidates with no ledger mention: ${undispositioned.join(' | ')}. ` +
          `This is M1: the commit message is an input that only exists after a pre-commit run.`,
      ];
}

/**
 * THE GOVERNED FINGERPRINT — the whole certificate, and the whole of its claim.
 *
 * ⚠⚠ WHAT THIS CERTIFIES: the governed tree, in the index AND the working tree
 * AND as untracked additions, at the moment the gate runs. That is round-1's M4
 * repair and round 2 marked it RESOLVED.
 *
 * ⚠⚠⚠ WHAT IT DOES NOT CERTIFY, AND MUST NEVER BE DESCRIBED AS CERTIFYING:
 * anything outside the four governed path classes. Not `src/`, not the tests,
 * not the tools, not the commission text, not this ledger's own evidence. The
 * round-1 fix added `base commit` and `commit-message range` and called the
 * result a base/head lifecycle binding; round 2 measured that a same-message
 * amend changed the tracked tree while all three declarations stayed valid and
 * the gate stayed green. Both were cut rather than widened — see the block
 * above `checkLedgerFreshness()`.
 *
 * A whole-tree digest or an external CI attestation over the HEAD SHA would
 * genuinely close that class. Both were considered and neither was built: the
 * first raises the amend tax on every commit, and the second re-opens a
 * standing owner ruling that this gate stays a local `vitest` check. The
 * residue is disclosed, not repaired.
 */
export function checkCertificate(ctx: GateContext): string[] {
  const failures: string[] = [];
  if (!ctx.owesLedger) return failures;
  if (ctx.ledgerRaw === null) {
    failures.push(`${LEDGER} is absent, so no certificate exists`);
    return failures;
  }
  const declared = parseCertificate(ctx.ledgerRaw).fingerprint;
  const computed = governedFingerprint(ctx.repo);
  // ⚠ Match the DECLARATION, then compare — never key the regex on the expected
  // SHAPE. Keying it on `[0-9a-f]{12}` meant a malformed value simply failed to
  // match and the assertion was skipped in silence, found by writing
  // `PLACEHOLDER00` into the ledger and watching the test pass. An unparseable
  // certificate must be a failure, never a no-op.
  if (declared === null) {
    failures.push(`${LEDGER} must declare "governed fingerprint: \`<value>\`"`);
  } else if (declared !== computed) {
    failures.push(
      `${LEDGER} declares governed fingerprint "${declared}" but this checkout computes ` +
        `"${computed}". Re-run the commission and regenerate the ledger for THIS tree.`,
    );
  }
  return failures;
}

/** Every check, in one call — the shape the hostile fixtures assert against. */
export function runGate(ctx: GateContext): string[] {
  return [
    ...checkGovernedObligation(ctx),
    ...checkCommissionInput(ctx),
    ...checkLedgerFreshness(ctx),
    ...checkLedgerCoverage(ctx),
    ...checkDispositions(ctx),
    ...checkOwnerAcceptance(ctx),
    ...checkCommitMessageCandidates(ctx),
    ...checkCertificate(ctx),
  ];
}
