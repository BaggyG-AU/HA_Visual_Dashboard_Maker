import { parseUpstreamSwipeCard } from '../features/carousel/carouselService';
import type { SwiperCardConfig } from '../features/carousel/types';
import type { TabsCardConfig, TabbedCardAttributes } from '../types/tabs';
import { STRIP_KEYS } from './haExportContract';
import { translateToCardMod } from './cardModTranslator';
import { translateVisibility } from './visibilityTranslator';
import { substituteCanvasOnlyCard } from './canvasPlaceholderTranslator';
import { stripCanvasKeys } from './canvasKeyStripper';
import type { ExportWarning } from './exportWarnings';

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

// HA's `logbook` card (the "Activity card") selects what to show via a REQUIRED
// `target` map (`entity_id` / `device_id` / `area_id`) — it has NO `entity` /
// `entities` option, and it accepts only `type`, `target`, `title`,
// `hours_to_show`, `theme`, `state_filter`, `name_detail` (verified against
// home-assistant.io/dashboards/logbook, HA 2026.7). HAVDM renders its own
// "Timeline" here and drives it with these HAVDM-only keys, which must NOT reach
// Home Assistant. `entity` / `entities` are HAVDM-only AS TOP-LEVEL KEYS — their
// values are re-homed into the `target` map by `exportLogbookCard`.
const LOGBOOK_HAVDM_ONLY_KEYS = new Set([
  'entity',
  'entities',
  'orientation',
  'group_by',
  'show_now_marker',
  'enable_scrubber',
  'max_items',
  'item_density',
  'truncate_length',
  'selected_timestamp',
  'events',
]);

// HA's `alarm-panel` card `states` option lists the ARM ACTIONS to show as
// buttons: `arm_home` / `arm_away` / `arm_night` / `arm_custom_bypass` (verified
// against home-assistant.io/dashboards/alarm-panel, HA 2026.7). HAVDM stores the
// friendlier `armed_*` entity-state names internally (its renderer keys off
// them), so export translates them. `disarmed` has no arm-action equivalent (HA
// always offers disarm) and is dropped silently; anything else unmapped is
// dropped too.
const ALARM_ARM_ACTION_BY_STATE: Record<string, string> = {
  armed_home: 'arm_home',
  armed_away: 'arm_away',
  armed_night: 'arm_night',
  armed_custom_bypass: 'arm_custom_bypass',
  // already-correct action names pass through unchanged
  arm_home: 'arm_home',
  arm_away: 'arm_away',
  arm_night: 'arm_night',
  arm_custom_bypass: 'arm_custom_bypass',
};

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

// HA's calendar card `initial_view` accepts ONLY the FullCalendar view names
// `dayGridMonth` / `dayGridDay` / `listWeek` (verified against
// home-assistant.io/dashboards/calendar, HA 2026.7). HAVDM's internal `view` is
// the friendlier `month` / `week` / `day`. These translate between the two —
// `viewFromInitialView` also accepts the LEGACY values HAVDM used to emit
// (`month` / `list` / `day`) so older saved/exported dashboards still import.
const viewFromInitialView = (value: unknown): 'month' | 'week' | 'day' => {
  if (value === 'dayGridDay' || value === 'day') return 'day';
  if (value === 'listWeek' || value === 'list' || value === 'week') return 'week';
  return 'month';
};

const initialViewFromView = (value: unknown): 'dayGridMonth' | 'listWeek' | 'dayGridDay' => {
  if (value === 'day') return 'dayGridDay';
  if (value === 'week') return 'listWeek';
  return 'dayGridMonth';
};

// Normalise any pre-existing `initial_view` (which may carry a legacy value on an
// imported/older card) to the canonical current HA value.
const normalizeInitialView = (value: unknown): 'dayGridMonth' | 'listWeek' | 'dayGridDay' =>
  initialViewFromView(viewFromInitialView(value));

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
        ? { initial_view: normalizeInitialView(inputCard.initial_view) }
        : {}),
  };
};

const importLogbookCard = (inputCard: Record<string, unknown>): Record<string, unknown> => {
  const mapped: Record<string, unknown> = { ...inputCard };

  // Re-home a real HA `target: { entity_id }` into HAVDM's `entity` / `entities`
  // so the Timeline renderer (which reads `entity` / `entities`) shows something.
  const target = isRecord(inputCard.target) ? inputCard.target : undefined;
  if (target && !('entity' in mapped) && !('entities' in mapped)) {
    const entityId = target.entity_id;
    if (typeof entityId === 'string') {
      mapped.entity = entityId;
    } else if (Array.isArray(entityId)) {
      mapped.entities = entityId.filter((value): value is string => typeof value === 'string');
    }
  }

  return mapped;
};

const exportLogbookCard = (inputCard: Record<string, unknown>): Record<string, unknown> => {
  const passthrough = omitKeys(inputCard, LOGBOOK_HAVDM_ONLY_KEYS);

  // Collect the entity ids HAVDM stored as `entity` (singular) / `entities`.
  const entityIds: string[] = [];
  if (typeof inputCard.entity === 'string' && inputCard.entity.trim().length > 0) {
    entityIds.push(inputCard.entity);
  }
  if (Array.isArray(inputCard.entities)) {
    inputCard.entities.forEach((value) => {
      if (typeof value === 'string' && value.trim().length > 0) entityIds.push(value);
    });
  }

  // Prefer an existing real `target` (round-tripped from HA); otherwise build one
  // from the collected entity ids. HA requires `target`, so emit it whenever we
  // have something to point at.
  const existingTarget = isRecord(inputCard.target) ? inputCard.target : undefined;

  return {
    ...passthrough,
    type: 'logbook',
    ...(existingTarget
      ? { target: existingTarget }
      : entityIds.length > 0
        ? { target: { entity_id: entityIds } }
        : {}),
  };
};

const exportAlarmPanelCard = (inputCard: Record<string, unknown>): Record<string, unknown> => {
  const states = inputCard.states;
  if (!Array.isArray(states)) {
    return { ...inputCard };
  }

  const actions: string[] = [];
  states.forEach((value) => {
    if (typeof value !== 'string') return;
    const action = ALARM_ARM_ACTION_BY_STATE[value];
    if (action && !actions.includes(action)) actions.push(action);
    // Unmapped values (`disarmed`, `armed_vacation`, anything else) are dropped:
    // HA's alarm-panel card `states` has no equivalent for them.
  });

  const result = { ...inputCard };
  if (actions.length > 0) {
    result.states = actions;
  } else {
    // Nothing maps — omit `states` entirely so HA falls back to its own default
    // (arm_home, arm_away) rather than receiving an empty/invalid list.
    delete result.states;
  }
  return result;
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

  // Phase 4 PR-3: HAVDM's "Progress Ring" used to squat on the real
  // `custom:modern-circular-gauge` type string. It is now the HAVDM-only phantom
  // `custom:havdm-progress-ring`. Disambiguate BY VALUE SHAPE — only a card
  // carrying HAVDM's invented `rings` array is our Progress Ring; a genuine
  // modern-circular-gauge (top-level `entity`, no `rings`) is left untouched.
  if (card.type === 'custom:modern-circular-gauge' && Array.isArray(card.rings)) {
    return { ...card, type: 'custom:havdm-progress-ring' };
  }

  return { ...card };
}

// Slice B5: migrate the legacy internal grid-geometry key. Old HAVDM saves and
// imported dashboards carry a bare `layout: {x,y,w,h}` object; the internal key
// is now `_havdm_layout` (renamed so it no longer collides with Mushroom's real
// `layout: 'horizontal' | 'vertical'` option). Disambiguate BY VALUE SHAPE —
// only an object carrying grid geometry (x/y/w/h) is migrated; a string layout
// (Mushroom's option) or any other value is left untouched.
const GEOMETRY_KEYS = ['x', 'y', 'w', 'h'] as const;

const migrateInternalLayout = (card: Record<string, unknown>): Record<string, unknown> => {
  const layout = card.layout;
  if (isRecord(layout) && GEOMETRY_KEYS.some((key) => key in layout)) {
    const { layout: _legacyLayout, ...rest } = card;
    void _legacyLayout;
    return { ...rest, _havdm_layout: layout };
  }
  return card;
};

export function importCard(card: Record<string, unknown>): Record<string, unknown> {
  const migrated = migrateInternalLayout(migrateLegacyCard(card));

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

  if (migrated.type === 'logbook') {
    return importLogbookCard(migrated);
  }

  return { ...migrated };
}

/**
 * Options threaded through the HA-bound export so every card at every depth is
 * translated/stripped consistently.
 */
export interface ExportCardOptions {
  /**
   * Whether card-mod is available on the target instance (slice B6). Default
   * `true` — assume present, matching the reference instance; the full
   * capability-inventory gate is Phase 3. When `false`, the TRANSLATE→card-mod
   * keys are stripped and a warning is recorded instead of emitting `card_mod`.
   */
  cardModAvailable?: boolean;
  /**
   * Optional accumulator. When provided, every export warning raised while
   * translating (card-mod B6 + visibility B6b, at any depth) is pushed here.
   * Slice B8 surfaces these to the user; B6/B6b only collect them.
   */
  warnings?: ExportWarning[];
}

export function exportCard(
  card: Record<string, unknown>,
  options: ExportCardOptions = {},
): Record<string, unknown> {
  // Slice B7: CANVAS-ONLY phantom card TYPES (haExportContract
  // CANVAS_ONLY_CARD_TYPES) are substituted with a native `markdown` "Card Not
  // Available" placeholder holding the slot. Runs FIRST so the rest of the
  // pipeline sees a plain markdown card and the phantom container's design-time
  // children are dropped (the placeholder has no nested `cards`).
  const placeholder = substituteCanvasOnlyCard(card);
  if (options.warnings && placeholder.warnings.length > 0) {
    options.warnings.push(...placeholder.warnings);
  }
  const source = placeholder.card;

  let exported: Record<string, unknown>;

  if (source.type === 'custom:swipe-card') {
    exported = exportSwipeCard(source);
  } else if (source.type === 'custom:expander-card') {
    exported = exportExpanderCard(source);
  } else if (source.type === 'custom:tabbed-card') {
    exported = exportTabbedCard(source);
  } else if (source.type === 'calendar') {
    exported = exportCalendarCard(source);
  } else if (source.type === 'logbook') {
    exported = exportLogbookCard(source);
  } else if (source.type === 'alarm-panel') {
    exported = exportAlarmPanelCard(source);
  } else {
    exported = { ...source };
  }

  // Slice B6: TRANSLATE the card-mod class (haExportContract CARD_MOD_KEYS) into
  // a `card_mod` block — or strip + warn when card-mod is unavailable — AFTER the
  // per-card canonical exporters (so string-valued expander `gap` etc. are
  // already settled) and BEFORE the STRIP class below.
  const cardMod = translateToCardMod(exported, {
    cardModAvailable: options.cardModAvailable ?? true,
  });

  // Slice B6b: TRANSLATE the ha-visibility class (HA_VISIBILITY_KEYS) —
  // `visibility_conditions`/`visibility_operator` — into HA's native card-level
  // `visibility` array. No capability gate (native HA feature).
  const visibility = translateVisibility(cardMod.card);

  // Phase 4 PR-1: CANVAS-ONLY behavioural keys (CANVAS_KEYS) are stripped AND
  // warned about (strip+warn) — design-time features HA has no mechanism for.
  // Runs after the TRANSLATE steps and before the silent STRIP, so a warning is
  // raised for what the user set before it is removed.
  const canvas = stripCanvasKeys(visibility.card);

  if (options.warnings) {
    if (cardMod.warnings.length > 0) options.warnings.push(...cardMod.warnings);
    if (visibility.warnings.length > 0) options.warnings.push(...visibility.warnings);
    if (canvas.warnings.length > 0) options.warnings.push(...canvas.warnings);
  }

  // Slice B2: the global STRIP runs last, after the per-card canonical
  // exporters, so nothing they pass through leaks. Because exportDashboard
  // applies exportCard at every depth via processCardRecursively, this strips
  // the internal keys from nested cards too.
  return stripInternalKeys(canvas.card);
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

export function exportDashboard(
  dashboard: Record<string, unknown>,
  options: ExportCardOptions = {},
): Record<string, unknown> {
  const nextDashboard: Record<string, unknown> = { ...dashboard };

  if (!Array.isArray(nextDashboard.views)) {
    return nextDashboard;
  }

  // Bind the export options once so the SAME options object — including the
  // optional `warnings` accumulator — reaches exportCard at every depth via
  // processCardRecursively (slice B6).
  const cardProcessor = (card: Record<string, unknown>): Record<string, unknown> =>
    exportCard(card, options);

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
        .map((card) => processCardRecursively(card, cardProcessor, { dropCard: isSpacerCard }));
    }

    return nextView;
  });

  return nextDashboard;
}
