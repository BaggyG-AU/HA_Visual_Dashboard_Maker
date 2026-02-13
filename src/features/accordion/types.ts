import type { Card } from '../../types/dashboard';

export interface ExpanderCardConfig {
  type: 'custom:expander-card';
  title?: string;
  'title-card'?: Card;
  'title-card-button-overlay'?: boolean;
  cards?: Card[];
  expanded?: boolean;
  'expanded-icon'?: string;
  'collapsed-icon'?: string;
  gap?: string;
  padding?: string;
  clear?: boolean;
  'overlay-margin'?: string;
  'child-padding'?: string;
  'button-background'?: string;
}

export interface NormalizedExpanderConfig {
  title: string;
  titleCard?: Card;
  titleCardButtonOverlay: boolean;
  cards: Card[];
  expanded: boolean;
  expandedIcon: string;
  collapsedIcon: string;
  gap: string;
  padding: string;
  clear: boolean;
  overlayMargin: string;
  childPadding: string;
  buttonBackground?: string;
}
