import pino from 'pino';
import path from 'path';
import fs from 'fs';

const logDir = path.resolve(process.cwd(), 'test-results', 'logs');
try {
  fs.mkdirSync(logDir, { recursive: true });
} catch {
  // Best-effort; tests should still run.
}

const destination = process.env.CI ? path.join(logDir, 'structured.ndjson') : undefined;

export const logger = pino(
  {
  level: process.env.LOG_LEVEL ?? (process.env.CI ? 'info' : 'debug'),
  redact: {
    paths: ['req.headers.authorization', 'req.headers.Authorization', '*.token', '*.password', '*.secret'],
    remove: true,
  },
  base: {
    app: 'playwright-e2e',
    stage: process.env.STAGE ?? 'qa',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  },
  destination ? pino.destination(destination) : undefined,
);

