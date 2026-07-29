import { describe, expect, it } from 'vitest';
import { findCardYamlBlock } from '../../src/utils/yamlCardLocator';

/**
 * YAML-04. Locating a card in the YAML text used to be a string search for
 * `type: <the card's type>` with an occurrence counter compared against the
 * card's index among ALL cards. Most of these tests are CONTROL LEGS: the
 * dangerous fix is one that repairs the reported case and quietly keeps a
 * different flavour of the same wrong answer.
 */

const MIXED = `title: Mixed
views:
  - title: Home
    path: home
    cards:
      - type: markdown
        content: CARD-ZERO
      - type: button
        name: CARD-ONE
      - type: markdown
        content: CARD-TWO
`;

const lines = (src: string, from: number, to: number): string =>
  src
    .split('\n')
    .slice(from - 1, to)
    .join('\n');

describe('findCardYamlBlock', () => {
  it('locates each card in a view of mixed types', () => {
    const zero = findCardYamlBlock(MIXED, 0, 0);
    const one = findCardYamlBlock(MIXED, 0, 1);
    const two = findCardYamlBlock(MIXED, 0, 2);

    expect(zero).not.toBeNull();
    expect(one).not.toBeNull();
    expect(two).not.toBeNull();
    expect(lines(MIXED, zero!.startLine, zero!.endLine)).toContain('CARD-ZERO');
    expect(lines(MIXED, one!.startLine, one!.endLine)).toContain('CARD-ONE');
    expect(lines(MIXED, two!.startLine, two!.endLine)).toContain('CARD-TWO');
  });

  it('gives each card a distinct block', () => {
    const starts = [0, 1, 2].map((i) => findCardYamlBlock(MIXED, 0, i)?.startLine);
    expect(new Set(starts).size).toBe(3);
  });

  // CONTROL LEG: the old code was correct for this shape by coincidence — a
  // card's index among all cards equals its ordinal among its own type. A fix
  // must not regress it.
  it('stays correct when every card shares one type', () => {
    const same = `views:
  - cards:
      - type: markdown
        content: A
      - type: markdown
        content: B
      - type: markdown
        content: C
`;
    expect(lines(same, ...blockOf(same, 0, 0))).toContain('content: A');
    expect(lines(same, ...blockOf(same, 0, 1))).toContain('content: B');
    expect(lines(same, ...blockOf(same, 0, 2))).toContain('content: C');
  });

  describe('nesting', () => {
    const nested = `views:
  - cards:
      - type: vertical-stack
        cards:
          - type: markdown
            content: NESTED-A
          - type: markdown
            content: NESTED-B
      - type: markdown
        content: TOP-LEVEL-ONE
`;

    // ⭐ The substring match counted cards INSIDE the stack, so the top-level
    // card resolved to a nested one — a confidently wrong answer, which is
    // worse than no answer.
    it('never resolves a top-level card to one nested inside a container', () => {
      const [from, to] = blockOf(nested, 0, 1);
      const text = lines(nested, from, to);
      expect(text).toContain('TOP-LEVEL-ONE');
      expect(text).not.toContain('NESTED-A');
      expect(text).not.toContain('NESTED-B');
    });

    it('returns the whole container block when the container itself is selected', () => {
      const [from, to] = blockOf(nested, 0, 0);
      const text = lines(nested, from, to);
      expect(text).toContain('vertical-stack');
      expect(text).toContain('NESTED-A');
      expect(text).toContain('NESTED-B');
      expect(text).not.toContain('TOP-LEVEL-ONE');
    });
  });

  // CONTROL LEG: `parseDashboard` runs `importDashboard`, which REWRITES some
  // card types (`custom:swiper-card` -> `custom:swipe-card`). A type-based
  // search can never match those, because the rewritten string is not in the
  // user's text at all. Locating by PATH is immune.
  it('locates a card whose type import would rewrite', () => {
    const legacy = `views:
  - cards:
      - type: markdown
        content: FIRST
      - type: custom:swiper-card
        name: LEGACY
`;
    const [from, to] = blockOf(legacy, 0, 1);
    expect(lines(legacy, from, to)).toContain('LEGACY');
  });

  it('is unaffected by comments and blank lines between cards', () => {
    const commented = `views:
  - cards:
      # the first card
      - type: markdown
        content: FIRST

      # the second card
      - type: button
        name: SECOND
`;
    expect(lines(commented, ...blockOf(commented, 0, 1))).toContain('SECOND');
  });

  describe('fail mode — return null so the caller can do nothing visible', () => {
    it('returns null for a card index past the end', () => {
      expect(findCardYamlBlock(MIXED, 0, 3)).toBeNull();
    });

    it('returns null for a view index past the end', () => {
      expect(findCardYamlBlock(MIXED, 4, 0)).toBeNull();
    });

    it('returns null for YAML that does not parse', () => {
      expect(findCardYamlBlock('views:\n  - cards:\n   -  bad: [unclosed\n', 0, 0)).toBeNull();
    });

    it('returns null for a view with no cards array, such as a sections view', () => {
      const sections = `views:
  - type: sections
    sections:
      - type: grid
        cards:
          - type: markdown
            content: IN-SECTION
`;
      expect(findCardYamlBlock(sections, 0, 0)).toBeNull();
    });

    it('returns null for empty input', () => {
      expect(findCardYamlBlock('', 0, 0)).toBeNull();
    });
  });
});

/** Small helper so the assertions above read as line ranges, not tuples. */
function blockOf(src: string, viewIndex: number, cardIndex: number): [number, number] {
  const block = findCardYamlBlock(src, viewIndex, cardIndex);
  if (!block) throw new Error(`expected a block for view ${viewIndex} card ${cardIndex}`);
  return [block.startLine, block.endLine];
}
