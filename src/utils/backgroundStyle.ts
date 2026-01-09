import type { CSSProperties } from 'react';
import { formatRgba, parseColor, rgbaToHex } from './colorConversions';
import { gradientToCss, isGradientString, parseGradient } from './gradientConversions';
import { extractStyleProperty, removeStyleProperties, upsertStyleProperties } from './styleProperties';

export type BackgroundType = 'none' | 'solid' | 'gradient' | 'image' | 'blur';

export type BackgroundBlendMode = 'normal' | 'multiply' | 'screen' | 'overlay';

export type BackgroundImagePosition =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top left'
  | 'top right'
  | 'bottom left'
  | 'bottom right';

export type BackgroundImageSize = 'cover' | 'contain' | 'auto' | 'custom';

export type BackgroundImageRepeat = 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';

export interface BackgroundConfig {
  type: BackgroundType;
  solidColor: string;
  gradient: string;
  backgroundOpacity: number;
  imageUrl: string;
  imagePosition: BackgroundImagePosition;
  imageSize: BackgroundImageSize;
  imageSizeCustom: string;
  imageRepeat: BackgroundImageRepeat;
  imageOpacity: number;
  imageBlur: number;
  blendMode: BackgroundBlendMode;
  overlayColor: string;
  overlayOpacity: number;
  blurAmount: number;
}

const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max);
const normalizeOpaqueColor = (color: string): string => {
  const rgba = parseColor(color);
  if (!rgba) return color;
  return rgbaToHex({ ...rgba, a: 1 });
};

export const DEFAULT_BACKGROUND_CONFIG: BackgroundConfig = {
  type: 'none',
  solidColor: '#1f1f1f',
  gradient: 'linear-gradient(90deg, #4F46E5 0%, #06B6D4 100%)',
  backgroundOpacity: 100,
  imageUrl: '',
  imagePosition: 'center',
  imageSize: 'cover',
  imageSizeCustom: '100% 100%',
  imageRepeat: 'no-repeat',
  imageOpacity: 100,
  imageBlur: 0,
  blendMode: 'normal',
  overlayColor: '#000000',
  overlayOpacity: 0,
  blurAmount: 12,
};

const applyOpacityToColor = (color: string, opacityPercent: number): string => {
  const rgba = parseColor(color);
  if (!rgba) return color;
  const alpha = (clamp(opacityPercent, 0, 100) / 100) * rgba.a;
  return formatRgba({ ...rgba, a: alpha });
};

const applyOpacityToGradient = (gradient: string, opacityPercent: number): string => {
  if (!isGradientString(gradient)) return gradient;
  const alpha = clamp(opacityPercent, 0, 100) / 100;
  const parsed = parseGradient(gradient);
  const stops = parsed.stops.map((stop) => {
    const rgba = parseColor(stop.color);
    if (!rgba) return stop;
    return { ...stop, color: formatRgba({ ...rgba, a: rgba.a * alpha }) };
  });
  return gradientToCss({ ...parsed, stops });
};

const parseOpacityFromColor = (color: string): number => {
  const rgba = parseColor(color);
  if (!rgba) return 100;
  return clamp(Math.round(rgba.a * 100), 0, 100);
};

const parseOpacityFromGradient = (gradient: string): number => {
  if (!isGradientString(gradient)) return 100;
  const parsed = parseGradient(gradient);
  const firstStop = parsed.stops[0];
  if (!firstStop) return 100;
  return parseOpacityFromColor(firstStop.color);
};

const extractOverlayFromBackgroundImage = (backgroundImage: string): { color: string; opacity: number } => {
  const gradientMatch = backgroundImage.match(/linear-gradient\(([^)]+)\)/i);
  if (!gradientMatch) {
    return { color: DEFAULT_BACKGROUND_CONFIG.overlayColor, opacity: 0 };
  }

  const colorMatch = gradientMatch[1].match(/(rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-f]{3,8})/i);
  const color = colorMatch ? colorMatch[1] : DEFAULT_BACKGROUND_CONFIG.overlayColor;
  const opacity = parseOpacityFromColor(color);
  return { color, opacity };
};

const extractImageUrl = (backgroundImage: string): string => {
  const match = backgroundImage.match(/url\(([^)]+)\)/i);
  if (!match) return '';
  return match[1].trim().replace(/^['"]|['"]$/g, '');
};

export const parseBackgroundConfig = (styleValue?: string): BackgroundConfig => {
  const background = extractStyleProperty(styleValue, 'background');
  const backgroundImage = extractStyleProperty(styleValue, 'background-image');
  const backgroundColor = extractStyleProperty(styleValue, 'background-color');
  const backgroundPosition = extractStyleProperty(styleValue, 'background-position');
  const backgroundSize = extractStyleProperty(styleValue, 'background-size');
  const backgroundRepeat = extractStyleProperty(styleValue, 'background-repeat');
  const backgroundBlendMode = extractStyleProperty(styleValue, 'background-blend-mode');
  const backdropFilter = extractStyleProperty(styleValue, 'backdrop-filter');
  const filter = extractStyleProperty(styleValue, 'filter');

  const hasImage = /url\(/i.test(backgroundImage)
    || Boolean(backgroundPosition || backgroundSize || backgroundRepeat || backgroundBlendMode || filter);
  const hasGradient = isGradientString(background);
  const hasSolid = Boolean(background) && !hasGradient;
  const hasBlur = /blur\(/i.test(backdropFilter);

  let type: BackgroundType = 'none';
  if (hasImage) {
    type = 'image';
  } else if (hasGradient) {
    type = 'gradient';
  } else if (hasSolid) {
    type = 'solid';
  } else if (hasBlur) {
    type = 'blur';
  }

  const overlayFromImage = hasImage ? extractOverlayFromBackgroundImage(backgroundImage) : null;
  const blurOverlayColor = hasBlur && backgroundColor ? normalizeOpaqueColor(backgroundColor) : null;

  const imageOpacity = backgroundColor ? Math.max(0, 100 - parseOpacityFromColor(backgroundColor)) : 100;
  const blurMatch = filter.match(/blur\((\d+(?:\.\d+)?)px\)/i);
  const imageBlur = blurMatch ? Number(blurMatch[1]) : 0;
  const backdropBlurMatch = backdropFilter.match(/blur\((\d+(?:\.\d+)?)px\)/i);

  const sizeValue = backgroundSize || DEFAULT_BACKGROUND_CONFIG.imageSize;
  const sizeType: BackgroundImageSize = sizeValue === 'cover' || sizeValue === 'contain' || sizeValue === 'auto'
    ? sizeValue
    : 'custom';

  const gradientOpacity = hasGradient ? parseOpacityFromGradient(background) : DEFAULT_BACKGROUND_CONFIG.backgroundOpacity;
  const solidOpacity = hasSolid ? parseOpacityFromColor(background) : DEFAULT_BACKGROUND_CONFIG.backgroundOpacity;
  const blurOpacity = backgroundColor ? parseOpacityFromColor(backgroundColor) : DEFAULT_BACKGROUND_CONFIG.backgroundOpacity;

  return {
    type,
    solidColor: hasSolid ? normalizeOpaqueColor(background) : DEFAULT_BACKGROUND_CONFIG.solidColor,
    gradient: hasGradient ? background : DEFAULT_BACKGROUND_CONFIG.gradient,
    backgroundOpacity: hasGradient ? gradientOpacity : hasSolid ? solidOpacity : hasBlur ? blurOpacity : DEFAULT_BACKGROUND_CONFIG.backgroundOpacity,
    imageUrl: hasImage ? extractImageUrl(backgroundImage) : DEFAULT_BACKGROUND_CONFIG.imageUrl,
    imagePosition: (backgroundPosition as BackgroundImagePosition) || DEFAULT_BACKGROUND_CONFIG.imagePosition,
    imageSize: sizeType,
    imageSizeCustom: sizeType === 'custom' ? sizeValue : DEFAULT_BACKGROUND_CONFIG.imageSizeCustom,
    imageRepeat: (backgroundRepeat as BackgroundImageRepeat) || DEFAULT_BACKGROUND_CONFIG.imageRepeat,
    imageOpacity,
    imageBlur,
    blendMode: (backgroundBlendMode as BackgroundBlendMode) || DEFAULT_BACKGROUND_CONFIG.blendMode,
    overlayColor: overlayFromImage?.color
      ? normalizeOpaqueColor(overlayFromImage.color)
      : blurOverlayColor ?? DEFAULT_BACKGROUND_CONFIG.overlayColor,
    overlayOpacity: overlayFromImage?.opacity ?? DEFAULT_BACKGROUND_CONFIG.overlayOpacity,
    blurAmount: backdropBlurMatch ? Number(backdropBlurMatch[1]) : DEFAULT_BACKGROUND_CONFIG.blurAmount,
  };
};

export const applyBackgroundConfigToStyle = (styleValue: string | undefined, config: BackgroundConfig): string => {
  const properties: Record<string, string | undefined> = {};
  const removed = [
    'background',
    'background-image',
    'background-position',
    'background-size',
    'background-repeat',
    'background-color',
    'background-blend-mode',
    'backdrop-filter',
    '-webkit-backdrop-filter',
    'filter',
  ];

  if (config.type === 'none') {
    return removeStyleProperties(styleValue, removed);
  }

  if (config.type === 'solid') {
    properties.background = applyOpacityToColor(config.solidColor, config.backgroundOpacity);
  }

  if (config.type === 'gradient') {
    properties.background = applyOpacityToGradient(config.gradient, config.backgroundOpacity);
  }

  if (config.type === 'image') {
    const layers: string[] = [];
    const overlayOpacity = clamp(config.overlayOpacity, 0, 100);
    if (overlayOpacity > 0) {
      const overlay = applyOpacityToColor(config.overlayColor, overlayOpacity);
      layers.push(`linear-gradient(${overlay}, ${overlay})`);
    }

    const imageOpacity = clamp(config.imageOpacity, 0, 100);
    if (imageOpacity < 100) {
      const opacityOverlay = applyOpacityToColor('#000000', 100 - imageOpacity);
      layers.push(`linear-gradient(${opacityOverlay}, ${opacityOverlay})`);
    }

    if (config.imageUrl) {
      layers.push(`url("${config.imageUrl}")`);
    }

    properties['background-image'] = layers.length > 0 ? layers.join(', ') : undefined;
    properties['background-position'] = config.imagePosition;
    properties['background-size'] = config.imageSize === 'custom' ? config.imageSizeCustom : config.imageSize;
    properties['background-repeat'] = config.imageRepeat;
    properties['background-blend-mode'] = config.blendMode;
    properties['background-color'] = imageOpacity < 100 ? applyOpacityToColor('#000000', 100 - imageOpacity) : undefined;
    properties.filter = config.imageBlur > 0 ? `blur(${config.imageBlur}px)` : undefined;
  }

  if (config.type === 'blur') {
    const tint = applyOpacityToColor(config.overlayColor, config.backgroundOpacity);
    properties['background-color'] = tint;
    properties['backdrop-filter'] = `blur(${config.blurAmount}px)`;
    properties['-webkit-backdrop-filter'] = `blur(${config.blurAmount}px)`;
  }

  return upsertStyleProperties(removeStyleProperties(styleValue, removed), properties);
};

export const getCardBackgroundStyle = (
  styleValue: string | undefined,
  fallbackBackground: string
): CSSProperties => {
  const background = extractStyleProperty(styleValue, 'background');
  const backgroundImage = extractStyleProperty(styleValue, 'background-image');
  const backgroundColor = extractStyleProperty(styleValue, 'background-color');
  const backgroundPosition = extractStyleProperty(styleValue, 'background-position');
  const backgroundSize = extractStyleProperty(styleValue, 'background-size');
  const backgroundRepeat = extractStyleProperty(styleValue, 'background-repeat');
  const backgroundBlendMode = extractStyleProperty(styleValue, 'background-blend-mode');
  const backdropFilter = extractStyleProperty(styleValue, 'backdrop-filter');
  const webkitBackdropFilter = extractStyleProperty(styleValue, '-webkit-backdrop-filter');
  const filter = extractStyleProperty(styleValue, 'filter');

  const hasCustom = Boolean(
    background ||
    backgroundImage ||
    backgroundColor ||
    backgroundPosition ||
    backgroundSize ||
    backgroundRepeat ||
    backgroundBlendMode ||
    backdropFilter ||
    filter
  );

  if (!hasCustom) {
    return { backgroundColor: fallbackBackground };
  }

  const style: CSSProperties = {
    backgroundColor: backgroundColor || 'transparent',
  };

  if (background) style.background = background;
  if (backgroundImage) style.backgroundImage = backgroundImage;
  if (backgroundPosition) style.backgroundPosition = backgroundPosition;
  if (backgroundSize) style.backgroundSize = backgroundSize;
  if (backgroundRepeat) style.backgroundRepeat = backgroundRepeat;
  if (backgroundBlendMode) style.backgroundBlendMode = backgroundBlendMode;
  if (backdropFilter) style.backdropFilter = backdropFilter;
  if (webkitBackdropFilter) style.WebkitBackdropFilter = webkitBackdropFilter;
  if (filter) style.filter = filter;

  return style;
};

export const getBackgroundLayerStyle = (styleValue: string | undefined): CSSProperties | null => {
  const background = extractStyleProperty(styleValue, 'background');
  const backgroundImage = extractStyleProperty(styleValue, 'background-image');
  const backgroundColor = extractStyleProperty(styleValue, 'background-color');
  const backgroundPosition = extractStyleProperty(styleValue, 'background-position');
  const backgroundSize = extractStyleProperty(styleValue, 'background-size');
  const backgroundRepeat = extractStyleProperty(styleValue, 'background-repeat');
  const backgroundBlendMode = extractStyleProperty(styleValue, 'background-blend-mode');
  const backdropFilter = extractStyleProperty(styleValue, 'backdrop-filter');
  const webkitBackdropFilter = extractStyleProperty(styleValue, '-webkit-backdrop-filter');
  const filter = extractStyleProperty(styleValue, 'filter');

  const hasCustom = Boolean(
    background ||
    backgroundImage ||
    backgroundColor ||
    backgroundPosition ||
    backgroundSize ||
    backgroundRepeat ||
    backgroundBlendMode ||
    backdropFilter ||
    filter
  );

  if (!hasCustom) return null;

  const style: CSSProperties = {
    backgroundColor: backgroundColor || 'transparent',
  };

  if (background) style.background = background;
  if (backgroundImage) style.backgroundImage = backgroundImage;
  if (backgroundPosition) style.backgroundPosition = backgroundPosition;
  if (backgroundSize) style.backgroundSize = backgroundSize;
  if (backgroundRepeat) style.backgroundRepeat = backgroundRepeat;
  if (backgroundBlendMode) style.backgroundBlendMode = backgroundBlendMode;
  if (backdropFilter) style.backdropFilter = backdropFilter;
  if (webkitBackdropFilter) style.WebkitBackdropFilter = webkitBackdropFilter;
  if (filter) style.filter = filter;

  return style;
};
