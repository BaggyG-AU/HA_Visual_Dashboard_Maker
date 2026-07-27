/**
 * Unit Test: card registry category invariants (palette recategorisation)
 *
 * 41 of the registry's 69 built-in cards used to sit in a single `custom`
 * bucket — 59% of the palette in one panel, while "Controls" held 4 and
 * "Media" held 1. The category axis was carrying almost no information because
 * it was being used to answer "is this a custom card?", a question the
 * `isCustom` flag already answers.
 *
 * The two axes are now separate for real:
 *   - `category` says what the card DOES (Layout / Sensors & Display /
 *     Controls / Media / Information).
 *   - `isCustom` says where it CAME FROM, and drives the palette's "Custom"
 *     badge (CardPalette.tsx).
 *
 * These tests are the lock. Without them nothing stops the next batch of HACS
 * cards being dropped back into `custom` one at a time until the bucket
 * reforms — the drift is invisible in any single diff.
 *
 * ⚠ `'custom'` deliberately REMAINS a valid `CardCategory`. It is the fallback
 * for cards discovered dynamically from a HA instance, which have no known
 * functional category. The invariant below is scoped to the BUILT-IN registry,
 * which is what the palette renders on a cold start.
 */

import { describe, it, expect } from 'vitest';
import { cardRegistry, type CardCategory } from '../../src/services/cardRegistry';

const FUNCTIONAL_CATEGORIES: CardCategory[] = [
  'layout',
  'sensor',
  'control',
  'media',
  'information',
];

describe('card registry — category invariants', () => {
  const all = cardRegistry.getAll();

  it('files no built-in card under the "custom" category', () => {
    const stragglers = all.filter((c) => c.category === 'custom').map((c) => c.type);
    expect(stragglers).toEqual([]);
  });

  it('gives every built-in card one of the five functional categories', () => {
    const offenders = all
      .filter((c) => !FUNCTIONAL_CATEGORIES.includes(c.category))
      .map((c) => `${c.type} -> ${c.category}`);
    expect(offenders).toEqual([]);
  });

  it('loses no card in the re-tag — the categories still partition the registry', () => {
    const summed = FUNCTIONAL_CATEGORIES.reduce(
      (total, category) => total + cardRegistry.getByCategory(category).length,
      0,
    );
    expect(summed).toBe(all.length);
  });

  it('spreads the cards across categories instead of concentrating them', () => {
    // The defect this replaces was one bucket holding 59% of the palette. Any
    // single category holding more than half the registry means the axis has
    // stopped discriminating again.
    for (const category of FUNCTIONAL_CATEGORIES) {
      const share = cardRegistry.getByCategory(category).length / all.length;
      expect(share, `${category} holds ${Math.round(share * 100)}% of the palette`).toBeLessThan(
        0.5,
      );
    }
    // ...and every category must actually be populated, or the palette renders
    // a heading the user can never open.
    for (const category of FUNCTIONAL_CATEGORIES) {
      expect(cardRegistry.getByCategory(category).length, `${category} is empty`).toBeGreaterThan(
        0,
      );
    }
  });

  it('keeps the custom cards marked custom after the move', () => {
    // The re-tag must not have cost the "Custom" badge its input. Every card
    // whose type is namespaced `custom:` is a custom card wherever it now sits.
    const namespaced = all.filter((c) => c.type.startsWith('custom:'));
    expect(namespaced.length).toBeGreaterThan(0);
    const unmarked = namespaced.filter((c) => !c.isCustom).map((c) => c.type);
    expect(unmarked).toEqual([]);
  });

  it('still resolves custom cards through getCustomCards() after the re-tag', () => {
    // getCustomCards() ORs isCustom / source / category. The re-tag removed the
    // category signal, so this pins that the remaining signals still carry it.
    const customTypes = cardRegistry.getCustomCards().map((c) => c.type);
    for (const card of all.filter((c) => c.isCustom)) {
      expect(customTypes, `${card.type} should still resolve as custom`).toContain(card.type);
    }
  });
});
