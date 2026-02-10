import type { Card } from './dashboard';

export type TabsPosition = 'top' | 'bottom' | 'left' | 'right';
export type TabsSize = 'default' | 'small' | 'large';
export type TabsAnimation = 'none' | 'fade' | 'slide';

export interface TabConfig {
  title?: string;
  icon?: string;
  badge?: string | number;
  count?: number;
  cards?: Card[];
}

export interface TabsCardConfig {
  type: 'custom:tabs-card';
  title?: string;
  tab_position?: TabsPosition;
  tab_size?: TabsSize;
  default_tab?: number;
  animation?: TabsAnimation;
  lazy_render?: boolean;
  tabs?: TabConfig[];
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
