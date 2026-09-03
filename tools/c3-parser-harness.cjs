#!/usr/bin/env node
/**
 * PRE-CODE HARNESS for the C3 parser remediation
 * (`docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md`, revision 2).
 *
 * ⚠⚠⚠ THIS FILE EXISTS BECAUSE THE REVISION-1 EVIDENCE WAS NOT REVIEWABLE
 * (review finding P5). Revision 1 claimed "30 ok, 0 FAIL" from a prototype that
 * was deleted under the delete-every-probe discipline, so the plan's strongest
 * assurance could not be reproduced by the reviewer or by a later audit. The
 * mechanism, the literal fixtures, the expectations and their provenance are
 * therefore COMMITTED here, and the transcript is pasted into the plan's §2.10.
 *
 * ⚠ IT IS NOT A TEST AND NOTHING IMPORTS IT. It models the PROPOSED mechanism
 * so the design can be attacked before `tests/support/planConsistency.ts` is
 * touched. When the repair lands, these cases become committed controls in
 * `tests/unit/planConsistency.spec.ts` and this file is deleted.
 *
 *   node tools/c3-parser-harness.cjs
 *
 * ⭐ THE POPULATION IS GENERATED FROM THE HOST GRAMMARS, NOT FROM THE REVIEW.
 * Each case names the CommonMark or YAML rule it comes from; the reference
 * parsers (`marked` for Markdown, `yaml` for YAML) decide the grammar facts,
 * and the specification decides the expected verdict. Cases marked `codex Pn`
 * were contributed by the round-3 plan review and are the floor, not the
 * population.
 */
const fs = require('node:fs');
const { marked } = require('marked');
const { parseDocument, isMap } = require('yaml');

const MARKER = '# plan-running-totals';
const MARKER_TEXT = 'plan-running-totals';
const GOVERNED = ['review_rounds_complete', 'reviewer_findings', 'findings_after_round_one'];

// ---------------------------------------------------------------------------
// The proposed mechanism.
// ---------------------------------------------------------------------------

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (s) =>
  s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, c) => String.fromCodePoint(parseInt(c, 16)))
    .replace(/&#(\d+);/g, (_, c) => String.fromCodePoint(parseInt(c, 10)))
    .replace(/&([a-zA-Z]+);/g, (m, n) => ENTITIES[n.toLowerCase()] ?? m);

/**
 * READER-VISIBLE TEXT of a heading (review finding P3, owner ruling 2026-09-03).
 *
 * ⚠⚠ `heading.text` IS SOURCE MARKUP, NOT WHAT A READER SEES. `# **x**` has
 * `text` of `**x**`, so an equality test against the marker misses a bold,
 * struck, code-spanned, linked or character-referenced heading that renders
 * IDENTICALLY to the prohibited one. The projection below is the contract:
 * every inline role states what it contributes, so the boundary is decided
 * rather than inherited from a token field.
 */
function visibleText(tokens) {
  let out = '';
  for (const t of tokens ?? []) {
    switch (t.type) {
      case 'text':
        out += t.tokens?.length ? visibleText(t.tokens) : decode(t.text ?? '');
        break;
      case 'escape':
      case 'codespan':
        out += t.text ?? '';
        break;
      case 'strong':
      case 'em':
      case 'del':
      case 'link':
        out += t.tokens?.length ? visibleText(t.tokens) : decode(t.text ?? '');
        break;
      case 'br':
        out += ' ';
        break;
      // `image` contributes NOTHING: a reader sees a picture, not the alt
      // attribute. `html` contributes nothing: raw inline HTML is not text.
      // Both are DELIBERATE residuals, pinned by KNOWN-OPEN cases below.
      default:
        break;
    }
  }
  return out.replace(/\s+/g, ' ').trim();
}

function walk(tokens, out) {
  for (const t of tokens ?? []) {
    if (t.type === 'code') {
      // ⚠ A `code` TOKEN IS NOT NECESSARILY A FENCED BLOCK (review finding P2).
      // `marked` gives four-space indented blocks the same token type and
      // distinguishes them ONLY by `codeBlockStyle`. The contract says FENCED.
      if (t.codeBlockStyle === 'indented') continue;
      if ((t.text ?? '').split('\n')[0] === MARKER) out.canonical.push(t);
      continue; // code content is never a container
    }
    if (t.type === 'html') continue; // comments and raw blocks declare nothing
    if (t.type === 'heading' && t.depth === 1 && visibleText(t.tokens) === MARKER_TEXT) {
      out.stray.push(t.raw.trim());
    }
    if (t.type === 'blockquote') walk(t.tokens, out);
    else if (t.type === 'list') for (const it of t.items ?? []) walk(it.tokens, out);
  }
}

/** @returns {string[]} empty when the plan's canonical home is valid. */
function c3(spec) {
  const out = { canonical: [], stray: [] };
  walk(marked.lexer(spec), out);
  const bad = [];
  if (out.stray.length) bad.push(`${out.stray.length} shadow-home heading(s)`);
  if (out.canonical.length !== 1) {
    bad.push(`found ${out.canonical.length} canonical blocks (expected 1)`);
    return bad;
  }
  // ⚠ `stringKeys: true` IS LOAD-BEARING (review finding P4). Without it an
  // ALIAS used as a key — `&k review_rounds_complete: 7` then `*k : 8` — raises
  // no error, counts as one key, and lets the later value silently win.
  const doc = parseDocument(out.canonical[0].text, { uniqueKeys: true, stringKeys: true });
  if (doc.errors.length) {
    bad.push(`YAML: ${[...new Set(doc.errors.map((e) => e.code))].join(',')}`);
    return bad;
  }
  if (!isMap(doc.contents)) {
    bad.push('payload is not a top-level mapping');
    return bad;
  }
  const pairs = doc.contents.items.map((p) => [String(p.key.value ?? p.key), p.value]);
  for (const key of GOVERNED) {
    const hits = pairs.filter(([k]) => k === key);
    if (hits.length !== 1) {
      bad.push(`\`${key}\` x${hits.length} (expected 1)`);
      continue;
    }
    // Review finding P7, owner ruling: a running TOTAL must be a count.
    const v = hits[0][1]?.value;
    if (!Number.isInteger(v) || v < 0) {
      bad.push(`\`${key}\` is not a non-negative integer (${JSON.stringify(v ?? null)})`);
    }
  }
  return bad;
}

// ---------------------------------------------------------------------------
// The population. `must` is decided by the cited specification, never by the
// mechanism above.
// ---------------------------------------------------------------------------

const KEYS = ['review_rounds_complete: 7', 'reviewer_findings: 30', 'findings_after_round_one: 24'];
const fence = (body, open = '```yaml', close = '```') => [open, MARKER, ...body, close].join('\n');
const GOOD = fence(KEYS);
const WIRED = ['```ts', 'private async a(): Promise<void> { await this.b(); }', '```'].join('\n');
const doc = (...parts) => `${WIRED}\n\n${parts.join('\n\n')}\n`;

/** @type {[string, string, 'valid'|'invalid', string][]} */
const CASES = [
  ['well-formed canonical block', doc(GOOD), 'valid', 'control'],

  // --- fence forms: CommonMark §4.5 --------------------------------------
  ['tilde fence', doc(fence(KEYS, '~~~yaml', '~~~')), 'valid', 'CommonMark 4.5'],
  ['four-backtick fence', doc(fence(KEYS, '````yaml', '````')), 'valid', 'CommonMark 4.5'],
  ['untagged fence (no info string)', doc(fence(KEYS, '```', '```')), 'valid', 'CommonMark 4.5'],
  [
    'fence indented three spaces (legal)',
    doc(['   ```yaml', `   ${MARKER}`, ...KEYS.map((k) => `   ${k}`), '   ```'].join('\n')),
    'valid',
    'CommonMark 4.5',
  ],
  ['backtick in the info string', doc(fence(KEYS, '```yaml`', '```')), 'invalid', 'CommonMark 4.5'],
  [
    'TAB before the opening fence',
    doc(['\t```yaml', MARKER, ...KEYS, '\t```'].join('\n')),
    'invalid',
    'codex S2 / CommonMark 4.5',
  ],
  [
    'closer NARROWER than opener (4 open, 3 close)',
    doc(fence(KEYS, '````yaml', '```')),
    'invalid',
    'codex P1 / CommonMark 4.5',
  ],
  [
    'closer WIDER than opener (3 open, 4 close)',
    doc(fence(KEYS, '```yaml', '````')),
    'valid',
    'codex P1 / CommonMark 4.5',
  ],
  [
    'closer of the WRONG CHARACTER (backtick open, tilde close)',
    doc(fence(KEYS, '```yaml', '~~~')),
    'invalid',
    'codex P1 / CommonMark 4.5',
  ],
  [
    'closer OVER-INDENTED four spaces',
    doc(['```yaml', MARKER, ...KEYS, '    ```'].join('\n'), 'Trailing prose paragraph.'),
    'invalid',
    'codex P1 / CommonMark 4.5',
  ],
  [
    'KNOWN-OPEN: unclosed fence at END OF FILE is a valid block',
    `${WIRED}\n\n${['```yaml', MARKER, ...KEYS].join('\n')}`,
    'valid',
    'CommonMark 4.5 (departure DROPPED, owner ruling)',
  ],
  [
    'unclosed fence SWALLOWS the rest of the document',
    `${WIRED}\n\n${['```yaml', MARKER, ...KEYS].join('\n')}\n\n## A later section\n\nOrdinary prose.\n`,
    'invalid',
    'CommonMark 4.5 (the swallow risk, caught by YAML)',
  ],

  // --- leaf-block subtype: CommonMark §4.4 vs §4.5 -----------------------
  [
    'INDENTED code block alone is not a fenced block',
    doc([MARKER, ...KEYS].map((l) => `    ${l}`).join('\n')),
    'invalid',
    'codex P2 / CommonMark 4.4',
  ],
  [
    'INDENTED example beside a valid fence is ignored',
    doc(GOOD, [MARKER, 'review_rounds_complete: 99'].map((l) => `    ${l}`).join('\n')),
    'valid',
    'codex P2 / CommonMark 4.4',
  ],

  // --- containers: CommonMark §5.1, §5.2 ---------------------------------
  [
    'second canonical block in a BLOCK QUOTE',
    doc(GOOD, ['> ```yaml', `> ${MARKER}`, '> review_rounds_complete: 99', '> ```'].join('\n')),
    'invalid',
    'CommonMark 5.1',
  ],
  [
    'second canonical block in a LIST ITEM',
    doc(GOOD, `- item\n\n  \`\`\`yaml\n  ${MARKER}\n  review_rounds_complete: 99\n  \`\`\``),
    'invalid',
    'CommonMark 5.2',
  ],
  ['unfenced marker in a BLOCK QUOTE', doc(GOOD, `> ${MARKER}`), 'invalid', 'CommonMark 5.1'],
  ['unfenced marker in a LIST ITEM', doc(GOOD, `- ${MARKER}`), 'invalid', 'CommonMark 5.2'],
  [
    'unfenced marker in a NESTED block quote',
    doc(GOOD, `> > ${MARKER}`),
    'invalid',
    'CommonMark 5.1',
  ],

  // --- heading forms: CommonMark §4.2, §4.3, §6 --------------------------
  ['plain ATX shadow home', doc(GOOD, MARKER), 'invalid', 'CommonMark 4.2'],
  [
    'SETEXT shadow home',
    doc(GOOD, `${MARKER_TEXT}\n${'='.repeat(19)}`),
    'invalid',
    'CommonMark 4.3',
  ],
  ['ATX with a closing # sequence', doc(GOOD, `${MARKER} #`), 'invalid', 'CommonMark 4.2'],
  ['BOLD shadow home', doc(GOOD, `# **${MARKER_TEXT}**`), 'invalid', 'codex P3 / CommonMark 6'],
  [
    'CODE-SPAN shadow home',
    doc(GOOD, `# \`${MARKER_TEXT}\``),
    'invalid',
    'codex P3 / CommonMark 6',
  ],
  ['STRIKETHROUGH shadow home', doc(GOOD, `# ~~${MARKER_TEXT}~~`), 'invalid', 'codex P3 / GFM'],
  [
    'REFERENCE-LINK shadow home',
    doc(GOOD, `# [${MARKER_TEXT}][t]`, '[t]: https://example.invalid'),
    'invalid',
    'codex P3 / CommonMark 6',
  ],
  [
    'CHARACTER-REFERENCE shadow home',
    doc(GOOD, '# plan&#x2D;running-totals'),
    'invalid',
    'codex P3 / CommonMark 6',
  ],
  [
    'formatted SETEXT shadow home',
    doc(GOOD, `**${MARKER_TEXT}**\n${'='.repeat(19)}`),
    'invalid',
    'codex P3 / CommonMark 4.3',
  ],
  [
    'CONTROL: a formatted heading that is NOT the marker',
    doc(GOOD, '# **other-running-totals**'),
    'valid',
    'codex P3',
  ],
  [
    'CONTROL: level-2 heading with the marker text is not a home',
    doc(GOOD, `## ${MARKER_TEXT}`),
    'valid',
    'CommonMark 4.2',
  ],
  [
    'CONTROL: `#plan-running-totals` with no space is not a heading',
    doc(GOOD, `#${MARKER_TEXT}`),
    'valid',
    'CommonMark 4.2',
  ],
  [
    'KNOWN-OPEN: an IMAGE heading contributes no visible text',
    doc(GOOD, `# ![${MARKER_TEXT}](i.png)`),
    'valid',
    'CommonMark 6 (declared residual)',
  ],
  [
    'CONTROL: marker in an inline code span (live plan, line 14)',
    doc(GOOD, `The figures are in the \`${MARKER_TEXT}\` block.`),
    'valid',
    'CommonMark 6.1',
  ],
  [
    'CONTROL: marker inside an HTML comment',
    doc(GOOD, `<!--\n${MARKER}\nDocumentation, not a home.\n-->`),
    'valid',
    'codex S3 / CommonMark 4.6',
  ],

  // --- payload: YAML 1.2 --------------------------------------------------
  ['empty payload', doc(fence([])), 'invalid', 'grammar'],
  [
    'FLOW-MAPPING payload',
    doc(
      fence(['{ review_rounds_complete: 7, reviewer_findings: 30, findings_after_round_one: 24 }']),
    ),
    'valid',
    'YAML 7.4',
  ],
  [
    'SEQUENCE payload (root is not a mapping)',
    doc(fence(KEYS.map((k) => `- ${k}`))),
    'invalid',
    'YAML 8.2',
  ],
  [
    'malformed YAML payload',
    doc(fence(['review_rounds_complete: [7', ...KEYS.slice(1)])),
    'invalid',
    'YAML',
  ],
  [
    'MULTI-DOCUMENT payload',
    doc(fence([...KEYS, '---', 'review_rounds_complete: 99'])),
    'invalid',
    'YAML 9.1',
  ],
  [
    'governed keys NESTED one level deep',
    doc(fence(['totals:', ...KEYS.map((k) => `  ${k}`)])),
    'invalid',
    'YAML 8.2',
  ],
  [
    'governed key COMMENTED OUT',
    doc(fence([`# ${KEYS[0]}`, ...KEYS.slice(1)])),
    'invalid',
    'YAML 8.1',
  ],
  [
    'key-shaped text inside a BLOCK SCALAR',
    doc(fence(['notes: |', ...KEYS.map((k) => `  ${k}`)])),
    'invalid',
    'codex S1 / YAML 8.1',
  ],
  [
    'CONTROL: real keys PLUS a scalar mentioning one',
    doc(fence([...KEYS, 'notes: |', '  review_rounds_complete: 6'])),
    'valid',
    'codex S1 / YAML 8.1',
  ],
  [
    'QUOTED duplicate key',
    doc(fence([...KEYS, '"review_rounds_complete": 999'])),
    'invalid',
    'YAML dup',
  ],
  ['duplicate key with the SAME value', doc(fence([...KEYS, KEYS[0]])), 'invalid', 'YAML dup'],
  [
    'ALIAS used as a duplicate key',
    doc(fence([`&k ${KEYS[0]}`, '*k : 8', ...KEYS.slice(1)])),
    'invalid',
    'codex P4 / YAML 7.1',
  ],
  [
    'CONTROL: a key that merely CONTAINS a governed key',
    doc(fence([...KEYS, 'x_reviewer_findings: 1'])),
    'valid',
    'YAML',
  ],

  // --- values: the owner's P7 ruling -------------------------------------
  [
    'STRING value',
    doc(fence(['review_rounds_complete: bananas', ...KEYS.slice(1)])),
    'invalid',
    'codex P7',
  ],
  [
    'NEGATIVE value',
    doc(fence(['review_rounds_complete: -1', ...KEYS.slice(1)])),
    'invalid',
    'codex P7',
  ],
  [
    'NULL value',
    doc(fence(['review_rounds_complete: null', ...KEYS.slice(1)])),
    'invalid',
    'codex P7',
  ],
  [
    'SEQUENCE value',
    doc(fence(['review_rounds_complete: [7]', ...KEYS.slice(1)])),
    'invalid',
    'codex P7',
  ],
  [
    'FLOAT value',
    doc(fence(['review_rounds_complete: 7.5', ...KEYS.slice(1)])),
    'invalid',
    'codex P7',
  ],
  [
    'CONTROL: zero is a legitimate total',
    doc(fence(['review_rounds_complete: 0', ...KEYS.slice(1)])),
    'valid',
    'codex P7',
  ],
];

// ---------------------------------------------------------------------------

let ok = 0;
const failures = [];
console.log('| Must be | Case | Provenance | Mechanism said |');
console.log('| ------- | ---- | ---------- | -------------- |');
for (const [label, text, must, provenance] of CASES) {
  const bad = c3(text);
  const got = bad.length === 0 ? 'valid' : 'invalid';
  const pass = got === must;
  pass ? ok++ : failures.push(`${label} — expected ${must}, got ${got} (${bad.join('; ') || '-'})`);
  console.log(
    `| ${pass ? '' : '**FAIL** '}${must} | ${label} | ${provenance} | ${bad.join('; ') || 'clean'} |`,
  );
}
console.log(`\n${ok} ok, ${failures.length} FAIL (of ${CASES.length})`);
for (const f of failures) console.log(`  FAIL: ${f}`);

const plan = fs.readFileSync('docs/testing/SPACING_HELPER_PRESET_PLAN.md', 'utf8');
const live = c3(plan);
console.log(`\nLIVE PLAN -> ${live.length === 0 ? 'VALID (clean)' : `BLOCKS: ${live.join('; ')}`}`);
process.exit(failures.length === 0 && live.length === 0 ? 0 : 1);
