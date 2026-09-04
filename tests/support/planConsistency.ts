/**
 * Consistency checks for long-lived governed plan documents.
 *
 * WHY THIS EXISTS, MEASURED AS AT REVISION 6 OF
 * `docs/testing/SPACING_HELPER_PRESET_PLAN.md` (2026-08-31) AND DELIBERATELY NOT
 * MAINTAINED HERE: review of that plan had by then raised the great majority of
 * its findings against defects introduced by the previous round's own repairs.
 * ⚠ The live figures are stated ONCE, in that plan's own cost section — this
 * comment pins a moment rather than carrying a second copy of a running total,
 * which is the exact defect C3 below exists to catch.
 *
 * The measured cause was structural: `tools/checks` gates code with eslint,
 * prettier, tsc and vitest, while the plan — the artifact carrying every one of
 * those defects — was checked by nothing but a formatter.
 *
 * These checks are therefore keyed on the classes that ACTUALLY BIT, not on a
 * general notion of document tidiness. Each one names the finding it comes from.
 *
 * ⚠⚠ THE MOST IMPORTANT PROPERTY OF THIS MODULE IS THAT IT CAN STILL FAIL.
 * While it was being written, the orphan check was silently DEAD for one
 * iteration — a mis-escaped pattern parsed nothing and reported a clean pass.
 * That is why `checkPlan` throws if it cannot parse any declaration, and why the
 * accompanying spec drives every check with known-bad input rather than only
 * asserting that the real document is clean.
 */

import { marked, type Token, type Tokens } from 'marked';
import { decodeHTML } from 'entities';
import { parseDocument, isMap, isAlias, isScalar, Parser as YamlParser, type CST } from 'yaml';

export interface PlanFinding {
  /** Stable code, e.g. `C1-ORPHAN`. */
  code: string;
  /** What is wrong, in the plan author's terms. */
  message: string;
  /**
   * ADVISORY findings are reported but never block.
   *
   * ⭐⭐⭐ Owner ruling 2026-09-03, after the independent review measured that
   * C3's prose matching is simultaneously too blind and too loud. A check that
   * cannot decide its property must not hold a gate: the DECIDABLE half of C3
   * (exactly one marked `plan-running-totals` block) blocks, and the HEURISTIC
   * half (prose frames) advises. ⚠ This narrows C3's claim rather than growing
   * another regex — `if your fix for a proxy is a better proxy, you have not
   * fixed it`.
   */
  advisory?: boolean;
}

/** The findings that FAIL a gate. Advisory findings are diagnostics only. */
export const blockingFindings = (f: readonly PlanFinding[]): PlanFinding[] =>
  f.filter((x) => !x.advisory);

/** The findings that are REPORTED but never fail a gate. */
export const advisoryFindings = (f: readonly PlanFinding[]): PlanFinding[] =>
  f.filter((x) => Boolean(x.advisory));

/**
 * Surface every advisory finding, and return how many were surfaced.
 *
 * ⚠⚠⚠ THIS EXISTS BECAUSE "ADVISORY" MEANT "SILENTLY DISCARDED" (review R2).
 * The contract said advisories are "reported but never block". `blockingFindings`
 * delivered the second half and nothing delivered the first: the only consumer
 * filtered them out and asserted on the remainder, so an advisory reached no
 * human at all. A NON-BLOCKING FINDING IS NOT A DELIVERED ADVISORY MERELY
 * BECAUSE A HELPER RETURNS IT — some real consumer must surface it on a PASSING
 * run, and a control must exercise that consumer, not the producer.
 *
 * `log` is injectable so the delivery path itself is testable.
 */
export function reportAdvisories(
  findings: readonly PlanFinding[],
  log: (message: string) => void = console.warn,
): number {
  const advisories = advisoryFindings(findings);
  for (const a of advisories) log(`[planConsistency ADVISORY] ${a.code}: ${a.message}`);
  return advisories.length;
}

export interface PlanSources {
  /** The specification document. */
  spec: string;
  /** The companion review-history document, if the plan has been split. */
  history?: string;
  /** The live DSL, so a method called only from real code is not "orphaned". */
  dsl?: string;
}

const UNITS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
};

const TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

const ORDINALS: Record<string, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  tenth: 10,
};

/**
 * Parse a number written as digits, a word, an ordinal, or a hyphenated
 * compound.
 *
 * ⚠⚠ THE COMPOUND CASE IS WHY THIS FUNCTION EXISTS. Its predecessor was a
 * single flat map capped at `twenty`, read through a `\w+` capture that cannot
 * span a hyphen — so "twenty-four" parsed as **4**, "twenty-six" as **6** and
 * "twenty-one" as **1**. That is a FALSE ACCEPT, not a miss: the plan's own
 * "twenty-four findings" was held as 4, so a stray "four findings" anywhere
 * would have AGREED with it and the check would have certified a 24-vs-4
 * contradiction as clean.
 */
const numberFrom = (raw: string): number => {
  const t = raw.toLowerCase();
  if (/^\d+$/.test(t)) return Number(t);
  if (t in UNITS) return UNITS[t];
  if (t in TENS) return TENS[t];
  if (t in ORDINALS) return ORDINALS[t];
  const compound = /^([a-z]+)-([a-z]+)$/.exec(t);
  if (compound) {
    const tens = TENS[compound[1]];
    const unit = UNITS[compound[2]];
    if (tens !== undefined && unit !== undefined && unit < 10) return tens + unit;
  }
  return NaN;
};

/** A real method declaration — not a mention of one in prose. */
const DECL =
  /^[ \t]*(?:private[ \t]+)?(?:static[ \t]+)?(?:async[ \t]+)?([a-z]\w*)[ \t]*\([^;{]*?\)[ \t]*:[ \t]*(?:Promise<|Locator|Record<|string|number|boolean|void)/gm;

const stripComments = (s: string): string =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');

const codeBlocks = (s: string): string =>
  [...s.matchAll(/```ts\n([\s\S]*?)```/g)].map((m) => m[1]).join('\n');

/**
 * Drop markdown emphasis markers before frame matching.
 *
 * ⚠ MEASURED NECESSARY, not defensive: this document emphasises the very words
 * the frames key on, and `the **fourth** review round` does not match a frame
 * written as `the <number> review round` while the asterisks are still there.
 * Only `*` is removed — `_` is left alone because it appears inside real
 * identifiers in this corpus (`card_margin`, `expected-failures`).
 */
const stripEmphasis = (line: string): string => line.replace(/\*/g, '');

/**
 * Blank out quoted and code spans across the WHOLE document, preserving line
 * breaks so line numbers stay exact.
 *
 * A quoted or code-spanned figure is being CORRECTED or ILLUSTRATED, not
 * asserted, so it is exempt.
 *
 * ⚠ MEASURED NECESSARY, twice. This replaces a per-LINE quote stripper that
 * could not see a quotation the formatter WRAPPED ACROSS A LINE BREAK — it
 * paired the closing quote of one phrase with the opening quote of the next and
 * exempted the wrong span — and that did not treat a backtick code span as
 * quoted at all. Both showed up as false positives against a document that was
 * merely DESCRIBING the drift it had just fixed. ⚠ A noisy check gets ignored,
 * and an ignored check is worse than none.
 *
 * ⓘ The old per-line helper was left in place for one iteration after this
 * replaced it, defined and never called — the C1-ORPHAN class, inside the
 * checker that exists to catch it. It is deleted rather than kept "just in
 * case".
 *
 * ⓘ An unbalanced quote pairs with the next one and so exempts more than it
 * should. That fails toward SILENCE, which is the pre-existing behaviour and is
 * stated here rather than left to be discovered.
 */
const blankSpans = (text: string): string =>
  text.replace(/"[^"]*"|“[^”]*”|`[^`]*`/g, (m) => m.replace(/[^\n]/g, ' '));

export function checkPlan({ spec, history = '', dsl = '' }: PlanSources): PlanFinding[] {
  const out: PlanFinding[] = [];
  const add = (code: string, message: string, advisory = false) =>
    out.push(advisory ? { code, message, advisory } : { code, message });

  // ---- C1 (SP-15): a method DEFINED in a code block must have a TEXTUAL CALLER.
  // P4 once survived as a definition, an inventory row and a harness leg with no
  // call site at all — three mentions read like a wired detector.
  //
  // ⚠⚠ THE CLAIM IS "ZERO TEXTUAL CALLERS", NOT "UNREACHABLE" (F6, 2026-09-03).
  // This subtracts every `this.<name>(` occurrence, which is an INCOMING-EDGE
  // count, not graph reachability: two private methods that only call each other
  // have callers and are still unreachable from the live DSL. That case is
  // pinned by a `KNOWN-OPEN:` test rather than described in prose. Deciding real
  // reachability needs a TypeScript call graph, which this deliberately is not.
  const code = stripComments(codeBlocks(spec));
  const defined = new Set([...code.matchAll(DECL)].map((m) => m[1]));
  if (defined.size === 0) {
    throw new Error(
      'planConsistency C1 is DEAD: no method declarations were parsed from the ' +
        'spec. A check that cannot fail must never report a pass.',
    );
  }
  const called = new Set<string>([
    ...[...code.matchAll(/this\.(\w+)\(/g)].map((m) => m[1]),
    // Called only from the live DSL: factual, so no hand-maintained allowlist.
    ...[...stripComments(dsl).matchAll(/this\.(\w+)\(/g)].map((m) => m[1]),
  ]);
  for (const name of [...defined].filter((d) => !called.has(d)).sort()) {
    add(
      'C1-ORPHAN',
      `\`${name}\` is defined in a code block and has NO TEXTUAL CALLER — no ` +
        `\`this.${name}(\` appears in the plan's code blocks or in the live DSL (SP-15)`,
    );
  }

  // ---- C2 (coverage): every finding raised must have a disposition row, in
  // either document, so the split cannot hide one.
  const both = `${spec}\n${history}`;
  const raised = new Set([...both.matchAll(/\bSP-(\d+)\b/g)].map((m) => Number(m[1])));
  // ⚠ Emphasis is OPTIONAL (F5, 2026-09-03). The row `| SP-99 | … |` disposes
  // SP-99 exactly as `| **SP-99** | … |` does; boldface was never part of the
  // documented contract, and requiring it reported "no disposition row" for a
  // perfectly valid row.
  const disposed = new Set(
    [...both.matchAll(/\|\s*\*{0,2}_?SP-(\d+)_?\*{0,2}\s*\|/g)].map((m) => Number(m[1])),
  );
  for (const n of [...raised].filter((n) => !disposed.has(n)).sort((a, b) => a - b)) {
    add('C2-NODISPOSITION', `SP-${n} is referenced but has no disposition row`);
  }

  // ---- C3 (SP-5, and SP-22 TWICE): a running total must have exactly ONE home.
  //
  // ⚠⚠⚠ THIS CHECK REPORTED A CLEAN PASS OVER THE VERY DRIFT IT IS NAMED FOR.
  // Measured against revision 6 of the spacing plan: `checkPlan` returned ZERO
  // findings while the plan called it "the fourth review round" and the history
  // both stated the running totals and claimed it stated none. Three separate
  // defects produced that green, and all three are fixed here:
  //   (a) it read only `spec` — `tally(spec, …)` at BOTH call sites, with
  //       `history` never passed — so drift ACROSS the split was invisible,
  //       which is precisely the drift the split created;
  //   (b) it was anchored on two exact phrasings, so "produced 24 findings"
  //       and "the fourth review round" did not register at all;
  //   (c) its `\w+` capture could not span a hyphen — see `numberFrom`.
  //
  // ⚠⚠ IT IS NOW KEYED ON SITE COUNT, NOT ON VALUE DISAGREEMENT. The owner's
  // 2026-08-31 ruling is that a running total is stated ONCE and every other
  // mention is a pointer; two sites that happen to agree today are the SP-5 /
  // SP-22 defect one edit before it shows. A QUOTED figure stays exempt — it is
  // being corrected, not asserted.
  //
  // ⚠ THE LIMIT, STATED PLAINLY: this is an enumerated FRAME list, not a
  // semantic judgment about what a number is "about". "Option A survived two
  // review rounds" is a historical fact and not a running total, and no regex
  // decides that in general. Each frame below is therefore proved in the
  // accompanying spec against BOTH populations — the sites it must catch, and
  // the real historical prose it must leave alone.
  const FRAMES: ReadonlyArray<{ subject: string; source: string }> = [
    {
      subject: 'review-round',
      source: '\\b([\\w-]+)\\s+(?:independent\\s+)?review\\s+rounds?\\s+complete\\b',
    },
    { subject: 'review-round', source: '\\bthe\\s+([\\w-]+)\\s+review\\s+round\\b' },
    { subject: 'review-round', source: '\\bacross\\s+([\\w-]+)\\s+(?:review\\s+)?rounds?\\b' },
    { subject: 'finding', source: '\\b([\\w-]+)\\s+findings?,?\\s+none\\s+false\\b' },
    { subject: 'finding', source: '\\bproduced\\s+([\\w-]+)\\s+findings?\\b' },
  ];
  // ⭐⭐⭐ THE DECIDABLE HALF OF C3 — AND THE ONLY PART THAT BLOCKS.
  //
  // ⚠⚠⚠ THE CONTRACT (§2.1, `docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md`,
  // revision 3). A valid canonical home is EXACTLY ONE FENCED code block —
  // excluding INDENTED code blocks, at any Markdown container depth — whose
  // FIRST CONTENT LINE is exactly `# plan-running-totals`. Its content must
  // parse as a single YAML document whose root is a mapping with string keys,
  // in which each governed key appears EXACTLY ONCE, with a value that is a
  // finite non-negative integer. In addition, no level-1 Markdown heading
  // anywhere in the plan may have the READER-VISIBLE TEXT `plan-running-totals`
  // (§2.2a) — such a heading is a shadow home. Violations raise
  // `C3-NOCANONICAL`.
  //
  // ⚠⚠ THE DIALECT IS NAMED (§2.2). Markdown is GitHub Flavored Markdown as
  // implemented by `marked` 14.x (`gfm: true`, `pedantic: false` — the shipped
  // defaults, pinned by a dialect test in the spec). YAML is YAML 1.2 as
  // implemented by `yaml` 2.x, parsed with `uniqueKeys: true` AND
  // `stringKeys: true` — the second option is load-bearing: without it an
  // ALIAS used as a key raises no error, counts as one key, and lets a later
  // value silently win.
  //
  // ⚠⚠⚠ THERE IS NO CLOSURE CHECK OF ANY KIND, AND NONE IS MISSING FOR THE
  // CASES THIS REPAIR TARGETS. An unclosed fence runs to end of file, exactly
  // as CommonMark says. Ordinary swallowed prose, and deleting the live plan's
  // own closing fence, are both caught by the YAML parse below — the swallowed
  // material fails to parse as one valid mapping. ⚠ THAT IS NOT A UNIVERSAL
  // (implementation review finding P14, corrected — an earlier version of this
  // comment overstated it): swallowed content that is ITSELF valid YAML —
  // trailing `##`/`###` Markdown headings, which YAML reads as comments — stays
  // clean. That is the declared, owner-accepted residual (plan §2.7), pinned by
  // a `KNOWN-OPEN:` test, not a gap this mechanism claims to close. Hand-parsing
  // the fence delimiter to close it (review finding P1), an equality test on
  // `heading.text` that missed every formatted shadow home (P3), and a
  // three-regex character-reference decoder that threw `RangeError` and crashed
  // the whole check (P8) were each a partial parser standing in for a property
  // CommonMark or YAML already decides. All three are gone; nothing below
  // hand-parses Markdown or YAML syntax.
  //
  // ⓘ THIS REPLACES THE LINE-BASED FENCE STATE MACHINE, THE UNFENCED-MARKER
  // RAW-LINE SCAN AND THE `^\s*${key}\s*:` KEY COUNTER (review R1). A `code`
  // token is not necessarily FENCED — `marked` gives four-space-indented
  // blocks the same token type — and an unfenced `# plan-running-totals`
  // occurrence (in prose, a block quote or a list item) is itself a level-1
  // ATX heading once a real parser reads it, so it is caught by the SAME
  // shadow-home walk below rather than a separate raw-line scan.
  const GOVERNED: ReadonlyArray<{ key: string; subject: string }> = [
    { key: 'review_rounds_complete', subject: 'review-round' },
    { key: 'reviewer_findings', subject: 'finding' },
    { key: 'findings_after_round_one', subject: 'finding' },
  ];
  const MARKER = '# plan-running-totals';
  const MARKER_TEXT = 'plan-running-totals';
  const decode = decodeHTML;

  /**
   * READER-VISIBLE TEXT of a heading (§2.2a, review finding P3).
   *
   * `heading.text` is SOURCE markup, not what a reader sees: `# **x**` has a
   * `text` of `**x**`, so an equality test against the marker misses a bold,
   * struck, code-spanned, linked or character-referenced heading that renders
   * IDENTICALLY to the prohibited one. Every inline role states what it
   * contributes; `image` and inline `html` contribute nothing — deliberate
   * residuals, pinned by `KNOWN-OPEN:` tests rather than left to be found.
   */
  function visibleText(tokens: Token[] | undefined): string {
    let out = '';
    for (const t of tokens ?? []) {
      switch (t.type) {
        case 'text': {
          const kids = 'tokens' in t ? t.tokens : undefined;
          out += kids?.length ? visibleText(kids) : decode(t.text ?? '');
          break;
        }
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
        default:
          break;
      }
    }
    return out.replace(/\s+/g, ' ').trim();
  }

  /**
   * The CST `directive` tokens in `text` whose directive NAME is `%YAML` —
   * parsed once via `yaml`'s own `Parser`, shared by the two checks below.
   * Each token's span is HALF-OPEN over JavaScript UTF-16 code-unit offsets,
   * `[t.offset, t.offset + t.source.length)` — the same coordinate system
   * `yaml`'s own CST and composer use throughout (implementation review
   * finding P22: an earlier version of this comment called it a "byte range,"
   * which is wrong on two counts — the unit is code units, not bytes, so an
   * astral character shifts the two apart, and the upper bound EXCLUDES the
   * span's end rather than including it).
   */
  function yamlDirectiveTokens(text: string): CST.Directive[] {
    const tokens: CST.Directive[] = [];
    for (const token of new YamlParser().parse(text)) {
      if (token.type === 'directive' && /^%YAML(?:\s|$)/.test(token.source)) tokens.push(token);
    }
    return tokens;
  }

  /**
   * Whether the YAML parser's `warnings` contain a `BAD_DIRECTIVE` warning
   * specifically about an unsupported `%YAML` version (implementation review
   * finding P16) — as opposed to a `%YAML`/`%TAG`-reserved directive such as
   * `%FOO`, which the YAML 1.2.2 grammar (§6.8) requires processors to accept
   * with only a warning (implementation review finding P19: the P16 fix used
   * `BAD_DIRECTIVE` as if it meant only the former, and `yaml`'s own
   * `Directives.add()` routes both cases through that one code).
   *
   * For each `BAD_DIRECTIVE` warning, finds the `%YAML` token (from
   * `yamlDirectives`, already parsed by `yamlDirectiveTokens`) whose
   * half-open span contains the warning's own reported position. This does
   * not re-decide version validity (the parser already did, or there would
   * be no warning) and does not match the warning's human-readable message
   * or a version-string table — it asks only whether the warning falls
   * inside a `%YAML` directive's own span, the same way `Directives.add()`
   * itself branches on the directive name.
   */
  function unsupportedYamlVersionWarned(
    yamlDirectives: readonly CST.Directive[],
    warnings: ReadonlyArray<{ code?: string; pos: [number, number] }>,
  ): boolean {
    if (!warnings.some((w) => w.code === 'BAD_DIRECTIVE')) return false;
    return warnings.some(
      (w) =>
        w.code === 'BAD_DIRECTIVE' &&
        yamlDirectives.some((t) => w.pos[0] >= t.offset && w.pos[0] < t.offset + t.source.length),
    );
  }

  // The token walk. Recurses into block quotes and list items — a canonical
  // block or a shadow-home heading inside either is a real, rendered Markdown
  // construct and must count (CommonMark §5.1, §5.2). Does not descend into
  // `code` tokens (code content is never a container) or `html` tokens — that
  // is the owner's declared MARKDOWN-ONLY boundary (§2.1 says "level-1
  // Markdown heading"), not a claim that raw blocks are invisible: the same
  // bucket holds `<h1>plan-running-totals</h1>`, which renders a fully
  // visible level-1 title, and that is a declared, pinned residual (§2.7).
  const homes: { canonical: Tokens.Code[]; stray: string[] } = { canonical: [], stray: [] };
  function walk(tokens: Token[] | undefined): void {
    for (const t of tokens ?? []) {
      if (t.type === 'code') {
        // A `code` token is not necessarily FENCED (review finding P2) —
        // `marked` gives four-space-indented blocks the same token type,
        // distinguished only by `codeBlockStyle`. The contract says fenced.
        if (t.codeBlockStyle === 'indented') continue;
        if ((t.text ?? '').split('\n')[0] === MARKER) homes.canonical.push(t as Tokens.Code);
        continue;
      }
      if (t.type === 'html') continue;
      if (t.type === 'heading' && t.depth === 1 && visibleText(t.tokens) === MARKER_TEXT) {
        homes.stray.push(t.raw.trim());
      }
      if (t.type === 'blockquote') walk(t.tokens);
      else if (t.type === 'list') for (const item of t.items ?? []) walk(item.tokens);
    }
  }
  walk(marked.lexer(spec));

  const sites = new Map<string, string[]>();
  if (homes.stray.length > 0) {
    add(
      'C3-NOCANONICAL',
      `found ${homes.stray.length} level-1 heading(s) outside the canonical block whose ` +
        `READER-VISIBLE text is \`${MARKER_TEXT}\` — each is a shadow home the fenced parse ` +
        `cannot see (SP-30)`,
    );
  }
  if (homes.canonical.length !== 1) {
    add(
      'C3-NOCANONICAL',
      `expected EXACTLY ONE fenced \`${MARKER}\` block in the plan; found ` +
        `${homes.canonical.length}. It is the declared home every other mention points at, ` +
        `so without exactly one there is nothing to count against (SP-30)`,
    );
  } else {
    // YAML payload validation (§2.3 item 5). `raise on doc.errors.length > 0`
    // covers malformed YAML, duplicate keys (including the quoted spelling),
    // multi-document payloads, and — because of `stringKeys: true` — an alias
    // or non-string key (review finding P4). `version: '1.2'` sets the
    // FALLBACK for a document with no `%YAML` directive; it does NOT reject an
    // explicit directive naming a different version (implementation review
    // finding P12) — `yamlDoc.directives.yaml.version` is checked below for
    // that, because the library documents that an in-document directive
    // overrides the `version` option.
    const yamlDoc = parseDocument(homes.canonical[0].text, {
      uniqueKeys: true,
      stringKeys: true,
      version: '1.2',
    });
    // A syntactically well-formed but UNSUPPORTED numeric `%YAML` version
    // (`1.0`, `1.3`, `2.0`, …) is not a parse ERROR — the library reports it
    // as a `BAD_DIRECTIVE` WARNING and silently keeps the fallback effective
    // version at `1.2`, so `directives.yaml.version` alone cannot see it
    // (implementation review finding P16 — the same class as P12: the parser
    // DOES decide the syntax, but the decision landed in a channel this
    // checker was not reading). `%YAML 1.1` raises no warning at all — it is
    // a fully SUPPORTED version whose EFFECTIVE value differs, which the
    // version check below still catches; `%YAML next` is not version-shaped
    // at all and is already a parse ERROR, caught by the branch above it.
    //
    // ⚠⚠⚠ `BAD_DIRECTIVE` IS NOT UNIQUELY "UNSUPPORTED %YAML VERSION"
    // (implementation review finding P19 — the P16 fix regressed the other
    // way). YAML 1.2.2 §6.8 reserves any directive other than `%YAML`/`%TAG`
    // for future use and requires processors to accept the document and only
    // WARN — `yaml`'s own `Directives.add()` (`node_modules/yaml/dist/doc/
    // directives.js`) routes an unrecognised directive name to the exact same
    // `BAD_DIRECTIVE` code as an unsupported `%YAML` version, so treating the
    // code alone as blocking rejects a document the named dialect requires
    // this checker to accept (e.g. `%FOO bar`), including when it is paired
    // with a perfectly valid explicit `%YAML 1.2`. `unsupportedYamlVersionWarned`
    // does not re-decide version validity or match the warning's human-readable
    // message — it asks only whether a `BAD_DIRECTIVE` warning falls inside
    // one of `yamlDirectives`'s own spans, the same way `Directives.add()`
    // itself branches on the directive name.
    //
    // ⚠⚠⚠ A `%YAML` DIRECTIVE THAT NAMES A SUPPORTED VERSION RAISES NEITHER
    // AN ERROR NOR A WARNING (implementation review finding P20 — the SAME
    // seam, a THIRD channel): `Directives.add()` unconditionally overwrites
    // its stored effective version on every `%YAML` directive it sees,
    // supported or not, with no redeclaration check of its own. A second,
    // valid `%YAML 1.2` therefore silently ERASES an earlier, forbidden
    // `%YAML 1.1` from `directives.yaml.version` — the version check below
    // would see only the final, innocent-looking value. YAML 1.2.2 §6.8.1
    // makes more than one `%YAML` directive an error regardless of whether
    // the versions agree (Example 6.15), which `yaml@2.9.0` does not enforce.
    // Counting `yamlDirectives` — the SAME CST tokens `unsupportedYamlVersionWarned`
    // already parses — rejects the block before `directives.yaml.version` is
    // ever trusted, with no re-parsing of version text of our own.
    const yamlDirectives = yamlDirectiveTokens(homes.canonical[0].text);
    const badDirective = unsupportedYamlVersionWarned(yamlDirectives, yamlDoc.warnings);
    if (yamlDoc.errors.length > 0) {
      add(
        'C3-NOCANONICAL',
        `the \`${MARKER}\` block's payload is not valid YAML — ` +
          `${[...new Set(yamlDoc.errors.map((e) => e.code))].join(', ')} (SP-30)`,
      );
    } else if (yamlDirectives.length > 1) {
      add(
        'C3-NOCANONICAL',
        `the \`${MARKER}\` block declares ${yamlDirectives.length} \`%YAML\` directives; YAML ` +
          `1.2.2 §6.8.1 permits at most one, and a later declaration can silently erase an ` +
          `earlier one from the parser's final state (SP-30)`,
      );
    } else if (badDirective) {
      add(
        'C3-NOCANONICAL',
        `the \`${MARKER}\` block declares a \`%YAML\` directive the parser could not resolve to ` +
          `a supported version; only YAML 1.2 is the named dialect (§2.2) (SP-30)`,
      );
    } else if (yamlDoc.directives.yaml.version !== '1.2') {
      // §2.2: the named dialect is YAML 1.2. Under 1.1, a sexagesimal scalar
      // like `1:20` resolves to the integer 80 and would silently pass the
      // value check below as a legitimate total — measured, implementation
      // review finding P12.
      add(
        'C3-NOCANONICAL',
        `the \`${MARKER}\` block declares an explicit \`%YAML ${yamlDoc.directives.yaml.version}\` ` +
          `directive; only YAML 1.2 is the named dialect (§2.2) (SP-30)`,
      );
    } else if (!isMap(yamlDoc.contents)) {
      add('C3-NOCANONICAL', `the \`${MARKER}\` block's payload is not a top-level mapping (SP-30)`);
    } else {
      const pairs = yamlDoc.contents.items.map(
        (p) => [isScalar(p.key) ? String(p.key.value) : String(p.key), p.value] as const,
      );
      const bad: string[] = [];
      // ⚠⚠ SITES ARE COLLECTED HERE AND COMMITTED ONLY BELOW, AFTER THE WHOLE
      // LOOP CONFIRMS `bad` IS EMPTY (implementation review finding P13). The
      // site-grouping rule is "established only after the payload validates"
      // (§2.3 item 6) — validates as a WHOLE, not key-by-key: committing a
      // valid key's site immediately let an invalid payload (e.g. one bad
      // value) still seed an advisory `C3-COUNTDRIFT` site claiming the block
      // "declares" a subject it does not, alongside the correct blocking
      // finding. Measured: a block with `reviewer_findings: bananas` plus
      // matching prose emitted both C3-NOCANONICAL and a misleading
      // C3-COUNTDRIFT.
      const validSubjects: string[] = [];
      const seen = new Set<string>();
      for (const { key, subject } of GOVERNED) {
        const hits = pairs.filter(([k]) => k === key);
        if (hits.length !== 1) {
          bad.push(`\`${key}\` appears ${hits.length} times (expected exactly 1)`);
          continue;
        }
        // Review finding P7: a running TOTAL must be a count. An `Alias` node
        // has no scalar `.value` (P9) — reading it directly made every alias
        // look like `null`, so `Alias.resolve(doc)`, the library's own
        // dereference API, is used instead of hand-deciding anchor semantics.
        const node = hits[0][1];
        const resolved = isAlias(node) ? node.resolve(yamlDoc) : node;
        const v = isScalar(resolved) ? resolved.value : undefined;
        if (typeof v !== 'number' || !Number.isInteger(v) || v < 0) {
          bad.push(`\`${key}\` is not a non-negative integer (${JSON.stringify(v ?? null)})`);
        } else if (!seen.has(subject)) {
          seen.add(subject);
          validSubjects.push(subject);
        }
      }
      if (bad.length > 0) {
        add(
          'C3-NOCANONICAL',
          `the \`${MARKER}\` block does not satisfy its own grammar — ${bad.join('; ')} (SP-30)`,
        );
      } else {
        for (const subject of validSubjects) {
          sites.set(subject, [`plan: the canonical block declares ${subject}`]);
        }
      }
    }
  }

  for (const [file, text] of [
    ['plan', spec],
    ['history', history],
  ] as const) {
    if (!text) continue;
    blankSpans(text)
      .split('\n')
      .forEach((raw, i) => {
        const line = stripEmphasis(raw);
        for (const { subject, source } of FRAMES) {
          for (const m of line.matchAll(new RegExp(source, 'gi'))) {
            const v = numberFrom(m[1]);
            if (Number.isNaN(v)) continue;
            sites.set(subject, [...(sites.get(subject) ?? []), `${file}:${i + 1} states ${v}`]);
          }
        }
      });
  }
  // ⚠⚠⚠ ADVISORY, NOT BLOCKING (owner ruling 2026-09-03). The frame list is an
  // ENUMERATED heuristic and the independent review measured it failing in BOTH
  // directions on the same counter: a second home inside quotes or written
  // `the eleventh review round` is still missed, while ONE ordinary historical
  // sentence ("Across two review rounds, option A was rejected") now collides
  // with the canonical site and would have BLOCKED. Those are the same root
  // cause — no regex decides what a number is ABOUT — so the honest fix is to
  // narrow the claim, not to grow the list. The known misses are pinned by
  // `KNOWN-OPEN:` tests in the spec.
  for (const [subject, where] of [...sites.entries()].sort()) {
    if (where.length > 1) {
      add(
        'C3-COUNTDRIFT',
        `ADVISORY: the ${subject} total looks asserted at ${where.length} sites; it ` +
          `must be stated ONCE and pointed at from everywhere else — ` +
          `${where.join('; ')} (SP-22). Heuristic: verify before acting.`,
        true,
      );
    }
  }

  // ---- C4 (SP-20): a leg needing the repaired helper cannot precede it.
  // ⚠⚠ FAILS CLOSED (F3, 2026-09-03). Every prerequisite below used to return a
  // silent clean: a missing section, zero parsed steps, or no helper step made
  // C4 indistinguishable from a valid sequence. `C4-UNVERIFIABLE` is a DISTINCT
  // code on purpose — the committed `NOT leg 1` negative fixture asserts only
  // that `C4-SEQUENCE` is absent, and a legitimate plan may schedule no leg 1.
  const seq = spec.match(/\*\*Then implementation\*\*[\s\S]*?(?=\n\d+\.\s\*\*|\n---)/);
  if (!seq) {
    add(
      'C4-UNVERIFIABLE',
      'no `**Then implementation**` section was found, so the leg/helper order ' +
        'cannot be established. C4 must not read as clean when its input is absent (SP-20)',
    );
  }
  if (seq) {
    const steps = [...seq[0].matchAll(/\n\s+(\d+)\.\s+\*\*(.*?)\*\*/g)].map(
      (m) => [Number(m[1]), m[2]] as const,
    );
    const helperSteps = steps.filter(([, t]) => /the helper/i.test(t));
    const helperAt = helperSteps[0]?.[0];
    const legSteps = steps.filter(
      ([, t]) => /\bleg\s*1\b(?!\d)/i.test(t) && !/\bNOT\s+leg\s*1\b/i.test(t),
    );
    // ⚠ DUPLICATE anchors are ambiguous, not clean: "first match wins" silently
    // picks one of two possible orders. ⓘ A MISSING leg 1 is deliberately NOT
    // unverifiable — a plan may legitimately schedule none, and the committed
    // `NOT leg 1` fixture asserts exactly that. Absence of the helper IS
    // unverifiable, because C4's whole question is "did the helper come first".
    if (helperSteps.length > 1 || legSteps.length > 1) {
      add(
        'C4-UNVERIFIABLE',
        `the implementation order names ${helperSteps.length} helper steps and ` +
          `${legSteps.length} leg-1 steps; with duplicates the order is ambiguous ` +
          `and "first match wins" would silently pick one (SP-20)`,
      );
    }
    const legAt = steps.find(
      ([, t]) => /\bleg\s*1\b(?!\d)/i.test(t) && !/\bNOT\s+leg\s*1\b/i.test(t),
    )?.[0];
    if (steps.length === 0) {
      add(
        'C4-UNVERIFIABLE',
        'the `**Then implementation**` section parsed ZERO numbered steps — the ' +
          'nested-list form is load-bearing and flattening it once made C4 silently dead (SP-20)',
      );
    } else if (helperAt === undefined) {
      add(
        'C4-UNVERIFIABLE',
        'no helper step was found in the implementation order, so the ' +
          'prerequisite C4 checks against does not exist (SP-20)',
      );
    }
    if (helperAt !== undefined && legAt !== undefined && legAt < helperAt) {
      add(
        'C4-SEQUENCE',
        `leg 1 is scheduled at step ${legAt} but the repaired helper it needs is ` +
          `only built at step ${helperAt} (SP-20)`,
      );
    }
  }

  return out;
}
