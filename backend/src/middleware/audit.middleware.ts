import { NextFunction, Response } from 'express';
import { auditLogger, AuditEntry, redact } from '../utils/logger';
import { AuthRequest } from './auth.middleware';

// Logs every non-GET request as an audit entry once the response finishes
export function auditMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const start = Date.now();
  const method = req.method;
  // Skip noisy health/readiness endpoints entirely
  if (req.path === '/health' || req.path === '/ready' || method === 'GET') {
    return next();
  }

  res.on('finish', () => {
    const ms = Date.now() - start;
    const entry: AuditEntry = {
      ts: new Date().toISOString(),
      method,
      path: req.path,
      status: res.statusCode,
      ms,
      userId: req.user?.id,
      ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || undefined,
      userAgent: req.headers['user-agent'] as string,
      params: redact(req.params),
      query: redact(req.query),
      body: redact(req.body),
    };
    auditLogger.info(entry);
  });

  next();
}
