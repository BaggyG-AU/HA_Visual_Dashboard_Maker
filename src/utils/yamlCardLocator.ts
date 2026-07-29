import { LineCounter, parseDocument } from 'yaml';

/**
 * Where a card sits in the YAML source, as 1-based line numbers (Monaco's
 * convention), inclusive of both ends.
 */
export interface CardYamlBlock {
  /** First line of the card's block. */
  startLine: number;
  /** Last line of the card's block. */
  endLine: number;
}

/**
 * Locate a dashboard card's block in raw YAML text.
 *
 * YAML-04. This replaces a string search that looked for `type: <the card's
 * type>` and counted occurrences of THAT ONE type string, then compared the
 * counter against `cardIndex` — which is the card's index among ALL cards, of
 * any type. The two only agree when every card in the view shares a type, which
 * is why the old code looked correct in exactly that case and failed everywhere
 * else. It had three separate ways of being wrong, all measured:
 *
 *   - a mixed-type view found no match at all, left the previous card's
 *     highlight in place, and so appeared to highlight the wrong section;
 *   - an all-same-type view happened to be right, by coincidence;
 *   - because `includes` matched a SUBSTRING on every line, cards nested inside
 *     a `vertical-stack` were counted too, so a top-level card could resolve to
 *     a nested one — a confidently wrong answer rather than a missing one.
 *
 * A fourth failure was structural: the caller took the card type from
 * `yamlService.parseDashboard`, which runs `importDashboard` and REWRITES some
 * types (`custom:swiper-card` -> `custom:swipe-card`). The rewritten string does
 * not occur in the user's text at all, so those cards could never be found.
 *
 * Locating by PATH rather than by content answers all four at once, and is
 * indifferent to formatting, comments, blank lines and duplicate cards.
 *
 * ⚠ The path is the RAW document's `views[v].cards[i]`, while `cardIndex` comes
 * from the canvas, which renders the IMPORTED model. Those agree card-for-card
 * except where `importDashboard` silently drops a malformed entry
 * (`src/services/yamlConversionService.ts` `asCardRecord` + `.filter(Boolean)`),
 * which is a separately-tracked open defect.
 *
 * @returns the card's block, or `null` when it cannot be located — the caller
 * must then do nothing visible. A highlight on the wrong card is worse than no
 * highlight at all.
 */
export function findCardYamlBlock(
  yamlText: string,
  viewIndex: number,
  cardIndex: number,
): CardYamlBlock | null {
  if (!yamlText || !yamlText.trim()) return null;
  if (!Number.isInteger(viewIndex) || viewIndex < 0) return null;
  if (!Number.isInteger(cardIndex) || cardIndex < 0) return null;

  try {
    const lineCounter = new LineCounter();
    const doc = parseDocument(yamlText, { lineCounter });

    // Mid-edit YAML is routinely unparseable. That is not an error worth
    // reporting — it just means we cannot say where the card is yet.
    if (doc.errors.length > 0) return null;

    const node = doc.getIn(['views', viewIndex, 'cards', cardIndex], true);
    if (!hasRange(node)) return null;

    const [start, valueEnd] = node.range;
    const startLine = lineCounter.linePos(start).line;
    const endLine = lineCounter.linePos(Math.max(start, valueEnd - 1)).line;

    if (!Number.isFinite(startLine) || !Number.isFinite(endLine)) return null;
    if (endLine < startLine) return null;

    return { startLine, endLine };
  } catch {
    return null;
  }
}

/** Every `yaml` AST node carries a source range; a plain value does not. */
const hasRange = (node: unknown): node is { range: [number, number, number] } => {
  if (!node || typeof node !== 'object') return false;
  const range = (node as { range?: unknown }).range;
  return Array.isArray(range) && typeof range[0] === 'number' && typeof range[1] === 'number';
};
