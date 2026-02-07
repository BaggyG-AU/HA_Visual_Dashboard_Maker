import type {
  CarouselAutoplayConfig,
  CarouselPaginationConfig,
  CarouselSlideConfig,
  NormalizedCarouselConfig,
  SwiperCardConfig,
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

export const normalizeSwiperConfig = (card: SwiperCardConfig): NormalizedCarouselConfig => {
  return {
    pagination: normalizePagination(card.pagination),
    navigation: toBoolean(card.navigation, DEFAULT_CONFIG.navigation),
    autoplay: normalizeAutoplay(card.autoplay),
    effect: card.effect ?? DEFAULT_CONFIG.effect,
    slides_per_view: card.slides_per_view ?? DEFAULT_CONFIG.slides_per_view,
    space_between: toNumber(card.space_between, DEFAULT_CONFIG.space_between, 0),
    loop: toBoolean(card.loop, DEFAULT_CONFIG.loop),
    direction: card.direction ?? DEFAULT_CONFIG.direction,
    centered_slides: toBoolean(card.centered_slides, DEFAULT_CONFIG.centered_slides),
    free_mode: toBoolean(card.free_mode, DEFAULT_CONFIG.free_mode),
    slides: normalizeSlides(card),
  };
};

export const ensureSlideBackground = (background?: CarouselSlideConfig['background']): CarouselSlideConfig['background'] => {
  if (!background) return undefined;
  return {
    ...DEFAULT_BACKGROUND_CONFIG,
    ...background,
  };
};
