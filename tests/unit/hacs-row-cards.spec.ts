/**
 * Unit Test: HACS entity-ROW card placement disclosure.
 *
 * ⭐⭐⭐ WHY THIS MATTERS MORE THAN IT LOOKS. Three of the seven card types
 * HAVDM's palette offered without a renderer are not cards at all — they are
 * entity ROWS that belong inside an `entities` card. Simply drawing them as
 * cards would have swapped a VISIBLE gap ("Unsupported Card Type") for an
 * INVISIBLE one: a card-shaped thing whose exported YAML Home Assistant will
 * not render where the user put it.
 *
 * So the disclosure is the feature, and these tests pin it.
 */
import { describe, it, expect } from 'vitest';
import {
  ROW_CARD_TYPE_NAMES,
  describeRowCardPlacement,
  explainRowCardPlacement,
  isRowCardType,
} from '../../src/utils/hacsRowCards';

describe('row card identification', () => {
  it('knows exactly the three HACS entity-row types', () => {
    expect(ROW_CARD_TYPE_NAMES).toEqual([
      'custom:fold-entity-row',
      'custom:multiple-entity-row',
      'custom:slider-entity-row',
    ]);
  });

  it.each(ROW_CARD_TYPE_NAMES)('treats %s as a row', (type) => {
    expect(isRowCardType(type)).toBe(true);
  });

  it.each([
    'custom:battery-state-card',
    'custom:decluttering-card',
    'custom:mini-media-player',
    'custom:simple-swipe-card',
    'tile',
    'entities',
  ])('does NOT treat %s as a row', (type) => {
    // ⚠ The four non-row cards from the same slice are the important negatives:
    // marking a genuine card as "belongs inside an Entities card" would be a
    // new false statement, which is the exact thing being avoided.
    expect(isRowCardType(type)).toBe(false);
  });

  it('handles a missing or malformed type without throwing', () => {
    expect(isRowCardType(undefined)).toBe(false);
    expect(isRowCardType('')).toBe(false);
  });

  it('is not fooled by inherited Object properties', () => {
    // ⭐ A plain `type in ROW_CARD_TYPES` lookup would answer TRUE for
    // 'constructor', 'toString' and friends — every card named after an Object
    // prototype member would grow a spurious "this is a row" notice.
    expect(isRowCardType('constructor')).toBe(false);
    expect(isRowCardType('toString')).toBe(false);
    expect(isRowCardType('hasOwnProperty')).toBe(false);
  });
});

describe('the placement disclosure', () => {
  it('names the constraint in the user’s terms, not HA’s schema terms', () => {
    expect(describeRowCardPlacement('custom:slider-entity-row')).toBe(
      'Entity row — belongs inside an Entities card, not on its own',
    );
  });

  it('returns null for a genuine card', () => {
    // ⭐ Same rule as `describeBulkTypeSkip` (#113): a notice that fires when
    // nothing is at risk spends the user's attention for nothing.
    expect(describeRowCardPlacement('custom:battery-state-card')).toBeNull();
    expect(describeRowCardPlacement('tile')).toBeNull();
    expect(describeRowCardPlacement(undefined)).toBeNull();
  });

  it('explains what each row actually does inside the list', () => {
    expect(explainRowCardPlacement('custom:fold-entity-row')).toContain(
      'a collapsible group of rows',
    );
    expect(explainRowCardPlacement('custom:multiple-entity-row')).toContain(
      'one row showing several entities',
    );
    expect(explainRowCardPlacement('custom:slider-entity-row')).toContain(
      'a row with an inline slider',
    );
  });

  it('warns that a row placed alone will not render in Home Assistant', () => {
    // The consequence is the part a user needs; "this is a row" alone does not
    // tell them their dashboard will be wrong.
    for (const type of ROW_CARD_TYPE_NAMES) {
      expect(explainRowCardPlacement(type)).toContain('will not render in Home Assistant');
    }
  });

  it('returns null from the long explanation for a genuine card', () => {
    expect(explainRowCardPlacement('custom:mini-media-player')).toBeNull();
    expect(explainRowCardPlacement(undefined)).toBeNull();
  });
});
