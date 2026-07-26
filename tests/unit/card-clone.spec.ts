/**
 * WS3 slice C (as amended) — clipboard copy isolation.
 *
 * The Phase 7 Slice C prompt's State Safety Rules require that duplicate/clone
 * "deep-copy mutable nested configuration branches", and its stop conditions
 * name "clone causes cross-card unintended edits". Before this slice the
 * clipboard path spread cards shallowly on both sides and nothing tested it.
 *
 * ⚠ HONEST LABEL: these are NOT red-before-green. The transforms under test are
 * new pure modules extracted from inline logic in a 6700-line component, so
 * there was no seam to write a failing test against on base. What makes them
 * meaningful rather than decorative is the characterisation block below, which
 * pins the OLD semantics and demonstrates the aliasing this slice removes.
 */
import { describe, it, expect } from 'vitest';
import {
  cloneCardsForClipboard,
  prepareCardsForFlatPaste,
  prepareCardsForSectionPaste,
  PASTE_FALLBACK_HEIGHT,
  PASTE_FALLBACK_WIDTH,
  type CardWithInternalLayout,
} from '../../src/utils/cardClipboard';
import { deepClone } from '../../src/utils/deepClone';

/** A card with every nested branch the aliasing hazard applies to. */
const makeNestedCard = (): CardWithInternalLayout =>
  ({
    type: 'button',
    name: 'Kitchen',
    entity: 'light.kitchen',
    tap_action: { action: 'toggle' },
    style: { color: 'red', nested: { depth: 2 } },
    card_mod: { style: '.foo { color: red; }' },
    entities: ['light.a', 'light.b'],
    cards: [{ type: 'markdown', content: 'inner' }],
    _havdm_layout: { x: 1, y: 2, w: 3, h: 4 },
  }) as unknown as CardWithInternalLayout;

describe('deepClone', () => {
  it('detaches nested objects and arrays from the source', () => {
    const source = makeNestedCard();
    const copy = deepClone(source);

    expect(copy).toEqual(source);
    expect(copy).not.toBe(source);
    expect(copy.tap_action).not.toBe(source.tap_action);
    expect(copy.style).not.toBe(source.style);
    expect((copy as { entities: string[] }).entities).not.toBe(
      (source as unknown as { entities: string[] }).entities,
    );
    expect((copy as { cards: unknown[] }).cards[0]).not.toBe(
      (source as unknown as { cards: unknown[] }).cards[0],
    );
  });

  it('detaches branches nested more than one level deep', () => {
    const source = makeNestedCard();
    const copy = deepClone(source) as unknown as { style: { nested: { depth: number } } };

    expect(copy.style.nested).not.toBe(
      (source as unknown as { style: { nested: unknown } }).style.nested,
    );
  });
});

describe('characterisation — the hazard this slice removes', () => {
  it('a shallow spread (the previous clipboard behaviour) ALIASES nested branches', () => {
    const source = makeNestedCard();

    // Exactly what src/App.tsx did on both the copy and the paste side.
    const shallow = { ...source };

    expect(shallow).not.toBe(source);
    // ...but every nested branch is the same object.
    expect(shallow.tap_action).toBe(source.tap_action);
    expect(shallow.style).toBe(source.style);

    // Which means an in-place edit of the copy reaches the original.
    (shallow as unknown as { style: { color: string } }).style.color = 'blue';
    expect((source as unknown as { style: { color: string } }).style.color).toBe('blue');
  });

  it('the clipboard transform does not alias, so the same edit is contained', () => {
    const source = makeNestedCard();
    const [copy] = cloneCardsForClipboard([source]);

    (copy as unknown as { style: { color: string } }).style.color = 'blue';
    expect((source as unknown as { style: { color: string } }).style.color).toBe('red');
  });
});

describe('cloneCardsForClipboard', () => {
  it('preserves card content exactly', () => {
    const cards = [makeNestedCard(), makeNestedCard()];
    expect(cloneCardsForClipboard(cards)).toEqual(cards);
  });

  it('isolates every card from its source, including geometry', () => {
    const source = makeNestedCard();
    const [copy] = cloneCardsForClipboard([source]);

    expect(copy).not.toBe(source);
    expect(copy._havdm_layout).not.toBe(source._havdm_layout);
    expect(copy.tap_action).not.toBe(source.tap_action);
  });

  it('returns an empty list unchanged', () => {
    expect(cloneCardsForClipboard([])).toEqual([]);
  });
});

describe('prepareCardsForSectionPaste', () => {
  it('drops canvas geometry — sections are an ordered list, not a grid', () => {
    const [pasted] = prepareCardsForSectionPaste([makeNestedCard()]);
    expect(pasted).not.toHaveProperty('_havdm_layout');
  });

  it('keeps everything else intact', () => {
    const [pasted] = prepareCardsForSectionPaste([makeNestedCard()]);
    expect(pasted).toMatchObject({
      type: 'button',
      name: 'Kitchen',
      entity: 'light.kitchen',
      tap_action: { action: 'toggle' },
    });
  });

  it('isolates the pasted card from the clipboard entry', () => {
    const clipboardCard = makeNestedCard();
    const [pasted] = prepareCardsForSectionPaste([clipboardCard]);

    expect(pasted.tap_action).not.toBe(clipboardCard.tap_action);
    expect((pasted as unknown as { style: unknown }).style).not.toBe(
      (clipboardCard as unknown as { style: unknown }).style,
    );
  });

  it('pasting the same clipboard twice yields two INDEPENDENT cards', () => {
    const clipboardCards = [makeNestedCard()];
    const [first] = prepareCardsForSectionPaste(clipboardCards);
    const [second] = prepareCardsForSectionPaste(clipboardCards);

    expect(first).not.toBe(second);
    expect(first.tap_action).not.toBe(second.tap_action);

    (first as unknown as { style: { color: string } }).style.color = 'green';
    expect((second as unknown as { style: { color: string } }).style.color).toBe('red');
  });
});

describe('prepareCardsForFlatPaste', () => {
  it('re-homes the card to the bottom of the grid, keeping its size', () => {
    const [pasted] = prepareCardsForFlatPaste([makeNestedCard()]);

    expect(pasted._havdm_layout).toEqual({ x: 0, y: Infinity, w: 3, h: 4 });
  });

  it('falls back to a default footprint when the card had no geometry', () => {
    const bare = { type: 'markdown', content: 'hi' } as unknown as CardWithInternalLayout;
    const [pasted] = prepareCardsForFlatPaste([bare]);

    expect(pasted._havdm_layout).toEqual({
      x: 0,
      y: Infinity,
      w: PASTE_FALLBACK_WIDTH,
      h: PASTE_FALLBACK_HEIGHT,
    });
  });

  it('does not mutate the clipboard entry it was given', () => {
    const clipboardCard = makeNestedCard();
    prepareCardsForFlatPaste([clipboardCard]);

    expect(clipboardCard._havdm_layout).toEqual({ x: 1, y: 2, w: 3, h: 4 });
  });

  it('isolates the pasted card from the clipboard entry', () => {
    const clipboardCard = makeNestedCard();
    const [pasted] = prepareCardsForFlatPaste([clipboardCard]);

    expect(pasted.tap_action).not.toBe(clipboardCard.tap_action);
    expect((pasted as unknown as { cards: unknown[] }).cards[0]).not.toBe(
      (clipboardCard as unknown as { cards: unknown[] }).cards[0],
    );
  });

  it('pasting the same clipboard twice yields two INDEPENDENT cards', () => {
    const clipboardCards = [makeNestedCard()];
    const [first] = prepareCardsForFlatPaste(clipboardCards);
    const [second] = prepareCardsForFlatPaste(clipboardCards);

    (first as unknown as { style: { color: string } }).style.color = 'green';
    expect((second as unknown as { style: { color: string } }).style.color).toBe('red');
  });
});
