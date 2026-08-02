/**
 * Unit Test: card type parity across HAVDM's THREE independent notions of
 * "what a card is".
 *
 * ⭐⭐⭐ WHY THIS FILE EXISTS. HAVDM keeps three separate lists:
 *
 *   1. `src/schemas/ha-dashboard-schema.json` — what the YAML editor VALIDATES
 *   2. `src/services/cardRegistry.ts`         — what the palette OFFERS
 *   3. `src/components/BaseCard.tsx`          — what the canvas can DRAW
 *
 * Nothing ever compared them, and each looked internally consistent, so the
 * drift was invisible. HA-03 found the bill: HAVDM knew 40+ `custom:` HACS
 * cards and could not draw FOUR cards that ship with Home Assistant itself —
 * `tile` (17 uses on one real dashboard), `heading` (7), `entity` (4) and
 * `statistics-graph` (1), 29 cards rendering as amber question marks.
 *
 * Four renderers close that gap. THIS TEST CLOSES THE CLASS.
 *
 * ⚠⚠ THE RULES ARE DELIBERATELY NOT SYMMETRIC — read this before "tidying"
 * them into a three-way equality:
 *
 *   RULE 1 (hard): registry ⊆ renderer.
 *       Every card the PALETTE OFFERS must render. This is a promise to the
 *       user: you cannot be allowed to drag a card out of the palette and get
 *       an "Unsupported Card Type" placeholder.
 *
 *   RULE 2 (hard): renderer ⊆ schema.
 *       HAVDM must never flag as invalid a card it can itself draw. Violating
 *       this puts red squiggles in the YAML editor under cards that render
 *       perfectly — which it did, 13 times, including two cards in daily use.
 *
 *   RULE 3 (NOT an equality, and must stay that way): schema ⊋ renderer.
 *       The schema lists what HOME ASSISTANT accepts; the renderer lists what
 *       HAVDM can draw. `area`, `energy`, `humidifier`, `iframe`, `logbook`,
 *       `picture-elements`, `shopping-list`, `statistic` and `todo-list` are
 *       legitimately validated-but-unrendered: HAVDM preserves their YAML and
 *       honestly marks them on the canvas. That is the product vision working
 *       as designed, not drift. ⚠ A test demanding three-way equality would
 *       force nine renderers nobody has agreed to build. Do not write it.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cardRegistry } from '../../src/services/cardRegistry';
import schema from '../../src/schemas/ha-dashboard-schema.json';

const repoRoot = resolve(__dirname, '../..');

/**
 * The set of types `BaseCard`'s `switch (card.type)` actually handles.
 *
 * ⭐⭐⭐ THIS PARSES THE REAL SOURCE ON PURPOSE. The obvious alternative — a
 * hand-maintained exported array that BaseCard and this test both import — is
 * exactly the bug being guarded against: a second declaration that can drift
 * from the switch it claims to describe. Reading the file means the test can
 * only ever be wrong in the direction of the truth.
 */
const rendererTypes = (): Set<string> => {
  const source = readFileSync(resolve(repoRoot, 'src/components/BaseCard.tsx'), 'utf8');
  const types = new Set<string>(
    Array.from(source.matchAll(/^\s+case '([^']+)':/gm), (match) => match[1]),
  );
  // `spacer` never reaches the switch — it returns early, above it, so that a
  // spacer renders as a dashed drop-zone rather than a card. It IS rendered.
  if (/card\.type === 'spacer'/.test(source)) types.add('spacer');
  return types;
};

const schemaCardTypes = (): Set<string> => {
  const cardDef = (schema as { properties?: Record<string, unknown> } & Record<string, any>)
    .definitions?.card;
  const values: string[] = cardDef?.properties?.type?.enum ?? [];
  return new Set(values);
};

/**
 * ⚠⚠⚠ THE KNOWN-GAP ALLOW-LIST. THIS LIST MAY SHRINK. IT MUST NEVER GROW.
 *
 * These `custom:` cards are offered in HAVDM's palette and have no renderer, so
 * a user can drag one out and immediately get an "Unsupported Card Type"
 * placeholder. They pre-date this guard; freezing them here is what let the
 * guard ship with the four core cards (the actual release blocker) instead of
 * waiting on eleven renderers.
 *
 * ⭐ Two of them (`custom:mini-media-player`, `custom:battery-state-card`) even
 * have dedicated PropertiesPanel forms — HAVDM will let you configure a card it
 * cannot draw.
 *
 * ⚠ ADDING AN ENTRY HERE IS NOT A FIX. If this list grows, the drift this file
 * exists to prevent has simply been re-labelled.
 */
const KNOWN_UNRENDERED_PALETTE_CARDS = [
  'custom:battery-state-card',
  'custom:decluttering-card',
  'custom:fold-entity-row',
  'custom:mini-media-player',
  'custom:multiple-entity-row',
  'custom:simple-swipe-card',
  'custom:slider-entity-row',
] as const;

describe('card type parity across schema, registry and renderer', () => {
  it('parses a plausible switch out of BaseCard (guards the instrument itself)', () => {
    // ⭐ A parity test whose parser silently matched nothing would pass every
    // assertion below while measuring absolutely nothing. Pin the instrument
    // first: BaseCard is known to carry dozens of cases, and these three are
    // long-standing and unlikely to be renamed.
    const renderers = rendererTypes();
    expect(renderers.size).toBeGreaterThan(50);
    expect(renderers).toContain('gauge');
    expect(renderers).toContain('markdown');
    expect(renderers).toContain('entities');
  });

  it('RULE 1: every card type the palette offers has a renderer', () => {
    const renderers = rendererTypes();
    const allowed = new Set<string>(KNOWN_UNRENDERED_PALETTE_CARDS);

    const unrendered = cardRegistry
      .getAll()
      .map((card) => card.type)
      .filter((type) => !renderers.has(type) && !allowed.has(type))
      .sort();

    expect(unrendered).toEqual([]);
  });

  it('RULE 2: every card type HAVDM can draw is accepted by its own schema', () => {
    const schemaTypes = schemaCardTypes();
    const unvalidated = Array.from(rendererTypes())
      .filter((type) => type !== 'spacer' && !schemaTypes.has(type))
      .sort();

    // A card HAVDM renders but its own YAML editor flags as invalid is a
    // contradiction the user sees directly, as red squiggles under working cards.
    expect(unvalidated).toEqual([]);
  });

  it('RULE 3: the schema stays a strict SUPERSET of what can be drawn', () => {
    const schemaTypes = schemaCardTypes();
    const renderers = rendererTypes();
    const validatedButUnrendered = Array.from(schemaTypes).filter((type) => !renderers.has(type));

    // Not a defect — these are preserved and honestly marked on the canvas.
    // Asserted only to keep the asymmetry deliberate rather than accidental:
    // if this ever hits zero, someone has "fixed" Rule 3 into an equality.
    expect(validatedButUnrendered.length).toBeGreaterThan(0);
  });

  it('the four core HA cards that HA-03 found are registered AND renderable', () => {
    const renderers = rendererTypes();
    const schemaTypes = schemaCardTypes();

    for (const type of ['tile', 'heading', 'entity', 'statistics-graph']) {
      expect(cardRegistry.get(type), `${type} missing from the palette`).toBeDefined();
      expect(renderers.has(type), `${type} has no BaseCard case`).toBe(true);
      expect(schemaTypes.has(type), `${type} missing from the schema`).toBe(true);
    }
  });

  it('the known-gap allow-list only ever shrinks', () => {
    // Pinning the length is what turns "we know about these" into a ratchet.
    // Deleting entries (by building the renderers) is the intended way to move
    // this number; raising it silently re-creates the drift.
    expect(KNOWN_UNRENDERED_PALETTE_CARDS.length).toBeLessThanOrEqual(7);
  });

  it('every allow-listed card is genuinely still in the palette', () => {
    // ⭐ Stops the list rotting into a set of names nobody recognises: an entry
    // whose card was removed from the registry is dead weight that would hide a
    // future real gap behind a stale exemption.
    for (const type of KNOWN_UNRENDERED_PALETTE_CARDS) {
      expect(cardRegistry.get(type), `${type} is allow-listed but not registered`).toBeDefined();
    }
  });
});
