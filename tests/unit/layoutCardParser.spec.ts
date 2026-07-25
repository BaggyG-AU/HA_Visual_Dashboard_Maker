import { describe, it, expect } from 'vitest';
import { getCanvasColumns } from '../../src/utils/layoutCardParser';
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
