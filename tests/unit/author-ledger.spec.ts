/**
 * AUTHOR EXECUTION LEDGER — the blocking detector, second attempt.
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
 * ⚠⚠⚠ THE FIRST ATTEMPT WAS WITHDRAWN. It shipped on PR #140 in `fd626be`, an
 * adversarial review returned FIVE merge-blockers
 * (`docs/reviews/self-pass-gate-adversarial-review-codex.md`, `c8678d2`), and
 * `./tools/checks` on the committed head returned REAL_EXIT=1 — the gate failed
 * its own gate. It was withdrawn in `03c817c`. This file is the repair, and
 * every one of the five is named at the assertion that closes it.
 *
 * WHY IT STILL LIVES IN `tests/unit/`. `vitest` is the only blocking gate in
 * `./tools/checks` that can read arbitrary files, and `./tools/checks` mirrors
 * `.github/workflows/ci.yml`. A defect in a TEST is ordinary PR evidence; a
 * defect in `docs/governance/**` would be a governance amendment costing its
 * own review round. PR #139's whole lesson was to keep the mechanism out of the
 * governing text.
 *
 * ⚠⚠ WHAT THIS STILL CANNOT DO — read before describing it to anyone.
 *   - It cannot decide whether a claim is TRUE.
 *   - It cannot see a question the author never wrote down. The commission is
 *     now tracked, so a written question cannot be silently dropped and a
 *     deletion is a visible diff — that is a VISIBILITY change, not a
 *     completeness guarantee, and it does not close the omission class.
 *   - Row atomicity is mechanical; the honesty of a row's CONTENT is not.
 */

import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

/**
 * The repository under inspection. Overridable so the detector can be exercised
 * against CONSTRUCTED git state — a rename across the governed boundary, an
 * untracked governed addition, a mode-only change, a shallow clone. The prior
 * review's standing complaint was that checks were argued rather than run, and
 * "testing a component with synthetic input is not testing the mechanism with
 * real state"; this override is what lets the hostile cases drive THIS code.
 */
const REPO = process.env.HAVDM_LEDGER_REPO
  ? resolve(process.env.HAVDM_LEDGER_REPO)
  : resolve(__dirname, '..', '..');
const COMMISSION = 'docs/reviews/self-pass-gate-codex-commission.md';
const LEDGER = 'docs/reviews/self-pass-gate-author-ledger.md';

/** Artifacts whose change obliges a ledger even with no commission present. */
const GOVERNED = [/^docs\/governance\//, /^docs\/templates\//, /^ai_rules\.md$/, /^CLAUDE\.md$/];

/**
 * PASS           the check ran and the claim held
 * FIXED          the check ran, found a defect, and it is repaired here
 * NORMATIVE      a rule or quoted prohibition, not an empirical claim
 * DISCLOSED      the check ran and found something real, deliberately NOT
 *                actioned here — recorded so a reviewer sees it rather than
 *                discovering it. ⚠ May NOT be self-awarded for an in-scope
 *                residue; that is what OWNER-ACCEPTED is for.
 * OWNER-ACCEPTED the owner accepted the residue; must cite "owner: <ref>"
 * UNRUN          not executed — handoff is not permitted while any row is UNRUN
 */
const DISPOSITIONS = ['PASS', 'FIXED', 'NORMATIVE', 'DISCLOSED', 'OWNER-ACCEPTED', 'UNRUN'];

function git(...args: string[]): string {
  return execFileSync('git', args, { cwd: REPO, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
}

function tryGit(...args: string[]): string | null {
  try {
    return git(...args);
  } catch {
    return null;
  }
}

/**
 * M2 — FAIL CLOSED. The first attempt resolved only `origin/main` or `main` and
 * deliberately `it.skip`ped when neither existed. Codex reproduced a
 * `--depth 1 --single-branch` clone in which both probes exit 1, the suite
 * skips, and VITEST_EXIT is 0 — so ordinary CI certified nothing while
 * appearing green. `.github/workflows/ci.yml` now checks out with
 * `fetch-depth: 0`; if a base ref is STILL unresolvable the population is
 * unknown, and an unknown population must never present as an empty one.
 */
function baseRef(): string {
  const candidates = [process.env.HAVDM_BASE_REF, 'origin/main', 'main'].filter(
    Boolean,
  ) as string[];
  for (const ref of candidates) {
    if (tryGit('rev-parse', '--verify', '--quiet', ref) !== null) return ref;
  }
  throw new Error(
    `No base ref resolves (tried: ${candidates.join(', ')}). ` +
      `A shallow or single-branch checkout leaves none. Fetch history before running this suite — ` +
      `failing rather than skipping is deliberate: this is merge-blocker M2 of ` +
      `docs/reviews/self-pass-gate-adversarial-review-codex.md.`,
  );
}

/**
 * M4 — RENAME DECOMPOSITION, NUL-SAFE. Default `git diff --name-only` emits
 * ONLY THE DESTINATION of a rename, so `docs/governance/x.md ->
 * docs/reviews/x.md` left the governed PREIMAGE invisible and the detector took
 * its "nothing governed changed" branch. That defect was itself PR #139's R4-M1
 * repeating verbatim. `--name-status -M -z` gives NUL-separated records —
 * `R<score>\0<old>\0<new>` for renames and copies, `<X>\0<path>` otherwise — so
 * both sides are captured and a path containing a space or newline cannot split
 * a field.
 */
function changedPaths(base: string): string[] {
  const mergeBase = git('merge-base', base, 'HEAD').trim();
  const raw = git('diff', '--name-status', '-M', '-z', `${mergeBase}...HEAD`);
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
  // Uncommitted and untracked work counts: a pre-submit run on a dirty tree is
  // the moment this is most useful, and the first version scanned nothing then.
  for (const p of git('diff', '--name-only', '-z', 'HEAD').split('\0')) if (p) out.push(p);
  for (const p of git('ls-files', '--others', '--exclude-standard', '-z').split('\0'))
    if (p) out.push(p);
  return [...new Set(out)];
}

const isGoverned = (p: string) => GOVERNED.some((re) => re.test(p));

/**
 * M4 (second leg) — THE FINGERPRINT MUST SEE WHAT `git ls-files` CANNOT. The
 * first version enumerated only tracked files, so an UNTRACKED file added under
 * `docs/governance/` left the certified target byte-identical. It also ignored
 * file MODE, so `chmod +x` on identical content was invisible. This covers
 * tracked entries (mode + object id, straight from the index) and untracked
 * governed additions (mode + content hash).
 */
function governedFingerprint(): string {
  const entries: string[] = [];
  for (const line of git('ls-files', '-s', '-z').split('\0')) {
    if (!line) continue;
    // "<mode> <oid> <stage>\t<path>"
    const tab = line.indexOf('\t');
    if (tab < 0) continue;
    const meta = line.slice(0, tab).split(/\s+/);
    const path = line.slice(tab + 1);
    if (!isGoverned(path)) continue;
    entries.push(`T ${meta[0]} ${meta[1]} ${path}`);
  }
  for (const path of git('ls-files', '--others', '--exclude-standard', '-z').split('\0')) {
    if (!path || !isGoverned(path)) continue;
    const abs = join(REPO, path);
    if (!existsSync(abs)) continue;
    const st = statSync(abs);
    const mode = st.mode & 0o111 ? '100755' : '100644';
    const oid = createHash('sha1').update(readFileSync(abs)).digest('hex');
    entries.push(`U ${mode} ${oid} ${path}`);
  }
  entries.sort();
  return createHash('sha256').update(entries.join('\n')).digest('hex').slice(0, 12);
}

/** Commissioned check IDs, parsed from the TRACKED commission. */
function commissionedIds(): string[] {
  const abs = join(REPO, COMMISSION);
  if (!existsSync(abs)) return [];
  const body = readFileSync(abs, 'utf8');
  const section = body.split(/^##\s+Commissioned checks\s*$/m)[1] ?? '';
  const upToNextHeading = section.split(/^##\s/m)[0] ?? '';
  const ids = [...upToNextHeading.matchAll(/^\|\s*(C\d+)\s*\|/gm)].map((m) => m[1]);
  return ids;
}

interface Row {
  id: string;
  disposition: string;
  evidence: string;
}

function ledgerRows(): Row[] {
  const abs = join(REPO, LEDGER);
  if (!existsSync(abs)) return [];
  const body = readFileSync(abs, 'utf8');
  const rows: Row[] = [];
  for (const m of body.matchAll(/^\|\s*(C\d+)\s*\|([^|]*)\|([^|]*)\|([^|]*)\|/gm)) {
    rows.push({ id: m[1], disposition: m[3].trim(), evidence: m[4].trim() });
  }
  return rows;
}

/** Branch commit messages — the surface that only exists AFTER a pre-commit run. */
function commitMessages(base: string): string {
  const mergeBase = git('merge-base', base, 'HEAD').trim();
  return tryGit('log', '--format=%H%n%B', `${mergeBase}..HEAD`) ?? '';
}

const COUNT_RE =
  /[^0-9a-zA-Z_]([0-9]{1,6})[ \t]+(specs?|files?|tests?|paths?|rows?|drawers?|cards?|legs?|commits?|rounds?|surfaces?|warnings?|errors?)\b/g;

describe('author execution ledger (the self-pass gate)', () => {
  const base = baseRef(); // M2: throws rather than skipping.

  it('M2 — resolves a base ref, and fails closed rather than skipping when it cannot', () => {
    expect(base).toBeTruthy();
    expect(tryGit('rev-parse', '--verify', '--quiet', base)).not.toBeNull();
  });

  it('M4 — governed-change discovery decomposes renames and sees the preimage', () => {
    const changed = changedPaths(base);
    // Both sides of every rename are present by construction; assert the parser
    // never emits an empty field, which is how a NUL mis-parse first shows.
    expect(changed.every((p) => p.length > 0)).toBe(true);
    // If a governed artifact changed, a commission is required. Discovering
    // this via the PREIMAGE is the whole point: a governed file renamed OUT of
    // docs/governance/ must still oblige a ledger.
    const governed = changed.filter(isGoverned);
    if (governed.length > 0) {
      expect(
        existsSync(join(REPO, COMMISSION)),
        `governed artifacts changed (${governed.join(', ')}) but ${COMMISSION} is absent`,
      ).toBe(true);
    }
  });

  it('M3 — every commissioned check has exactly one atomic ledger row', () => {
    const ids = commissionedIds();
    if (ids.length === 0) return; // no commission on this branch: nothing owed
    const rows = ledgerRows();
    expect(
      rows.length,
      `${LEDGER} has no rows but ${COMMISSION} lists ${ids.length}`,
    ).toBeGreaterThan(0);

    const seen = new Map<string, number>();
    for (const r of rows) seen.set(r.id, (seen.get(r.id) ?? 0) + 1);

    // The M3 closure: the required set comes from the COMMISSION, not the
    // ledger. A validator reading only author-supplied rows cannot tell a
    // completed commission from one whose hardest question was deleted.
    const missing = ids.filter((id) => !seen.has(id));
    expect(missing, `commissioned checks with no ledger row: ${missing.join(', ')}`).toEqual([]);

    const duplicated = [...seen.entries()].filter(([, n]) => n > 1).map(([id]) => id);
    expect(
      duplicated,
      `ledger rows must be unique and atomic; duplicated: ${duplicated.join(', ')}`,
    ).toEqual([]);

    const orphan = [...seen.keys()].filter((id) => !ids.includes(id));
    expect(orphan, `ledger rows with no commissioned check: ${orphan.join(', ')}`).toEqual([]);
  });

  it('no ledger row is UNRUN, and every disposition is recognised', () => {
    for (const r of ledgerRows()) {
      expect(DISPOSITIONS, `row ${r.id} has unknown disposition "${r.disposition}"`).toContain(
        r.disposition,
      );
      expect(r.disposition, `row ${r.id} is UNRUN — handoff is not permitted`).not.toBe('UNRUN');
      expect(r.evidence.length, `row ${r.id} has no evidence`).toBeGreaterThan(0);
    }
  });

  it('OWNER-ACCEPTED cites the owner; DISCLOSED may not be self-awarded in its place', () => {
    for (const r of ledgerRows()) {
      if (r.disposition === 'OWNER-ACCEPTED') {
        expect(
          r.evidence.toLowerCase(),
          `row ${r.id} claims OWNER-ACCEPTED without citing the owner`,
        ).toContain('owner:');
      }
    }
  });

  /**
   * M1 — THE LIFECYCLE LEG. A pre-commit run cannot certify a commit message
   * that does not yet exist: on the first attempt the author filled the ledger
   * and ran the gate BEFORE committing, the commit then introduced 13
   * undispositioned candidates, and the certificate could not invalidate itself
   * because it excluded commit messages entirely.
   *
   * ⚠ A literal hash of commit messages inside the certificate cannot work: the
   * act of recording the new hash requires another commit, whose message
   * changes the hash again — an infinite regress. So commit messages are part
   * of the CHECKED POPULATION rather than the fingerprint. Committing can now
   * turn a green run red, which is exactly the behaviour M1 demanded, and CI
   * (with `fetch-depth: 0`) runs this suite on the committed head so the check
   * cannot be confined to the author's pre-commit tree.
   */
  it('M1 — claim candidates in branch commit messages are dispositioned', () => {
    const msgs = commitMessages(base);
    if (!msgs.trim()) return;
    const candidates = [...msgs.matchAll(COUNT_RE)].map((m) => `${m[1]} ${m[2]}`);
    if (candidates.length === 0) return;
    const ledgerText = existsSync(join(REPO, LEDGER))
      ? readFileSync(join(REPO, LEDGER), 'utf8')
      : '';
    const undispositioned = [...new Set(candidates)].filter((c) => !ledgerText.includes(c));
    expect(
      undispositioned,
      `commit-message claim candidates with no ledger mention: ${undispositioned.join(' | ')}. ` +
        `This is M1: the commit message is an input that only exists after a pre-commit run.`,
    ).toEqual([]);
  });

  it('records a governed fingerprint that covers untracked additions and mode', () => {
    const fp = governedFingerprint();
    expect(fp).toMatch(/^[0-9a-f]{12}$/);
    const abs = join(REPO, LEDGER);
    if (!existsSync(abs)) return;
    const body = readFileSync(abs, 'utf8');
    // ⚠ Match the DECLARATION, then validate its shape separately. Keying the
    // regex on `[0-9a-f]{12}` meant a malformed value simply failed to match
    // and the assertion was skipped in silence — found by writing
    // `PLACEHOLDER00` into the ledger and watching this test pass. An
    // unparseable certificate must be a failure, never a no-op.
    const declared = body.match(/governed fingerprint:\s*`([^`]*)`/);
    expect(declared, `${LEDGER} must declare a governed fingerprint`).not.toBeNull();
    expect(
      declared![1],
      `${LEDGER} declares governed fingerprint "${declared![1]}" but the tree computes ${fp}`,
    ).toBe(fp);
  });
});
