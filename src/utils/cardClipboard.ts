/**
 * Pure clipboard transforms for cut / copy / paste of cards.
 *
 * WS3 slice C (as amended — see
 * `docs/governance/phases/phase-7-ecosystem-future-growth-amendment-02.md`).
 *
 * ⚠ WHY THIS MODULE EXISTS. The clipboard path in `src/App.tsx` used a shallow
 * spread (`{ ...card }`) on both the copy side and the paste side, and
 * `dashboardStore.updateConfig` stores the incoming config object as-is (it
 * deep-clones only the *previous* config, onto the undo stack). So a pasted
 * card shared every nested branch — `style`, `tap_action`, `card_mod`, nested
 * `cards[]`, `entities[]` — by reference with the card it came from.
 *
 * No user-visible bug was demonstrated: every edit path in HAVDM builds new
 * objects (`ai_rules.md` §7, immutable state updates), so the aliasing never
 * had to surface. But it is precisely the hazard the Phase 7 Slice C prompt
 * names — "avoid shared references", "deep-copy mutable nested configuration
 * branches", stop condition "clone causes cross-card unintended edits" — and
 * nothing tested it. One in-place mutation anywhere downstream would turn it
 * into silent cross-card corruption, which the product vision forbids
 * outright.
 *
 * Keeping these transforms pure is the point: the isolation guarantee is
 * unit-testable here, where it was untestable inline in a 6700-line component.
 */
import type { Card } from '../types/dashboard';
import { deepClone } from './deepClone';

/** A card carrying HAVDM's internal canvas geometry. */
export type CardWithInternalLayout = Card & {
  _havdm_layout?: { x: number; y: number; w: number; h: number };
};

/** Default canvas footprint for a pasted card that had no usable geometry. */
export const PASTE_FALLBACK_WIDTH = 6;
export const PASTE_FALLBACK_HEIGHT = 4;

/**
 * Snapshot cards onto the clipboard, fully detached from the dashboard.
 *
 * Deep — the clipboard outlives the edit that follows it, so a shallow copy
 * would leave the clipboard aliasing live config.
 */
export const cloneCardsForClipboard = (cards: CardWithInternalLayout[]): CardWithInternalLayout[] =>
  cards.map((card) => deepClone(card));

/**
 * Prepare clipboard cards for pasting into a **Sections** view.
 *
 * Geometry is dropped: sections are an ordered list, not a grid (Tier 4 slice
 * 4.3a). Deep-cloned so that pasting the same clipboard twice yields two
 * independent cards rather than two aliases of one.
 */
export const prepareCardsForSectionPaste = (cards: CardWithInternalLayout[]): Card[] =>
  cards.map((card) => {
    const { _havdm_layout: _layout, ...rest } = deepClone(card);
    void _layout;
    return rest as Card;
  });

/**
 * Prepare clipboard cards for pasting into a **flat grid** view.
 *
 * Keeps each card's width/height but re-homes it to the bottom of the grid;
 * `y: Infinity` is react-grid-layout's "append below everything" sentinel.
 */
export const prepareCardsForFlatPaste = (
  cards: CardWithInternalLayout[],
): CardWithInternalLayout[] =>
  cards.map((card) => {
    const { _havdm_layout: _layout, ...rest } = deepClone(card);
    void _layout;
    return {
      ...rest,
      _havdm_layout: {
        x: 0,
        y: Infinity,
        w: card._havdm_layout?.w || PASTE_FALLBACK_WIDTH,
        h: card._havdm_layout?.h || PASTE_FALLBACK_HEIGHT,
      },
    } as CardWithInternalLayout;
  });
