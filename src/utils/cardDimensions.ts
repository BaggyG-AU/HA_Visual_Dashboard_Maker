/**
 * DEPRECATED: This file is kept for backward compatibility
 * New code should use cardSizingContract.ts which implements
 * Home Assistant's constraint-based sizing approach
 *
 * Official HA grid specifications (Sections view):
 * - Row height: 56px
 * - Column width: ~30px (section width / 12)
 * - Gap: 8px between cells
 *
 * This file used 30px per row which didn't match HA's actual rendering
 */

import { getCardSizeConstraints, generateMasonryLayout as generateMasonryLayoutNew } from './cardSizingContract';

interface CardDimensions {
  w: number; // width in grid columns (out of 12)
  h: number; // height in grid rows
}

/**
 * @deprecated Use getCardSizeConstraints from cardSizingContract.ts instead
 */
export const calculateCardDimensions = (card: any): CardDimensions => {
  const constraints = getCardSizeConstraints(card);
  return {
    w: constraints.w,
    h: constraints.h,
  };
};

/**
 * @deprecated Use generateMasonryLayout from cardSizingContract.ts instead
 */
export const generateMasonryLayout = (cards: any[]): Array<{ i: string; x: number; y: number; w: number; h: number }> => {
  return generateMasonryLayoutNew(cards);
};
