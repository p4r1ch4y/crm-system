import request from 'supertest';
import { app } from '../src/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Task API Tests', () => {
  let authToken: string;
  let adminToken: string;
  let testTaskId: string;
  let testLeadId: string;
  let userId: string;

  beforeAll(async () => {
    // Login as sales rep
    const salesResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'sales1@crm.com',
        password: 'Sales@123',
      });
    authToken = salesResponse.body.data.accessToken;
    userId = salesResponse.body.data.user.id;

    // Login as admin
    const adminResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@crm.com',
        password: 'Admin@123',
      });
    adminToken = adminResponse.body.data.accessToken;

    // Create a test lead for tasks
    const leadResponse = await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Task Test Lead',
        email: `task-lead-${Date.now()}@example.com`,
        status: 'NEW',
      });
    testLeadId = leadResponse.body.data.id;
  });

  afterAll(async () => {
    // Cleanup
    if (testLeadId) {
      await prisma.task.deleteMany({
        where: { leadId: testLeadId },
      });
      await prisma.lead.delete({
        where: { id: testLeadId },
      });
    }
    await prisma.$disconnect();
  });

  describe('POST /api/v1/tasks', () => {
    it('should create a new task', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Follow up with lead',
          description: 'Call to discuss proposal',
          status: 'PENDING',
          priority: 'HIGH',
          dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          leadId: testLeadId,
          assignedTo: userId,
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe('Follow up with lead');
      expect(response.body.data.status).toBe('PENDING');
      expect(response.body.data.priority).toBe('HIGH');
      testTaskId = response.body.data.id;
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .send({
          title: 'Test Task',
          status: 'PENDING',
        });

      expect(response.status).toBe(401);
    });

    it('should fail with invalid status', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          status: 'INVALID_STATUS',
          priority: 'HIGH',
        });

      expect(response.status).toBe(400);
    });

    it('should fail with invalid priority', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          status: 'PENDING',
          priority: 'INVALID_PRIORITY',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/tasks', () => {
    it('should get all tasks with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/tasks?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('tasks');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.tasks)).toBe(true);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/v1/tasks?status=PENDING')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      response.body.data.tasks.forEach((task: any) => {
        expect(task.status).toBe('PENDING');
      });
    });

    it('should filter tasks by priority', async () => {
      const response = await request(app)
        .get('/api/v1/tasks?priority=HIGH')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      response.body.data.tasks.forEach((task: any) => {
        expect(task.priority).toBe('HIGH');
      });
    });

    it('should filter tasks by lead', async () => {
      const response = await request(app)
        .get(`/api/v1/tasks?leadId=${testLeadId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      response.body.data.tasks.forEach((task: any) => {
        expect(task.leadId).toBe(testLeadId);
      });
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    it('should get a specific task', async () => {
      if (!testTaskId) {
        const createResponse = await request(app)
          .post('/api/v1/tasks')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Get Test Task',
            status: 'PENDING',
            priority: 'MEDIUM',
          });
        testTaskId = createResponse.body.data.id;
      }

      const response = await request(app)
        .get(`/api/v1/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(testTaskId);
      expect(response.body.data).toHaveProperty('title');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/v1/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/tasks/:id', () => {
    it('should update a task', async () => {
      if (!testTaskId) {
        const createResponse = await request(app)
          .post('/api/v1/tasks')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Update Test Task',
            status: 'PENDING',
            priority: 'MEDIUM',
          });
        testTaskId = createResponse.body.data.id;
      }

      const response = await request(app)
        .put(`/api/v1/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Task Title',
          status: 'IN_PROGRESS',
          priority: 'URGENT',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.title).toBe('Updated Task Title');
      expect(response.body.data.status).toBe('IN_PROGRESS');
      expect(response.body.data.priority).toBe('URGENT');
    });

    it('should set completedAt when status is COMPLETED', async () => {
      const response = await request(app)
        .put(`/api/v1/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'COMPLETED',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('COMPLETED');
      expect(response.body.data.completedAt).toBeTruthy();
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    it('should delete a task', async () => {
      // Create a task to delete
      const createResponse = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Delete Test Task',
          status: 'PENDING',
          priority: 'LOW',
          leadId: testLeadId,
        });
      const taskToDelete = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/v1/tasks/${taskToDelete}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/api/v1/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
