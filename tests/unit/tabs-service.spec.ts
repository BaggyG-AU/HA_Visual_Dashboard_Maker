import { describe, expect, it } from 'vitest';
import {
  clampTabIndex,
  getNextActiveTabIndex,
  normalizeTabsConfig,
  shouldRenderTabPanel,
} from '../../src/services/tabsService';
import type { TabsCardConfig } from '../../src/types/tabs';

const makeCard = (overrides: Partial<TabsCardConfig> = {}): TabsCardConfig => ({
  type: 'custom:tabs-card',
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
      default_tab: 99,
      tabs: [{ title: 'One' }, { title: 'Two' }],
    }));

    expect(config.default_tab).toBe(1);
  });

  it('preserves static badge and count fields', () => {
    const config = normalizeTabsConfig(makeCard({
      tabs: [{ title: 'Status', badge: 'NEW', count: 3 }],
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
});
