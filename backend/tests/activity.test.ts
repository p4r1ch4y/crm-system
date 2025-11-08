import request from 'supertest';
import { app } from '../src/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Activity API Tests', () => {
  let authToken: string;
  let testLeadId: string;
  let testActivityId: string;

  beforeAll(async () => {
    // Login
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'sales1@crm.com',
        password: 'Sales@123',
      });
    authToken = loginResponse.body.data.accessToken;

    // Create a test lead
    const leadResponse = await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Activity Test Lead',
        email: `activity-lead-${Date.now()}@example.com`,
        status: 'NEW',
      });
    testLeadId = leadResponse.body.data.id;
  });

  afterAll(async () => {
    // Cleanup
    if (testLeadId) {
      await prisma.activity.deleteMany({
        where: { leadId: testLeadId },
      });
      await prisma.lead.delete({
        where: { id: testLeadId },
      });
    }
    await prisma.$disconnect();
  });

  describe('POST /api/v1/activities', () => {
    it('should create a new activity', async () => {
      const response = await request(app)
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'CALL',
          description: 'Discussed pricing options',
          leadId: testLeadId,
          metadata: {
            duration: '15 minutes',
            outcome: 'positive',
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.type).toBe('CALL');
      expect(response.body.data.description).toBe('Discussed pricing options');
      testActivityId = response.body.data.id;
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/activities')
        .send({
          type: 'NOTE',
          description: 'Test note',
          leadId: testLeadId,
        });

      expect(response.status).toBe(401);
    });

    it('should fail with invalid activity type', async () => {
      const response = await request(app)
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'INVALID_TYPE',
          description: 'Test description',
          leadId: testLeadId,
        });

      expect(response.status).toBe(400);
    });

    it('should fail without description', async () => {
      const response = await request(app)
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'NOTE',
          leadId: testLeadId,
        });

      expect(response.status).toBe(400);
    });

    it('should fail with non-existent lead', async () => {
      const fakeLeadId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'NOTE',
          description: 'Test note',
          leadId: fakeLeadId,
        });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/v1/activities', () => {
    it('should get all activities with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/activities?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('activities');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.activities)).toBe(true);
    });

    it('should filter activities by type', async () => {
      const response = await request(app)
        .get('/api/v1/activities?type=CALL')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      response.body.data.activities.forEach((activity: any) => {
        expect(activity.type).toBe('CALL');
      });
    });

    it('should filter activities by lead', async () => {
      const response = await request(app)
        .get(`/api/v1/activities?leadId=${testLeadId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      response.body.data.activities.forEach((activity: any) => {
        expect(activity.leadId).toBe(testLeadId);
      });
    });

    it('should filter activities by date range', async () => {
      const from = new Date(Date.now() - 86400000 * 7).toISOString(); // 7 days ago
      const to = new Date().toISOString(); // Now

      const response = await request(app)
        .get(`/api/v1/activities?from=${from}&to=${to}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.activities)).toBe(true);
    });
  });

  describe('DELETE /api/v1/activities/:id', () => {
    it('should delete an activity', async () => {
      // Create an activity to delete
      const createResponse = await request(app)
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'NOTE',
          description: 'Delete test note',
          leadId: testLeadId,
        });
      const activityToDelete = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/v1/activities/${activityToDelete}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should return 404 for non-existent activity', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/api/v1/activities/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
