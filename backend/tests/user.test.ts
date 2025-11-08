import request from 'supertest';
import { app } from '../src/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('User Management API Tests', () => {
  let adminToken: string;
  let managerToken: string;
  let salesToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Login as admin
    const adminResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@crm.com',
        password: 'Admin@123',
      });
    adminToken = adminResponse.body.data.accessToken;

    // Login as manager
    const managerResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'manager1@crm.com',
        password: 'Manager@123',
      });
    managerToken = managerResponse.body.data.accessToken;

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
    // Cleanup test users
    if (testUserId) {
      await prisma.user.deleteMany({
        where: {
          email: {
            contains: 'test-user-',
          },
        },
      });
    }
    await prisma.$disconnect();
  });

  describe('GET /api/v1/users', () => {
    it('should get all users with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/users?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('users');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    it('should filter users by role', async () => {
      const response = await request(app)
        .get('/api/v1/users?role=SALES_REP')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      response.body.data.users.forEach((user: any) => {
        expect(user.role).toBe('SALES_REP');
      });
    });

    it('should filter users by active status', async () => {
      const response = await request(app)
        .get('/api/v1/users?isActive=true')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      response.body.data.users.forEach((user: any) => {
        expect(user.isActive).toBe(true);
      });
    });

    it('should work for non-admin users', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(response.status).toBe(200);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/v1/users');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should get a specific user', async () => {
      // First get list of users to get a valid ID
      const listResponse = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      const userId = listResponse.body.data.users[0].id;

      const response = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('role');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    beforeAll(async () => {
      // Create a test user to update
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `test-user-${Date.now()}@example.com`,
          password: 'Test@123456',
          name: 'Test User',
          role: 'SALES_REP',
        });
      testUserId = registerResponse.body.data.user.id;
    });

    it('should update a user (admin only)', async () => {
      const response = await request(app)
        .put(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Test User',
          role: 'MANAGER',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe('Updated Test User');
      expect(response.body.data.role).toBe('MANAGER');
    });

    it('should fail for non-admin users', async () => {
      const response = await request(app)
        .put(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          name: 'Unauthorized Update',
        });

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .put(`/api/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Non-existent User',
        });

      expect(response.status).toBe(404);
    });

    it('should toggle user active status', async () => {
      const response = await request(app)
        .put(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isActive: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.isActive).toBe(false);

      // Toggle back to active
      const response2 = await request(app)
        .put(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isActive: true,
        });

      expect(response2.status).toBe(200);
      expect(response2.body.data.isActive).toBe(true);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should delete a user (admin only)', async () => {
      // Create a user to delete
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `delete-user-${Date.now()}@example.com`,
          password: 'Test@123456',
          name: 'Delete Test User',
          role: 'SALES_REP',
        });
      const userToDelete = registerResponse.body.data.user.id;

      const response = await request(app)
        .delete(`/api/v1/users/${userToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should fail for non-admin users', async () => {
      const response = await request(app)
        .delete(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${salesToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/api/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Notification Endpoints', () => {
    describe('GET /api/v1/notifications', () => {
      it('should get user notifications', async () => {
        const response = await request(app)
          .get('/api/v1/notifications')
          .set('Authorization', `Bearer ${salesToken}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data).toHaveProperty('notifications');
        expect(response.body.data).toHaveProperty('unreadCount');
        expect(Array.isArray(response.body.data.notifications)).toBe(true);
      });

      it('should filter by read status', async () => {
        const response = await request(app)
          .get('/api/v1/notifications?isRead=false')
          .set('Authorization', `Bearer ${salesToken}`);

        expect(response.status).toBe(200);
        response.body.data.notifications.forEach((notification: any) => {
          expect(notification.isRead).toBe(false);
        });
      });

      it('should fail without authentication', async () => {
        const response = await request(app).get('/api/v1/notifications');

        expect(response.status).toBe(401);
      });
    });

    describe('PUT /api/v1/notifications/read-all', () => {
      it('should mark all notifications as read', async () => {
        const response = await request(app)
          .put('/api/v1/notifications/read-all')
          .set('Authorization', `Bearer ${salesToken}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
      });
    });
  });
});
