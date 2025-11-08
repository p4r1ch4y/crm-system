import request from 'supertest';
import { app } from '../src/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Analytics API Tests', () => {
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

  describe('GET /api/v1/analytics/overview', () => {
    it('should get dashboard overview', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('leads');
      expect(response.body.data).toHaveProperty('tasks');
      expect(response.body.data).toHaveProperty('activities');
      expect(response.body.data).toHaveProperty('revenue');
    });

    it('should filter by date range', async () => {
      const startDate = new Date(Date.now() - 86400000 * 30).toISOString(); // 30 days ago
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get(`/api/v1/analytics/overview?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('leads');
    });

    it('should work for sales rep', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(response.status).toBe(200);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/v1/analytics/overview');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/analytics/conversion-funnel', () => {
    it('should get conversion funnel data (admin)', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/conversion-funnel')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('funnel');
      expect(Array.isArray(response.body.data.funnel)).toBe(true);
    });

    it('should fail for non-admin/manager', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/conversion-funnel')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(response.status).toBe(403);
    });

    it('should filter by date range', async () => {
      const startDate = new Date(Date.now() - 86400000 * 90).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get(`/api/v1/analytics/conversion-funnel?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/v1/analytics/sales-pipeline', () => {
    it('should get sales pipeline metrics (admin)', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/sales-pipeline')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('byStage');
      expect(response.body.data).toHaveProperty('bySource');
      expect(response.body.data).toHaveProperty('totalPipelineValue');
    });

    it('should fail for non-admin/manager', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/sales-pipeline')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(response.status).toBe(403);
    });
  });
});
