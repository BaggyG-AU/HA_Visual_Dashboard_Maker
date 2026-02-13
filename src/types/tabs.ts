import type { Card } from './dashboard';

// Upstream tabbed-card types
export interface TabbedCardAttributes {
  label?: string;
  icon?: string;
  isFadingIndicator?: boolean;
  minWidth?: boolean;
  isMinWidthIndicator?: boolean;
  stacked?: boolean;
}

export interface TabbedCardStyles {
  [key: string]: string;
}

export interface TabbedCardTab {
  card?: Card;
  cards?: Card[]; // Legacy HAVDM compatibility
  styles?: TabbedCardStyles;
  attributes?: TabbedCardAttributes;
  badge?: string | number; // HAVDM-only extension (stripped on export)
  count?: number; // HAVDM-only extension (stripped on export)
}

export interface TabbedCardOptions {
  defaultTabIndex?: number;
}

export type TabsPosition = 'top' | 'bottom' | 'left' | 'right';
export type TabsSize = 'default' | 'small' | 'large';
export type TabsAnimation = 'none' | 'fade' | 'slide';

export interface TabsCardConfig {
  type: 'custom:tabbed-card';
  options?: TabbedCardOptions;
  styles?: TabbedCardStyles;
  attributes?: TabbedCardAttributes;
  tabs?: TabbedCardTab[];
  // HAVDM-only extensions (stripped on export)
  _havdm_tab_position?: TabsPosition;
  _havdm_tab_size?: TabsSize;
  _havdm_animation?: TabsAnimation;
  _havdm_lazy_render?: boolean;
  // Legacy HAVDM compatibility
  tab_position?: TabsPosition;
  tab_size?: TabsSize;
  default_tab?: number;
  animation?: TabsAnimation;
  lazy_render?: boolean;
}

export interface NormalizedTabConfig {
  title: string;
  icon: string;
  badge?: string;
  count?: number;
  cards: Card[];
}

export interface NormalizedTabsCardConfig {
  tab_position: TabsPosition;
  tab_size: TabsSize;
  default_tab: number;
  animation: TabsAnimation;
  lazy_render: boolean;
  tabs: NormalizedTabConfig[];
}
