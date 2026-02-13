import { describe, expect, it } from 'vitest';
import {
  clampTabIndex,
  getNextActiveTabIndex,
  normalizeTabsConfig,
  shouldRenderTabPanel,
  toUpstreamTabbedCard,
} from '../../src/services/tabsService';
import type { TabsCardConfig } from '../../src/types/tabs';

const makeCard = (overrides: Partial<TabsCardConfig> = {}): TabsCardConfig => ({
  type: 'custom:tabbed-card',
  ...overrides,
});

describe('tabsService', () => {
  it('normalizes default config and tab fallback values', () => {
    const config = normalizeTabsConfig(makeCard({ tabs: [{}] }));

    expect(config.tab_position).toBe('top');
    expect(config.tab_size).toBe('default');
    expect(config.animation).toBe('none');
    expect(config.lazy_render).toBe(true);
    expect(config.tabs[0]).toMatchObject({
      title: 'Tab 1',
      icon: 'mdi:tab',
      cards: [],
    });
  });

  it('clamps default tab index to valid range', () => {
    const config = normalizeTabsConfig(makeCard({
      options: { defaultTabIndex: 99 },
      tabs: [
        { attributes: { label: 'One' } },
        { attributes: { label: 'Two' } },
      ],
    }));

    expect(config.default_tab).toBe(1);
  });

  it('preserves static badge and count fields', () => {
    const config = normalizeTabsConfig(makeCard({
      tabs: [{ attributes: { label: 'Status' }, badge: 'NEW', count: 3 }],
    }));

    expect(config.tabs[0].badge).toBe('NEW');
    expect(config.tabs[0].count).toBe(3);
  });

  it('handles active-tab transition reducer logic', () => {
    expect(getNextActiveTabIndex(0, 1, 3)).toBe(1);
    expect(getNextActiveTabIndex(1, 1, 3)).toBe(1);
    expect(getNextActiveTabIndex(1, 8, 3)).toBe(2);
  });

  it('returns lazy rendering behavior flags', () => {
    expect(shouldRenderTabPanel(0, 1, true)).toBe(false);
    expect(shouldRenderTabPanel(1, 1, true)).toBe(true);
    expect(shouldRenderTabPanel(0, 1, false)).toBe(true);
  });

  it('clamps tab index helper for edge cases', () => {
    expect(clampTabIndex(-2, 2)).toBe(0);
    expect(clampTabIndex(4, 2)).toBe(1);
    expect(clampTabIndex(undefined, 2)).toBe(0);
    expect(clampTabIndex(0, 0)).toBe(0);
  });

  it('parses upstream attributes and singular tab card shape', () => {
    const config = normalizeTabsConfig(makeCard({
      options: { defaultTabIndex: 1 },
      tabs: [
        {
          attributes: { label: 'Lights', icon: 'mdi:lightbulb' },
          card: { type: 'markdown', content: 'A' },
        },
        {
          attributes: { label: 'Climate', icon: 'mdi:thermometer' },
          card: {
            type: 'vertical-stack',
            cards: [
              { type: 'markdown', content: 'B' },
              { type: 'markdown', content: 'C' },
            ],
          },
        },
      ],
    }));

    expect(config.default_tab).toBe(1);
    expect(config.tabs[0]).toMatchObject({
      title: 'Lights',
      icon: 'mdi:lightbulb',
      cards: [{ type: 'markdown', content: 'A' }],
    });
    expect(config.tabs[1]).toMatchObject({
      title: 'Climate',
      icon: 'mdi:thermometer',
      cards: [
        {
          type: 'vertical-stack',
          cards: [
            { type: 'markdown', content: 'B' },
            { type: 'markdown', content: 'C' },
          ],
        },
      ],
    });
  });

  it('exports normalized config to upstream tabbed-card format', () => {
    const normalized = normalizeTabsConfig(makeCard({
      options: { defaultTabIndex: 1 },
      _havdm_tab_position: 'left',
      _havdm_animation: 'fade',
      tabs: [
        {
          attributes: { label: 'Single', icon: 'mdi:one' },
          cards: [{ type: 'markdown', content: 'One' }],
          badge: '3',
          count: 3,
        },
        {
          attributes: { label: 'Multi', icon: 'mdi:two' },
          cards: [
            { type: 'markdown', content: 'Two' },
            { type: 'markdown', content: 'Three' },
          ],
        },
      ],
    }));

    const upstream = toUpstreamTabbedCard(normalized, makeCard({
      styles: { '--mdc-theme-primary': 'yellow' },
      attributes: { stacked: true },
    }));

    expect(upstream.type).toBe('custom:tabbed-card');
    expect(upstream.options).toEqual({ defaultTabIndex: 1 });
    expect(upstream.styles).toEqual({ '--mdc-theme-primary': 'yellow' });
    expect(upstream.attributes).toEqual({ stacked: true });
    expect(upstream.tabs?.[0].attributes).toMatchObject({ label: 'Single', icon: 'mdi:one' });
    expect(upstream.tabs?.[0].card).toEqual({ type: 'markdown', content: 'One' });
    expect(upstream.tabs?.[1].card).toEqual({
      type: 'vertical-stack',
      cards: [
        { type: 'markdown', content: 'Two' },
        { type: 'markdown', content: 'Three' },
      ],
    });
    expect((upstream as unknown as Record<string, unknown>)._havdm_tab_position).toBeUndefined();
  });

  it('round-trips upstream config through normalized and export layers', () => {
    const upstream = makeCard({
      options: { defaultTabIndex: 1 },
      tabs: [
        {
          attributes: { label: 'Lights', icon: 'mdi:lightbulb' },
          card: { type: 'markdown', content: 'A' },
        },
      ],
    });

    const normalized = normalizeTabsConfig(upstream);
    const exported = toUpstreamTabbedCard(normalized, upstream);

    expect(exported).toMatchObject({
      type: 'custom:tabbed-card',
      options: { defaultTabIndex: 0 },
      tabs: [
        {
          attributes: { label: 'Lights', icon: 'mdi:lightbulb' },
          card: { type: 'markdown', content: 'A' },
        },
      ],
    });
  });
});
