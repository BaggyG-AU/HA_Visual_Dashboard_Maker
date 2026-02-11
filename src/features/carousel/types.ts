import type { Card } from '../../types/dashboard';
import type { BackgroundConfig } from '../../utils/backgroundStyle';

export type CarouselPaginationType = 'bullets' | 'fraction' | 'progressbar' | 'custom';
export type CarouselEffect = 'slide' | 'fade' | 'cube' | 'coverflow' | 'flip';
export type CarouselDirection = 'horizontal' | 'vertical';
export type CarouselAlignment = 'top' | 'center' | 'bottom';

export interface CarouselPaginationConfig {
  type?: CarouselPaginationType;
  clickable?: boolean;
}

export interface CarouselAutoplayConfig {
  enabled?: boolean;
  delay?: number;
  pause_on_interaction?: boolean;
  stop_on_last_slide?: boolean;
}

export interface CarouselSlideConfig {
  id?: string;
  cards?: Card[];
  card?: Card;
  background?: BackgroundConfig;
  alignment?: CarouselAlignment;
  autoplay_delay?: number;
  allow_navigation?: boolean;
  skip_navigation?: boolean;
}

export interface SwiperCardConfig {
  type: 'custom:swiper-card';
  title?: string;
  pagination?: CarouselPaginationConfig | boolean;
  navigation?: boolean;
  autoplay?: CarouselAutoplayConfig | boolean;
  effect?: CarouselEffect;
  slides_per_view?: number | 'auto';
  space_between?: number;
  loop?: boolean;
  direction?: CarouselDirection;
  centered_slides?: boolean;
  free_mode?: boolean;
  cards?: Card[];
  slides?: CarouselSlideConfig[];
  style?: string;
}

export interface NormalizedCarouselConfig {
  pagination: CarouselPaginationConfig | false;
  navigation: boolean;
  autoplay: CarouselAutoplayConfig | false;
  effect: CarouselEffect;
  slides_per_view: number | 'auto';
  space_between: number;
  loop: boolean;
  direction: CarouselDirection;
  centered_slides: boolean;
  free_mode: boolean;
  slides: CarouselSlideConfig[];
}
