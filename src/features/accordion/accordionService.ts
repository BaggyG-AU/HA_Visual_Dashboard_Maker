import type { Card } from '../../types/dashboard';
import type {
  AccordionCardConfig,
  AccordionExpandMode,
  AccordionStyleMode,
  NormalizedAccordionConfig,
  NormalizedAccordionSection,
} from './types';

export const MAX_ACCORDION_DEPTH = 3;
export const DEFAULT_SECTION_ICON = 'mdi:folder-outline';

const DEFAULT_CONFIG: Omit<NormalizedAccordionConfig, 'sections'> = {
  expand_mode: 'single',
  style: 'bordered',
  header_background: undefined,
  content_padding: 12,
};

const isExpandMode = (value: unknown): value is AccordionExpandMode => value === 'single' || value === 'multi';
const isStyleMode = (value: unknown): value is AccordionStyleMode =>
  value === 'bordered' || value === 'borderless' || value === 'ghost';

const toContentPadding = (value: unknown): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) return DEFAULT_CONFIG.content_padding;
  return Math.max(0, value);
};

const normalizeSection = (
  section: AccordionCardConfig['sections'][number],
  index: number,
): NormalizedAccordionSection => {
  const cards = Array.isArray(section?.cards) ? section.cards : [];
  return {
    title: typeof section?.title === 'string' && section.title.trim().length > 0
      ? section.title
      : `Section ${index + 1}`,
    icon: typeof section?.icon === 'string' && section.icon.trim().length > 0
      ? section.icon
      : DEFAULT_SECTION_ICON,
    default_expanded: Boolean(section?.default_expanded),
    cards,
  };
};

const ensureValidDefaultExpansion = (
  sections: NormalizedAccordionSection[],
  expandMode: AccordionExpandMode,
): NormalizedAccordionSection[] => {
  if (sections.length === 0) {
    return [{
      title: 'Section 1',
      icon: DEFAULT_SECTION_ICON,
      default_expanded: true,
      cards: [],
    }];
  }

  if (expandMode === 'multi') {
    return sections;
  }

  const hasAnyDefaultExpanded = sections.some((section) => section.default_expanded);
  if (!hasAnyDefaultExpanded) {
    return sections;
  }

  let foundExpanded = false;
  return sections.map((section) => {
    if (!section.default_expanded) return section;
    if (!foundExpanded) {
      foundExpanded = true;
      return section;
    }
    return { ...section, default_expanded: false };
  });
};

export const normalizeAccordionConfig = (card: AccordionCardConfig): NormalizedAccordionConfig => {
  const expandMode = isExpandMode(card.expand_mode) ? card.expand_mode : DEFAULT_CONFIG.expand_mode;
  const sections = Array.isArray(card.sections)
    ? card.sections.map((section, index) => normalizeSection(section, index))
    : [];

  return {
    expand_mode: expandMode,
    style: isStyleMode(card.style) ? card.style : DEFAULT_CONFIG.style,
    header_background: typeof card.header_background === 'string' ? card.header_background : undefined,
    content_padding: toContentPadding(card.content_padding),
    sections: ensureValidDefaultExpansion(sections, expandMode),
  };
};

export const getDefaultExpandedSections = (config: NormalizedAccordionConfig): number[] => {
  if (config.expand_mode === 'single') {
    const firstExpandedIndex = config.sections.findIndex((section) => section.default_expanded);
    return firstExpandedIndex >= 0 ? [firstExpandedIndex] : [];
  }

  const expandedIndexes = config.sections
    .map((section, index) => (section.default_expanded ? index : -1))
    .filter((index) => index >= 0);

  return expandedIndexes;
};

export const toggleAccordionSection = (
  expanded: Set<number>,
  index: number,
  mode: AccordionExpandMode,
): Set<number> => {
  if (mode === 'single') {
    if (expanded.has(index)) return new Set();
    return new Set([index]);
  }

  const next = new Set(expanded);
  if (next.has(index)) {
    next.delete(index);
  } else {
    next.add(index);
  }
  return next;
};

export const setAllSectionsExpanded = (
  sectionCount: number,
  expanded: boolean,
  mode: AccordionExpandMode,
): Set<number> => {
  if (!expanded) return new Set();
  if (mode === 'single') return new Set(sectionCount > 0 ? [0] : []);
  return new Set(Array.from({ length: sectionCount }, (_value, index) => index));
};

export const getAccordionNestingDepth = (card: Card, depth = 1): number => {
  if (card.type !== 'custom:accordion-card') {
    return depth - 1;
  }

  const normalized = normalizeAccordionConfig(card as AccordionCardConfig);
  let maxDepth = depth;

  normalized.sections.forEach((section) => {
    section.cards.forEach((childCard) => {
      if (childCard.type === 'custom:accordion-card') {
        maxDepth = Math.max(maxDepth, getAccordionNestingDepth(childCard, depth + 1));
      }
    });
  });

  return maxDepth;
};

export const validateAccordionNestingDepth = (
  card: Card,
  maxDepth = MAX_ACCORDION_DEPTH,
): boolean => {
  if (card.type !== 'custom:accordion-card') return true;
  return getAccordionNestingDepth(card, 1) <= maxDepth;
};
