import { describe, it, expect } from 'vitest';
import {
  normalizeSwiperConfig,
  parseUpstreamSwipeCard,
  toUpstreamSwipeCard,
} from '../../src/features/carousel/carouselService';
import type { SwiperCardConfig, UpstreamSwipeCardConfig } from '../../src/features/carousel/types';

const makeCard = (overrides: Partial<SwiperCardConfig> = {}): SwiperCardConfig => ({
  type: 'custom:swipe-card',
  ...overrides,
});

describe('carouselService', () => {
  it('normalizes pagination and autoplay defaults', () => {
    const card = makeCard({ pagination: true, autoplay: true });
    const config = normalizeSwiperConfig(card);

    expect(config.pagination).toEqual({ type: 'bullets', clickable: true });
    expect(config.autoplay).toEqual({
      enabled: true,
      delay: 5000,
      pause_on_interaction: true,
      stop_on_last_slide: false,
    });
  });

  it('maps legacy cards array into slides', () => {
    const card = makeCard({
      cards: [
        { type: 'markdown', content: 'One' } as any,
        { type: 'markdown', content: 'Two' } as any,
      ],
    });

    const config = normalizeSwiperConfig(card);
    expect(config.slides).toHaveLength(2);
    expect(config.slides[0].cards?.[0]).toMatchObject({ type: 'markdown', content: 'One' });
    expect(config.slides[1].cards?.[0]).toMatchObject({ type: 'markdown', content: 'Two' });
  });

  it('normalizes slide defaults and navigation flags', () => {
    const card = makeCard({
      slides: [
        { card: { type: 'markdown', content: 'Slide' } as any, skip_navigation: true },
        { cards: [{ type: 'markdown', content: 'Allowed' } as any], allow_navigation: true },
      ],
    });

    const config = normalizeSwiperConfig(card);
    expect(config.slides[0].cards).toHaveLength(1);
    expect(config.slides[0].alignment).toBe('center');
    expect(config.slides[0].allow_navigation).toBe(false);
    expect(config.slides[0].skip_navigation).toBe(true);

    expect(config.slides[1].allow_navigation).toBe(true);
  });

  it('applies numeric defaults for spacing and slides per view', () => {
    const card = makeCard({ space_between: -5, slides_per_view: undefined });
    const config = normalizeSwiperConfig(card);
    expect(config.space_between).toBe(0);
    expect(config.slides_per_view).toBe(1);
  });

  it('parses upstream swipe-card parameters into internal snake_case fields', () => {
    const upstream: UpstreamSwipeCardConfig = {
      type: 'custom:swipe-card',
      start_card: 2,
      reset_after: 30,
      parameters: {
        slidesPerView: 2,
        spaceBetween: 20,
        centeredSlides: true,
        loop: true,
        autoplay: {
          delay: 3000,
          disableOnInteraction: true,
        },
        pagination: {
          type: 'fraction',
        },
        navigation: true,
        effect: 'coverflow',
      },
      cards: [
        { type: 'button', entity: 'light.room_1' } as any,
        { type: 'button', entity: 'light.room_2' } as any,
        { type: 'button', entity: 'light.room_3' } as any,
      ],
    };

    const parsed = parseUpstreamSwipeCard(upstream);
    const normalized = normalizeSwiperConfig(parsed);

    expect(normalized.slides_per_view).toBe(2);
    expect(normalized.space_between).toBe(20);
    expect(normalized.centered_slides).toBe(true);
    expect(normalized.loop).toBe(true);
    expect(normalized.autoplay).toMatchObject({
      delay: 3000,
      pause_on_interaction: true,
    });
    expect(normalized.pagination).toMatchObject({ type: 'fraction' });
    expect(normalized.navigation).toBe(true);
    expect(normalized.effect).toBe('coverflow');
    expect(normalized.start_card).toBe(2);
    expect(normalized.reset_after).toBe(30);
    expect(normalized.slides).toHaveLength(3);
    expect(normalized.slides[0].cards?.[0]).toMatchObject({ type: 'button', entity: 'light.room_1' });
  });

  it('exports internal config to upstream swipe-card schema and strips HAVDM-only slide fields', () => {
    const internal = makeCard({
      start_card: 2,
      reset_after: 30,
      slides: [
        {
          alignment: 'top',
          background: { type: 'gradient', value: 'linear-gradient(#000, #111)' } as any,
          allow_navigation: true,
          autoplay_delay: 2000,
          cards: [{ type: 'button', entity: 'light.room_1' } as any],
        },
        {
          alignment: 'bottom',
          skip_navigation: true,
          cards: [{ type: 'button', entity: 'light.room_2' } as any],
        },
      ],
      slides_per_view: 2,
      space_between: 20,
      centered_slides: true,
      loop: true,
      autoplay: { enabled: true, delay: 3000, pause_on_interaction: true },
      pagination: { type: 'fraction', clickable: true },
      navigation: true,
      effect: 'coverflow',
    });

    const upstream = toUpstreamSwipeCard(normalizeSwiperConfig(internal));
    expect(upstream.type).toBe('custom:swipe-card');
    expect(upstream.start_card).toBe(2);
    expect(upstream.reset_after).toBe(30);
    expect(upstream.cards).toHaveLength(2);
    expect(upstream.cards?.[0]).toMatchObject({ type: 'button', entity: 'light.room_1' });
    expect((upstream as { slides?: unknown }).slides).toBeUndefined();
    expect((upstream.cards?.[0] as { alignment?: unknown }).alignment).toBeUndefined();
    expect((upstream.cards?.[0] as { background?: unknown }).background).toBeUndefined();
    expect(upstream.parameters).toMatchObject({
      slidesPerView: 2,
      spaceBetween: 20,
      centeredSlides: true,
      loop: true,
      navigation: true,
      effect: 'coverflow',
      autoplay: {
        delay: 3000,
        disableOnInteraction: true,
      },
      pagination: {
        type: 'fraction',
        clickable: true,
      },
    });
  });
});
