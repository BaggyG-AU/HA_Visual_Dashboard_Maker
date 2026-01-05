import { LoggingLevel } from './settingsService';

type LevelWeight = Record<LoggingLevel, number>;

const weights: LevelWeight = {
  off: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

const defaultLevel: LoggingLevel =
  process.env.NODE_ENV === 'development' || process.env.E2E === '1' ? 'debug' : 'info';

let currentLevel: LoggingLevel = defaultLevel;

const redact = (value: unknown): unknown => {
  if (typeof value === 'string') {
    // Basic token redaction
    return value.replace(/(bearer\s+)[A-Za-z0-9\-_.~+/]+=*/gi, '$1[REDACTED]');
  }
  if (typeof value === 'object' && value !== null) {
    const cloned = Array.isArray(value) ? [...value] : { ...(value as Record<string, unknown>) };
    for (const key of Object.keys(cloned)) {
      if (/token|authorization|auth/i.test(key)) {
        cloned[key] = '[REDACTED]';
      }
    }
    return cloned;
  }
  return value;
};

const logAt = (level: LoggingLevel, method: keyof Console, args: unknown[]) => {
  if (weights[level] === 0) return;
  if (weights[level] <= weights[currentLevel]) {
    const safeArgs = args.map(redact);
    // eslint-disable-next-line no-console
    (console[method] ?? console.log)(...safeArgs);
  }
};

export const logger = {
  setLevel(level: LoggingLevel) {
    currentLevel = level;
  },
  getLevel(): LoggingLevel {
    return currentLevel;
  },
  error: (...args: unknown[]) => logAt('error', 'error', args),
  warn: (...args: unknown[]) => logAt('warn', 'warn', args),
  info: (...args: unknown[]) => logAt('info', 'info', args),
  debug: (...args: unknown[]) => logAt('debug', 'debug', args),
  trace: (...args: unknown[]) => logAt('trace', 'debug', args),
};

export const loggerDefaults = {
  defaultLevel,
};
