const STYLE_COLOR_REGEX = /(^|[\s{;])color\s*:\s*([^;]+)/i;
const STYLE_BACKGROUND_REGEX = /(^|[\s{;])background\s*:\s*([^;]+)/i;

export const extractStyleColor = (styleValue?: string): string => {
  if (!styleValue) return '';
  const match = STYLE_COLOR_REGEX.exec(styleValue);
  return match ? match[2].trim() : '';
};

export const upsertStyleColor = (styleValue: string | undefined, color: string): string => {
  if (!styleValue || !styleValue.trim()) {
    return `color: ${color};`;
  }

  if (STYLE_COLOR_REGEX.test(styleValue)) {
    return styleValue.replace(STYLE_COLOR_REGEX, `$1color: ${color}`);
  }

  const normalized = styleValue.trim().endsWith(';') ? styleValue.trim() : `${styleValue.trim()};`;
  return `${normalized}\ncolor: ${color};`;
};

export const extractStyleBackground = (styleValue?: string): string => {
  if (!styleValue) return '';
  const match = STYLE_BACKGROUND_REGEX.exec(styleValue);
  return match ? match[2].trim() : '';
};

export const upsertStyleBackground = (styleValue: string | undefined, background: string): string => {
  if (!styleValue || !styleValue.trim()) {
    return `background: ${background};`;
  }

  if (STYLE_BACKGROUND_REGEX.test(styleValue)) {
    return styleValue.replace(STYLE_BACKGROUND_REGEX, `$1background: ${background}`);
  }

  const normalized = styleValue.trim().endsWith(';') ? styleValue.trim() : `${styleValue.trim()};`;
  return `${normalized}\nbackground: ${background};`;
};

export const removeStyleBackground = (styleValue: string | undefined): string => {
  if (!styleValue) return '';
  return styleValue
    .replace(STYLE_BACKGROUND_REGEX, '')
    .replace(/;{2,}/g, ';')
    .replace(/\s{2,}/g, ' ')
    .trim();
};
