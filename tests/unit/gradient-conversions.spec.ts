import { describe, it, expect } from 'vitest';
import { defaultGradient, gradientToCss, parseGradient, addStop, removeStop } from '../../src/utils/gradientConversions';

describe('gradientConversions', () => {
  it('generates linear gradient css', () => {
    const css = gradientToCss({
      ...defaultGradient,
      type: 'linear',
      angle: 45,
      stops: [
        { id: 's1', color: '#ff0000', position: 0 },
        { id: 's2', color: '#0000ff', position: 100 },
      ],
    });
    expect(css).toBe('linear-gradient(45deg, #ff0000 0%, #0000ff 100%)');
  });

  it('generates radial gradient css', () => {
    const css = gradientToCss({
      ...defaultGradient,
      type: 'radial',
      shape: 'circle',
      position: 'center',
      stops: [
        { id: 's1', color: '#ff0000', position: 0 },
        { id: 's2', color: '#0000ff', position: 100 },
      ],
    });
    expect(css).toBe('radial-gradient(circle at center, #ff0000 0%, #0000ff 100%)');
  });

  it('generates multiple stops in order', () => {
    const css = gradientToCss({
      ...defaultGradient,
      type: 'linear',
      angle: 90,
      stops: [
        { id: 's1', color: '#f00', position: 0 },
        { id: 's2', color: '#0f0', position: 50 },
        { id: 's3', color: '#00f', position: 100 },
      ],
    });
    expect(css).toBe('linear-gradient(90deg, #f00 0%, #0f0 50%, #00f 100%)');
  });

  it('parses linear gradient css', () => {
    const gradient = parseGradient('linear-gradient(120deg, #ff0000 0%, #0000ff 100%)');
    expect(gradient.type).toBe('linear');
    expect(gradient.angle).toBe(120);
    expect(gradient.stops).toHaveLength(2);
    expect(gradient.stops[0].color).toBe('#ff0000');
  });

  it('parses radial gradient css', () => {
    const gradient = parseGradient('radial-gradient(circle at center, #111 0%, #222 100%)');
    expect(gradient.type).toBe('radial');
    expect(gradient.shape).toBe('circle');
    expect(gradient.position).toBe('center');
    expect(gradient.stops[1].color).toBe('#222');
  });

  it('parses css variable stops', () => {
    const gradient = parseGradient('linear-gradient(90deg, var(--primary) 20%, var(--secondary) 80%)');
    expect(gradient.stops[0].color).toBe('var(--primary)');
    expect(gradient.stops[0].position).toBe(20);
    expect(gradient.stops[1].color).toBe('var(--secondary)');
    expect(gradient.stops[1].position).toBe(80);
  });

  it('adds and removes stops safely', () => {
    const withAdded = addStop(defaultGradient.stops, '#ffffff');
    expect(withAdded.length).toBeGreaterThan(defaultGradient.stops.length);
    const withRemoved = removeStop(withAdded, withAdded[0].id);
    expect(withRemoved.length).toBeGreaterThan(0);
  });

  it('falls back to default gradient for invalid string', () => {
    const gradient = parseGradient('not-a-gradient');
    expect(gradientToCss(gradient)).toBe(gradientToCss(defaultGradient));
  });
});
