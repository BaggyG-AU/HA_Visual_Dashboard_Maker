import { parseColor } from './colorConversions';
import { isGradientString } from './gradientConversions';

export type IconColorMode = 'default' | 'custom' | 'state' | 'attribute';

export interface IconColorResolverInput {
  mode?: IconColorMode;
  customColor?: string;
  stateColors?: Record<string, string>;
  attribute?: string;
  entityState?: string;
  entityAttributes?: Record<string, unknown>;
  defaultColor?: string;
}

const isVar = (value: string) => /^var\(.+\)$/i.test(value);

const isValidColor = (value?: string): string | undefined => {
  if (!value || typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  if (isGradientString(trimmed) || isVar(trimmed)) return trimmed;
  const parsed = parseColor(trimmed);
  return parsed ? trimmed : undefined;
};

export const resolveIconColor = ({
  mode = 'default',
  customColor,
  stateColors,
  attribute,
  entityState,
  entityAttributes,
  defaultColor = '#666',
}: IconColorResolverInput): string => {
  const resolvedCustom = isValidColor(customColor);

  if (mode === 'custom') {
    return resolvedCustom || defaultColor;
  }

  if (mode === 'state') {
    const stateKey = entityState || 'unknown';
    const stateColor = stateColors?.[stateKey] || stateColors?.default;
    return isValidColor(stateColor) || resolvedCustom || defaultColor;
  }

  if (mode === 'attribute') {
    const attrName = attribute?.trim();
    if (attrName && entityAttributes && typeof entityAttributes[attrName] === 'string') {
      const attrColor = isValidColor(entityAttributes[attrName] as string);
      if (attrColor) return attrColor;
    }
    return resolvedCustom || defaultColor;
  }

  return defaultColor;
};
