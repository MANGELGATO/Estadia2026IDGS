export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  reqId?: string;
  path?: string;
  method?: string;
  status?: number;
  userId?: string;
  [key: string]: unknown;
}

export interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  reqId?: string;
  path?: string;
  method?: string;
  status?: number;
  data?: Record<string, unknown>;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
  };
}

const SENSITIVE_KEYS = [
  'password',
  'contrasena',
  'token',
  'secret',
  'authorization',
  'cookie',
  'jwt',
  'credential',
  'directus_token',
  'ine',
];

/**
 * Sanitiza recursivamente objetos para no filtrar datos sensibles a Loki/Promtail
 * conforme a la Sección 8 y LFPDPPP del Estándar Tecnológico PLAi.
 */
export function sanitizeLogData(input: unknown): unknown {
  if (input === null || input === undefined) return input;
  if (typeof input !== 'object') return input;

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeLogData(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const isSensitive = SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s));
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function writeLog(
  level: LogLevel,
  message: string,
  context?: LogContext,
  err?: Error | unknown
): StructuredLog {
  const { reqId, path, method, status, ...restData } = context || {};

  const logEntry: StructuredLog = {
    timestamp: new Date().toISOString(),
    level,
    service: 'plai-recursos-espacios',
    message,
    ...(reqId ? { reqId } : {}),
    ...(path ? { path } : {}),
    ...(method ? { method } : {}),
    ...(status ? { status } : {}),
  };

  if (Object.keys(restData).length > 0) {
    logEntry.data = sanitizeLogData(restData) as Record<string, unknown>;
  }

  if (err instanceof Error) {
    logEntry.error = {
      name: err.name,
      message: err.message,
      ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
    };
  } else if (err) {
    logEntry.error = {
      message: String(err),
    };
  }

  const jsonLine = JSON.stringify(logEntry);

  // En producción y Node.js, emitir a stdout/stderr sin escribir en disco
  if (level === 'error') {
    if (typeof process !== 'undefined' && process.stderr && process.stderr.write) {
      process.stderr.write(jsonLine + '\n');
    } else {
      console.error(jsonLine);
    }
  } else {
    if (typeof process !== 'undefined' && process.stdout && process.stdout.write) {
      process.stdout.write(jsonLine + '\n');
    } else {
      console.log(jsonLine);
    }
  }

  return logEntry;
}

export const logger = {
  debug: (message: string, context?: LogContext) => writeLog('debug', message, context),
  info: (message: string, context?: LogContext) => writeLog('info', message, context),
  warn: (message: string, context?: LogContext, err?: Error | unknown) =>
    writeLog('warn', message, context, err),
  error: (message: string, context?: LogContext, err?: Error | unknown) =>
    writeLog('error', message, context, err),
};
