import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
const MAIN_LOG = path.join(LOG_DIR, 'all.log');
const AUDIT_LOG = path.join(LOG_DIR, 'audit.log');

function tailFile(file: string, limit: number): string[] {
  if (!fs.existsSync(file)) return [];
  const content = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  return content.slice(-limit);
}

function parseLogLine(line: string, isAudit: boolean): any {
  if (!isAudit) return { raw: line };
  try {
    return JSON.parse(line);
  } catch {
    return { raw: line };
  }
}

function extractTimestamp(line: string, isAudit: boolean): Date | null {
  if (isAudit) {
    try {
      const parsed = JSON.parse(line);
      return parsed.ts || parsed.timestamp ? new Date(parsed.ts || parsed.timestamp) : null;
    } catch {
      return null;
    }
  }
  // Main log format: "YYYY-MM-DD HH:mm:ss:ms level: message"
  const match = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
  return match ? new Date(match[1]) : null;
}

export function listLogs(req: Request, res: Response) {
  const limit = Math.min(parseInt((req.query.limit as string) || '200', 10), 2000);
  const levelFilter = (req.query.level as string) || '';
  const search = (req.query.search as string) || '';
  const fromDate = req.query.from ? new Date(req.query.from as string) : null;
  const toDate = req.query.to ? new Date(req.query.to as string) : null;
  const file = req.query.type === 'audit' ? AUDIT_LOG : MAIN_LOG;
  const isAudit = req.query.type === 'audit';
  
  let lines = tailFile(file, limit);
  
  // Date range filter
  if (fromDate || toDate) {
    lines = lines.filter(l => {
      const ts = extractTimestamp(l, isAudit);
      if (!ts) return false;
      if (fromDate && ts < fromDate) return false;
      if (toDate && ts > toDate) return false;
      return true;
    });
  }
  
  // Level filter
  if (levelFilter) {
    lines = lines.filter(l => l.toLowerCase().includes(levelFilter.toLowerCase()));
  }
  
  // Search filter
  if (search) {
    lines = lines.filter(l => l.toLowerCase().includes(search.toLowerCase()));
  }
  
  // Parse audit logs as JSON
  const records = isAudit 
    ? lines.map(l => parseLogLine(l, true))
    : lines.map(l => ({ raw: l }));
  
  res.json({ 
    file: path.basename(file), 
    count: records.length, 
    records,
    filters: {
      from: fromDate?.toISOString(),
      to: toDate?.toISOString(),
      level: levelFilter,
      search,
    }
  });
}

export function downloadLog(req: Request, res: Response) {
  const file = req.query.type === 'audit' ? AUDIT_LOG : MAIN_LOG;
  if (!fs.existsSync(file)) {
    res.status(404).json({ message: 'log not found' });
    return;
  }
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename=${path.basename(file)}`);
  fs.createReadStream(file).pipe(res);
}
