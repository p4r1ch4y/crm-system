import request from 'supertest';
import { app } from '../src/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Health & Logging API Tests', () => {
  let adminToken: string;
  let salesToken: string;

  beforeAll(async () => {
    // Login as admin
    const adminResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@crm.com',
        password: 'Admin@123',
      });
    adminToken = adminResponse.body.data.accessToken;

    // Login as sales rep
    const salesResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'sales1@crm.com',
        password: 'Sales@123',
      });
    salesToken = salesResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('database');
    });

    it('should include database status', async () => {
      const response = await request(app).get('/health');

      expect(response.body.database).toHaveProperty('status');
      expect(['connected', 'disconnected']).toContain(
        response.body.database.status
      );
    });
  });

  describe('GET /ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app).get('/ready');

      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('database');
    });

    it('should return 200 when database is connected', async () => {
      const response = await request(app).get('/ready');

      if (response.status === 200) {
        expect(response.body.status).toBe('ready');
        expect(response.body.database).toBe('connected');
      }
    });
  });

  describe('GET /api/v1/logs', () => {
    it('should get application logs (admin)', async () => {
      const response = await request(app)
        .get('/api/v1/logs?limit=50')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('file');
      expect(response.body.data).toHaveProperty('count');
      expect(response.body.data).toHaveProperty('records');
      expect(Array.isArray(response.body.data.records)).toBe(true);
    });

    it('should filter logs by level', async () => {
      const response = await request(app)
        .get('/api/v1/logs?level=error&limit=50')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      response.body.data.records.forEach((record: any) => {
        expect(record.level).toBe('error');
      });
    });

    it('should search logs', async () => {
      const response = await request(app)
        .get('/api/v1/logs?search=server&limit=50')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.records)).toBe(true);
    });

    it('should filter logs by date range', async () => {
      const from = new Date(Date.now() - 86400000).toISOString(); // 24 hours ago
      const to = new Date().toISOString();

      const response = await request(app)
        .get(`/api/v1/logs?from=${from}&to=${to}&limit=50`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it('should get audit logs', async () => {
      const response = await request(app)
        .get('/api/v1/logs?type=audit&limit=50')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.file).toBe('audit.log');
    });

    it('should fail for non-admin/manager', async () => {
      const response = await request(app)
        .get('/api/v1/logs')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(response.status).toBe(403);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/v1/logs');

      expect(response.status).toBe(401);
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/v1/logs?limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.records.length).toBeLessThanOrEqual(10);
    });

    it('should enforce maximum limit', async () => {
      const response = await request(app)
        .get('/api/v1/logs?limit=5000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      // Should cap at 2000
      expect(response.body.data.records.length).toBeLessThanOrEqual(2000);
    });
  });

  describe('GET /api/v1/logs/download', () => {
    it('should download main log file (admin)', async () => {
      const response = await request(app)
        .get('/api/v1/logs/download?type=main')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe(
        'text/plain; charset=utf-8'
      );
      expect(response.headers['content-disposition']).toContain('all.log');
    });

    it('should download audit log file (admin)', async () => {
      const response = await request(app)
        .get('/api/v1/logs/download?type=audit')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe(
        'text/plain; charset=utf-8'
      );
      expect(response.headers['content-disposition']).toContain('audit.log');
    });

    it('should fail for non-admin/manager', async () => {
      const response = await request(app)
        .get('/api/v1/logs/download')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(response.status).toBe(403);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/v1/logs/download');

      expect(response.status).toBe(401);
    });
  });
});
