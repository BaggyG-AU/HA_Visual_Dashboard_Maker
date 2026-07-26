import { Card, View } from '../types/dashboard';
import { LayoutItem } from 'react-grid-layout';
import { getCardSizeConstraints } from './cardSizingContract';
import { isHavdmScaffoldView, isLayoutCardViewType } from '../services/haExportContract';

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
  const columns = template.split(/\s+/).filter((col) => col.trim().length > 0);
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
  const rows = template.split(/\s+/).filter((row) => row.trim().length > 0);
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

  const parts = position.split('/').map((p) => p.trim());

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
  rowHeight: number = HAVDM_CANVAS_ROW_HEIGHT,
): { x: number; y: number; w: number; h: number } => {
  const viewLayout = card.view_layout;

  if (!viewLayout) {
    // No view_layout - use auto-positioning.
    //
    // ⚠ Slice 4.7b: `getCardSizeConstraints` returns row SPANS tuned for the
    // canvas's 150px row. In a real layout-card view rendering at a smaller
    // declared row height, those spans would make the card several times too
    // short, so scale them to preserve roughly the intended PIXEL height. Cards
    // that declare their own `view_layout` are never touched — those spans are
    // the user's, expressed in their own grid's units.
    const constraints = getCardSizeConstraints(card);
    const scale = HAVDM_CANVAS_ROW_HEIGHT / rowHeight;
    const col = index % 2;
    const row = Math.floor(index / 2);
    return {
      x: col * 6,
      y: Math.round(row * 4 * scale),
      w: constraints.w,
      h: Math.max(1, Math.round(constraints.h * scale)),
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
  if (view.cards?.some((card) => card.view_layout)) return true;

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
 * How many columns the canvas should render this view on (slice 4.7a).
 *
 * HAVDM's flat canvas is a fixed 12-column grid and every view HAVDM creates
 * carries a matching `repeat(12, 1fr)` scaffold, so HAVDM's own views are
 * unaffected by this and keep rendering exactly as before. A view the USER
 * authored or imported can declare any column count, and rendering a 6-column
 * grid on 12 columns puts every card at half its real width — so honour what
 * the view actually declares.
 *
 * The result is clamped to a renderable 1..24 so a malformed template cannot
 * produce a zero-column (or absurdly wide) grid.
 *
 * ⚠ Scope: the ROW HEIGHT is handled by its sibling {@link getCanvasRowHeight}
 * (slice 4.7b), on exactly the same terms. Neither ever moves a HAVDM scaffold
 * view; the global `GRID_CONFIG.rowHeight` 150 -> 56 change for
 * Home-Assistant-Sections parity remains deferred (see `GRID_CONFIG` in
 * GridCanvas.tsx).
 */
export const HAVDM_CANVAS_COLUMNS = 12;

/**
 * The canvas's own row height, and the fallback for every view whose row height
 * HAVDM does not honour. Must stay in sync with `GRID_CONFIG.rowHeight` in
 * `components/GridCanvas.tsx`.
 */
export const HAVDM_CANVAS_ROW_HEIGHT = 150;

/** Row-height bounds that keep a card visible, clickable and draggable. */
const MIN_CANVAS_ROW_HEIGHT = 8;
const MAX_CANVAS_ROW_HEIGHT = 300;

export const getCanvasColumns = (view: View): number => {
  if (isHavdmScaffoldView(view)) return HAVDM_CANVAS_COLUMNS;
  if (!isLayoutCardViewType(view.type) && view.layout_type !== 'grid') {
    return HAVDM_CANVAS_COLUMNS;
  }
  if (!view.layout?.grid_template_columns) return HAVDM_CANVAS_COLUMNS;
  const columns = parseGridColumns(view.layout.grid_template_columns);
  if (!Number.isFinite(columns)) return HAVDM_CANVAS_COLUMNS;
  return Math.min(Math.max(1, Math.floor(columns)), 24);
};

/**
 * How tall the canvas should render one grid row for this view (slice 4.7b).
 *
 * The exact mirror of {@link getCanvasColumns}, and scoped just as narrowly: a
 * layout-card grid declaring `repeat(auto-fill, 30px)` means one row is 30px,
 * and rendering it on the canvas's 150px row makes every card five times too
 * tall — the user's `grid_row: 1 / 5` spans stop meaning anything. HAVDM's own
 * scaffold and every plain HA view keep the canvas default, so this can never
 * move a view HAVDM created.
 *
 * ⚠ SCOPE — this is NOT the global `GRID_CONFIG.rowHeight` 150 -> 56 change that
 * `components/GridCanvas.tsx` documents for Home-Assistant-Sections parity. That
 * one moves EVERY view including HAVDM's own, re-baselines every
 * `tests/e2e/layout.visual.spec.ts` snapshot, and needs the card `h` heuristics
 * in `cardSizingContract.ts` re-tuned first. It stays deferred; note the
 * scaffold DECLARES 56px yet has always RENDERED at 150, so honouring the
 * scaffold's own declaration here would silently BE that change.
 *
 * Only pixel row heights can be honoured — `1fr` / `auto` / `minmax(...)` have
 * no fixed height and react-grid-layout needs a number, so those fall back to
 * the canvas default. The result is clamped to a range that stays draggable.
 */
export const getCanvasRowHeight = (view: View): number => {
  if (isHavdmScaffoldView(view)) return HAVDM_CANVAS_ROW_HEIGHT;
  if (!isLayoutCardViewType(view.type) && view.layout_type !== 'grid') {
    return HAVDM_CANVAS_ROW_HEIGHT;
  }
  const template = view.layout?.grid_template_rows || view.layout?.grid_auto_rows;
  if (!template) return HAVDM_CANVAS_ROW_HEIGHT;

  const raw = parseGridRows(template);
  const match = raw.match(/^(\d+(?:\.\d+)?)px$/);
  if (!match) return HAVDM_CANVAS_ROW_HEIGHT;

  const px = Number.parseFloat(match[1]);
  if (!Number.isFinite(px) || px <= 0) return HAVDM_CANVAS_ROW_HEIGHT;
  return Math.min(Math.max(MIN_CANVAS_ROW_HEIGHT, Math.round(px)), MAX_CANVAS_ROW_HEIGHT);
};

/**
 * Convert layout-card grid to react-grid-layout
 */
export const convertLayoutCardToGridLayout = (view: View): LayoutItem[] => {
  const cards = view.cards || [];
  parseLayoutCardConfig(view);
  // Slice 4.7b: cards without their own `view_layout` fall back to heuristics
  // tuned for the canvas's default row, so they need to know what row height
  // this view actually renders at.
  const rowHeight = getCanvasRowHeight(view);

  return cards.map((card, index) => {
    const { x, y, w, h } = parseViewLayout(card, index, rowHeight);

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
  layout: readonly LayoutItem[],
): Array<{ grid_column: string; grid_row: string }> => {
  return layout.map((item) => {
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
