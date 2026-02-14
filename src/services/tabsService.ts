import type {
  NormalizedTabConfig,
  NormalizedTabsCardConfig,
  TabbedCardAttributes,
  TabbedCardStyles,
  TabbedCardTab,
  TabsAnimation,
  TabsCardConfig,
  TabsPosition,
  TabsSize,
} from '../types/tabs';
import type { Card } from '../types/dashboard';

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

const resolveTabCards = (tab: TabbedCardTab | Record<string, unknown>): Card[] => {
  if (Array.isArray((tab as { cards?: unknown }).cards)) {
    return (tab as { cards: Card[] }).cards;
  }

  const singularCard = (tab as { card?: unknown }).card;
  if (singularCard && typeof singularCard === 'object') {
    return [singularCard as Card];
  }

  return [];
};

const resolveTabTitle = (tab: TabbedCardTab | Record<string, unknown>, index: number): string => {
  const attributes = (tab as { attributes?: TabbedCardAttributes }).attributes;
  if (typeof attributes?.label === 'string' && attributes.label.trim().length > 0) {
    return attributes.label;
  }

  const legacyTitle = (tab as { title?: unknown }).title;
  if (typeof legacyTitle === 'string' && legacyTitle.trim().length > 0) {
    return legacyTitle;
  }

  return `Tab ${index + 1}`;
};

const resolveTabIcon = (tab: TabbedCardTab | Record<string, unknown>): string => {
  const attributes = (tab as { attributes?: TabbedCardAttributes }).attributes;
  if (typeof attributes?.icon === 'string' && attributes.icon.trim().length > 0) {
    return attributes.icon;
  }

  const legacyIcon = (tab as { icon?: unknown }).icon;
  if (typeof legacyIcon === 'string' && legacyIcon.trim().length > 0) {
    return legacyIcon;
  }

  return DEFAULT_TAB_ICON;
};

const normalizeTab = (tab: TabsCardConfig['tabs'][number], index: number): NormalizedTabConfig => {
  const cards = resolveTabCards((tab ?? {}) as TabbedCardTab | Record<string, unknown>);
  const badgeRaw = tab?.badge ?? (tab as { badge?: unknown })?.badge;
  const badge = typeof badgeRaw === 'string'
    ? badgeRaw
    : typeof badgeRaw === 'number'
      ? String(badgeRaw)
      : undefined;

  const countRaw = tab?.count ?? (tab as { count?: unknown })?.count;
  const count = typeof countRaw === 'number' && Number.isFinite(countRaw)
    ? Math.max(0, Math.floor(countRaw))
    : undefined;

  return {
    title: resolveTabTitle((tab ?? {}) as TabbedCardTab | Record<string, unknown>, index),
    icon: resolveTabIcon((tab ?? {}) as TabbedCardTab | Record<string, unknown>),
    badge,
    count,
    cards,
  };
};

const pickHavdmTabPosition = (card: TabsCardConfig): TabsPosition | undefined => {
  if (isTabPosition(card._havdm_tab_position)) return card._havdm_tab_position;
  if (isTabPosition(card.tab_position)) return card.tab_position;
  return undefined;
};

const pickHavdmTabSize = (card: TabsCardConfig): TabsSize | undefined => {
  if (isTabSize(card._havdm_tab_size)) return card._havdm_tab_size;
  if (isTabSize(card.tab_size)) return card.tab_size;
  return undefined;
};

const pickHavdmAnimation = (card: TabsCardConfig): TabsAnimation | undefined => {
  if (isTabAnimation(card._havdm_animation)) return card._havdm_animation;
  if (isTabAnimation(card.animation)) return card.animation;
  return undefined;
};

const pickHavdmLazyRender = (card: TabsCardConfig): boolean | undefined => {
  if (typeof card._havdm_lazy_render === 'boolean') return card._havdm_lazy_render;
  if (typeof card.lazy_render === 'boolean') return card.lazy_render;
  return undefined;
};

const pickDefaultTab = (card: TabsCardConfig): number | undefined => {
  if (typeof card.options?.defaultTabIndex === 'number') return card.options.defaultTabIndex;
  if (typeof card.default_tab === 'number') return card.default_tab;
  return undefined;
};

export const normalizeTabsConfig = (card: TabsCardConfig): NormalizedTabsCardConfig => {
  const tabs = Array.isArray(card.tabs) && card.tabs.length > 0
    ? card.tabs.map((tab, index) => normalizeTab(tab, index))
    : [normalizeTab({}, 0)];

  return {
    tab_position: pickHavdmTabPosition(card) ?? DEFAULT_CONFIG.tab_position,
    tab_size: pickHavdmTabSize(card) ?? DEFAULT_CONFIG.tab_size,
    default_tab: clampTabIndex(pickDefaultTab(card), tabs.length),
    animation: pickHavdmAnimation(card) ?? DEFAULT_CONFIG.animation,
    lazy_render: pickHavdmLazyRender(card) ?? DEFAULT_CONFIG.lazy_render,
    tabs,
  };
};

const normalizeTabStyles = (styles: unknown): TabbedCardStyles | undefined => {
  if (!styles || typeof styles !== 'object') return undefined;
  const entries = Object.entries(styles as Record<string, unknown>)
    .filter(([, value]) => typeof value === 'string')
    .map(([key, value]) => [key, value as string] as const);
  if (entries.length === 0) return undefined;
  return Object.fromEntries(entries);
};

const normalizeTabAttributes = (tab: NormalizedTabConfig): TabbedCardAttributes => ({
  label: tab.title,
  icon: tab.icon,
});

const normalizeUpstreamCard = (cards: Card[]): Card | undefined => {
  if (cards.length === 0) return undefined;
  if (cards.length === 1) return cards[0];
  return {
    type: 'vertical-stack',
    cards,
  } as Card;
};

export const toUpstreamTabbedCard = (
  config: NormalizedTabsCardConfig,
  existingCard?: TabsCardConfig,
): TabsCardConfig => {
  const mappedTabs: TabbedCardTab[] = config.tabs
    .map((tab, index) => {
      const existingTab = Array.isArray(existingCard?.tabs) ? existingCard.tabs[index] : undefined;
      const attributes = {
        ...(existingTab?.attributes ?? {}),
        ...normalizeTabAttributes(tab),
      };

      const upstreamTab: TabbedCardTab = {
        attributes,
        card: normalizeUpstreamCard(tab.cards),
      };

      const styles = normalizeTabStyles(existingTab?.styles);
      if (styles) {
        upstreamTab.styles = styles;
      }

      return upstreamTab;
    })
    .filter((tab) => Boolean(tab.card));

  const nextCard: TabsCardConfig = {
    type: 'custom:tabbed-card',
    tabs: mappedTabs,
  };

  const defaultTabIndex = clampTabIndex(config.default_tab, mappedTabs.length);
  nextCard.options = { defaultTabIndex };

  const globalStyles = normalizeTabStyles(existingCard?.styles);
  if (globalStyles) {
    nextCard.styles = globalStyles;
  }

  if (existingCard?.attributes && typeof existingCard.attributes === 'object') {
    nextCard.attributes = { ...existingCard.attributes };
  }

  return nextCard;
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
