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
 * ⚠⚠ WHAT THIS STILL CANNOT DO — read before describing it to anyone.
 *   - It cannot decide whether a claim is TRUE.
 *   - It cannot see a question the author never wrote down. The commission is
 *     tracked and mandatory, so a written question cannot be silently dropped
 *     and a deletion is a visible diff — that is a VISIBILITY change, not a
 *     completeness guarantee, and it does not close the omission class.
 *   - Row atomicity is enforced as one unique ID per row. Whether a row's
 *     natural-language CONTENT is one question is not mechanically decidable;
 *     round 1 found three rows that bundled two, and they were split by hand.
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
  baseCommit: string | null;
  messageRange: string | null;
}

export interface GateContext {
  repo: string;
  base: string;
  mergeBase: string;
  head: string;
  /** Committed range, plus uncommitted and untracked work. */
  changed: string[];
  /**
   * Whether this checkout has anything to certify: commits ahead of the base,
   * or a dirty tree. ⚠ This is NOT "the input was missing so nothing is owed" —
   * that early return is the round-1 M1 defect. It is a positive, decidable
   * fact about Git state, and it is the only condition under which the
   * commission and ledger are not required. On `main` with a clean tree it is
   * false, which is what keeps the post-merge CI push build green.
   */
  hasBranchWork: boolean;
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
 * ⭐ ROUND-1 M3 — THE COMMIT-MESSAGE RANGE HASH, AND THE RATIONALE IT REPLACES.
 *
 * ⚠⚠ THE PREVIOUS VERSION OF THIS FILE ASSERTED THAT A LITERAL HASH OF COMMIT
 * MESSAGES IS IMPOSSIBLE — "recording the new hash needs another commit, whose
 * message changes the hash again, an infinite regress." THAT WAS FALSE, AND THE
 * REVIEWER REFUTED IT BY MEASUREMENT: `git commit --amend --no-edit
 * --allow-empty` changed HEAD from `9c5148a…` to `1c4dfb5…` while the SHA-256
 * of `git log --format='%B' origin/main..HEAD` stayed byte-identical at
 * `23b191d6812fb8dd1ec9ce3e41bc5a9683e3dc6520a23cb8ad0e278a9769d30f`.
 *
 * The regress is only real for a HEAD SHA. A MESSAGE range is stable under an
 * amend that preserves the message, so the author can commit with the final
 * message, compute the hash, write it into the ledger, and `--amend --no-edit`.
 * `tests/unit/author-ledger-fixtures.spec.ts` builds its fixture that exact way
 * and therefore demonstrates the property on every run.
 *
 * `--no-merges` is load-bearing: on a `pull_request` event `actions/checkout`
 * builds a synthetic merge commit whose message would otherwise enter the range
 * and make the CI hash disagree with the author's.
 */
export function messageRangeHash(repo: string, mergeBase: string): string {
  return sha256(git(repo, 'log', '--no-merges', '--format=%B', `${mergeBase}..HEAD`));
}

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

const CERT_RE = {
  fingerprint: /^governed fingerprint:\s*`([^`]*)`\s*$/m,
  baseCommit: /^base commit:\s*`([^`]*)`\s*$/m,
  messageRange: /^commit-message range:\s*`([^`]*)`\s*$/m,
};

export function parseCertificate(body: string): Certificate {
  const grab = (re: RegExp) => {
    const m = body.match(re);
    return m ? m[1] : null;
  };
  return {
    fingerprint: grab(CERT_RE.fingerprint),
    baseCommit: grab(CERT_RE.baseCommit),
    messageRange: grab(CERT_RE.messageRange),
  };
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
  return {
    repo,
    base,
    mergeBase,
    head,
    changed: changedPaths(repo, mergeBase),
    hasBranchWork: mergeBase !== head || dirty,
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
  if (!ctx.hasBranchWork) return failures;
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
 * ⭐ ROUND-1 M1, SECOND HALF — THE COMMISSION MAY NOT SHRINK AFTER A REVIEWER
 * HAS READ IT.
 *
 * Round 1's objection: the author's only deletion control removed a LEDGER row
 * while its commission row remained. It never tested disappearance of the
 * upstream question, so it could not establish that the commissioned population
 * was deletion-resistant.
 *
 * ⚠ Deleting a question together with its ledger row leaves both artifacts
 * internally consistent, so NO check reading only those two files can catch it.
 * The anchor has to be something the author does not write, and there is
 * exactly one on the branch: the reviewer's own committed deliverable. Every
 * commit that adds or edits `docs/reviews/*-review.md` snapshots the commission
 * the reviewer was looking at, and no later commit may drop an id from it.
 *
 * ⚠⚠ WHAT THIS DOES NOT CLOSE, STATED RATHER THAN IMPLIED: before any review
 * commit exists there is no anchor, so an author who deletes a question in the
 * same round that wrote it is still invisible here — the same class as never
 * writing it down. `tests/unit/author-ledger-fixtures.spec.ts` pins that
 * boundary with a test that asserts the gate stays GREEN, so the limit is
 * executable rather than a paragraph nobody re-reads.
 */
export function reviewedCommissionSnapshot(
  ctx: GateContext,
): { sha: string; ids: string[] } | null {
  // ⚠ `git()` for the enumeration — see checkCommitMessageCandidates: a failed
  // log must not read as "no reviewer deliverable, so no anchor". An empty
  // result from a SUCCESSFUL log genuinely means there is none.
  const log = git(
    ctx.repo,
    'log',
    '--format=%H',
    `${ctx.mergeBase}..HEAD`,
    '--',
    'docs/reviews/*-review.md',
  );
  const shas = log.trim().split('\n').filter(Boolean);
  if (shas.length === 0) return null;
  const sha = shas[0]; // newest first
  // `tryGit` IS correct here: the commission legitimately did not exist at that
  // commit on a branch that introduces it, and absence is a real answer.
  const body = tryGit(ctx.repo, 'show', `${sha}:${COMMISSION}`);
  if (body === null) return null;
  return { sha, ids: parseCommission(body).map((r) => r.id) };
}

export function checkCommissionMonotonic(ctx: GateContext): string[] {
  if (!ctx.hasBranchWork) return [];
  const snapshot = reviewedCommissionSnapshot(ctx);
  if (snapshot === null) return [];
  const now = new Set(ctx.commission.map((r) => r.id));
  const dropped = snapshot.ids.filter((id) => !now.has(id));
  return dropped.length === 0
    ? []
    : [
        `commissioned questions present when the reviewer's deliverable was committed at ` +
          `${snapshot.sha.slice(0, 7)} have since been dropped: ${dropped.join(', ')}. ` +
          `A question may be NARROWED and split, never deleted, once it has been reviewed.`,
      ];
}

/** Round 0, M3 — the required row set comes from the COMMISSION, not the ledger. */
export function checkLedgerCoverage(ctx: GateContext): string[] {
  const failures: string[] = [];
  if (!ctx.hasBranchWork) return failures;
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
 * Round 0, M1 — branch commit messages are a CHECKED POPULATION, not merely a
 * hashed one. The hash below catches STALENESS; this catches an undispositioned
 * numeric claim, and it fired on this PR's own content commit.
 *
 * ⚠ Round 1's boundary, recorded rather than overstated: this key matches only
 * count-shaped claims. A later commit whose whole message was `all checks
 * passed` went undetected HERE. It is now caught by the message-range hash, not
 * by this leg, and this leg remains a candidate generator rather than a
 * semantic claim detector.
 */
export function checkCommitMessageCandidates(ctx: GateContext): string[] {
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
 * ⭐ ROUND-1 M3 — THE CERTIFICATE IS BOUND TO A BASE/HEAD LIFECYCLE.
 *
 * Round 1 simulated the post-merge state — `origin/main` set to this PR's
 * content commit, one later commit added, and NEITHER tracked artifact
 * regenerated — and the spec returned exit 0, 7/7 passing. A future branch
 * inherited a green execution ledger for work nobody had commissioned.
 *
 * Three declarations now pin the ledger to the state it was computed against:
 *   governed fingerprint  the governed tree, index AND working tree (M4)
 *   base commit           the merge base this branch's population is measured from
 *   commit-message range  sha256 of every non-merge message since that base
 *
 * A later branch has a different merge base and a different message range, so
 * the inherited ledger is stale and the gate is red until it is regenerated.
 * ⚠ THE STANDING CONSEQUENCE, STATED PLAINLY: once this lands, ANY branch with
 * work to certify owes its own commission and its own regenerated ledger. That
 * is the point of the repair and it is also a real tax on every future PR.
 */
export function checkCertificate(ctx: GateContext): string[] {
  const failures: string[] = [];
  if (!ctx.hasBranchWork) return failures;
  if (ctx.ledgerRaw === null) {
    failures.push(`${LEDGER} is absent, so no certificate exists`);
    return failures;
  }
  const declared = parseCertificate(ctx.ledgerRaw);
  const computed: Certificate = {
    fingerprint: governedFingerprint(ctx.repo),
    baseCommit: ctx.mergeBase,
    messageRange: messageRangeHash(ctx.repo, ctx.mergeBase),
  };
  // ⚠ Match the DECLARATION, then compare — never key the regex on the expected
  // SHAPE. Keying it on `[0-9a-f]{12}` meant a malformed value simply failed to
  // match and the assertion was skipped in silence, found by writing
  // `PLACEHOLDER00` into the ledger and watching the test pass. An unparseable
  // certificate must be a failure, never a no-op.
  for (const field of ['fingerprint', 'baseCommit', 'messageRange'] as const) {
    const label = {
      fingerprint: 'governed fingerprint',
      baseCommit: 'base commit',
      messageRange: 'commit-message range',
    }[field];
    if (declared[field] === null) {
      failures.push(`${LEDGER} must declare "${label}: \`<value>\`"`);
    } else if (declared[field] !== computed[field]) {
      failures.push(
        `${LEDGER} declares ${label} "${declared[field]}" but this checkout computes ` +
          `"${computed[field]}". The certificate is stale: re-run the commission and regenerate ` +
          `the ledger for THIS base and THIS branch.`,
      );
    }
  }
  return failures;
}

/** Every check, in one call — the shape the hostile fixtures assert against. */
export function runGate(ctx: GateContext): string[] {
  return [
    ...checkGovernedObligation(ctx),
    ...checkCommissionInput(ctx),
    ...checkCommissionMonotonic(ctx),
    ...checkLedgerCoverage(ctx),
    ...checkDispositions(ctx),
    ...checkOwnerAcceptance(ctx),
    ...checkCommitMessageCandidates(ctx),
    ...checkCertificate(ctx),
  ];
}
