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
    // Index through a keyed view so array-ness of `cloned` is preserved for the caller.
    const keyed = cloned as Record<string, unknown>;
    for (const key of Object.keys(keyed)) {
      if (/token|authorization|auth/i.test(key)) {
        keyed[key] = '[REDACTED]';
      }
    }
    return cloned;
  }
  return value;
};

// Narrowed to the console methods logger actually dispatches to — `keyof Console`
// also covers non-callable members such as the `Console` constructor.
type ConsoleMethod = 'error' | 'warn' | 'info' | 'debug' | 'log';

const logAt = (level: LoggingLevel, method: ConsoleMethod, args: unknown[]) => {
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
