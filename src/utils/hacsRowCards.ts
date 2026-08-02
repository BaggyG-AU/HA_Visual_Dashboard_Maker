/**
 * HACS **row** cards — the ones that are not cards at all.
 *
 * ⭐⭐⭐ THE FINDING THIS MODULE EXISTS FOR. Three of the seven card types that
 * HAVDM's palette offered without a renderer are not Lovelace *cards*: they are
 * **entity rows**. In Home Assistant they go inside an `entities` card's
 * `entities:` list, never at the top level of a view:
 *
 *   `custom:fold-entity-row`      a collapsible group of rows
 *   `custom:multiple-entity-row`  one row showing several entities
 *   `custom:slider-entity-row`    a row with an inline slider
 *
 * The registry's own descriptions said so all along — "Collapsible rows in
 * entities cards", "Add sliders to entities cards" — and the palette offered
 * them as cards anyway.
 *
 * ⚠⚠ SO RENDERING THEM AS ORDINARY CARDS WOULD FIX THE QUESTION MARK AND LEAVE
 * A DEEPER LIE IN PLACE: the user would get a card-shaped thing on the canvas
 * whose exported YAML Home Assistant will not render where they put it. HAVDM
 * would have stopped saying "unsupported" and started saying something false.
 *
 * ⭐ THEREFORE: render a recognisable ROW, and MARK it as a row. That is the
 * product vision applied exactly — translate what we can, honestly mark what we
 * cannot — one level down from card types, at card *placement*.
 *
 * ⓘ A future slice could go further and let an `entities` card actually host
 * these as children, which is what HA does. That is a real feature (the
 * `entities` renderer would need to delegate per-row), NOT a rename, and it is
 * deliberately out of scope here.
 */

/** Card types that are entity ROWS, mapped to what they do inside a list. */
const ROW_CARD_TYPES: Readonly<Record<string, string>> = {
  'custom:fold-entity-row': 'a collapsible group of rows',
  'custom:multiple-entity-row': 'one row showing several entities',
  'custom:slider-entity-row': 'a row with an inline slider',
};

/** Whether this card type is really an entity row rather than a card. */
export const isRowCardType = (type: string | undefined): boolean =>
  typeof type === 'string' && Object.prototype.hasOwnProperty.call(ROW_CARD_TYPES, type);

/** Every row type HAVDM knows. Exported so a test can pin the set. */
export const ROW_CARD_TYPE_NAMES: readonly string[] = Object.keys(ROW_CARD_TYPES).sort();

/**
 * The disclosure shown on a row rendered at the top level of a view.
 *
 * ⚠ Returns `null` for anything that is a genuine card. A notice that fires
 * when nothing is at risk spends the user's attention for nothing — the same
 * rule `describeBulkTypeSkip` follows.
 */
export const describeRowCardPlacement = (type: string | undefined): string | null => {
  if (!isRowCardType(type)) return null;
  return `Entity row — belongs inside an Entities card, not on its own`;
};

/** Longer explanation, for a tooltip or panel rather than the card face. */
export const explainRowCardPlacement = (type: string | undefined): string | null => {
  if (!type || !isRowCardType(type)) return null;
  return `In Home Assistant this is ${ROW_CARD_TYPES[type]} inside an Entities card's \`entities:\` list. Placed on its own it will not render in Home Assistant.`;
};
