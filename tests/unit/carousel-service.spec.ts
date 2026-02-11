import { describe, it, expect } from 'vitest';
import { normalizeSwiperConfig } from '../../src/features/carousel/carouselService';
import type { SwiperCardConfig } from '../../src/features/carousel/types';

const makeCard = (overrides: Partial<SwiperCardConfig> = {}): SwiperCardConfig => ({
  type: 'custom:swiper-card',
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
});
