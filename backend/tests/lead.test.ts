import request from 'supertest';
import { app } from '../src/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Lead API Tests', () => {
  let authToken: string;
  let adminToken: string;
  let testLeadId: string;

  beforeAll(async () => {
    // Login as sales rep
    const salesResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'sales1@crm.com',
        password: 'Sales@123',
      });
    authToken = salesResponse.body.data.accessToken;

    // Login as admin
    const adminResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@crm.com',
        password: 'Admin@123',
      });
    adminToken = adminResponse.body.data.accessToken;
  });

  afterAll(async () => {
    // Cleanup test leads
    if (testLeadId) {
      await prisma.lead.deleteMany({
        where: {
          email: {
            contains: 'test-lead-',
          },
        },
      });
    }
    await prisma.$disconnect();
  });

  describe('POST /api/v1/leads', () => {
    it('should create a new lead', async () => {
      const response = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Lead',
          email: `test-lead-${Date.now()}@example.com`,
          phone: '+1234567890',
          company: 'Test Company',
          position: 'CTO',
          status: 'NEW',
          source: 'LINKEDIN',
          value: 50000,
          notes: 'Test notes',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Test Lead');
      expect(response.body.data.status).toBe('NEW');
      testLeadId = response.body.data.id;
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/leads')
        .send({
          name: 'Test Lead',
          email: 'test@example.com',
        });

      expect(response.status).toBe(401);
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Lead',
          email: 'invalid-email',
          status: 'NEW',
        });

      expect(response.status).toBe(400);
    });

    it('should fail with invalid status', async () => {
      const response = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Lead',
          email: 'test2@example.com',
          status: 'INVALID_STATUS',
        });

      expect(response.status).toBe(400);
    });

    it('should fail with duplicate email', async () => {
      const email = `duplicate-${Date.now()}@example.com`;
      
      // Create first lead
      await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'First Lead',
          email: email,
          status: 'NEW',
        });

      // Try to create duplicate
      const response = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Duplicate Lead',
          email: email,
          status: 'NEW',
        });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/v1/leads', () => {
    it('should get all leads with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/leads?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('leads');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.leads)).toBe(true);
    });

    it('should filter leads by status', async () => {
      const response = await request(app)
        .get('/api/v1/leads?status=NEW')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      response.body.data.leads.forEach((lead: any) => {
        expect(lead.status).toBe('NEW');
      });
    });

    it('should filter leads by source', async () => {
      const response = await request(app)
        .get('/api/v1/leads?source=LINKEDIN')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      response.body.data.leads.forEach((lead: any) => {
        expect(lead.source).toBe('LINKEDIN');
      });
    });

    it('should search leads', async () => {
      const response = await request(app)
        .get('/api/v1/leads?search=test')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.leads)).toBe(true);
    });
  });

  describe('GET /api/v1/leads/:id', () => {
    it('should get a specific lead', async () => {
      if (!testLeadId) {
        // Create a test lead first
        const createResponse = await request(app)
          .post('/api/v1/leads')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Get Test Lead',
            email: `get-test-${Date.now()}@example.com`,
            status: 'NEW',
          });
        testLeadId = createResponse.body.data.id;
      }

      const response = await request(app)
        .get(`/api/v1/leads/${testLeadId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(testLeadId);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('email');
    });

    it('should return 404 for non-existent lead', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/v1/leads/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/leads/:id', () => {
    it('should update a lead', async () => {
      if (!testLeadId) {
        const createResponse = await request(app)
          .post('/api/v1/leads')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Update Test Lead',
            email: `update-test-${Date.now()}@example.com`,
            status: 'NEW',
          });
        testLeadId = createResponse.body.data.id;
      }

      const response = await request(app)
        .put(`/api/v1/leads/${testLeadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Lead Name',
          status: 'CONTACTED',
          value: 75000,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe('Updated Lead Name');
      expect(response.body.data.status).toBe('CONTACTED');
      expect(response.body.data.value).toBe(75000);
    });

    it('should return 404 for non-existent lead', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .put(`/api/v1/leads/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/leads/:id', () => {
    it('should delete a lead (admin only)', async () => {
      // Create a lead to delete
      const createResponse = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Delete Test Lead',
          email: `delete-test-${Date.now()}@example.com`,
          status: 'NEW',
        });
      const leadToDelete = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/v1/leads/${leadToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should fail to delete as non-admin', async () => {
      // Create a lead
      const createResponse = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Delete Test Lead 2',
          email: `delete-test2-${Date.now()}@example.com`,
          status: 'NEW',
        });
      const leadToDelete = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/v1/leads/${leadToDelete}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });
});
