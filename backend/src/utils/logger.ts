import winston from 'winston';
import fs from 'fs';
import path from 'path';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Ensure logs directory exists
const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: path.join(LOG_DIR, 'error.log'),
    level: 'error',
  }),
  new winston.transports.File({ filename: path.join(LOG_DIR, 'all.log') }),
];

export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

// Dedicated audit logger (JSON only)
export const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(LOG_DIR, 'audit.log') }),
  ],
});

export type AuditEntry = {
  ts: string;
  method: string;
  path: string;
  status: number;
  ms: number;
  userId?: string;
  ip?: string;
  userAgent?: string;
  params?: any;
  query?: any;
  body?: any;
};

export function redact(obj: any, keys: string[] = ['password', 'token', 'authorization']): any {
  try {
    const clone = JSON.parse(JSON.stringify(obj || {}));
    const walk = (o: any) => {
      if (!o || typeof o !== 'object') return;
      for (const k of Object.keys(o)) {
        if (keys.includes(k.toLowerCase())) {
          o[k] = '[REDACTED]';
        } else if (typeof o[k] === 'object') {
          walk(o[k]);
        }
      }
    };
    walk(clone);
    return clone;
  } catch {
    return {};
  }
}
