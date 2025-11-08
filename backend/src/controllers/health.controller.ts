import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function healthHandler(_req: Request, res: Response) {
  const start = Date.now();
  let db = 'unknown';
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = 'ok';
  } catch (e) {
    db = 'down';
  }

  const payload = {
    status: db === 'ok' ? 'success' : 'degraded',
    db,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    responseTimeMs: Date.now() - start,
    version: process.env.npm_package_version || '1.0.0',
  };

  res.status(200).json(payload);
}

export async function readyHandler(_req: Request, res: Response) {
  // For readiness, require DB connectivity to be ok
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({ ready: true, ts: new Date().toISOString() });
  } catch {
    return res.status(503).json({ ready: false, ts: new Date().toISOString() });
  }
}
