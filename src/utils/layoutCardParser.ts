import { Card, View } from '../types/dashboard';
import { Layout } from 'react-grid-layout';

/**
 * Parse layout-card grid configuration and convert to react-grid-layout format
 */

interface GridConfig {
  columns: number;
  rows: string; // e.g., "30px" or "auto"
  templateColumns?: string;
  templateRows?: string;
}

/**
 * Parse grid-template-columns to determine number of columns
 * Examples:
 *   "repeat(12, 1fr)" -> 12
 *   "1fr 1fr 1fr" -> 3
 *   "100px 200px 100px" -> 3
 */
const parseGridColumns = (template?: string): number => {
  if (!template) return 12; // Default to 12 columns

  // Handle repeat() syntax
  const repeatMatch = template.match(/repeat\((\d+),/);
  if (repeatMatch) {
    return parseInt(repeatMatch[1], 10);
  }

  // Count individual columns
  const columns = template.split(/\s+/).filter(col => col.trim().length > 0);
  return columns.length;
};

/**
 * Parse grid-template-rows to determine row height
 * Examples:
 *   "repeat(auto-fill, 30px)" -> "30px"
 *   "30px 30px 30px" -> "30px"
 */
const parseGridRows = (template?: string): string => {
  if (!template) return '30px'; // Default row height

  // Handle repeat() syntax
  const repeatMatch = template.match(/repeat\([^,]+,\s*([^)]+)\)/);
  if (repeatMatch) {
    return repeatMatch[1].trim();
  }

  // Get first row height
  const rows = template.split(/\s+/).filter(row => row.trim().length > 0);
  return rows[0] || '30px';
};

/**
 * Parse CSS grid position syntax to grid coordinates
 * Examples:
 *   "1 / 7" -> { start: 1, end: 7, span: 6 }
 *   "span 6" -> { span: 6 }
 *   "2 / span 4" -> { start: 2, span: 4 }
 */
const parseGridPosition = (position?: string): { start?: number; end?: number; span?: number } => {
  if (!position) return {};

  const parts = position.split('/').map(p => p.trim());

  if (parts.length === 2) {
    // "1 / 7" or "1 / span 4"
    const start = parts[0].match(/\d+/);
    const endOrSpan = parts[1];

    if (endOrSpan.startsWith('span')) {
      const span = endOrSpan.match(/\d+/);
      return {
        start: start ? parseInt(start[0], 10) : undefined,
        span: span ? parseInt(span[0], 10) : undefined,
      };
    } else {
      const end = endOrSpan.match(/\d+/);
      return {
        start: start ? parseInt(start[0], 10) : undefined,
        end: end ? parseInt(end[0], 10) : undefined,
      };
    }
  } else if (position.startsWith('span')) {
    // "span 6"
    const span = position.match(/\d+/);
    return {
      span: span ? parseInt(span[0], 10) : undefined,
    };
  } else {
    // Just a number
    const start = position.match(/\d+/);
    return {
      start: start ? parseInt(start[0], 10) : undefined,
    };
  }

  return {};
};

/**
 * Convert view_layout to react-grid-layout coordinates
 */
export const parseViewLayout = (
  card: Card,
  index: number,
  gridConfig: GridConfig
): { x: number; y: number; w: number; h: number } => {
  const viewLayout = card.view_layout;

  if (!viewLayout) {
    // No view_layout - use auto-positioning
    const col = index % 2;
    const row = Math.floor(index / 2);
    return {
      x: col * 6,
      y: row * 4,
      w: 6,
      h: 4,
    };
  }

  // Parse grid_column
  let x = 0;
  let w = 6; // Default width

  if (viewLayout.grid_column) {
    const colPos = parseGridPosition(viewLayout.grid_column);
    if (colPos.start !== undefined) {
      x = colPos.start - 1; // CSS Grid is 1-indexed, react-grid-layout is 0-indexed
    }
    if (colPos.span !== undefined) {
      w = colPos.span;
    } else if (colPos.start !== undefined && colPos.end !== undefined) {
      w = colPos.end - colPos.start;
    }
  }

  // Parse grid_row
  let y = 0;
  let h = 4; // Default height

  if (viewLayout.grid_row) {
    const rowPos = parseGridPosition(viewLayout.grid_row);
    if (rowPos.start !== undefined) {
      y = rowPos.start - 1; // CSS Grid is 1-indexed
    }
    if (rowPos.span !== undefined) {
      h = rowPos.span;
    } else if (rowPos.start !== undefined && rowPos.end !== undefined) {
      h = rowPos.end - rowPos.start;
    }
  }

  return { x, y, w, h };
};

/**
 * Check if view uses layout-card grid system
 */
export const isLayoutCardGrid = (view: View): boolean => {
  // Check if view type is layout-card
  if (view.type === 'custom:layout-card') return true;

  // Check if view has layout_type: grid
  if (view.layout_type === 'grid') return true;

  // Check if view has grid layout configuration
  if (view.layout?.grid_template_columns || view.layout?.grid_template_rows) return true;

  // Check if any cards have view_layout
  if (view.cards?.some(card => card.view_layout)) return true;

  return false;
};

/**
 * Parse layout-card view configuration
 */
export const parseLayoutCardConfig = (view: View): GridConfig => {
  const columns = parseGridColumns(view.layout?.grid_template_columns);
  const rowHeight = parseGridRows(view.layout?.grid_template_rows || view.layout?.grid_auto_rows);

  return {
    columns,
    rows: rowHeight,
    templateColumns: view.layout?.grid_template_columns,
    templateRows: view.layout?.grid_template_rows,
  };
};

/**
 * Convert layout-card grid to react-grid-layout
 */
export const convertLayoutCardToGridLayout = (view: View): Layout[] => {
  const cards = view.cards || [];
  const gridConfig = parseLayoutCardConfig(view);

  return cards.map((card, index) => {
    const { x, y, w, h } = parseViewLayout(card, index, gridConfig);

    return {
      i: `card-${index}`,
      x,
      y,
      w,
      h,
    };
  });
};

/**
 * Convert react-grid-layout back to layout-card view_layout
 */
export const convertGridLayoutToViewLayout = (
  layout: Layout[],
  totalColumns: number = 12
): Array<{ grid_column: string; grid_row: string }> => {
  return layout.map(item => {
    // Convert to CSS Grid 1-indexed positions
    const colStart = item.x + 1;
    const colEnd = item.x + item.w + 1;
    const rowStart = item.y + 1;
    const rowEnd = item.y + item.h + 1;

    return {
      grid_column: `${colStart} / ${colEnd}`,
      grid_row: `${rowStart} / ${rowEnd}`,
    };
  });
};
