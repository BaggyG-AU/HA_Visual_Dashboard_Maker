import { describe, it, expect } from 'vitest';
import { selfCheckHaConfig } from '../../src/services/exportSelfCheck';
import type { DashboardConfig } from '../../src/types/dashboard';

const wrap = (cards: Record<string, unknown>[]): DashboardConfig =>
  ({ title: 'T', views: [{ title: 'V', path: 'v', cards }] }) as unknown as DashboardConfig;

describe('exportSelfCheck (B8 warn-only validation)', () => {
  it('returns no warnings for a clean HA-ready config', () => {
    const out = selfCheckHaConfig(
      wrap([
        { type: 'markdown', content: 'hi' },
        { type: 'custom:mushroom-template-card', layout: 'horizontal' },
      ]),
    );
    expect(out).toEqual([]);
  });

  it('flags a surviving _havdm_* / STRIP-class internal key', () => {
    const out = selfCheckHaConfig(
      wrap([{ type: 'markdown', _havdm_layout: { x: 0 }, icon_color_mode: 'state' }]),
    );
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ category: 'self-check', reason: 'leaked-internal' });
    expect(out[0].keys).toEqual(expect.arrayContaining(['_havdm_layout', 'icon_color_mode']));
  });

  it('flags a bare geometry `layout` but NOT a Mushroom string layout', () => {
    const geom = selfCheckHaConfig(
      wrap([{ type: 'markdown', layout: { x: 1, y: 2, w: 3, h: 4 } }]),
    );
    expect(geom).toHaveLength(1);
    expect(geom[0].keys).toContain('layout');

    const mushroom = selfCheckHaConfig(
      wrap([{ type: 'custom:mushroom-template-card', layout: 'vertical' }]),
    );
    expect(mushroom).toEqual([]);
  });

  it('flags surviving visibility_conditions/visibility_operator', () => {
    const out = selfCheckHaConfig(
      wrap([{ type: 'markdown', visibility_conditions: [], visibility_operator: 'or' }]),
    );
    expect(out).toHaveLength(1);
    expect(out[0].keys).toEqual(
      expect.arrayContaining(['visibility_conditions', 'visibility_operator']),
    );
  });

  it('flags a surviving phantom (canvas-only) card type', () => {
    const out = selfCheckHaConfig(wrap([{ type: 'custom:popup-card', popup: { cards: [] } }]));
    expect(out.some((w) => w.cardType === 'custom:popup-card' && w.keys.includes('type'))).toBe(
      true,
    );
  });

  it('detects leaks in NESTED cards (recursion)', () => {
    const out = selfCheckHaConfig(
      wrap([
        {
          type: 'vertical-stack',
          cards: [{ type: 'markdown', _havdm_layout: { x: 0 } }],
        },
      ]),
    );
    expect(out).toHaveLength(1);
    expect(out[0].keys).toContain('_havdm_layout');
  });

  it('detects leaks in cards INSIDE a sections view (sections[].cards recursion)', () => {
    const out = selfCheckHaConfig({
      title: 'T',
      views: [
        {
          title: 'V',
          path: 'v',
          type: 'sections',
          sections: [{ type: 'grid', cards: [{ type: 'markdown', _havdm_layout: { x: 0 } }] }],
        },
      ],
    } as unknown as DashboardConfig);
    expect(out).toHaveLength(1);
    expect(out[0].keys).toContain('_havdm_layout');
  });
});
