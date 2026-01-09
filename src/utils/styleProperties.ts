const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildPropertyRegex = (property: string): RegExp => {
  const escaped = escapeRegex(property);
  return new RegExp(`(^|[\\s{;])${escaped}\\s*:\\s*([^;]+)`, 'i');
};

export const extractStyleProperty = (styleValue: string | undefined, property: string): string => {
  if (!styleValue) return '';
  const match = buildPropertyRegex(property).exec(styleValue);
  return match ? match[2].trim() : '';
};

export const upsertStyleProperty = (
  styleValue: string | undefined,
  property: string,
  value: string | undefined
): string => {
  const trimmed = styleValue?.trim() ?? '';
  if (!value || !value.trim()) {
    return removeStyleProperty(trimmed, property);
  }

  if (!trimmed) {
    return `${property}: ${value};`;
  }

  const regex = buildPropertyRegex(property);
  if (regex.test(trimmed)) {
    return trimmed.replace(regex, `$1${property}: ${value}`);
  }

  const normalized = trimmed.endsWith(';') ? trimmed : `${trimmed};`;
  return `${normalized}\n${property}: ${value};`;
};

export const removeStyleProperty = (styleValue: string | undefined, property: string): string => {
  if (!styleValue) return '';
  const regex = buildPropertyRegex(property);
  return styleValue
    .replace(regex, '')
    .replace(/;{2,}/g, ';')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

export const upsertStyleProperties = (
  styleValue: string | undefined,
  properties: Record<string, string | undefined>
): string => {
  let next = styleValue ?? '';
  Object.entries(properties).forEach(([property, value]) => {
    next = upsertStyleProperty(next, property, value);
  });
  return next.trim();
};

export const removeStyleProperties = (styleValue: string | undefined, properties: string[]): string => {
  let next = styleValue ?? '';
  properties.forEach((property) => {
    next = removeStyleProperty(next, property);
  });
  return next.trim();
};

