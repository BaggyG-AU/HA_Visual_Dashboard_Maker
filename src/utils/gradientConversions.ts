import { GradientDefinition, GradientStop } from '../types/gradient';

const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max);

const DEFAULT_STOPS: GradientStop[] = [
  { id: 'stop-1', color: '#4F46E5', position: 0 },
  { id: 'stop-2', color: '#06B6D4', position: 100 },
];

export const defaultGradient: GradientDefinition = {
  type: 'linear',
  angle: 90,
  shape: 'ellipse',
  position: 'center',
  stops: DEFAULT_STOPS,
};

export const gradientToCss = (gradient: GradientDefinition): string => {
  const { type, angle, shape, position, stops } = gradient;
  const normalizedStops = [...stops]
    .sort((a, b) => a.position - b.position)
    .map((stop) => `${stop.color} ${clamp(stop.position)}%`)
    .join(', ');

  if (type === 'radial') {
    return `radial-gradient(${shape} at ${position}, ${normalizedStops})`;
  }

  return `linear-gradient(${angle}deg, ${normalizedStops})`;
};

const parseStops = (stopsPart: string): GradientStop[] => {
  const pieces = stopsPart.split(',').map((s) => s.trim()).filter(Boolean);
  return pieces.map((piece, index) => {
    const match = piece.match(/(var\([^)]+\)|#[0-9a-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))\s+(\d+(?:\.\d+)?)%/i);
    const color = match ? match[1] : piece.split(' ')[0];
    const position = match ? Number(match[2]) : (index === 0 ? 0 : 100);
    return {
      id: `stop-${index + 1}`,
      color,
      position: clamp(position),
    };
  });
};

export const parseGradient = (value?: string): GradientDefinition => {
  if (!value || typeof value !== 'string') return defaultGradient;

  const trimmed = value.trim();
  const linearMatch = trimmed.match(/^linear-gradient\(([^,]+),(.+)\)$/i);
  if (linearMatch) {
    const anglePart = linearMatch[1].trim();
    const angleMatch = anglePart.match(/(-?\d+(?:\.\d+)?)deg/);
    const angle = angleMatch ? Number(angleMatch[1]) : 90;
    const stops = parseStops(linearMatch[2]);
    return {
      type: 'linear',
      angle,
      shape: 'ellipse',
      position: 'center',
      stops: stops.length > 0 ? stops : DEFAULT_STOPS,
    };
  }

  const radialMatch = trimmed.match(/^radial-gradient\(([^,]+)\s+at\s+([^,]+),(.+)\)$/i);
  if (radialMatch) {
    const shapePart = radialMatch[1].trim().toLowerCase();
    const positionPart = radialMatch[2].trim();
    const stops = parseStops(radialMatch[3]);
    return {
      type: 'radial',
      angle: 0,
      shape: shapePart === 'circle' ? 'circle' : 'ellipse',
      position: positionPart || 'center',
      stops: stops.length > 0 ? stops : DEFAULT_STOPS,
    };
  }

  return defaultGradient;
};

export const updateStop = (stops: GradientStop[], id: string, updates: Partial<GradientStop>): GradientStop[] =>
  stops.map((stop) => (stop.id === id ? { ...stop, ...updates, position: updates.position !== undefined ? clamp(updates.position) : stop.position } : stop));

export const addStop = (stops: GradientStop[], color: string): GradientStop[] => {
  const nextPosition = stops.length === 0 ? 0 : clamp(stops[stops.length - 1].position + 20, 0, 100);
  return [...stops, { id: `stop-${stops.length + 1}`, color, position: nextPosition }];
};

export const removeStop = (stops: GradientStop[], id: string): GradientStop[] => {
  const filtered = stops.filter((stop) => stop.id !== id);
  return filtered.length > 0 ? filtered : DEFAULT_STOPS;
};

export const reorderStops = (stops: GradientStop[], fromIndex: number, toIndex: number): GradientStop[] => {
  const next = [...stops];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next.map((stop, idx) => ({ ...stop, id: `stop-${idx + 1}` }));
};

export const isGradientString = (value?: string): boolean => Boolean(value && /gradient\(/i.test(value));
