export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  levelName: string;
  message: string;
  context: string;
  timestamp: string;
  data?: unknown;
  error?: unknown;
}

export interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, error?: unknown, data?: unknown): void;
  child(childContext: string): Logger;
}

const IS_DEV = process.env.NODE_ENV === 'development';
const IS_SERVER = typeof window === 'undefined';
const MIN_LEVEL: LogLevel = IS_DEV ? LogLevel.DEBUG : LogLevel.WARN;

const LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
};

// ANSI colors for server-side dev logging only
const LEVEL_COLORS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: '\x1b[36m',
  [LogLevel.INFO]: '\x1b[32m',
  [LogLevel.WARN]: '\x1b[33m',
  [LogLevel.ERROR]: '\x1b[31m',
};

const RESET = '\x1b[0m';

function serializeError(error: unknown): unknown {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return error;
}

function writeLog(entry: LogEntry): void {
  if (entry.level < MIN_LEVEL) return;

  if (IS_DEV && IS_SERVER) {
    const color = LEVEL_COLORS[entry.level] ?? '';
    const prefix = `${color}[${entry.timestamp}] [${entry.levelName}] [${entry.context}]${RESET}`;
    const message = `${prefix} ${entry.message}`;

    if (entry.level === LogLevel.ERROR) {
      process.stderr.write(
        `${message}${entry.error ? ` | error: ${JSON.stringify(serializeError(entry.error))}` : ''}${entry.data ? ` | data: ${JSON.stringify(entry.data)}` : ''}\n`
      );
    } else {
      process.stdout.write(
        `${message}${entry.data ? ` | ${JSON.stringify(entry.data)}` : ''}\n`
      );
    }
    return;
  }

  if (!IS_DEV && entry.level >= LogLevel.WARN) {
    const structured = JSON.stringify({
      timestamp: entry.timestamp,
      level: entry.levelName,
      context: entry.context,
      message: entry.message,
      data: entry.data,
      error: serializeError(entry.error),
    });
    if (entry.level === LogLevel.ERROR) {
      console.error(structured);
    } else {
      console.warn(structured);
    }
  }
}

export function createLogger(context: string): Logger {
  function log(level: LogLevel, message: string, data?: unknown, error?: unknown): void {
    writeLog({
      level,
      levelName: LEVEL_NAMES[level] ?? 'UNKNOWN',
      message,
      context,
      timestamp: new Date().toISOString(),
      data,
      error,
    });
  }

  return {
    debug: (message, data) => log(LogLevel.DEBUG, message, data),
    info: (message, data) => log(LogLevel.INFO, message, data),
    warn: (message, data) => log(LogLevel.WARN, message, data),
    error: (message, error, data) => log(LogLevel.ERROR, message, data, error),
    child: (childContext) => createLogger(`${context}:${childContext}`),
  };
}

export const rootLogger = createLogger('AssetFlow');
