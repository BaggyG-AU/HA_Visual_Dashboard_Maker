import type {
  CarouselAutoplayConfig,
  CarouselPaginationConfig,
  CarouselSlideConfig,
  NormalizedCarouselConfig,
  SwiperCardConfig,
  UpstreamSwipeCardConfig,
} from './types';
import { DEFAULT_BACKGROUND_CONFIG } from '../../utils/backgroundStyle';

const DEFAULT_AUTOPLAY: CarouselAutoplayConfig = {
  enabled: false,
  delay: 5000,
  pause_on_interaction: true,
  stop_on_last_slide: false,
};

const DEFAULT_PAGINATION: CarouselPaginationConfig = {
  type: 'bullets',
  clickable: true,
};

const DEFAULT_CONFIG: Omit<NormalizedCarouselConfig, 'slides'> = {
  pagination: DEFAULT_PAGINATION,
  navigation: true,
  autoplay: DEFAULT_AUTOPLAY,
  effect: 'slide',
  slides_per_view: 1,
  space_between: 16,
  loop: false,
  direction: 'horizontal',
  centered_slides: false,
  free_mode: false,
};

const toBoolean = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === 'boolean') return value;
  return fallback;
};

const toNumber = (value: unknown, fallback: number, min?: number): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  if (typeof min === 'number') return Math.max(min, value);
  return value;
};

const toOptionalNumber = (value: unknown, min?: number): number | undefined => {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
  if (typeof min === 'number') return Math.max(min, value);
  return value;
};

const normalizeAutoplay = (autoplay: SwiperCardConfig['autoplay']): CarouselAutoplayConfig | false => {
  if (autoplay === false) return false;
  if (autoplay === true) return { ...DEFAULT_AUTOPLAY, enabled: true };
  if (typeof autoplay === 'object' && autoplay) {
    return {
      enabled: toBoolean(autoplay.enabled, true),
      delay: toNumber(autoplay.delay, DEFAULT_AUTOPLAY.delay ?? 5000, 0),
      pause_on_interaction: toBoolean(autoplay.pause_on_interaction, DEFAULT_AUTOPLAY.pause_on_interaction ?? true),
      stop_on_last_slide: toBoolean(autoplay.stop_on_last_slide, DEFAULT_AUTOPLAY.stop_on_last_slide ?? false),
    };
  }
  return DEFAULT_AUTOPLAY;
};

const normalizePagination = (pagination: SwiperCardConfig['pagination']): CarouselPaginationConfig | false => {
  if (pagination === false) return false;
  if (pagination === true) return { ...DEFAULT_PAGINATION };
  if (typeof pagination === 'object' && pagination) {
    return {
      type: pagination.type ?? DEFAULT_PAGINATION.type,
      clickable: toBoolean(pagination.clickable, DEFAULT_PAGINATION.clickable ?? true),
    };
  }
  return DEFAULT_PAGINATION;
};

const normalizeSlides = (card: SwiperCardConfig): CarouselSlideConfig[] => {
  if (Array.isArray(card.slides) && card.slides.length > 0) {
    return card.slides.map((slide) => {
      const cards = Array.isArray(slide.cards) && slide.cards.length > 0
        ? slide.cards
        : slide.card
          ? [slide.card]
          : [];
      const background = slide.background
        ? slide.background
        : slide.background === null
          ? undefined
          : undefined;
      return {
        ...slide,
        cards,
        background,
        alignment: slide.alignment ?? 'center',
        autoplay_delay: typeof slide.autoplay_delay === 'number' ? Math.max(0, slide.autoplay_delay) : undefined,
        allow_navigation: slide.allow_navigation !== false && slide.skip_navigation !== true,
      };
    });
  }

  if (Array.isArray(card.cards) && card.cards.length > 0) {
    return card.cards.map((child) => ({
      cards: [child],
      alignment: 'center',
      allow_navigation: true,
    }));
  }

  return [
    {
      cards: [],
      alignment: 'center',
      allow_navigation: true,
      background: undefined,
    },
  ];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseUpstreamPagination = (pagination: unknown): SwiperCardConfig['pagination'] => {
  if (pagination === false) return false;
  if (pagination === true) return true;
  if (!isRecord(pagination)) return undefined;
  return {
    type: pagination.type as CarouselPaginationConfig['type'],
    clickable: typeof pagination.clickable === 'boolean' ? pagination.clickable : undefined,
  };
};

const parseUpstreamAutoplay = (autoplay: unknown): SwiperCardConfig['autoplay'] => {
  if (autoplay === false) return false;
  if (autoplay === true) return true;
  if (!isRecord(autoplay)) return undefined;
  return {
    enabled: true,
    delay: typeof autoplay.delay === 'number' ? autoplay.delay : undefined,
    pause_on_interaction: typeof autoplay.disableOnInteraction === 'boolean' ? autoplay.disableOnInteraction : undefined,
    stop_on_last_slide: typeof autoplay.stopOnLastSlide === 'boolean' ? autoplay.stopOnLastSlide : undefined,
  };
};

export const parseUpstreamSwipeCard = (yamlConfig: UpstreamSwipeCardConfig): SwiperCardConfig => {
  const parameters = isRecord(yamlConfig.parameters) ? yamlConfig.parameters : {};
  const autoplay = parseUpstreamAutoplay(parameters.autoplay);
  const pagination = parseUpstreamPagination(parameters.pagination);
  const slidesPerView = parameters.slidesPerView;

  return {
    type: 'custom:swipe-card',
    cards: Array.isArray(yamlConfig.cards) ? yamlConfig.cards : [],
    pagination,
    navigation: typeof parameters.navigation === 'boolean' ? parameters.navigation : undefined,
    autoplay,
    effect: parameters.effect as SwiperCardConfig['effect'],
    slides_per_view: typeof slidesPerView === 'number' || slidesPerView === 'auto'
      ? slidesPerView
      : undefined,
    space_between: typeof parameters.spaceBetween === 'number' ? parameters.spaceBetween : undefined,
    loop: typeof parameters.loop === 'boolean' ? parameters.loop : undefined,
    direction: parameters.direction as SwiperCardConfig['direction'],
    centered_slides: typeof parameters.centeredSlides === 'boolean' ? parameters.centeredSlides : undefined,
    free_mode: typeof parameters.freeMode === 'boolean' ? parameters.freeMode : undefined,
    start_card: toOptionalNumber(yamlConfig.start_card, 1),
    reset_after: toOptionalNumber(yamlConfig.reset_after, 0),
  };
};

const slideToExportCard = (slide: CarouselSlideConfig) => {
  const slideCards = Array.isArray(slide.cards) ? slide.cards : [];
  if (slideCards.length === 0) return undefined;
  if (slideCards.length === 1) return slideCards[0];
  return {
    type: 'vertical-stack',
    cards: slideCards,
  };
};

export const toUpstreamSwipeCard = (config: NormalizedCarouselConfig): UpstreamSwipeCardConfig => {
  const parameters: Record<string, unknown> = {
    effect: config.effect,
    slidesPerView: config.slides_per_view,
    spaceBetween: config.space_between,
    loop: config.loop,
    direction: config.direction,
    centeredSlides: config.centered_slides,
    freeMode: config.free_mode,
  };

  if (config.pagination === false) {
    parameters.pagination = false;
  } else {
    parameters.pagination = {
      ...(config.pagination.type ? { type: config.pagination.type } : {}),
      ...(typeof config.pagination.clickable === 'boolean' ? { clickable: config.pagination.clickable } : {}),
    };
  }

  parameters.navigation = config.navigation;

  if (config.autoplay && config.autoplay.enabled !== false) {
    parameters.autoplay = {
      delay: config.autoplay.delay ?? 5000,
      disableOnInteraction: config.autoplay.pause_on_interaction ?? true,
      stopOnLastSlide: config.autoplay.stop_on_last_slide ?? false,
    };
  }

  const cards = config.slides
    .map(slideToExportCard)
    .filter((slideCard): slideCard is NonNullable<ReturnType<typeof slideToExportCard>> => Boolean(slideCard));

  return {
    type: 'custom:swipe-card',
    cards,
    parameters,
    ...(typeof config.start_card === 'number' ? { start_card: Math.max(1, config.start_card) } : {}),
    ...(typeof config.reset_after === 'number' ? { reset_after: Math.max(0, config.reset_after) } : {}),
  };
};

export const toUpstreamSwipeCardFromConfig = (card: SwiperCardConfig): UpstreamSwipeCardConfig & Record<string, unknown> => {
  const normalized = normalizeSwiperConfig(card);
  const upstream = toUpstreamSwipeCard(normalized);
  const passthrough = { ...(card as SwiperCardConfig & Record<string, unknown>) };
  delete passthrough.pagination;
  delete passthrough.navigation;
  delete passthrough.autoplay;
  delete passthrough.effect;
  delete passthrough.slides_per_view;
  delete passthrough.space_between;
  delete passthrough.loop;
  delete passthrough.direction;
  delete passthrough.centered_slides;
  delete passthrough.free_mode;
  delete passthrough.slides;
  delete passthrough.parameters;
  delete passthrough.cards;
  delete passthrough.start_card;
  delete passthrough.reset_after;

  return {
    ...passthrough,
    ...upstream,
  };
};

export const normalizeSwiperConfig = (card: SwiperCardConfig): NormalizedCarouselConfig => {
  const parsedCard = card.parameters
    ? parseUpstreamSwipeCard(card as UpstreamSwipeCardConfig)
    : null;
  const workingCard = parsedCard
    ? {
      ...parsedCard,
      ...card,
      pagination: card.pagination ?? parsedCard.pagination,
      autoplay: card.autoplay ?? parsedCard.autoplay,
      navigation: card.navigation ?? parsedCard.navigation,
      effect: card.effect ?? parsedCard.effect,
      slides_per_view: card.slides_per_view ?? parsedCard.slides_per_view,
      space_between: card.space_between ?? parsedCard.space_between,
      loop: card.loop ?? parsedCard.loop,
      direction: card.direction ?? parsedCard.direction,
      centered_slides: card.centered_slides ?? parsedCard.centered_slides,
      free_mode: card.free_mode ?? parsedCard.free_mode,
      cards: card.cards ?? parsedCard.cards,
      start_card: card.start_card ?? parsedCard.start_card,
      reset_after: card.reset_after ?? parsedCard.reset_after,
    }
    : card;

  return {
    pagination: normalizePagination(workingCard.pagination),
    navigation: toBoolean(workingCard.navigation, DEFAULT_CONFIG.navigation),
    autoplay: normalizeAutoplay(workingCard.autoplay),
    effect: workingCard.effect ?? DEFAULT_CONFIG.effect,
    slides_per_view: workingCard.slides_per_view ?? DEFAULT_CONFIG.slides_per_view,
    space_between: toNumber(workingCard.space_between, DEFAULT_CONFIG.space_between, 0),
    loop: toBoolean(workingCard.loop, DEFAULT_CONFIG.loop),
    direction: workingCard.direction ?? DEFAULT_CONFIG.direction,
    centered_slides: toBoolean(workingCard.centered_slides, DEFAULT_CONFIG.centered_slides),
    free_mode: toBoolean(workingCard.free_mode, DEFAULT_CONFIG.free_mode),
    start_card: toOptionalNumber(workingCard.start_card, 1),
    reset_after: toOptionalNumber(workingCard.reset_after, 0),
    slides: normalizeSlides(workingCard),
  };
};

export const ensureSlideBackground = (background?: CarouselSlideConfig['background']): CarouselSlideConfig['background'] => {
  if (!background) return undefined;
  return {
    ...DEFAULT_BACKGROUND_CONFIG,
    ...background,
  };
};
