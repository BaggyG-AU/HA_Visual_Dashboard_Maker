import React, { useMemo, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade, EffectCube, EffectCoverflow, EffectFlip, Keyboard, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/effect-cube';
import 'swiper/css/effect-coverflow';
import 'swiper/css/effect-flip';
import { Typography } from 'antd';
import type { Swiper as SwiperInstance } from 'swiper/types';
import type { CarouselAlignment, CarouselSlideConfig, SwiperCardConfig } from './types';
import { normalizeSwiperConfig, ensureSlideBackground } from './carouselService';
import { getCardBackgroundStyle, applyBackgroundConfigToStyle } from '../../utils/backgroundStyle';
import { BaseCard } from '../../components/BaseCard';

const { Text } = Typography;

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, []);

  return prefersReducedMotion;
};

const alignmentToJustify: Record<CarouselAlignment, React.CSSProperties['justifyContent']> = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
};

interface SwiperCarouselProps {
  card: SwiperCardConfig;
  isSelected?: boolean;
  onCardClick?: () => void;
}

export const SwiperCarousel: React.FC<SwiperCarouselProps> = ({
  card,
  isSelected = false,
  onCardClick,
}) => {
  const config = useMemo(() => normalizeSwiperConfig(card), [card]);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isEditing = isSelected;
  const skipInProgressRef = useRef(false);
  const swiperRef = useRef<SwiperInstance | null>(null);

  const paginationConfig = config.pagination
    ? {
      type: config.pagination.type,
      clickable: config.pagination.clickable,
      renderCustom: config.pagination.type === 'custom'
        ? (_swiper: SwiperInstance, current: number, total: number) => `${current} / ${total}`
        : undefined,
    }
    : false;

  // Extract primitive values for stable memoisation.  Without this, autoplayConfig
  // would be a new object on every render (even if values are identical), which causes
  // the autoplay useEffect to fire repeatedly — each call to start() resets Swiper's
  // internal setTimeout, so the delay never completes and slides never advance.
  const autoplayEnabled = Boolean(config.autoplay && config.autoplay.enabled !== false) && !prefersReducedMotion;
  const autoplayDelay = config.autoplay?.delay ?? 5000;
  const autoplayStopOnLast = Boolean(config.autoplay?.stop_on_last_slide);

  const autoplayConfig = useMemo(() => {
    if (!autoplayEnabled) return false as const;
    return {
      delay: autoplayDelay,
      // We manage pause/resume manually to match "pause on interaction" semantics.
      disableOnInteraction: false,
      stopOnLastSlide: autoplayStopOnLast,
    };
  }, [autoplayEnabled, autoplayDelay, autoplayStopOnLast]);

  const effect = prefersReducedMotion ? 'slide' : config.effect;
  const loop = config.loop && !prefersReducedMotion && !isEditing;
  const transitionSpeed = prefersReducedMotion ? 0 : 300;
  const shouldPauseOnInteraction = Boolean(config.autoplay?.pause_on_interaction);

  // swiperKey only includes options that REQUIRE a full Swiper re-mount (structural
  // changes).  Autoplay and isEditing are handled dynamically via useEffect to avoid
  // destroying and recreating the Swiper instance on every select/deselect cycle.
  // prefersReducedMotion is already captured via `effect` and `loop`.
  const swiperKey = useMemo(() => {
    const paginationKey = config.pagination
      ? `${config.pagination.type ?? 'bullets'}-${config.pagination.clickable ? 'click' : 'static'}`
      : 'none';
    return [
      paginationKey,
      config.navigation ? 'nav' : 'no-nav',
      effect,
      config.direction,
      config.slides_per_view,
      config.space_between,
      loop ? 'loop' : 'no-loop',
      config.centered_slides ? 'centered' : 'edge',
      config.free_mode ? 'free' : 'snap',
      config.slides.length,
    ].join('|');
  }, [
    config.centered_slides,
    config.direction,
    config.free_mode,
    config.navigation,
    config.pagination,
    config.slides.length,
    config.slides_per_view,
    config.space_between,
    effect,
    loop,
  ]);

  const getSlideCardContainerStyle = (alignment: CarouselAlignment | undefined): React.CSSProperties => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: alignmentToJustify[alignment ?? 'center'],
    gap: '12px',
    padding: '12px',
    boxSizing: 'border-box',
  });

  const slideIsNavigable = (slide: CarouselSlideConfig) => {
    if (slide.skip_navigation) return false;
    if (slide.allow_navigation === false) return false;
    return true;
  };

  const findNextNavigableIndex = (currentIndex: number, direction: number, slides: CarouselSlideConfig[]) => {
    const total = slides.length;
    for (let offset = 1; offset <= total; offset += 1) {
      const nextIndex = (currentIndex + offset * direction + total) % total;
      if (slideIsNavigable(slides[nextIndex])) return nextIndex;
    }
    return null;
  };

  const handleSlideChange = (swiper: SwiperInstance) => {
    if (skipInProgressRef.current || config.slides.length === 0) return;
    const realIndex = swiper.realIndex ?? swiper.activeIndex;
    const slide = config.slides[realIndex];
    if (!slide || slideIsNavigable(slide)) return;

    const direction = swiper.swipeDirection === 'prev' ? -1 : 1;
    const nextIndex = findNextNavigableIndex(realIndex, direction, config.slides);
    if (nextIndex === null) return;

    skipInProgressRef.current = true;
    window.setTimeout(() => {
      if (loop && swiper.slideToLoop) {
        swiper.slideToLoop(nextIndex);
      } else {
        swiper.slideTo(nextIndex);
      }
      skipInProgressRef.current = false;
    }, 0);
  };

  const slides = config.slides;

  const attachTestIds = () => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    const container = swiper.el as HTMLElement | null;
    if (!container) return;
    const prev = container.querySelector('.swiper-button-prev');
    const next = container.querySelector('.swiper-button-next');
    const pagination = container.querySelector('.swiper-pagination');
    if (prev) prev.setAttribute('data-testid', 'swiper-prev');
    if (next) next.setAttribute('data-testid', 'swiper-next');
    if (pagination) {
      pagination.setAttribute('data-testid', 'swiper-pagination');
      pagination.setAttribute('role', 'tablist');
    }
  };

  useEffect(() => {
    attachTestIds();
    const swiper = swiperRef.current;
    if (!swiper) return;
    if (swiper.pagination && typeof swiper.pagination !== 'boolean') {
      swiper.pagination.init?.();
      swiper.pagination.render?.();
      swiper.pagination.update?.();
    }
    swiper.update?.();
  }, [config.navigation, config.pagination, config.slides.length, swiperKey]);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    swiper.updateSize?.();
    swiper.updateSlides?.();
    swiper.updateProgress?.();
    swiper.updateSlidesClasses?.();
    swiper.update?.();
  }, [isEditing, config.direction, config.slides.length, config.slides_per_view, config.space_between]);

  // Autoplay start/stop — declared AFTER the dimension-update effect so that
  // swiper.update() completes before we call autoplay.start().  prefersReducedMotion
  // is already accounted for in autoplayConfig (set to false when reduced motion).
  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper?.autoplay) return;
    if (autoplayConfig && !isEditing) {
      swiper.autoplay.start?.();
    } else {
      swiper.autoplay.stop?.();
    }
  }, [autoplayConfig, isEditing, swiperKey]);

  return (
    <div
      data-testid="swiper-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={card.title ? `${card.title} carousel` : 'Carousel'}
      aria-live="polite"
      tabIndex={0}
      style={{ height: '100%' }}
      onClick={onCardClick}
    >
      <Swiper
        key={swiperKey}
        style={{ height: '100%' }}
        modules={[Navigation, Pagination, Autoplay, EffectFade, EffectCube, EffectCoverflow, EffectFlip, Keyboard, A11y]}
        navigation={config.navigation}
        pagination={paginationConfig}
        autoplay={autoplayConfig}
        loop={loop}
        effect={effect}
        slidesPerView={config.slides_per_view}
        spaceBetween={config.space_between}
        direction={config.direction}
        centeredSlides={config.centered_slides}
        freeMode={config.free_mode}
        keyboard={{ enabled: true, onlyInViewport: true }}
        a11y={{ enabled: true }}
        speed={transitionSpeed}
        onSlideChange={handleSlideChange}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          attachTestIds();
        }}
        onTouchStart={(swiper) => {
          if (shouldPauseOnInteraction) swiper.autoplay?.stop?.();
        }}
        onSliderFirstMove={(swiper) => {
          if (shouldPauseOnInteraction) swiper.autoplay?.stop?.();
        }}
        onTouchEnd={(swiper) => {
          if (shouldPauseOnInteraction && autoplayConfig && !isEditing) swiper.autoplay?.start?.();
        }}
        data-testid="swiper-carousel-core"
      >
        {slides.map((slide, index) => {
          const resolvedBackground = ensureSlideBackground(slide.background);
          const slideStyleValue = resolvedBackground
            ? applyBackgroundConfigToStyle('', resolvedBackground)
            : undefined;
          const backgroundStyle = resolvedBackground
            ? getCardBackgroundStyle(slideStyleValue, 'transparent')
            : undefined;
          const slideCards = slide.cards ?? [];

          return (
            <SwiperSlide
              key={slide.id ?? `slide-${index}`}
              data-testid={`swiper-slide-${index}`}
              data-slide-index={index}
              data-swiper-autoplay={typeof slide.autoplay_delay === 'number' ? slide.autoplay_delay : undefined}
              role="tabpanel"
              aria-label={`Slide ${index + 1} of ${slides.length}`}
              style={{
                height: '100%',
                ...(backgroundStyle ?? {}),
              }}
            >
              <div style={getSlideCardContainerStyle(slide.alignment)}>
                {slideCards.length === 0 ? (
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: isSelected ? '1px dashed #00d9ff' : '1px dashed #434343',
                      borderRadius: '8px',
                      color: '#666',
                      fontSize: '12px',
                    }}
                  >
                    <Text type="secondary">(No cards)</Text>
                  </div>
                ) : (
                  slideCards.map((childCard, childIndex) => (
                    <div key={`${index}-${childIndex}`} style={{ flex: '0 0 auto', minHeight: 0 }}>
                      <BaseCard
                        card={childCard}
                        isSelected={false}
                        onClick={(event) => {
                          event?.stopPropagation();
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

    </div>
  );
};
