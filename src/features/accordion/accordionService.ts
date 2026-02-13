import type { Card } from '../../types/dashboard';
import type { ExpanderCardConfig, NormalizedExpanderConfig } from './types';

export const MAX_EXPANDER_DEPTH = 3;
export const DEFAULT_EXPANDED_ICON = 'mdi:chevron-up';
export const DEFAULT_COLLAPSED_ICON = 'mdi:chevron-down';
export const DEFAULT_GAP = '0.6em';
export const DEFAULT_PADDING = '0';
export const DEFAULT_OVERLAY_MARGIN = '2em';
export const DEFAULT_CHILD_PADDING = '0';

const toStringWithDefault = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

export const normalizeExpanderConfig = (card: ExpanderCardConfig): NormalizedExpanderConfig => ({
  title: typeof card.title === 'string' ? card.title : '',
  titleCard: card['title-card'],
  titleCardButtonOverlay: Boolean(card['title-card-button-overlay']),
  cards: Array.isArray(card.cards) ? card.cards : [],
  expanded: Boolean(card.expanded),
  expandedIcon: toStringWithDefault(card['expanded-icon'], DEFAULT_EXPANDED_ICON),
  collapsedIcon: toStringWithDefault(card['collapsed-icon'], DEFAULT_COLLAPSED_ICON),
  gap: toStringWithDefault(card.gap, DEFAULT_GAP),
  padding: toStringWithDefault(card.padding, DEFAULT_PADDING),
  clear: Boolean(card.clear),
  overlayMargin: toStringWithDefault(card['overlay-margin'], DEFAULT_OVERLAY_MARGIN),
  childPadding: toStringWithDefault(card['child-padding'], DEFAULT_CHILD_PADDING),
  buttonBackground: typeof card['button-background'] === 'string' ? card['button-background'] : undefined,
});

export const getExpanderNestingDepth = (card: Card, depth = 1): number => {
  if (card.type !== 'custom:expander-card') {
    return depth - 1;
  }

  const normalized = normalizeExpanderConfig(card as ExpanderCardConfig);
  let maxDepth = depth;

  normalized.cards.forEach((childCard) => {
    if (childCard.type === 'custom:expander-card') {
      maxDepth = Math.max(maxDepth, getExpanderNestingDepth(childCard, depth + 1));
    }
  });

  return maxDepth;
};

export const validateExpanderNestingDepth = (
  card: Card,
  maxDepth = MAX_EXPANDER_DEPTH,
): boolean => {
  if (card.type !== 'custom:expander-card') return true;
  return getExpanderNestingDepth(card, 1) <= maxDepth;
};
