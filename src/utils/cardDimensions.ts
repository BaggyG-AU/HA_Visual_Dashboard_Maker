import { Card } from '../types/dashboard';

/**
 * Calculate card dimensions based on content
 * This attempts to match Home Assistant's masonry layout behavior
 * by estimating heights based on card type and content
 */

interface CardDimensions {
  w: number; // width in grid columns (out of 12)
  h: number; // height in grid rows (1 row = 30px by default)
}

export const calculateCardDimensions = (card: any): CardDimensions => {
  const cardType = card.type;

  // Check if card already has explicit layout
  if ('layout' in card && card.layout) {
    return {
      w: card.layout.w || 6,
      h: card.layout.h || 4,
    };
  }

  // Default dimensions
  let width = 6; // Half width by default
  let height = 4; // Default height

  switch (cardType) {
    case 'entities':
      // Height based on number of entities + title
      const entityCount = Array.isArray(card.entities) ? card.entities.length : 0;
      const titleRows = card.title ? 1.5 : 0;
      // Each entity ≈ 0.8 rows, minimum 3 rows
      height = Math.max(3, Math.ceil(titleRows + (entityCount * 0.8)));
      width = 6; // Standard half-width
      break;

    case 'button':
      // Buttons are typically small and square-ish
      height = 4;
      width = 3; // Quarter width
      break;

    case 'glance':
      // Glance cards are compact
      const glanceEntities = Array.isArray(card.entities) ? card.entities.length : 0;
      const columns = card.columns || 5;
      const rows = Math.ceil(glanceEntities / columns);
      height = Math.max(3, rows * 1.5 + (card.title ? 1.5 : 0));
      width = 6;
      break;

    case 'markdown':
      // Estimate based on content length
      const content = card.content || '';
      const lines = content.split('\n').length;
      height = Math.max(3, Math.min(12, Math.ceil(lines * 0.6) + (card.title ? 1.5 : 0)));
      width = 6;
      break;

    case 'custom:apexcharts-card':
      // Use configured height from apex_config
      const apexHeight = card.apex_config?.chart?.height || 280;
      // Convert pixels to grid rows (30px per row) + header
      height = Math.ceil(apexHeight / 30) + (card.header?.show ? 2 : 0);
      width = 6;
      break;

    case 'custom:power-flow-card-plus':
      // Power flow cards are typically larger
      height = 12;
      width = 6;
      break;

    case 'vertical-stack':
      // Sum heights of child cards (estimate)
      const childCards = card.cards || [];
      height = childCards.reduce((total: number, child: any) => {
        const childDim = calculateCardDimensions(child);
        return total + childDim.h;
      }, 0);
      height = Math.max(4, Math.min(20, height)); // Clamp between 4 and 20
      width = 6;
      break;

    case 'horizontal-stack':
      // Horizontal stacks take full width
      width = 12;
      height = 4;
      break;

    case 'grid':
      // Grid cards with sub-cards
      const gridCards = card.cards || [];
      const gridColumns = card.columns || 2;
      const gridRows = Math.ceil(gridCards.length / gridColumns);
      height = Math.max(4, gridRows * 4);
      width = 12; // Full width for grid layouts
      break;

    case 'thermostat':
      // Thermostats are medium sized
      height = 6;
      width = 4;
      break;

    case 'gauge':
      // Gauges are compact
      height = 4;
      width = 3;
      break;

    case 'conditional':
      // Use dimensions of the wrapped card
      if (card.card) {
        return calculateCardDimensions(card.card);
      }
      height = 4;
      width = 6;
      break;

    case 'weather-forecast':
      // Weather cards are medium-tall
      height = 8;
      width = 6;
      break;

    default:
      // Custom cards and unknown types: default medium size
      if (cardType.startsWith('custom:')) {
        // Most custom cards are medium-large
        height = 8;
        width = 6;
      } else {
        // Unknown standard cards
        height = 4;
        width = 6;
      }
      break;
  }

  return {
    w: Math.min(12, width), // Clamp to max 12 columns
    h: Math.max(2, height), // Minimum 2 rows
  };
};

/**
 * Generate masonry-like layout for cards
 * Places cards in columns trying to balance heights
 */
export const generateMasonryLayout = (cards: any[]): Array<{ i: string; x: number; y: number; w: number; h: number }> => {
  const columnHeights = [0, 0]; // Track height of each column (2 columns)
  const layouts: Array<{ i: string; x: number; y: number; w: number; h: number }> = [];

  cards.forEach((card, index) => {
    const dimensions = calculateCardDimensions(card);

    // Determine which column to place card in
    let column = 0;
    let y = 0;

    if (dimensions.w >= 12) {
      // Full-width cards span both columns
      column = 0;
      y = Math.max(columnHeights[0], columnHeights[1]);
      // Update both column heights
      columnHeights[0] = y + dimensions.h;
      columnHeights[1] = y + dimensions.h;
    } else {
      // Place in shorter column
      column = columnHeights[0] <= columnHeights[1] ? 0 : 1;
      y = columnHeights[column];
      // Update column height
      columnHeights[column] = y + dimensions.h;
    }

    layouts.push({
      i: `card-${index}`,
      x: column * 6, // Column 0 = x:0, Column 1 = x:6
      y: y,
      w: dimensions.w,
      h: dimensions.h,
    });
  });

  return layouts;
};
