import { parseUpstreamSwipeCard } from '../features/carousel/carouselService';
import type { SwiperCardConfig } from '../features/carousel/types';
import type { TabsCardConfig, TabbedCardAttributes } from '../types/tabs';
import { STRIP_KEYS } from './haExportContract';

const SWIPE_KNOWN_PARAMETER_KEYS = new Set([
  'slidesPerView',
  'spaceBetween',
  'centeredSlides',
  'freeMode',
  'autoplay',
  'pagination',
  'navigation',
  'effect',
  'loop',
  'direction',
  'speed',
]);

const SWIPE_KNOWN_CARD_KEYS = new Set([
  'pagination',
  'navigation',
  'autoplay',
  'effect',
  'slides_per_view',
  'space_between',
  'loop',
  'direction',
  'speed',
  'centered_slides',
  'free_mode',
  'start_card',
  'reset_after',
  'slides',
  'cards',
  'parameters',
]);

const EXPANDER_KNOWN_KEYS = new Set([
  'title',
  'title-card',
  'title-card-button-overlay',
  'cards',
  'expanded',
  'expanded-icon',
  'collapsed-icon',
  'gap',
  'padding',
  'clear',
  'overlay-margin',
  'child-padding',
  'button-background',
  'titleCard',
  'titleCardButtonOverlay',
  'expandedIcon',
  'collapsedIcon',
  'overlayMargin',
  'childPadding',
  'buttonBackground',
  '_expanderDepth',
]);

const TABBED_KNOWN_KEYS = new Set([
  'options',
  'tabs',
  'styles',
  'attributes',
  '_havdm_styles',
  'default_tab',
  'tab_position',
  'tab_size',
  'animation',
  'lazy_render',
  '_havdm_tab_position',
  '_havdm_tab_size',
  '_havdm_animation',
  '_havdm_lazy_render',
]);

const TABS_HAVDM_ONLY_KEYS = new Set([
  'tab_position',
  'tab_size',
  'animation',
  'lazy_render',
  '_havdm_tab_position',
  '_havdm_tab_size',
  '_havdm_animation',
  '_havdm_lazy_render',
]);

const TAB_HAVDM_ONLY_KEYS = new Set(['title', 'icon', 'cards', 'badge', 'count']);
const CALENDAR_HAVDM_ONLY_KEYS = new Set([
  'calendar_entities',
  'view',
  'show_week_numbers',
  'show_agenda',
  'on_date_select',
  'selected_date',
  'events',
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asCardRecord = (value: unknown): Record<string, unknown> | null => {
  if (!isRecord(value)) return null;
  if (typeof value.type !== 'string') return null;
  return value;
};

const toNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && !Number.isNaN(value) ? value : undefined;

const omitKeys = (source: Record<string, unknown>, keys: Set<string>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  Object.entries(source).forEach(([key, value]) => {
    if (!keys.has(key)) {
      result[key] = value;
    }
  });
  return result;
};

// Slice B2: the STRIP class of the export contract (haExportContract.ts) — the
// HAVDM-internal bookkeeping keys that carry no HA meaning. Removed from every
// card at every depth by exportCard (which processCardRecursively applies
// recursively). NOTE: bare `layout` is deliberately NOT here — its rename to
// `_havdm_layout` + import migration is slice B5, and stripping bare `layout`
// now would clobber Mushroom's real `layout: 'horizontal'`.
const STRIP_KEY_SET = new Set<string>(STRIP_KEYS);

const stripInternalKeys = (card: Record<string, unknown>): Record<string, unknown> =>
  omitKeys(card, STRIP_KEY_SET);

// Slice B3: spacer cards are a HAVDM-internal layout device with no HA type
// (`type: 'spacer'` renders as an error tile). They are filtered out of the
// export at every depth by the recursive pass below (previously only at the top
// level, in sanitizeForHA).
const isSpacerCard = (card: Record<string, unknown>): boolean =>
  card.type === 'spacer' || card._isSpacer === true;

const slideCardsToCards = (slides: unknown, fallbackCards: unknown): Record<string, unknown>[] => {
  if (!Array.isArray(slides) || slides.length === 0) {
    return Array.isArray(fallbackCards)
      ? fallbackCards.filter(isRecord).map((card) => ({ ...card }))
      : [];
  }

  const resolvedCards: Record<string, unknown>[] = [];
  slides.forEach((slide) => {
    if (!isRecord(slide)) return;

    if (Array.isArray(slide.cards)) {
      const cards = slide.cards.filter(isRecord);
      if (cards.length === 1) {
        resolvedCards.push({ ...cards[0] });
        return;
      }
      if (cards.length > 1) {
        resolvedCards.push({ type: 'vertical-stack', cards: cards.map((card) => ({ ...card })) });
        return;
      }
    }

    if (isRecord(slide.card)) {
      resolvedCards.push({ ...slide.card });
    }
  });

  return resolvedCards;
};

const importSwipeCard = (inputCard: Record<string, unknown>): Record<string, unknown> => {
  const parsed = parseUpstreamSwipeCard(inputCard as unknown as SwiperCardConfig);
  const parameters = isRecord(inputCard.parameters) ? inputCard.parameters : {};
  const autoplay = isRecord(parameters.autoplay) ? parameters.autoplay : null;

  const mapped: Record<string, unknown> = {
    ...inputCard,
    type: 'custom:swipe-card',
    pagination: parsed.pagination,
    navigation: parsed.navigation,
    autoplay: parsed.autoplay,
    effect: parsed.effect,
    slides_per_view: parsed.slides_per_view,
    space_between: parsed.space_between,
    loop: parsed.loop,
    direction: parsed.direction,
    speed: toNumber(parameters.speed),
    centered_slides: parsed.centered_slides,
    free_mode: parsed.free_mode,
    start_card: parsed.start_card,
    reset_after: parsed.reset_after,
    cards: Array.isArray(parsed.cards) ? parsed.cards : [],
  };

  if (autoplay && mapped.autoplay && isRecord(mapped.autoplay)) {
    if (typeof autoplay.delay === 'number') {
      (mapped.autoplay as Record<string, unknown>).delay = autoplay.delay;
    }
    if (typeof autoplay.disableOnInteraction === 'boolean') {
      (mapped.autoplay as Record<string, unknown>).pause_on_interaction =
        autoplay.disableOnInteraction;
    }
    if (typeof autoplay.stopOnLastSlide === 'boolean') {
      (mapped.autoplay as Record<string, unknown>).stop_on_last_slide = autoplay.stopOnLastSlide;
    }
  }

  mapped.slides = (mapped.cards as unknown[]).map((childCard) => ({ cards: [childCard] }));

  return mapped;
};

const exportSwipeCard = (inputCard: Record<string, unknown>): Record<string, unknown> => {
  const passthrough = omitKeys(inputCard, SWIPE_KNOWN_CARD_KEYS);
  const existingParameters = isRecord(inputCard.parameters) ? inputCard.parameters : {};
  const parameters = omitKeys(existingParameters, SWIPE_KNOWN_PARAMETER_KEYS);

  const autoplay = inputCard.autoplay;
  if (autoplay !== false && isRecord(autoplay) && autoplay.enabled !== false) {
    const upstreamAutoplayBase = isRecord(existingParameters.autoplay)
      ? omitKeys(
          existingParameters.autoplay,
          new Set(['delay', 'disableOnInteraction', 'stopOnLastSlide']),
        )
      : {};

    parameters.autoplay = {
      ...upstreamAutoplayBase,
      ...(typeof autoplay.delay === 'number' ? { delay: autoplay.delay } : {}),
      ...(typeof autoplay.pause_on_interaction === 'boolean'
        ? { disableOnInteraction: autoplay.pause_on_interaction }
        : {}),
      ...(typeof autoplay.stop_on_last_slide === 'boolean'
        ? { stopOnLastSlide: autoplay.stop_on_last_slide }
        : {}),
    };
  }

  const pagination = inputCard.pagination;
  if (pagination === false) {
    parameters.pagination = false;
  } else if (pagination === true) {
    parameters.pagination = true;
  } else if (isRecord(pagination)) {
    const upstreamPaginationBase = isRecord(existingParameters.pagination)
      ? omitKeys(existingParameters.pagination, new Set(['type', 'clickable']))
      : {};
    parameters.pagination = {
      ...upstreamPaginationBase,
      ...(typeof pagination.type === 'string' ? { type: pagination.type } : {}),
      ...(typeof pagination.clickable === 'boolean' ? { clickable: pagination.clickable } : {}),
    };
  }

  if (typeof inputCard.navigation === 'boolean') parameters.navigation = inputCard.navigation;
  if (typeof inputCard.effect === 'string') parameters.effect = inputCard.effect;
  if (typeof inputCard.slides_per_view === 'number' || inputCard.slides_per_view === 'auto') {
    parameters.slidesPerView = inputCard.slides_per_view;
  }
  if (typeof inputCard.space_between === 'number')
    parameters.spaceBetween = inputCard.space_between;
  if (typeof inputCard.loop === 'boolean') parameters.loop = inputCard.loop;
  if (typeof inputCard.direction === 'string') parameters.direction = inputCard.direction;
  if (typeof inputCard.centered_slides === 'boolean')
    parameters.centeredSlides = inputCard.centered_slides;
  if (typeof inputCard.free_mode === 'boolean') parameters.freeMode = inputCard.free_mode;
  if (typeof inputCard.speed === 'number') parameters.speed = inputCard.speed;

  const cards = slideCardsToCards(inputCard.slides, inputCard.cards);

  return {
    ...passthrough,
    type: 'custom:swipe-card',
    cards,
    ...(Object.keys(parameters).length > 0 ? { parameters } : {}),
    ...(typeof inputCard.start_card === 'number' ? { start_card: inputCard.start_card } : {}),
    ...(typeof inputCard.reset_after === 'number' ? { reset_after: inputCard.reset_after } : {}),
  };
};

const importExpanderCard = (inputCard: Record<string, unknown>): Record<string, unknown> => ({
  ...inputCard,
  type: 'custom:expander-card',
  titleCard: inputCard['title-card'],
  titleCardButtonOverlay: inputCard['title-card-button-overlay'],
  expandedIcon: inputCard['expanded-icon'],
  collapsedIcon: inputCard['collapsed-icon'],
  overlayMargin: inputCard['overlay-margin'],
  childPadding: inputCard['child-padding'],
  buttonBackground: inputCard['button-background'],
});

const exportExpanderCard = (inputCard: Record<string, unknown>): Record<string, unknown> => {
  const passthrough = omitKeys(inputCard, EXPANDER_KNOWN_KEYS);

  const titleCard = inputCard.titleCard ?? inputCard['title-card'];
  const titleCardButtonOverlay =
    inputCard.titleCardButtonOverlay ?? inputCard['title-card-button-overlay'];
  const expandedIcon = inputCard.expandedIcon ?? inputCard['expanded-icon'];
  const collapsedIcon = inputCard.collapsedIcon ?? inputCard['collapsed-icon'];
  const overlayMargin = inputCard.overlayMargin ?? inputCard['overlay-margin'];
  const childPadding = inputCard.childPadding ?? inputCard['child-padding'];
  const buttonBackground = inputCard.buttonBackground ?? inputCard['button-background'];

  return {
    ...passthrough,
    type: 'custom:expander-card',
    ...(typeof inputCard.title === 'string' ? { title: inputCard.title } : {}),
    ...(titleCard ? { 'title-card': titleCard } : {}),
    ...(typeof titleCardButtonOverlay === 'boolean'
      ? { 'title-card-button-overlay': titleCardButtonOverlay }
      : {}),
    ...(Array.isArray(inputCard.cards) ? { cards: inputCard.cards } : {}),
    ...(typeof inputCard.expanded === 'boolean' ? { expanded: inputCard.expanded } : {}),
    ...(typeof expandedIcon === 'string' ? { 'expanded-icon': expandedIcon } : {}),
    ...(typeof collapsedIcon === 'string' ? { 'collapsed-icon': collapsedIcon } : {}),
    ...(typeof inputCard.gap === 'string' ? { gap: inputCard.gap } : {}),
    ...(typeof inputCard.padding === 'string' ? { padding: inputCard.padding } : {}),
    ...(typeof inputCard.clear === 'boolean' ? { clear: inputCard.clear } : {}),
    ...(typeof overlayMargin === 'string' ? { 'overlay-margin': overlayMargin } : {}),
    ...(typeof childPadding === 'string' ? { 'child-padding': childPadding } : {}),
    ...(typeof buttonBackground === 'string' ? { 'button-background': buttonBackground } : {}),
  };
};

const tabLabelFromAttributes = (attributes: unknown, fallback: string): string => {
  if (!isRecord(attributes)) return fallback;
  return typeof attributes.label === 'string' && attributes.label.trim().length > 0
    ? attributes.label
    : fallback;
};

const tabIconFromAttributes = (attributes: unknown): string | undefined => {
  if (!isRecord(attributes)) return undefined;
  return typeof attributes.icon === 'string' && attributes.icon.trim().length > 0
    ? attributes.icon
    : undefined;
};

const viewFromInitialView = (value: unknown): 'month' | 'week' | 'day' => {
  if (value === 'day') return 'day';
  if (value === 'list') return 'week';
  return 'month';
};

const initialViewFromView = (value: unknown): 'month' | 'list' | 'day' => {
  if (value === 'day') return 'day';
  if (value === 'week') return 'list';
  return 'month';
};

const mergeAttributes = (
  globalAttributes: Record<string, unknown> | undefined,
  tabAttributes: Record<string, unknown> | undefined,
): TabbedCardAttributes | undefined => {
  const merged = {
    ...(globalAttributes ?? {}),
    ...(tabAttributes ?? {}),
  };

  if (!isRecord(merged)) return undefined;
  if (Object.keys(merged).length === 0) return undefined;
  return merged as unknown as TabbedCardAttributes;
};

const importTabbedCard = (inputCard: Record<string, unknown>): Record<string, unknown> => {
  const globalAttributes = isRecord(inputCard.attributes) ? inputCard.attributes : undefined;
  const tabs = Array.isArray(inputCard.tabs)
    ? inputCard.tabs.map((tab, index) => {
        const tabRecord = isRecord(tab) ? tab : {};
        const attributes = mergeAttributes(
          globalAttributes,
          isRecord(tabRecord.attributes) ? tabRecord.attributes : undefined,
        );
        const tabTitle = tabLabelFromAttributes(attributes, `Tab ${index + 1}`);
        const tabIcon = tabIconFromAttributes(attributes);

        const cards = Array.isArray(tabRecord.cards)
          ? tabRecord.cards.filter(isRecord)
          : isRecord(tabRecord.card)
            ? [tabRecord.card]
            : [];

        return {
          ...tabRecord,
          ...(attributes ? { attributes } : {}),
          title: typeof tabRecord.title === 'string' ? tabRecord.title : tabTitle,
          ...(typeof tabRecord.icon === 'string' ? {} : tabIcon ? { icon: tabIcon } : {}),
          cards,
        };
      })
    : [];

  const defaultTabFromOptions = isRecord(inputCard.options)
    ? inputCard.options.defaultTabIndex
    : undefined;

  return {
    ...inputCard,
    type: 'custom:tabbed-card',
    default_tab:
      typeof defaultTabFromOptions === 'number' ? defaultTabFromOptions : inputCard.default_tab,
    tabs,
    ...(isRecord(inputCard.styles) ? { _havdm_styles: inputCard.styles } : {}),
  };
};

const importCalendarCard = (inputCard: Record<string, unknown>): Record<string, unknown> => {
  const mapped: Record<string, unknown> = { ...inputCard };

  if (Array.isArray(inputCard.entities)) {
    mapped.calendar_entities = inputCard.entities.filter(
      (entity): entity is string => typeof entity === 'string',
    );
  }

  if (typeof inputCard.initial_view === 'string' && typeof inputCard.view !== 'string') {
    mapped.view = viewFromInitialView(inputCard.initial_view);
  }

  return mapped;
};

const tabCardsToUpstreamCard = (cards: unknown): Record<string, unknown> | undefined => {
  if (!Array.isArray(cards)) return undefined;
  const cardList = cards.filter(isRecord);
  if (cardList.length === 0) return undefined;
  if (cardList.length === 1) return cardList[0];
  return {
    type: 'vertical-stack',
    cards: cardList,
  };
};

const exportTabbedCard = (inputCard: Record<string, unknown>): Record<string, unknown> => {
  const passthrough = omitKeys(inputCard, TABBED_KNOWN_KEYS);
  const tabs = Array.isArray(inputCard.tabs)
    ? inputCard.tabs.map((tab) => {
        const tabRecord = isRecord(tab) ? tab : {};
        const tabPassthrough = omitKeys(tabRecord, TAB_HAVDM_ONLY_KEYS);
        const attributes: Record<string, unknown> = isRecord(tabRecord.attributes)
          ? { ...tabRecord.attributes }
          : {};

        if (typeof tabRecord.title === 'string' && tabRecord.title.trim().length > 0) {
          attributes.label = tabRecord.title;
        }
        if (typeof tabRecord.icon === 'string' && tabRecord.icon.trim().length > 0) {
          attributes.icon = tabRecord.icon;
        }

        const upstreamCard = tabCardsToUpstreamCard(tabRecord.cards);

        return {
          ...tabPassthrough,
          ...(Object.keys(attributes).length > 0 ? { attributes } : {}),
          ...(upstreamCard ? { card: upstreamCard } : {}),
        };
      })
    : [];

  const cardStyles = isRecord(inputCard._havdm_styles)
    ? inputCard._havdm_styles
    : isRecord(inputCard.styles)
      ? inputCard.styles
      : undefined;

  const remainingTopLevel = omitKeys(passthrough, TABS_HAVDM_ONLY_KEYS);

  return {
    ...remainingTopLevel,
    type: 'custom:tabbed-card',
    tabs,
    options: {
      defaultTabIndex:
        typeof inputCard.default_tab === 'number'
          ? inputCard.default_tab
          : isRecord(inputCard.options) && typeof inputCard.options.defaultTabIndex === 'number'
            ? inputCard.options.defaultTabIndex
            : 0,
    },
    ...(cardStyles ? { styles: cardStyles } : {}),
    ...(isRecord(inputCard.attributes) ? { attributes: inputCard.attributes } : {}),
  };
};

const exportCalendarCard = (inputCard: Record<string, unknown>): Record<string, unknown> => {
  const passthrough = omitKeys(inputCard, CALENDAR_HAVDM_ONLY_KEYS);
  const calendarEntities = Array.isArray(inputCard.calendar_entities)
    ? inputCard.calendar_entities.filter(
        (entity): entity is string => typeof entity === 'string' && entity.trim().length > 0,
      )
    : [];

  return {
    ...passthrough,
    type: 'calendar',
    ...(calendarEntities.length > 0
      ? { entities: calendarEntities }
      : Array.isArray(inputCard.entities)
        ? { entities: inputCard.entities }
        : {}),
    ...(typeof inputCard.view === 'string'
      ? { initial_view: initialViewFromView(inputCard.view) }
      : typeof inputCard.initial_view === 'string'
        ? { initial_view: inputCard.initial_view }
        : {}),
  };
};

const migrateLegacyAccordion = (inputCard: Record<string, unknown>): Record<string, unknown> => {
  const sections = Array.isArray(inputCard.sections) ? inputCard.sections : [];
  const cards = sections
    .map((section, index) => {
      if (!isRecord(section)) return null;
      return {
        type: 'custom:expander-card',
        title: typeof section.title === 'string' ? section.title : '',
        expanded:
          typeof section.default_expanded === 'boolean' ? section.default_expanded : index === 0,
        cards: Array.isArray(section.cards) ? section.cards.filter(isRecord) : [],
      };
    })
    .filter((section): section is NonNullable<typeof section> => section !== null);

  return {
    type: 'vertical-stack',
    cards,
  };
};

interface RecursiveProcessOptions {
  // When provided, any nested card for which this returns true is dropped from
  // the output (used by the export path to remove spacer cards at every depth).
  dropCard?: (card: Record<string, unknown>) => boolean;
}

const processCardRecursively = (
  card: Record<string, unknown>,
  processor: (card: Record<string, unknown>) => Record<string, unknown>,
  options: RecursiveProcessOptions = {},
): Record<string, unknown> => {
  const processed = processor({ ...card });
  const { dropCard } = options;

  const processCardsArray = (cards: unknown): Record<string, unknown>[] | undefined => {
    if (!Array.isArray(cards)) return undefined;
    return cards
      .map((entry) => asCardRecord(entry))
      .filter((entry): entry is Record<string, unknown> => Boolean(entry))
      .filter((entry) => !(dropCard?.(entry) ?? false))
      .map((entry) => processCardRecursively(entry, processor, options));
  };

  const processSingularCard = (value: unknown): Record<string, unknown> | undefined => {
    const singular = asCardRecord(value);
    if (!singular) return undefined;
    if (dropCard?.(singular)) return undefined;
    return processCardRecursively(singular, processor, options);
  };

  // Generic recursion (B2): recurse into any child `cards[]` array and any
  // singular child `card`, regardless of the container's type. This replaces
  // the previous hard-coded container allowlist, which missed custom containers
  // like vertical-stack-in-card / auto-entities / decluttering-card /
  // simple-swipe-card / bubble-card / fold-entity-row.
  const nestedCards = processCardsArray(processed.cards);
  if (nestedCards) {
    processed.cards = nestedCards;
  }

  if ('card' in processed) {
    const singular = processSingularCard(processed.card);
    if (singular) {
      processed.card = singular;
    } else if (asCardRecord(processed.card)) {
      // The singular child existed but was dropped (e.g. a spacer).
      delete processed.card;
    }
  }

  // Non-standard nesting keys the generic cards/card rule does not reach. These
  // stay type-guarded (unchanged from before B2) — only the cards/card recursion
  // above is genericised, per the design.
  if (processed.type === 'custom:tabbed-card' && Array.isArray(processed.tabs)) {
    processed.tabs = processed.tabs.map((tab) => {
      if (!isRecord(tab)) return tab;
      const nextTab = { ...tab };

      if ('card' in nextTab) {
        const singular = processSingularCard(nextTab.card);
        if (singular) {
          nextTab.card = singular;
        } else if (asCardRecord(nextTab.card)) {
          delete nextTab.card;
        }
      }

      const cards = processCardsArray(nextTab.cards);
      if (cards) {
        nextTab.cards = cards;
      }

      return nextTab;
    });
  }

  if (processed.type === 'custom:popup-card' && isRecord(processed.popup)) {
    const popup = { ...processed.popup };
    const cards = processCardsArray(popup.cards);
    if (cards) {
      popup.cards = cards;
    }
    processed.popup = popup;
  }

  return processed;
};

export function migrateLegacyCard(card: Record<string, unknown>): Record<string, unknown> {
  if (card.type === 'custom:swiper-card') {
    return {
      ...card,
      type: 'custom:swipe-card',
    };
  }

  if (card.type === 'custom:tabs-card') {
    return {
      ...card,
      type: 'custom:tabbed-card',
    };
  }

  if (card.type === 'custom:accordion-card') {
    return migrateLegacyAccordion(card);
  }

  return { ...card };
}

export function importCard(card: Record<string, unknown>): Record<string, unknown> {
  const migrated = migrateLegacyCard(card);

  if (migrated.type === 'custom:swipe-card') {
    return importSwipeCard(migrated);
  }

  if (migrated.type === 'custom:expander-card') {
    return importExpanderCard(migrated);
  }

  if (migrated.type === 'custom:tabbed-card') {
    return importTabbedCard(
      migrated as unknown as TabsCardConfig as unknown as Record<string, unknown>,
    );
  }

  if (migrated.type === 'calendar') {
    return importCalendarCard(migrated);
  }

  return { ...migrated };
}

export function exportCard(card: Record<string, unknown>): Record<string, unknown> {
  let exported: Record<string, unknown>;

  if (card.type === 'custom:swipe-card') {
    exported = exportSwipeCard(card);
  } else if (card.type === 'custom:expander-card') {
    exported = exportExpanderCard(card);
  } else if (card.type === 'custom:tabbed-card') {
    exported = exportTabbedCard(card);
  } else if (card.type === 'calendar') {
    exported = exportCalendarCard(card);
  } else {
    exported = { ...card };
  }

  // Slice B2: the global STRIP runs last, after the per-card canonical
  // exporters, so nothing they pass through leaks. Because exportDashboard
  // applies exportCard at every depth via processCardRecursively, this strips
  // the internal keys from nested cards too.
  return stripInternalKeys(exported);
}

export function importDashboard(dashboard: Record<string, unknown>): Record<string, unknown> {
  const nextDashboard: Record<string, unknown> = { ...dashboard };

  if (!Array.isArray(nextDashboard.views)) {
    return nextDashboard;
  }

  nextDashboard.views = nextDashboard.views.map((view) => {
    if (!isRecord(view)) return view;

    const nextView = { ...view };
    if (Array.isArray(nextView.cards)) {
      nextView.cards = nextView.cards
        .map((card) => asCardRecord(card))
        .filter((card): card is Record<string, unknown> => Boolean(card))
        .map((card) => processCardRecursively(card, importCard));
    }

    return nextView;
  });

  return nextDashboard;
}

export function exportDashboard(dashboard: Record<string, unknown>): Record<string, unknown> {
  const nextDashboard: Record<string, unknown> = { ...dashboard };

  if (!Array.isArray(nextDashboard.views)) {
    return nextDashboard;
  }

  nextDashboard.views = nextDashboard.views.map((view) => {
    if (!isRecord(view)) return view;

    const nextView = { ...view };
    if (Array.isArray(nextView.cards)) {
      // Slice B3: spacer filtering now lives in the export pass (top-level here
      // + every nested depth via processCardRecursively's dropCard), replacing
      // the old top-level-only filter in sanitizeForHA.
      nextView.cards = nextView.cards
        .map((card) => asCardRecord(card))
        .filter((card): card is Record<string, unknown> => Boolean(card))
        .filter((card) => !isSpacerCard(card))
        .map((card) => processCardRecursively(card, exportCard, { dropCard: isSpacerCard }));
    }

    return nextView;
  });

  return nextDashboard;
}
