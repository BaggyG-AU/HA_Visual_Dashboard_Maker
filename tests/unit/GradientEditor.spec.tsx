import { describe, it, expect } from 'vitest';
import { adjustAngleForArrow, adjustStopPositionForArrow } from '../../src/utils/gradientKeyboard';

describe('GradientEditor keyboard helpers', () => {
  it('adjusts angle with arrow keys', () => {
    expect(adjustAngleForArrow(90, 'ArrowRight', false)).toBe(91);
    expect(adjustAngleForArrow(90, 'ArrowLeft', true)).toBe(80);
    expect(adjustAngleForArrow(0, 'ArrowLeft', false)).toBe(0);
    expect(adjustAngleForArrow(360, 'ArrowRight', true)).toBe(360);
  });

  it('adjusts stop position with arrow keys', () => {
    expect(adjustStopPositionForArrow(50, 'ArrowRight', false)).toBe(51);
    expect(adjustStopPositionForArrow(50, 'ArrowLeft', true)).toBe(40);
    expect(adjustStopPositionForArrow(0, 'ArrowLeft', false)).toBe(0);
    expect(adjustStopPositionForArrow(100, 'ArrowRight', true)).toBe(100);
  });
});
