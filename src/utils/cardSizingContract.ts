/**
 * Card Sizing Contract - Defines how cards declare their size constraints
 * Based on Home Assistant's official grid specifications
 *
 * SOURCE: https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card
 *
 * HA uses TWO different sizing systems:
 * 1. Masonry View: getCardSize() where 1 unit = 50px height
 * 2. Sections View (Grid): getGridOptions() where 1 row = 56px height, 1 column ≈ 30px width
 *
 * This implementation uses the Sections Grid system (56px rows):
 * - 12 columns (each ~30px wide)
 * - Row height: 56px
 * - Gap: 8px between cells
 * - Cards provide constraints + heuristics, not fixed pixels
 * - Layout engine decides actual placement based on constraints
 */

export interface CardSizeConstraints {
  // Grid dimensions (12-column grid, matching HA Sections view)
  w: number;           // Default width in grid columns
  h: number;           // Default height in grid rows (1 row = 56px in HA sections grid)
  minW?: number;       // Minimum width
  maxW?: number;       // Maximum width
  minH?: number;       // Minimum height
  maxH?: number;       // Maximum height
}

/**
 * Calculate size constraints for a card based on its type and content
 * Returns constraints that the layout engine can use for placement
 *
 * Based on HA Sections Grid specifications:
 * - 1 grid row = 56px (official HA measurement)
 * - 1 column ≈ 30px (section width / 12)
 * - Gap = 8px between cells
 * - Returns constraints (min/max) not just fixed sizes
 * - Heights are heuristic estimates based on typical HA card sizes
 */
export const getCardSizeConstraints = (card: any): CardSizeConstraints => {
  const cardType = card.type;

  // Check if card already has explicit constraints from layout
  if ('layout' in card && card.layout) {
    return {
      w: card.layout.w || 6,
      h: card.layout.h || 4,
      minW: card.layout.minW || 3,
      maxW: card.layout.maxW || 12,
      minH: card.layout.minH || 2,
      maxH: card.layout.maxH || 20,
    };
  }

  // Default constraints
  let width = 6;      // Half width by default
  let height = 4;     // Default height (4 rows × 50px = 200px)
  let minW = 3;       // Minimum 3 columns
  let maxW = 12;      // Maximum 12 columns (full width)
  let minH = 2;       // Minimum 2 rows
  let maxH = 20;      // Maximum 20 rows

  switch (cardType) {
    case 'entities':
      // Height based on number of entities + title
      // HA measurements from actual frontend: more compact than expected
      const entityCount = Array.isArray(card.entities) ? card.entities.length : 0;
      const hasTitle = card.title ? true : false;

      // Actual HA measurements (smaller than initially thought):
      // Header ~40px, each entity ~40px, gaps 0px (overlapping borders), padding minimal
      const headerPx = hasTitle ? 40 : 0;
      const paddingPx = 24;  // Tighter padding
      const entityRowPx = entityCount * 40;  // Entities are more compact
      const totalPx = headerPx + paddingPx + entityRowPx;

      // Convert to grid rows (56px each)
      height = Math.max(2, Math.ceil(totalPx / 56));
      minH = 2;
      maxH = 30;
      width = 6;
      minW = 4;
      maxW = 12;
      break;

    case 'button':
      // Buttons are small and square-ish
      // HA renders buttons at ~120px tall, so 120/56 ≈ 2.14 rows
      height = 2;
      width = 3;
      minW = 2;
      maxW = 6;
      minH = 2;
      maxH = 4;
      break;

    case 'glance':
      // Glance cards are compact horizontal displays
      const glanceEntities = Array.isArray(card.entities) ? card.entities.length : 0;
      const columns = card.columns || 5;
      const rows = Math.ceil(glanceEntities / columns);
      // Each row in glance ≈ 60px in HA, so 60/56 ≈ 1.07 rows
      height = Math.max(2, Math.ceil(rows * 1.07 + (card.title ? 1 : 0)));
      width = 6;
      minW = 4;
      maxW = 12;
      minH = 2;
      maxH = 10;
      break;

    case 'markdown':
      // Estimate based on content length
      const content = card.content || '';
      const lines = content.split('\n').length;
      // Assume ~20px per line, so lines * 20 / 56 = lines * 0.36
      height = Math.max(2, Math.min(15, Math.ceil(lines * 0.36) + (card.title ? 1 : 0)));
      width = 6;
      minW = 4;
      maxW = 12;
      minH = 2;
      maxH = 20;
      break;

    case 'custom:apexcharts-card':
      // Use configured height from apex_config
      const apexHeight = card.apex_config?.chart?.height || 280;
      const hasHeader = card.header?.show !== false;

      // HA renders charts more compactly - reduce the configured height
      const apexTotalPx = (hasHeader ? 40 : 0) + 24 + (apexHeight * 0.7);

      // Convert to grid rows (56px each)
      height = Math.max(4, Math.ceil(apexTotalPx / 56));
      width = 6;
      minW = 4;
      maxW = 12;
      minH = 4;
      maxH = 20;
      break;

    case 'custom:power-flow-card-plus':
    case 'custom:power-flow-card':
      // Power flow cards are compact in HA - around 280px total
      const powerFlowTotalPx = 40 + 24 + 216;  // Header + padding + compact diagram
      height = Math.ceil(powerFlowTotalPx / 56);  // ≈ 5 rows
      width = 6;
      minW = 4;
      maxW = 12;
      minH = 4;
      maxH = 10;
      break;

    case 'vertical-stack':
      // Sum heights of child cards
      const childCards = card.cards || [];
      height = childCards.reduce((total: number, child: any) => {
        const childConstraints = getCardSizeConstraints(child);
        return total + childConstraints.h;
      }, 0);
      // No reduction factor - vertical stacks should show full height
      height = Math.max(4, Math.min(30, height));
      width = 6;
      minW = 3;
      maxW = 12;
      minH = 4;
      maxH = 40;
      break;

    case 'horizontal-stack':
      // Horizontal stacks take full width
      width = 12;
      height = 4;
      minW = 6;
      maxW = 12;
      minH = 3;
      maxH = 10;
      break;

    case 'grid':
      // Grid cards with sub-cards
      const gridCards = card.cards || [];
      const gridColumns = card.columns || 2;
      const gridRows = Math.ceil(gridCards.length / gridColumns);
      height = Math.max(4, gridRows * 4);
      width = 12;
      minW = 6;
      maxW = 12;
      minH = 4;
      maxH = 30;
      break;

    case 'thermostat':
      // Thermostats are medium sized (~250px in HA)
      // 250 / 56 ≈ 4.5 rows
      height = 5;
      width = 4;
      minW = 3;
      maxW = 6;
      minH = 4;
      maxH = 8;
      break;

    case 'gauge':
      // Gauges are compact (~180px)
      // 180 / 56 ≈ 3.2 rows
      height = 3;
      width = 3;
      minW = 2;
      maxW = 6;
      minH = 3;
      maxH = 6;
      break;

    case 'conditional':
      // Use dimensions of the wrapped card
      if (card.card) {
        return getCardSizeConstraints(card.card);
      }
      height = 4;
      width = 6;
      break;

    case 'weather-forecast':
      // Weather cards are medium-tall (~400px in HA)
      // 400 / 56 ≈ 7.1 rows
      height = 7;
      width = 6;
      minW = 4;
      maxW = 12;
      minH = 6;
      maxH = 12;
      break;

    case 'history-graph':
      // History graph cards need space for timeline (~280px in HA)
      // 280 / 56 ≈ 5 rows
      height = 5;
      width = 6;
      minW = 4;
      maxW = 12;
      minH = 4;
      maxH = 12;
      break;

    case 'map':
      // Map cards need significant space for visualization (~350px in HA)
      // 350 / 56 ≈ 6.25 rows
      height = 6;
      width = 6;
      minW = 4;
      maxW = 12;
      minH = 5;
      maxH = 15;
      break;

    case 'picture':
      // Picture cards are flexible, typically 3:2 aspect ratio (~280px in HA)
      // 280 / 56 ≈ 5 rows
      height = 5;
      width = 6;
      minW = 3;
      maxW = 12;
      minH = 3;
      maxH = 12;
      break;

    case 'picture-entity':
      // Picture entity cards similar to picture but with entity overlay (~300px in HA)
      // 300 / 56 ≈ 5.4 rows
      height = 5;
      width = 6;
      minW = 3;
      maxW = 12;
      minH = 4;
      maxH = 12;
      break;

    case 'picture-glance':
      // Picture glance cards have entity icons at bottom (~320px in HA)
      // 320 / 56 ≈ 5.7 rows
      height = 6;
      width = 6;
      minW = 4;
      maxW = 12;
      minH = 5;
      maxH = 12;
      break;

    case 'media-control':
      // Media player cards are medium-tall with album art and controls (~400px in HA)
      // 400 / 56 ≈ 7.1 rows
      height = 7;
      width = 6;
      minW = 4;
      maxW = 8;
      minH = 6;
      maxH = 10;
      break;

    case 'alarm-panel':
      // Alarm panel cards need space for state display and buttons (~420px in HA)
      // 420 / 56 ≈ 7.5 rows
      height = 8;
      width = 4;
      minW = 3;
      maxW = 6;
      minH = 7;
      maxH = 12;
      break;

    case 'plant-status':
      // Plant status cards show multiple metrics (~450px in HA)
      // 450 / 56 ≈ 8 rows
      height = 8;
      width = 4;
      minW = 3;
      maxW = 6;
      minH = 7;
      maxH = 12;
      break;

    case 'spacer':
      // Spacers are minimal
      height = 2;
      width = 6;
      minW = 1;
      maxW = 12;
      minH = 1;
      maxH = 2;
      break;

    case 'custom:better-thermostat-ui-card':
      // Better Thermostat UI card is taller than standard thermostat (~350px)
      // 350 / 56 ≈ 6.25 rows
      height = 6;
      width = 4;
      minW = 3;
      maxW = 6;
      minH = 5;
      maxH = 10;
      break;

    case 'custom:mini-graph-card':
      // Mini graph card is compact but needs space for the graph (~200px)
      // 200 / 56 ≈ 3.6 rows
      height = 4;
      width = 6;
      minW = 4;
      maxW = 12;
      minH = 3;
      maxH = 10;
      break;

    case 'custom:bubble-card':
      // Bubble cards are compact, single-row buttons (~80px)
      // 80 / 56 ≈ 1.4 rows
      height = 2;
      width = 3;
      minW = 2;
      maxW = 6;
      minH = 2;
      maxH = 4;
      break;

    // Mushroom cards - all types are compact (~100px)
    // 100 / 56 ≈ 1.8 rows
    case 'custom:mushroom-entity-card':
    case 'custom:mushroom-light-card':
    case 'custom:mushroom-fan-card':
    case 'custom:mushroom-cover-card':
    case 'custom:mushroom-climate-card':
    case 'custom:mushroom-media-player-card':
    case 'custom:mushroom-lock-card':
    case 'custom:mushroom-alarm-control-panel-card':
    case 'custom:mushroom-template-card':
    case 'custom:mushroom-title-card':
    case 'custom:mushroom-chips-card':
      height = 2;
      width = 3;
      minW = 2;
      maxW = 6;
      minH = 2;
      maxH = 5;
      break;

    default:
      // Custom cards and unknown types
      if (cardType.startsWith('custom:')) {
        // Most custom cards are medium-large (~400px)
        // 400 / 56 ≈ 7.1 rows
        height = 7;
        width = 6;
        minH = 4;
        maxH = 20;
      } else {
        // Unknown standard cards - conservative defaults
        height = 4;
        width = 6;
      }
      break;
  }

  return {
    w: Math.min(12, width),
    h: Math.max(2, height),
    minW: Math.max(1, minW),
    maxW: Math.min(12, maxW),
    minH: Math.max(1, minH),
    maxH,
  };
};

/**
 * Generate masonry-like layout for cards using size constraints
 * Places cards in columns trying to balance heights
 * Uses constraint-based sizing instead of fixed dimensions
 */
export const generateMasonryLayout = (cards: any[]): Array<{
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
}> => {
  const columnHeights = [0, 0]; // Track height of each column (2 columns)
  const layouts: Array<{
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    maxW?: number;
    minH?: number;
    maxH?: number;
  }> = [];

  cards.forEach((card, index) => {
    const constraints = getCardSizeConstraints(card);

    // Determine which column to place card in
    let column = 0;
    let y = 0;

    if (constraints.w >= 12) {
      // Full-width cards span both columns
      column = 0;
      y = Math.max(columnHeights[0], columnHeights[1]);
      // Update both column heights
      columnHeights[0] = y + constraints.h;
      columnHeights[1] = y + constraints.h;
    } else {
      // Place in shorter column
      column = columnHeights[0] <= columnHeights[1] ? 0 : 1;
      y = columnHeights[column];
      // Update column height
      columnHeights[column] = y + constraints.h;
    }

    layouts.push({
      i: `card-${index}`,
      x: column * 6, // Column 0 = x:0, Column 1 = x:6
      y: y,
      w: constraints.w,
      h: constraints.h,
      minW: constraints.minW,
      maxW: constraints.maxW,
      minH: constraints.minH,
      maxH: constraints.maxH,
    });
  });

  return layouts;
};
