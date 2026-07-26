import { describe, it, expect } from 'vitest';
import {
  getCanvasColumns,
  getCanvasRowHeight,
  parseViewLayout,
  HAVDM_CANVAS_ROW_HEIGHT,
} from '../../src/utils/layoutCardParser';
import { HAVDM_SCAFFOLD_VIEW_FIELDS } from '../../src/utils/viewsLayout';
import type { View } from '../../src/types/dashboard';

// Tier 4 slice 4.7a — canvas column count for first-class layout-card views.
//
// HAVDM's flat canvas is a fixed 12-column grid, and every view HAVDM creates
// carries a matching `repeat(12, 1fr)` scaffold. A view the USER authored or
// imported can declare any column count, and rendering it on 12 columns puts
// every card at the wrong width. This helper is what lets the canvas honour the
// user's grid while leaving HAVDM's own views pixel-identical.

const view = (over: Partial<View> = {}): View => ({ title: 'V', path: 'v', cards: [], ...over });

describe('layoutCardParser — getCanvasColumns (Tier 4, slice 4.7a)', () => {
  it("honours a real layout-card view's declared column count", () => {
    const real = view({
      type: 'custom:grid-layout',
      layout: { grid_template_columns: 'repeat(6, 1fr)' },
    } as Partial<View>);
    expect(getCanvasColumns(real)).toBe(6);
  });

  it('counts explicitly-listed columns too', () => {
    const real = view({
      type: 'custom:grid-layout',
      layout: { grid_template_columns: '1fr 1fr 1fr' },
    } as Partial<View>);
    expect(getCanvasColumns(real)).toBe(3);
  });

  it("keeps HAVDM's own scaffold on 12 columns (the canvas is unchanged)", () => {
    const scaffold = view({ ...HAVDM_SCAFFOLD_VIEW_FIELDS } as Partial<View>);
    expect(getCanvasColumns(scaffold)).toBe(12);
  });

  it('falls back to 12 columns for a plain HA view', () => {
    expect(getCanvasColumns(view({ type: 'masonry' }))).toBe(12);
    expect(getCanvasColumns(view())).toBe(12);
  });

  it('clamps a nonsensical column count into a renderable range', () => {
    const zero = view({
      type: 'custom:grid-layout',
      layout: { grid_template_columns: 'repeat(0, 1fr)' },
    } as Partial<View>);
    expect(getCanvasColumns(zero)).toBe(1);

    const huge = view({
      type: 'custom:grid-layout',
      layout: { grid_template_columns: 'repeat(999, 1fr)' },
    } as Partial<View>);
    expect(getCanvasColumns(huge)).toBe(24);
  });
});

// ---------------------------------------------------------------------------
// Tier 4 slice 4.7b — canvas ROW-HEIGHT fidelity
// ---------------------------------------------------------------------------
//
// The mirror of getCanvasColumns. A layout-card grid declaring
// `repeat(auto-fill, 30px)` means "one row is 30px"; rendering it on HAVDM's
// 150px canvas row makes every card 5x too tall and the user's careful
// `grid_row: 1 / 5` spans meaningless.
//
// ⚠ SCOPE — this is deliberately NOT the global GRID_CONFIG.rowHeight 150 -> 56
// change that GridCanvas.tsx documents for Home-Assistant-Sections parity. That
// one touches EVERY view including HAVDM's own scaffold, re-baselines every
// layout.visual snapshot, and needs the card `h` heuristics re-tuned first. It
// stays deferred. This helper only ever departs from the canvas default for a
// view the USER authored, exactly as getCanvasColumns does.

describe('layoutCardParser — getCanvasRowHeight (Tier 4, slice 4.7b)', () => {
  it("honours a real layout-card view's declared row height", () => {
    const real = view({
      type: 'custom:grid-layout',
      layout: { grid_template_rows: 'repeat(auto-fill, 30px)' },
    } as Partial<View>);
    expect(getCanvasRowHeight(real)).toBe(30);
  });

  it('reads an explicit first row height and grid_auto_rows', () => {
    expect(
      getCanvasRowHeight(
        view({
          type: 'custom:grid-layout',
          layout: { grid_template_rows: '40px 40px 40px' },
        } as Partial<View>),
      ),
    ).toBe(40);
    expect(
      getCanvasRowHeight(
        view({
          type: 'custom:grid-layout',
          layout: { grid_auto_rows: '25px' },
        } as Partial<View>),
      ),
    ).toBe(25);
  });

  it("keeps HAVDM's own scaffold on the canvas default (layout.visual is untouched)", () => {
    // The scaffold DECLARES 56px but has always RENDERED at 150. Honouring its
    // declaration here is the deferred global change — not this one.
    const scaffold = view({ ...HAVDM_SCAFFOLD_VIEW_FIELDS } as Partial<View>);
    expect(getCanvasRowHeight(scaffold)).toBe(HAVDM_CANVAS_ROW_HEIGHT);
  });

  it('falls back to the canvas default for a plain HA view', () => {
    expect(getCanvasRowHeight(view({ type: 'masonry' }))).toBe(HAVDM_CANVAS_ROW_HEIGHT);
    expect(getCanvasRowHeight(view())).toBe(HAVDM_CANVAS_ROW_HEIGHT);
  });

  it('falls back to the default for a non-px row unit it cannot render', () => {
    // `1fr` / `auto` / `minmax(...)` have no fixed pixel height, and
    // react-grid-layout needs a number.
    expect(
      getCanvasRowHeight(
        view({
          type: 'custom:grid-layout',
          layout: { grid_template_rows: 'repeat(auto-fill, 1fr)' },
        } as Partial<View>),
      ),
    ).toBe(HAVDM_CANVAS_ROW_HEIGHT);
    expect(
      getCanvasRowHeight(
        view({
          type: 'custom:grid-layout',
          layout: { grid_template_rows: 'auto' },
        } as Partial<View>),
      ),
    ).toBe(HAVDM_CANVAS_ROW_HEIGHT);
  });

  it('clamps an unusable row height into a draggable range', () => {
    const tiny = view({
      type: 'custom:grid-layout',
      layout: { grid_template_rows: 'repeat(auto-fill, 1px)' },
    } as Partial<View>);
    expect(getCanvasRowHeight(tiny)).toBe(8);

    const huge = view({
      type: 'custom:grid-layout',
      layout: { grid_template_rows: 'repeat(auto-fill, 5000px)' },
    } as Partial<View>);
    expect(getCanvasRowHeight(huge)).toBe(300);
  });
});

describe('layoutCardParser — heuristic card height at a non-default row height (slice 4.7b)', () => {
  // A card inside a real layout-card view that has NO `view_layout` falls back
  // to the `getCardSizeConstraints` heuristics, which are tuned for the 150px
  // canvas row. At a declared 30px row those spans render ~5x too short, so the
  // fallback scales to preserve roughly the intended PIXEL height. Cards that DO
  // declare view_layout are untouched — their spans are the user's own.
  it('scales the fallback height for a card with no view_layout', () => {
    const card = { type: 'button' } as never;
    const atDefault = parseViewLayout(card, 0, HAVDM_CANVAS_ROW_HEIGHT);
    const atThirty = parseViewLayout(card, 0, 30);
    expect(atThirty.h).toBeGreaterThan(atDefault.h);
    // ~5x the row count for a 5x shorter row.
    expect(atThirty.h).toBe(atDefault.h * 5);
  });

  it("leaves a card's OWN declared view_layout spans alone", () => {
    const card = {
      type: 'button',
      view_layout: { grid_column: '1 / 4', grid_row: '1 / 5' },
    } as never;
    expect(parseViewLayout(card, 0, 30)).toEqual({ x: 0, y: 0, w: 3, h: 4 });
  });

  it('defaults to the canvas row height when none is passed (back-compatible)', () => {
    const card = { type: 'button' } as never;
    expect(parseViewLayout(card, 0)).toEqual(parseViewLayout(card, 0, HAVDM_CANVAS_ROW_HEIGHT));
  });
});
