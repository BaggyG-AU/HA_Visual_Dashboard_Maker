import type { AttributeFormatConfig, AttributeFormatType, AttributeTimestampMode } from '../types/attributeDisplay';

const DEFAULT_MAX_LENGTH = 32;

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const toDate = (value: unknown): Date | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const formatRelativeTime = (input: Date, now: Date): string => {
  const diffMs = now.getTime() - input.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const absSec = Math.abs(diffSec);

  if (absSec < 60) {
    return `${absSec}s ${diffSec >= 0 ? 'ago' : 'from now'}`;
  }
  const diffMin = Math.round(absSec / 60);
  if (diffMin < 60) {
    return `${diffMin}m ${diffSec >= 0 ? 'ago' : 'from now'}`;
  }
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) {
    return `${diffHr}h ${diffSec >= 0 ? 'ago' : 'from now'}`;
  }
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) {
    return `${diffDay}d ${diffSec >= 0 ? 'ago' : 'from now'}`;
  }
  const diffMonth = Math.round(diffDay / 30);
  if (diffMonth < 12) {
    return `${diffMonth}mo ${diffSec >= 0 ? 'ago' : 'from now'}`;
  }
  const diffYear = Math.round(diffMonth / 12);
  return `${diffYear}y ${diffSec >= 0 ? 'ago' : 'from now'}`;
};

const formatBoolean = (value: unknown, config?: AttributeFormatConfig): string => {
  const trueLabel = config?.trueLabel ?? 'On';
  const falseLabel = config?.falseLabel ?? 'Off';

  if (typeof value === 'boolean') {
    return value ? trueLabel : falseLabel;
  }
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (normalized === 'true' || normalized === 'on' || normalized === 'yes' || normalized === '1') {
      return trueLabel;
    }
    if (normalized === 'false' || normalized === 'off' || normalized === 'no' || normalized === '0') {
      return falseLabel;
    }
  }
  return String(value ?? '');
};

const formatNumber = (value: unknown, config?: AttributeFormatConfig): string => {
  const numeric = toNumber(value);
  if (numeric === null) {
    return String(value ?? '');
  }
  const precision = typeof config?.precision === 'number' ? config.precision : undefined;
  const unit = config?.unit ? ` ${config.unit}` : '';
  const formatted = typeof precision === 'number' ? numeric.toFixed(precision) : String(numeric);
  return `${formatted}${unit}`;
};

const formatString = (value: unknown, config?: AttributeFormatConfig): string => {
  const raw = value == null ? '' : String(value);
  const maxLength = typeof config?.maxLength === 'number' ? config.maxLength : DEFAULT_MAX_LENGTH;
  if (maxLength > 0 && raw.length > maxLength) {
    return `${raw.slice(0, maxLength)}...`;
  }
  return raw;
};

const formatTimestamp = (value: unknown, mode: AttributeTimestampMode, now: Date): string => {
  const dateValue = toDate(value);
  if (!dateValue) {
    return String(value ?? '');
  }
  if (mode === 'relative') {
    return formatRelativeTime(dateValue, now);
  }
  return dateValue.toLocaleString();
};

const formatJson = (value: unknown): string => {
  if (value == null) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

export const detectFormatType = (value: unknown): AttributeFormatType => {
  if (value instanceof Date) return 'timestamp';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') {
    const numeric = toNumber(value);
    if (numeric !== null) return 'number';
    const date = toDate(value);
    if (date) return 'timestamp';
    return 'string';
  }
  if (Array.isArray(value) || typeof value === 'object') return 'json';
  return 'string';
};

export const formatAttributeValue = (
  value: unknown,
  config?: AttributeFormatConfig,
  now: Date = new Date(),
): string => {
  if (value === undefined || value === null) {
    return '';
  }

  const type = config?.type ?? detectFormatType(value);
  switch (type) {
    case 'number':
      return formatNumber(value, config);
    case 'boolean':
      return formatBoolean(value, config);
    case 'timestamp': {
      const mode = config?.timestampMode ?? 'relative';
      return formatTimestamp(value, mode, now);
    }
    case 'json':
      return formatJson(value);
    case 'string':
    default:
      return formatString(value, config);
  }
};
