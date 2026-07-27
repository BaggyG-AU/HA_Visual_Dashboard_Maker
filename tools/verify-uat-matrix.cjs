#!/usr/bin/env node
/**
 * verify-uat-matrix — headless self-check for a HAVDM UAT matrix HTML file.
 *
 * Usage:
 *   node tools/verify-uat-matrix.cjs docs/testing/uat/matrices/uat_matrix_template.html
 *   node tools/verify-uat-matrix.cjs docs/testing/uat/matrices/uat_matrix_v1.0.0_2026-07-28.html
 *
 * Runs the mechanical half of the Step 6 self-verify checklist in
 * `prompts/claude/uat-plan-and-matrix.md`: rendering, verdict wiring, severity
 * gating, localStorage persistence, the export -> clear -> import round-trip,
 * the live-HA teardown gate, and summary-report / issues-payload generation.
 *
 * It is round-agnostic — every expectation is derived from the matrix's own
 * TESTS / GROUPS data, so it works on the template and on any generated round.
 *
 * ⚠ It does NOT judge test CONTENT. Whether a step is human-executable, whether
 * a named control exists, and whether an auto_note cites a real spec are all
 * human review items. See UAT_STRATEGY.md §5.
 *
 * Exits 0 when every check passes, 1 otherwise.
 */
const fs = require('fs');
const path = require('path');

let JSDOM;
try {
  ({ JSDOM } = require('jsdom'));
} catch (e) {
  console.error(
    'jsdom is required. It ships as a vitest transitive dependency; run `npm install` first.',
  );
  process.exit(2);
}

const target = process.argv[2];
if (!target) {
  console.error('usage: node tools/verify-uat-matrix.cjs <path-to-matrix.html>');
  process.exit(2);
}
const html = fs.readFileSync(path.resolve(target), 'utf8');

let passed = 0;
let failed = 0;
const check = (name, cond, detail) => {
  if (cond) {
    passed++;
    console.log(`  ok   ${name}`);
  } else {
    failed++;
    console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`);
  }
};

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  url: 'https://havdm.local/uat',
  pretendToBeVisual: true,
});
const { window } = dom;
const { document } = window;

// Capture downloads. jsdom's Blob has no .text(), so keep the source parts.
const downloads = [];
const NativeBlob = window.Blob;
window.Blob = function (parts, opts) {
  const b = new NativeBlob(parts, opts);
  b.__text = (parts || []).join('');
  return b;
};
window.URL.createObjectURL = (blob) => {
  downloads.push({ type: blob.type, text: blob.__text });
  return 'blob:stub';
};
window.HTMLAnchorElement.prototype.click = function () {
  if (this.download && downloads.length) downloads[downloads.length - 1].name = this.download;
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const txt = (s) => ($(s) ? $(s).textContent.trim() : null);

// ── Derive expectations from the matrix's own data ──────────────
const TESTS = window.eval('TESTS');
const GROUPS = window.eval('GROUPS');
const ROUND_ID = window.eval('ROUND_ID');
const ROUND_KEY = window.eval('ROUND_KEY');

console.log(`\nVerifying: ${target}`);
console.log(`Round: ${ROUND_ID} — ${TESTS.length} tests in ${GROUPS.length} group(s)\n`);

console.log('=== STRUCTURE ===');
check(
  'every group rendered',
  $$('.group').length === GROUPS.length,
  `${$$('.group').length}/${GROUPS.length}`,
);
check(
  'every test rendered as a card',
  $$('.card').length === TESTS.length,
  `${$$('.card').length}/${TESTS.length}`,
);
check('first group open by default', $('.group-body').classList.contains('open'));
check(
  'summary total matches TESTS.length',
  txt('#cnt-total') === String(TESTS.length),
  `got ${txt('#cnt-total')}`,
);
check('all tests start untested', txt('#cnt-untested') === String(TESTS.length));
check('acceptance chip starts blocked', $('#acceptance-chip').className === 'blocked');

const autoCount = TESTS.filter((t) => t.auto_covered).length;
check(
  'AUTO badge on exactly the auto_covered tests',
  $$('.badge-auto').length === autoCount,
  `${$$('.badge-auto').length}/${autoCount}`,
);
check('note banner on exactly the auto_covered tests', $$('.auto-note').length === autoCount);
check(
  'every auto_covered test supplies an auto_note',
  TESTS.filter((t) => t.auto_covered && !t.auto_note).length === 0,
  TESTS.filter((t) => t.auto_covered && !t.auto_note)
    .map((t) => t.id)
    .join(', '),
);

const haTests = TESTS.filter((t) => t.needsHA);
check('live-HA badge on exactly the needsHA tests', $$('.badge-ha').length === haTests.length);
check('HA warning banner on exactly the needsHA tests', $$('.ha-warn').length === haTests.length);
check('expects block uses the styled list on every card', $$('ul.expects').length === TESTS.length);

check(
  'every test id appears in exactly one group',
  TESTS.every((t) => GROUPS.filter((g) => g.ids.includes(t.id)).length === 1),
);
check(
  'no group references an unknown test id',
  GROUPS.every((g) => g.ids.every((id) => TESTS.some((t) => t.id === id))),
);
check('test ids are unique', new Set(TESTS.map((t) => t.id)).size === TESTS.length);
check(
  'every test declares steps and expects',
  TESTS.every(
    (t) => Array.isArray(t.steps) && t.steps.length && Array.isArray(t.expects) && t.expects.length,
  ),
);
check(
  'every test uses a known type',
  TESTS.every((t) => ['gate', 'edge', 'interaction', 'fidelity'].includes(t.type)),
);

// ── Verdict wiring ──────────────────────────────────────────────
console.log('\n=== VERDICTS + SEVERITY GATING ===');
// Drive the Fail path through a test whose steps carry inline HTML where one
// exists, so the issues-payload HTML stripping is genuinely exercised rather
// than passing by absence.
const hasMarkup = (t) =>
  (t.steps || []).concat(t.expects || []).some((s) => /<[a-z]+[\s>]/i.test(s));
const first = TESTS.find(hasMarkup) || TESTS[0];
const firstCard = $(`.card[data-id="${first.id}"]`);
const btn = (card, v) => card.querySelector(`.btn-verdict[data-verdict="${v}"]`);
const click = (el) => el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

click(btn(firstCard, 'pass'));
check('Pass updates the summary bar', txt('#cnt-pass') === '1');
check(
  'Pass updates the card dot',
  firstCard.querySelector('.status-dot').classList.contains('dot-pass'),
);
check('Pass button becomes active', btn(firstCard, 'pass').classList.contains('active'));
check(
  'severity row stays hidden on Pass',
  !firstCard.querySelector('.severity-row').classList.contains('show'),
);

click(btn(firstCard, 'fail'));
check('Fail updates the summary bar', txt('#cnt-fail') === '1');
check(
  'severity row appears on Fail',
  firstCard.querySelector('.severity-row').classList.contains('show'),
);
check(
  'an unrated Fail blocks acceptance',
  /unrated/.test(txt('#acceptance-chip')),
  txt('#acceptance-chip'),
);

const sev = firstCard.querySelector(`select[data-severity="${first.id}"]`);
const setSev = (v) => {
  sev.value = v;
  sev.dispatchEvent(new window.Event('change', { bubbles: true }));
};
setSev('high');
check(
  'a High-severity defect blocks acceptance',
  /High/.test(txt('#acceptance-chip')),
  txt('#acceptance-chip'),
);
setSev('low');
check(
  'a rated non-High Fail does not block on severity',
  !/unrated|High/.test(txt('#acceptance-chip')),
);

// Give every OTHER test a verdict so the untested blocker clears. Must exclude
// `first` by id, not by index — `first` is not necessarily TESTS[0].
TESTS.filter((t) => t.id !== first.id).forEach((t) =>
  click(btn($(`.card[data-id="${t.id}"]`), 'pass')),
);
check(
  'clearing all untested unblocks the chip',
  $('#acceptance-chip').className === 'ok',
  txt('#acceptance-chip'),
);

// ── Persistence ─────────────────────────────────────────────────
console.log('\n=== PERSISTENCE ===');
const ta = firstCard.querySelector(`textarea[data-notes="${first.id}"]`);
ta.value = 'Observed: pipe | char and newline\nsecond line';
ta.dispatchEvent(new window.Event('input', { bubbles: true }));
const ls = (suffix) =>
  JSON.parse(window.localStorage.getItem(`havdm_uat_${ROUND_KEY}_${suffix}`) || '{}');
check('notes persist to localStorage', ls('notes')[first.id].startsWith('Observed'));
check('verdicts persist to localStorage', ls('current')[first.id] === 'fail');
check('severity persists to localStorage', ls('severity')[first.id] === 'low');
check(
  'storage keys are namespaced to the round',
  window.localStorage.key(0).startsWith(`havdm_uat_${ROUND_KEY}_`),
);

// ── Export -> clear -> import ───────────────────────────────────
console.log('\n=== EXPORT / CLEAR / IMPORT ROUND-TRIP ===');
window.confirm = () => true;
click($('#btn-export'));
const exported = downloads.find((d) => d.type === 'application/json');
check('export produces a session JSON', !!exported);
check(
  'session filename is well formed',
  exported && /^uat_session_.+_\d{4}-\d{2}-\d{2}\.json$/.test(exported.name),
  exported && exported.name,
);

const payload = JSON.parse(exported.text);
check('export carries verdicts', payload.current[first.id] === 'fail');
check('export carries notes', !!payload.currentNotes[first.id]);
check('export carries severity', payload.currentSeverity[first.id] === 'low');
check('export carries round identity', payload.round === ROUND_ID);

click($('#btn-clear-state'));
check('Clear all resets verdicts', txt('#cnt-untested') === String(TESTS.length));
check(
  'Clear all resets notes',
  document.querySelector(`textarea[data-notes="${first.id}"]`).value === '',
);

const file = new window.File([exported.text], 'session.json', { type: 'application/json' });
const input = $('#import-file-input');
Object.defineProperty(input, 'files', { value: [file], configurable: true });
input.dispatchEvent(new window.Event('change', { bubbles: true }));

setTimeout(() => {
  check('import restores verdicts', txt('#cnt-fail') === '1', `got ${txt('#cnt-fail')}`);
  check(
    'import restores notes',
    document.querySelector(`textarea[data-notes="${first.id}"]`).value.startsWith('Observed'),
  );
  check(
    'import restores severity',
    document.querySelector(`select[data-severity="${first.id}"]`).value === 'low',
  );

  // ── Teardown gate ─────────────────────────────────────────────
  console.log('\n=== LIVE-HA TEARDOWN GATE (UAT_STRATEGY §10) ===');
  if (haTests.length === 0) {
    console.log('  skip  no needsHA tests in this matrix — gate not exercised');
  } else {
    window.localStorage.removeItem(`havdm_uat_${ROUND_KEY}_teardown`);
    let prompted = false;
    window.confirm = (msg) => {
      prompted = /TEARDOWN/.test(msg);
      return false;
    };
    downloads.length = 0;
    click($('#defect-summary-btn'));
    check('teardown prompt fires when a live-HA test has a verdict', prompted);
    check(
      'report is BLOCKED when teardown is declined',
      downloads.length === 0,
      `${downloads.length} download(s)`,
    );
    window.confirm = () => true;
  }

  // ── Report ────────────────────────────────────────────────────
  console.log('\n=== SUMMARY REPORT ===');
  downloads.length = 0;
  click($('#defect-summary-btn'));
  const report = downloads.find((d) => d.type === 'text/markdown');
  check('summary report generated', !!report);
  const md = report ? report.text : '';
  check(
    'report filename is well formed',
    report && /^uat_summary_.+_\d{4}-\d{2}-\d{2}\.md$/.test(report.name),
    report && report.name,
  );
  check('report names the round', md.includes(`— ${ROUND_ID}:`));
  check('report carries the acceptance check', md.includes('## Acceptance check'));
  check(
    'report reports the High-severity criterion',
    /Zero open High-severity defects \|/.test(md),
  );
  check('report reports the Untested criterion', /No test left Untested \|/.test(md));
  check('report reports the severity-rating criterion', /Every Fail has a severity \|/.test(md));
  check('report has a failed-tests section', md.includes('## Failed tests'));
  check(
    'report has an uncovered-failure section',
    md.includes('## Failed tests without automated coverage'),
  );
  // The regression mandate is only printed when there IS an uncovered failure.
  const uncoveredFailed = TESTS.some(
    (t) => !t.auto_covered && window.eval('state')[t.id] === 'fail',
  );
  if (uncoveredFailed) {
    check('report cites the regression mandate', /UAT_STRATEGY\.md.*§7/.test(md));
  } else {
    check(
      'uncovered-failure section reports None when all failures are covered',
      /automated coverage\n\n_None\._/.test(md),
    );
  }
  check('pipes in notes are escaped', md.includes('\\|'));
  check('newlines in notes are flattened', !/Observed:[^|]*\n[^|]*\|/.test(md));
  check(
    'every test appears in the report',
    TESTS.every((t) => md.includes(t.id)),
  );

  // ── Issues payload ────────────────────────────────────────────
  console.log('\n=== ISSUES PAYLOAD ===');
  downloads.length = 0;
  click($('#issues-script-btn'));
  const sh = downloads.find((d) => d.type === 'text/x-shellscript');
  check('issues payload generated for failed tests', !!sh);
  const shText = sh ? sh.text : '';
  check('payload requires owner authorisation', /explicit authorisation/.test(shText));
  check('payload warns it is not idempotent', /NOT IDEMPOTENT/.test(shText));
  check('payload carries a severity label', /severity:/.test(shText));
  check('payload targets the HAVDM repo', /BaggyG-AU\/HA_Visual_Dashboard_Maker/.test(shText));
  // Scope the HTML check to the sections built from steps/expects — the rest of
  // the script legitimately contains paths and placeholders.
  const authored = (
    shText.match(/## (Expected|Steps to reproduce)\n[\s\S]*?(?=\n## |\n$)/g) || []
  ).join('\n');
  check(
    'payload strips HTML from steps and expects',
    authored.length > 0 && !/<[a-z]+>/i.test(authored),
  );

  console.log('\n' + '='.repeat(46));
  console.log(`RESULT: ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}, 150);
