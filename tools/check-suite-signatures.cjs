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
  const args = { report: null, tier: null, minTests: 0, subset: false };
  // ⚠⚠ Tracked SEPARATELY from the value, because "absent" and "present but
  // unusable" must both be rejected, and `minTests: 0` cannot tell them apart.
  let sawMinTests = false;
  let rawMinTests;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--report') args.report = argv[++i];
    else if (argv[i] === '--tier') args.tier = argv[++i];
    else if (argv[i] === '--manifest') args.manifest = argv[++i];
    else if (argv[i] === '--min-tests') {
      sawMinTests = true;
      rawMinTests = argv[++i];
    } else if (argv[i] === '--subset') args.subset = true;
    else {
      console.error(`Unknown argument: ${argv[i]}`);
      return null;
    }
  }
  if (!args.report || !args.tier) {
    console.error(
      'Usage: check-suite-signatures.cjs --report <json> --tier behavioural|visual|all' +
        ' (--min-tests N | --subset)',
    );
    return null;
  }
  if (!['behavioural', 'visual', 'all'].includes(args.tier)) {
    console.error(`--tier must be behavioural, visual or all (got: ${args.tier})`);
    return null;
  }

  // ⚠⚠⚠ THE FLOOR IS MANDATORY ON A FULL RUN, AND A BAD VALUE IS A HARD ERROR.
  //
  // Measured 2026-08-15, attacking this script's own accepting side before
  // commissioning round 2. The floor guard below is written
  // `if (args.minTests && executed.length < args.minTests)`. `Number(undefined)`
  // is `NaN` and `Number('')` is `0` — both falsy — so an ABSENT, EMPTY or
  // NON-NUMERIC `--min-tests` did not weaken the guard, it DELETED it, silently
  // and with no diagnostic. A report reduced to 4 executed outcomes of 541 —
  // keeping only the baselined failures and the baselined skips, so no other
  // guard has anything to say — EXITED 0.
  //
  // That is exactly the defect Codex round-1 finding M1 forced this floor into
  // existence to close, reintroduced through the argument parser instead of the
  // report. And it is reachable by ordinary means rather than malice: the
  // workflow passes `--min-tests ${{ env.BEHAVIOURAL_MIN_TESTS }}` as the LAST
  // argument, so renaming, deleting or typo-ing that env var renders an empty
  // string, the shell drops the empty token, and the flag silently takes no
  // value. A mechanised check's INPUT must be mandatory and lifecycle-bound;
  // "the caller always passes it correctly" is an assumption, not a control.
  //
  // `--subset` is the one legitimate exemption: a partial run executes only what
  // the diff selected, so no fixed floor is meaningful. Tier 1 in ci.yml relies
  // on that and passes no `--min-tests`.
  if (sawMinTests) {
    const n = Number(rawMinTests);
    if (!Number.isInteger(n) || n < 0) {
      console.error(
        `❌ --min-tests must be a non-negative integer (got: ${JSON.stringify(rawMinTests)}).` +
          '\n    Refusing to run: an unusable floor silently disables the truncation guard,' +
          '\n    which is the one control that notices a run that executed almost nothing.',
      );
      return null;
    }
    args.minTests = n;
  }
  if (!args.subset && (!sawMinTests || args.minTests < 1)) {
    console.error(
      '❌ --min-tests is REQUIRED (and must be >= 1) unless --subset is given.' +
        '\n    Without it the truncation guard does not run at all, and a report containing' +
        '\n    only the baselined failures and skips would exit 0 however much was lost.' +
        '\n    Measured: 4 executed outcomes of 541 passed cleanly before this check existed.',
    );
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

  // ⚠⚠ PRECEDENCE IS ROOT CAUSE FIRST, MATCHER TOKEN SECOND. Codex round-1 finding
  // M3: this list previously tested matcher words BEFORE timeout words, so a test
  // that TIMED OUT while sitting inside `toHaveScreenshot` was classified
  // `snapshot-mismatch` — i.e. a changed failure cause was masked as the expected
  // one and the gate exited 0. Reproduced against the real visual report.
  //
  // ⚠⚠⚠ BUT THE OBVIOUS FIX IS WRONG. A perfectly ordinary matcher failure ALSO
  // contains the word "Timeout": measured on the real reports, `calendar` (
  // locator-not-visible) and `tabs.visual` (count-mismatch) both carry
  // `Timeout: 5000ms` — the MATCHER'S OWN WAIT BUDGET — while neither carries a
  // test-level timeout. Promoting any /timeout/ match would reclassify two
  // manifest entries and break the gate in the opposite direction.
  //
  // So the root-cause timeout signature is specifically Playwright's TEST-level
  // message, `Test timeout of <n>ms exceeded`, and nothing looser.
  if (/electron\.launch|Process failed to launch/i.test(m)) return 'launch-failure';
  if (/Test timeout of \d+\s*ms exceeded/i.test(m)) return 'timeout';

  if (/A snapshot doesn't exist at/i.test(m)) return 'snapshot-missing';
  if (/Screenshot comparison failed|toHaveScreenshot|toMatchSnapshot|snapshot/i.test(m))
    return 'snapshot-mismatch';
  if (/toBeVisible/i.test(m)) return 'locator-not-visible';
  if (/toHaveCount/i.test(m)) return 'count-mismatch';
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
// Identity used for DUPLICATE DETECTION includes the project. `keyOf` deliberately
// does not, because the manifest is written in project-agnostic terms — but two
// Playwright projects can legitimately match the same spec path, and collapsing
// them would hide a doubled report. Keep the two notions separate.
const dupKeyOf = (o) => `${o.project} :: ${keyOf(o)}`;

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
  const skipped = outcomes.filter((o) => o.status === 'skipped');
  // ⚠ M1: a SKIPPED test is not executed coverage. The size floor below counts
  // these and nothing else — see the guard for the measurement that forced it.
  const executed = outcomes.filter((o) => o.status !== 'skipped');

  const forTier = (list) => (list || []).filter((e) => args.tier === 'all' || e.tier === args.tier);
  const expected = forTier(manifest.expectedFailures);
  const expectedSkips = forTier(manifest.expectedSkips);
  const expectedFlaky = forTier(manifest.expectedFlaky);

  const manifestKey = (e) => `${e.file} › ${e.titlePath.join(' › ')}`;
  const expectedByKey = new Map(expected.map((e) => [manifestKey(e), e]));
  const actualByKey = new Map(failures.map((f) => [keyOf(f), f]));

  // ⚠ SUBSET MODE (`--subset`), for tier 1. A partial run only executes the specs
  // the diff selected, so a baselined identity that is simply NOT PRESENT is not a
  // finding — it was never selected. Anything that IS present is still judged in
  // full. Codex round-1 finding M4: without this, tier 1 either uses the raw exit
  // code (and goes red on a known failure) or reports every unselected canonical
  // as "vanished".
  const presentKeys = new Set(outcomes.map(keyOf));
  const wasSelected = (key) => !args.subset || presentKeys.has(key);

  const unexpectedNew = [];
  const reasonChanged = [];
  const vanished = [];

  for (const [key, actual] of actualByKey) {
    const exp = expectedByKey.get(key);
    if (!exp) unexpectedNew.push(actual);
    else if (exp.reasonClass !== actual.reasonClass) reasonChanged.push({ key, exp, actual });
  }
  for (const [key, exp] of expectedByKey) {
    if (!actualByKey.has(key) && wasSelected(key)) vanished.push({ key, exp });
  }

  // ⚠⚠ M1 — SKIP IDENTITIES. A skip is not coverage. Baselined skips are tolerated;
  // an unbaselined skip fails (a test silently stopped running) and a baselined
  // skip that did not occur fails (it started running, which is good news that
  // still needs the manifest updated, or its identity moved).
  const expectedSkipByKey = new Map(expectedSkips.map((e) => [manifestKey(e), e]));
  const actualSkipByKey = new Map(skipped.map((o) => [keyOf(o), o]));
  const newSkips = [...actualSkipByKey.keys()].filter((k) => !expectedSkipByKey.has(k));
  const unSkipped = [...expectedSkipByKey.keys()].filter(
    (k) => !actualSkipByKey.has(k) && wasSelected(k),
  );

  // ⚠⚠ M2 — FLAKY IDENTITIES. CI retries twice, so a genuine regression that fails
  // twice and passes on the last attempt arrives as `flaky`. Tolerating every such
  // result makes retries a hiding place. The eight documented ledger entries are
  // allowlisted; anything else fails and must be adjudicated.
  const expectedFlakyByKey = new Map(expectedFlaky.map((e) => [manifestKey(e), e]));
  const newFlaky = flaky.filter((f) => !expectedFlakyByKey.has(keyOf(f)));

  // ⚠ In `--subset` mode the count guard must compare against the expected
  // identities that were ACTUALLY SELECTED, not the whole tier. Comparing to the
  // full manifest would make every partial run fail on arithmetic alone — which
  // it did, until this fixture caught it: a report that legitimately excluded the
  // one behavioural canonical still exited 1.
  const expectedApplicable = expected.filter((e) => wasSelected(manifestKey(e)));

  // ------------------------------------------------------------------ output
  console.log(`\nSuite signature check — tier: ${args.tier}`);
  console.log(`  report            : ${args.report}`);
  console.log(`  tests in report   : ${outcomes.length}${args.subset ? ' (SUBSET mode)' : ''}`);
  console.log(`  executed          : ${executed.length}   skipped: ${skipped.length}`);
  console.log(
    `  unexpected failures: ${failures.length}  (manifest expects ${expectedApplicable.length}` +
      `${args.subset ? ' of the selected subset' : ''})`,
  );
  console.log(`  flaky: ${flaky.length}  (${expectedFlaky.length} allowlisted for this tier)`);

  if (flaky.length - newFlaky.length > 0) {
    console.log('\nⓘ FLAKY, allowlisted (named existing debt — still on the watched ledger):');
    for (const f of flaky) {
      if (expectedFlakyByKey.has(keyOf(f)))
        console.log(`    ${keyOf(f)}  [${f.attempts} attempts]`);
    }
  }

  let status = 0;

  // ⚠⚠ THE DUPLICATION GUARD — the mirror of the truncation guard below, and the
  // one that is easy to forget because it is not a "missing" failure but a
  // DOUBLED one. Found by the author's own self-check before review, 2026-08-14:
  // a report whose suites were merged twice (an artifact-name collision, or
  // `merge-multiple: true` picking up overlapping blobs) produced
  // `unexpected failures: 2 (manifest expects 1)` and STILL PASSED, because the
  // set comparison collapses identical keys in a Map. A floor cannot catch a
  // report that is too BIG.
  const seen = new Map();
  for (const o of outcomes) {
    const k = dupKeyOf(o);
    seen.set(k, (seen.get(k) || 0) + 1);
  }
  const duplicated = [...seen.entries()].filter(([, n]) => n > 1);
  if (duplicated.length) {
    status = 1;
    console.log(
      `\n❌ REPORT CONTAINS ${duplicated.length} DUPLICATED TEST IDENTITIES.` +
        '\n    A shard was probably merged twice. The failure SET can still look correct' +
        '\n    while the run is not, so this is a hard failure rather than a warning.',
    );
    for (const [k, n] of duplicated.slice(0, 10)) console.log(`    x${n}  ${k}`);
  }

  // ⚠ COUNT AS WELL AS SET. Independent of the duplicate guard above: if the
  // number of unexpected failures does not equal the number expected, something
  // is wrong even when every key matches.
  if (failures.length !== expectedApplicable.length) {
    status = 1;
    console.log(
      `\n❌ FAILURE COUNT MISMATCH — ${failures.length} unexpected failures, manifest expects ${expectedApplicable.length}` +
        `${args.subset ? ' (of the selected subset)' : ''}.` +
        '\n    The set comparison below may still look clean; a count disagreement means' +
        '\n    the report is not what it claims to be.',
    );
  }

  if (newSkips.length) {
    status = 1;
    console.log(`\n❌ ${newSkips.length} TEST(S) SKIPPED THAT ARE NOT BASELINED:`);
    console.log('    A test that silently stops running looks identical to one that passes.');
    for (const k of newSkips.slice(0, 20)) console.log(`    ${k}`);
  }

  if (unSkipped.length) {
    status = 1;
    console.log(`\n❌ ${unSkipped.length} BASELINED SKIP(S) DID NOT OCCUR:`);
    console.log('    Possibly GOOD NEWS — the test may have been re-enabled. Either way the');
    console.log('    manifest is now wrong: update tests/baseline/expected-failures.json.');
    for (const k of unSkipped.slice(0, 20)) console.log(`    ${k}`);
  }

  if (newFlaky.length) {
    status = 1;
    console.log(`\n❌ ${newFlaky.length} NEWLY FLAKY IDENTITIES — not on the allowlist:`);
    console.log('    CI retries twice, so a regression that fails twice and passes on the last');
    console.log('    attempt arrives here rather than as a failure. Adjudicate it: fix it, or');
    console.log("    add it to the manifest's expectedFlaky with the owner's authorisation.");
    for (const f of newFlaky) console.log(`    ${keyOf(f)}  [${f.attempts} attempts]`);
  }

  // ⚠ THE TRUNCATION GUARD. A run that dies part-way — the 30-minute guillotine
  // that killed the old nightly 160 times — produces a SHORT report, not an
  // empty one. Its surviving tests may well contain no unexpected failures at
  // all, so a set comparison alone would call a two-thirds-complete run a pass.
  // Coverage lost is not coverage passed.
  //
  // ⚠⚠ IT COUNTS `executed`, NOT `outcomes`, AND THAT DISTINCTION IS THE WHOLE
  // GUARD. Codex round-1 finding M1: counting identities let a report in which
  // 560 of 561 outcomes were SKIPPED satisfy a floor of 550 and exit 0 — the
  // suite had run essentially nothing. Reproduced against the real merged report.
  // A floor over identities measures that tests EXIST; only a floor over executed
  // outcomes measures that they RAN. ⚠ Skips are additionally constrained by
  // identity above, so this floor is a backstop rather than the only control.
  if (args.minTests && executed.length < args.minTests) {
    status = 1;
    console.log(
      `\n❌ TOO FEW TESTS ACTUALLY EXECUTED — ${executed.length} executed of ${outcomes.length} identities` +
        ` (${skipped.length} skipped); expected at least ${args.minTests} executed.` +
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
