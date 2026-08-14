#!/usr/bin/env node
/**
 * check-suite-signatures.cjs — decide whether a suite run matches its baseline.
 *
 * WHY THIS EXISTS: this project has seven long-standing e2e failures that are
 * recorded, understood and NOT yet fixed. A run containing exactly those seven
 * is a PASS; a run containing six, or eight, or the same seven failing for
 * different reasons, is a FAIL. A plain exit code cannot express that, so
 * .github/workflows/test.yml previously papered over it with
 * `continue-on-error: true` — which meant the nightly could never go red and
 * nobody noticed it had been broken since 2026-01-09.
 *
 * This script is what replaces that. It compares the SET of unexpected failures
 * in a Playwright JSON report against a committed manifest.
 *
 * ⚠ IDENTITY IS `file` + TITLE PATH, DELIBERATELY NOT LINE NUMBERS. The suite
 * baseline names these failures by line (`apexcharts.visual:26`), but line
 * numbers decay on every edit above them — a rule this project has already paid
 * for four times. Titles move only when someone renames a test, which is a
 * conscious act that SHOULD require updating the manifest. Lines are carried in
 * the manifest as an informational cross-reference to the drawer only.
 *
 * ⚠ REASON CLASSES, NEVER PIXEL COUNTS. `apexcharts.visual:26` has measured
 * 3,126 / 3,341 / 3,261 / 3,285 / 3,384 differing pixels across five rounds. An
 * exact-count assertion would be permanently red and would teach everyone to
 * ignore it. Triage is on SIGNATURES, never counts.
 *
 * USAGE:
 *   node tools/check-suite-signatures.cjs --report <merged.json> --tier behavioural
 *   node tools/check-suite-signatures.cjs --report <merged.json> --tier visual
 *   node tools/check-suite-signatures.cjs --report <merged.json> --tier all
 *
 * EXIT CODES: 0 = the failure set matches the manifest exactly. 1 = it does not
 * (new failure, vanished expected failure, or changed reason class), or the
 * report could not be read.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const MANIFEST = path.join(ROOT, 'tests/baseline/expected-failures.json');

// ---------------------------------------------------------------- arg parsing

function parseArgs(argv) {
  const args = { report: null, tier: null, minTests: 0 };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--report') args.report = argv[++i];
    else if (argv[i] === '--tier') args.tier = argv[++i];
    else if (argv[i] === '--manifest') args.manifest = argv[++i];
    else if (argv[i] === '--min-tests') args.minTests = Number(argv[++i]);
    else {
      console.error(`Unknown argument: ${argv[i]}`);
      return null;
    }
  }
  if (!args.report || !args.tier) {
    console.error(
      'Usage: check-suite-signatures.cjs --report <json> --tier behavioural|visual|all [--min-tests N]',
    );
    return null;
  }
  if (!['behavioural', 'visual', 'all'].includes(args.tier)) {
    console.error(`--tier must be behavioural, visual or all (got: ${args.tier})`);
    return null;
  }
  return args;
}

// ------------------------------------------------------------ reason classing

/**
 * Playwright embeds ANSI colour codes in `error.message`. They do not affect
 * classification (the words survive), but they turn console output into
 * unreadable noise, so strip them before printing.
 */
// eslint-disable-next-line no-control-regex
const ANSI = /\u001b\[[0-9;]*m/g;
const stripAnsi = (s) => String(s || '').replace(ANSI, '');

/**
 * Collapse a Playwright error message to a stable class.
 *
 * Order matters: a missing-snapshot error also contains the word "snapshot",
 * so the more specific pattern is tested first.
 */
function classifyError(message) {
  const m = stripAnsi(message);
  if (/A snapshot doesn't exist at/i.test(m)) return 'snapshot-missing';
  if (/Screenshot comparison failed|toHaveScreenshot|toMatchSnapshot|snapshot/i.test(m))
    return 'snapshot-mismatch';
  if (/toBeVisible/i.test(m)) return 'locator-not-visible';
  if (/toHaveCount/i.test(m)) return 'count-mismatch';
  if (/electron\.launch|Process failed to launch/i.test(m)) return 'launch-failure';
  if (/Test timeout of|Timed out .* waiting|exceeded/i.test(m)) return 'timeout';
  return 'other';
}

// ------------------------------------------------------------- report walking

/**
 * Walk the nested suite tree of a Playwright JSON report.
 *
 * Shape: { suites: [ { title, specs: [ { file, line, title, tests: [...] } ],
 * suites: [...] } ] }. Titles nest, so the title path is accumulated on the way
 * down and the spec title appended at the leaf.
 */
function collectOutcomes(report) {
  const out = [];

  const walkSuite = (suite, titles) => {
    const nested = suite.title ? [...titles, suite.title] : titles;
    for (const spec of suite.specs || []) {
      for (const t of spec.tests || []) {
        const results = t.results || [];
        const last = results[results.length - 1] || {};
        const message = [
          last.error && last.error.message,
          ...(last.errors || []).map((e) => e.message),
        ]
          .filter(Boolean)
          .join('\n');
        out.push({
          file: spec.file,
          line: spec.line,
          titlePath: [...nested, spec.title],
          status: t.status, // 'expected' | 'unexpected' | 'flaky' | 'skipped'
          project: t.projectName,
          attempts: results.length,
          reasonClass: t.status === 'unexpected' ? classifyError(message) : null,
          message,
        });
      }
    }
    for (const child of suite.suites || []) walkSuite(child, nested);
  };

  // Top-level suites carry the FILE as their title; that duplicates spec.file,
  // so it is not folded into the title path.
  for (const suite of report.suites || []) {
    for (const spec of suite.specs || []) {
      for (const t of spec.tests || []) {
        const results = t.results || [];
        const last = results[results.length - 1] || {};
        const message = [
          last.error && last.error.message,
          ...(last.errors || []).map((e) => e.message),
        ]
          .filter(Boolean)
          .join('\n');
        out.push({
          file: spec.file,
          line: spec.line,
          titlePath: [spec.title],
          status: t.status,
          project: t.projectName,
          attempts: results.length,
          reasonClass: t.status === 'unexpected' ? classifyError(message) : null,
          message,
        });
      }
    }
    for (const child of suite.suites || []) walkSuite(child, []);
  }

  return out;
}

const keyOf = (o) => `${o.file} › ${o.titlePath.join(' › ')}`;

// --------------------------------------------------------------------- report

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args) return 1;

  const manifestPath = args.manifest || MANIFEST;
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (err) {
    console.error(`❌ Could not read manifest ${manifestPath}: ${err.message}`);
    return 1;
  }

  let report;
  try {
    report = JSON.parse(fs.readFileSync(args.report, 'utf8'));
  } catch (err) {
    // A missing/short report is itself a failure: it usually means the run was
    // killed before the merge step, which is exactly the old 30-minute
    // guillotine. Never treat "no report" as "no failures".
    console.error(`❌ Could not read report ${args.report}: ${err.message}`);
    return 1;
  }

  const outcomes = collectOutcomes(report);
  const failures = outcomes.filter((o) => o.status === 'unexpected');
  const flaky = outcomes.filter((o) => o.status === 'flaky');

  const expected = (manifest.expectedFailures || []).filter(
    (e) => args.tier === 'all' || e.tier === args.tier,
  );

  const expectedByKey = new Map(expected.map((e) => [`${e.file} › ${e.titlePath.join(' › ')}`, e]));
  const actualByKey = new Map(failures.map((f) => [keyOf(f), f]));

  const unexpectedNew = [];
  const reasonChanged = [];
  const vanished = [];

  for (const [key, actual] of actualByKey) {
    const exp = expectedByKey.get(key);
    if (!exp) unexpectedNew.push(actual);
    else if (exp.reasonClass !== actual.reasonClass) reasonChanged.push({ key, exp, actual });
  }
  for (const [key, exp] of expectedByKey) {
    if (!actualByKey.has(key)) vanished.push({ key, exp });
  }

  // ------------------------------------------------------------------ output
  console.log(`\nSuite signature check — tier: ${args.tier}`);
  console.log(`  report            : ${args.report}`);
  console.log(`  tests in report   : ${outcomes.length}`);
  console.log(`  unexpected failures: ${failures.length}  (manifest expects ${expected.length})`);
  console.log(`  flaky (passed on retry): ${flaky.length}`);

  if (flaky.length) {
    // Reported, never blocking: this project keeps an eight-item watched-flake
    // ledger, and 2 CI retries exist precisely to MEASURE the pass-on-retry
    // rate. Blocking on it would re-create the noise the ledger is managing.
    console.log('\n⚠ FLAKY (reported, not blocking — add to the watched-flake ledger):');
    for (const f of flaky) console.log(`    ${keyOf(f)}  [${f.attempts} attempts]`);
  }

  let status = 0;

  // ⚠ THE TRUNCATION GUARD. A run that dies part-way — the 30-minute guillotine
  // that killed the old nightly 160 times — produces a SHORT report, not an
  // empty one. Its surviving tests may well contain no unexpected failures at
  // all, so a set comparison alone would call a two-thirds-complete run a pass.
  // Coverage lost is not coverage passed.
  if (args.minTests && outcomes.length < args.minTests) {
    status = 1;
    console.log(
      `\n❌ REPORT IS SHORT — ${outcomes.length} tests, expected at least ${args.minTests}.` +
        '\n    A shard probably timed out or crashed before finishing. Treat as a FAILED run,' +
        '\n    not a passed one: the missing tests were never executed.',
    );
  }

  if (unexpectedNew.length) {
    status = 1;
    console.log('\n❌ NEW FAILURES — not in the baseline manifest:');
    for (const f of unexpectedNew) {
      console.log(`    ${keyOf(f)}`);
      console.log(`      reason class: ${f.reasonClass}`);
      console.log(`      ${stripAnsi(f.message).split('\n')[0].slice(0, 160)}`);
    }
  }

  if (reasonChanged.length) {
    status = 1;
    console.log('\n❌ EXPECTED FAILURES THAT CHANGED SHAPE — same test, different reason:');
    for (const { key, exp, actual } of reasonChanged) {
      console.log(`    ${key}`);
      console.log(`      expected reason class: ${exp.reasonClass}`);
      console.log(`      actual   reason class: ${actual.reasonClass}`);
      console.log(`      ${stripAnsi(actual.message).split('\n')[0].slice(0, 160)}`);
    }
  }

  if (vanished.length) {
    status = 1;
    console.log('\n❌ EXPECTED FAILURES THAT DID NOT OCCUR:');
    console.log('    This may be GOOD NEWS — someone may have fixed them. It is still a');
    console.log('    mismatch: retire the entry from tests/baseline/expected-failures.json');
    console.log('    (with the owner’s authorisation) rather than leaving the manifest stale.');
    for (const { key, exp } of vanished) console.log(`    ${key}  [${exp.reasonClass}]`);
  }

  if (status === 0) {
    console.log(
      `\n✅ Suite signature check passed — the ${failures.length} failure(s) are exactly the baseline set.`,
    );
  }
  return status;
}

process.exit(main());
