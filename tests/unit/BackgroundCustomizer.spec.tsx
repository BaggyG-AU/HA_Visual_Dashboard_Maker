import { describe, it, expect } from 'vitest';
import { applyBackgroundConfigToStyle, parseBackgroundConfig, DEFAULT_BACKGROUND_CONFIG } from '../../src/utils/backgroundStyle';

describe('BackgroundCustomizer style generation', () => {
  it('applies solid background with opacity', () => {
    const config = { ...DEFAULT_BACKGROUND_CONFIG, type: 'solid' as const, solidColor: '#ff0000', backgroundOpacity: 60 };
    const style = applyBackgroundConfigToStyle('', config);
    expect(style).toContain('background: rgba(255, 0, 0, 0.60)');
  });

  it('applies gradient background with opacity', () => {
    const config = { ...DEFAULT_BACKGROUND_CONFIG, type: 'gradient' as const, gradient: 'linear-gradient(90deg, #ff0000 0%, #0000ff 100%)', backgroundOpacity: 50 };
    const style = applyBackgroundConfigToStyle('', config);
    expect(style.toLowerCase()).toContain('linear-gradient');
    // Gradient colors are now normalized to hex format with alpha (e.g., #ff000080 for 50% opacity red)
    expect(style.toLowerCase()).toContain('#ff000080');
    expect(style.toLowerCase()).toContain('#0000ff80');
  });

  it('applies image background with url and controls', () => {
    const config = {
      ...DEFAULT_BACKGROUND_CONFIG,
      type: 'image' as const,
      imageUrl: 'https://example.com/bg.jpg',
      imagePosition: 'center' as const,
      imageSize: 'cover' as const,
      imageRepeat: 'no-repeat' as const,
      imageOpacity: 80,
      imageBlur: 4,
      overlayColor: '#112233',
      overlayOpacity: 25,
    };
    const style = applyBackgroundConfigToStyle('', config);
    expect(style).toContain('background-image:');
    expect(style).toContain('url("https://example.com/bg.jpg")');
    expect(style).toContain('background-size: cover');
    expect(style).toContain('background-position: center');
    expect(style).toContain('background-repeat: no-repeat');
    expect(style).toContain('filter: blur(4px)');
  });

  it('round-trips blur config from style', () => {
    const style = 'background-color: rgba(10, 20, 30, 0.35); backdrop-filter: blur(12px);';
    const parsed = parseBackgroundConfig(style);
    expect(parsed.type).toBe('blur');
    expect(parsed.blurAmount).toBe(12);
    expect(parsed.backgroundOpacity).toBe(35);
  });
});

