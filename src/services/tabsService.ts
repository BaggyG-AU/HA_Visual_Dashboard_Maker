import type {
  NormalizedTabConfig,
  NormalizedTabsCardConfig,
  TabsAnimation,
  TabsCardConfig,
  TabsPosition,
  TabsSize,
} from '../types/tabs';

export const DEFAULT_TAB_ICON = 'mdi:tab';

const DEFAULT_CONFIG: Omit<NormalizedTabsCardConfig, 'tabs'> = {
  tab_position: 'top',
  tab_size: 'default',
  default_tab: 0,
  animation: 'none',
  lazy_render: true,
};

const isTabPosition = (value: unknown): value is TabsPosition =>
  value === 'top' || value === 'bottom' || value === 'left' || value === 'right';

const isTabSize = (value: unknown): value is TabsSize =>
  value === 'default' || value === 'small' || value === 'large';

const isTabAnimation = (value: unknown): value is TabsAnimation =>
  value === 'none' || value === 'fade' || value === 'slide';

export const clampTabIndex = (index: unknown, tabCount: number): number => {
  if (tabCount <= 0) return 0;
  if (typeof index !== 'number' || Number.isNaN(index)) return 0;
  const normalized = Math.floor(index);
  return Math.min(Math.max(normalized, 0), tabCount - 1);
};

const normalizeTab = (tab: TabsCardConfig['tabs'][number], index: number): NormalizedTabConfig => {
  const cards = Array.isArray(tab?.cards) ? tab.cards : [];
  const badgeRaw = tab?.badge;
  const badge = typeof badgeRaw === 'string'
    ? badgeRaw
    : typeof badgeRaw === 'number'
      ? String(badgeRaw)
      : undefined;

  const count = typeof tab?.count === 'number' && Number.isFinite(tab.count)
    ? Math.max(0, Math.floor(tab.count))
    : undefined;

  return {
    title: typeof tab?.title === 'string' && tab.title.trim().length > 0
      ? tab.title
      : `Tab ${index + 1}`,
    icon: typeof tab?.icon === 'string' && tab.icon.trim().length > 0
      ? tab.icon
      : DEFAULT_TAB_ICON,
    badge,
    count,
    cards,
  };
};

export const normalizeTabsConfig = (card: TabsCardConfig): NormalizedTabsCardConfig => {
  const tabs = Array.isArray(card.tabs) && card.tabs.length > 0
    ? card.tabs.map((tab, index) => normalizeTab(tab, index))
    : [normalizeTab({}, 0)];

  return {
    tab_position: isTabPosition(card.tab_position) ? card.tab_position : DEFAULT_CONFIG.tab_position,
    tab_size: isTabSize(card.tab_size) ? card.tab_size : DEFAULT_CONFIG.tab_size,
    default_tab: clampTabIndex(card.default_tab, tabs.length),
    animation: isTabAnimation(card.animation) ? card.animation : DEFAULT_CONFIG.animation,
    lazy_render: typeof card.lazy_render === 'boolean' ? card.lazy_render : DEFAULT_CONFIG.lazy_render,
    tabs,
  };
};

export const getNextActiveTabIndex = (
  currentIndex: number,
  requestedIndex: number,
  tabCount: number,
): number => {
  if (tabCount <= 0) return 0;
  if (requestedIndex === currentIndex) return currentIndex;
  return clampTabIndex(requestedIndex, tabCount);
};

export const shouldRenderTabPanel = (
  panelIndex: number,
  activeIndex: number,
  lazyRender: boolean,
): boolean => {
  if (!lazyRender) return true;
  return panelIndex === activeIndex;
};
