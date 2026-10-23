import { INestApplication } from '@nestjs/common';
import { Server } from 'node:http';
import request from 'supertest';
import {
  setupApp,
  teardownApp,
  getDataSource,
  clearCapturedMails,
  getLastSentMailToken,
  parseBody,
} from './helpers/app.helper';
import { clearDatabase } from './helpers/db.helper';
import { AuthTokensResponse } from './interfaces/auth.interfaces';

// ---------------------------------------------------------------------------
// Shared interfaces for list responses
// ---------------------------------------------------------------------------

interface TaskItem {
  name: string;
}
type TaskListBody = TaskItem[] | { data?: TaskItem[] };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getServer(app: INestApplication): Server {
  return app.getHttpServer() as Server;
}

const anyString = expect.any(String) as unknown as string;

const testUser = {
  name: 'Task Test User',
  email: 'task-test@example.com',
  password: 'StrongPass@123',
  confirmPassword: 'StrongPass@123',
};

const secondUser = {
  name: 'Second Task User',
  email: 'second-task@example.com',
  password: 'StrongPass@123',
  confirmPassword: 'StrongPass@123',
};

async function registerAndVerify(
  app: INestApplication,
  user = testUser,
): Promise<{ accessToken: string; refreshToken: string }> {
  const registerRes = await request(getServer(app))
    .post('/auth/register')
    .send(user)
    .expect(201);

  const tokens = parseBody<AuthTokensResponse>(registerRes.body);

  const emailToken = getLastSentMailToken(user.email, 'EMAIL_CONFIRMATION');
  await request(getServer(app))
    .post('/auth/verify-email')
    .send({ token: emailToken })
    .expect(204);

  return {
    accessToken: tokens.accessToken.token,
    refreshToken: tokens.refreshToken.token,
  };
}

/** Creates a category and returns its id */
async function createCategory(
  app: INestApplication,
  accessToken: string,
  overrides?: Partial<{ name: string; color: string }>,
): Promise<string> {
  const res = await request(getServer(app))
    .post('/categories')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      name: overrides?.name ?? 'Test Category',
      color: overrides?.color ?? '#ff0000',
    })
    .expect(201);
  return parseBody<{ id: string }>(res.body).id;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Tasks E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupApp();
  });

  afterAll(async () => {
    await teardownApp();
  });

  beforeEach(async () => {
    await clearDatabase(getDataSource());
    clearCapturedMails();
  });

  // -------------------------------------------------------------------------
  // POST /tasks
  // -------------------------------------------------------------------------

  describe('POST /tasks', () => {
    it('should return 401 when no token is provided', async () => {
      await request(getServer(app))
        .post('/tasks')
        .send({ name: 'Task', categoryIds: [] })
        .expect(401);
    });

    it('should create a task successfully', async () => {
      const { accessToken } = await registerAndVerify(app);
      const categoryId = await createCategory(app, accessToken);

      const res = await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Fix login bug', categoryIds: [categoryId] })
        .expect(201);

      expect(res.body).toMatchObject({
        id: anyString,
        name: 'Fix login bug',
        status: 'todo',
        priority: 1,
      });
    });

    it('should create a task with all optional fields', async () => {
      const { accessToken } = await registerAndVerify(app);
      const categoryId = await createCategory(app, accessToken);

      const futureDate = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const res = await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Detailed Task',
          description: 'A task with all fields',
          priority: 3,
          categoryIds: [categoryId],
          dueDate: futureDate,
        })
        .expect(201);

      expect(res.body).toMatchObject({
        id: anyString,
        name: 'Detailed Task',
        description: 'A task with all fields',
        priority: 3,
        status: 'todo',
      });
    });

    it('should return 400 when name is missing', async () => {
      const { accessToken } = await registerAndVerify(app);
      const categoryId = await createCategory(app, accessToken);

      await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ categoryIds: [categoryId] })
        .expect(400);
    });

    it('should return 400 when categoryIds is missing', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Task without categories' })
        .expect(400);
    });

    it('should return 400 when categoryIds is empty', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Task', categoryIds: [] })
        .expect(400);
    });

    it('should return 400 when categoryIds contains invalid UUIDs', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Task', categoryIds: ['not-a-uuid'] })
        .expect(400);
    });

    it('should return 400 when priority is invalid', async () => {
      const { accessToken } = await registerAndVerify(app);
      const categoryId = await createCategory(app, accessToken);

      await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Task', categoryIds: [categoryId], priority: 99 })
        .expect(400);
    });

    it('should return 400 when dueDate is in the past', async () => {
      const { accessToken } = await registerAndVerify(app);
      const categoryId = await createCategory(app, accessToken);

      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Task', categoryIds: [categoryId], dueDate: pastDate })
        .expect(400);
    });
  });

  // -------------------------------------------------------------------------
  // GET /tasks
  // -------------------------------------------------------------------------

  describe('GET /tasks', () => {
    it('should return 401 when no token is provided', async () => {
      await request(getServer(app)).get('/tasks').expect(401);
    });

    it('should return tasks for authenticated user', async () => {
      const { accessToken } = await registerAndVerify(app);
      const categoryId = await createCategory(app, accessToken);

      await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'My Task', categoryIds: [categoryId] })
        .expect(201);

      const res = await request(getServer(app))
        .get('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      type SimpleListBody = unknown[] | { data?: unknown[] };
      const rawBody = parseBody<SimpleListBody>(res.body);
      const body: unknown[] = Array.isArray(rawBody)
        ? rawBody
        : (rawBody.data ?? []);
      expect(body.length).toBeGreaterThanOrEqual(1);
    });

    it('should return only tasks belonging to the authenticated user', async () => {
      const { accessToken: userToken } = await registerAndVerify(app, testUser);
      const { accessToken: secondToken } = await registerAndVerify(
        app,
        secondUser,
      );

      const userCategoryId = await createCategory(app, userToken, {
        name: 'UserCat',
      });
      const secondCategoryId = await createCategory(app, secondToken, {
        name: 'SecondCat',
      });

      await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'User1 Task', categoryIds: [userCategoryId] })
        .expect(201);

      await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${secondToken}`)
        .send({ name: 'User2 Task', categoryIds: [secondCategoryId] })
        .expect(201);

      const res = await request(getServer(app))
        .get('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const rawBody = parseBody<TaskListBody>(res.body);
      const body: TaskItem[] = Array.isArray(rawBody)
        ? rawBody
        : (rawBody.data ?? []);
      const names = body.map((t) => t.name);
      expect(names).toContain('User1 Task');
      expect(names).not.toContain('User2 Task');
    });
  });

  // -------------------------------------------------------------------------
  // GET /tasks/:id
  // -------------------------------------------------------------------------

  describe('GET /tasks/:id', () => {
    it('should return 401 when no token is provided', async () => {
      await request(getServer(app))
        .get('/tasks/00000000-0000-0000-0000-000000000000')
        .expect(401);
    });

    it('should return a task by id', async () => {
      const { accessToken } = await registerAndVerify(app);
      const categoryId = await createCategory(app, accessToken);

      const createRes = await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'My Task', categoryIds: [categoryId] })
        .expect(201);

      const taskId = parseBody<{ id: string }>(createRes.body).id;

      const res = await request(getServer(app))
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toMatchObject({
        id: taskId,
        name: 'My Task',
      });
    });

    it('should return 404 when task does not exist', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .get('/tasks/019251f0-b3c1-7a2d-8f4e-1c2d3e4f5a6b')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it("should return 404 when accessing another user's task", async () => {
      const { accessToken: userToken } = await registerAndVerify(app, testUser);
      const { accessToken: secondToken } = await registerAndVerify(
        app,
        secondUser,
      );

      const categoryId = await createCategory(app, secondToken);

      const createRes = await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${secondToken}`)
        .send({ name: "Second User's Task", categoryIds: [categoryId] })
        .expect(201);

      const taskId = parseBody<{ id: string }>(createRes.body).id;

      await request(getServer(app))
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should return 400 when id is not a valid UUID', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .get('/tasks/not-a-uuid')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });

  // -------------------------------------------------------------------------
  // PATCH /tasks/:id
  // -------------------------------------------------------------------------

  describe('PATCH /tasks/:id', () => {
    it('should return 401 when no token is provided', async () => {
      await request(getServer(app))
        .patch('/tasks/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Updated' })
        .expect(401);
    });

    it('should update a task name', async () => {
      const { accessToken } = await registerAndVerify(app);
      const categoryId = await createCategory(app, accessToken);

      const createRes = await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Original Name', categoryIds: [categoryId] })
        .expect(201);

      const taskId = parseBody<{ id: string }>(createRes.body).id;

      const res = await request(getServer(app))
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(res.body).toMatchObject({
        id: taskId,
        name: 'Updated Name',
      });
    });

    it('should update task description', async () => {
      const { accessToken } = await registerAndVerify(app);
      const categoryId = await createCategory(app, accessToken);

      const createRes = await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Task', categoryIds: [categoryId] })
        .expect(201);

      const taskId = parseBody<{ id: string }>(createRes.body).id;

      const res = await request(getServer(app))
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ description: 'New description' })
        .expect(200);

      expect(parseBody<{ description: string }>(res.body).description).toBe(
        'New description',
      );
    });

    it('should update task priority', async () => {
      const { accessToken } = await registerAndVerify(app);
      const categoryId = await createCategory(app, accessToken);

      const createRes = await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Task', categoryIds: [categoryId] })
        .expect(201);

      const taskId = parseBody<{ id: string }>(createRes.body).id;

      const res = await request(getServer(app))
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ priority: 4 })
        .expect(200);

      expect(parseBody<{ priority: number }>(res.body).priority).toBe(4);
    });

    it('should return 404 when task does not exist', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .patch('/tasks/019251f0-b3c1-7a2d-8f4e-1c2d3e4f5a6b')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated' })
        .expect(404);
    });

    it("should return 404 when updating another user's task", async () => {
      const { accessToken: userToken } = await registerAndVerify(app, testUser);
      const { accessToken: secondToken } = await registerAndVerify(
        app,
        secondUser,
      );

      const categoryId = await createCategory(app, secondToken);
      const createRes = await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${secondToken}`)
        .send({ name: "Second User's Task", categoryIds: [categoryId] })
        .expect(201);

      const taskId = parseBody<{ id: string }>(createRes.body).id;

      await request(getServer(app))
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Hacked' })
        .expect(404);
    });
  });

  // -------------------------------------------------------------------------
  // PATCH /tasks/:id/status
  // -------------------------------------------------------------------------

  describe('PATCH /tasks/:id/status', () => {
    it('should return 401 when no token is provided', async () => {
      await request(getServer(app))
        .patch('/tasks/00000000-0000-0000-0000-000000000000/status')
        .send({ status: 'done' })
        .expect(401);
    });

    it('should update task status to in_progress', async () => {
      const { accessToken } = await registerAndVerify(app);
      const categoryId = await createCategory(app, accessToken);

      const createRes = await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Task', categoryIds: [categoryId] })
        .expect(201);

      const taskId = parseBody<{ id: string }>(createRes.body).id;

      const res = await request(getServer(app))
        .patch(`/tasks/${taskId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'in_progress' })
        .expect(200);

      expect(parseBody<{ status: string }>(res.body).status).toBe(
        'in_progress',
      );
    });

    it('should update task status to done', async () => {
      const { accessToken } = await registerAndVerify(app);
      const categoryId = await createCategory(app, accessToken);

      const createRes = await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Task', categoryIds: [categoryId] })
        .expect(201);

      const taskId = parseBody<{ id: string }>(createRes.body).id;

      // Transition: todo → in_progress (required before → done)
      await request(getServer(app))
        .patch(`/tasks/${taskId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'in_progress' })
        .expect(200);

      const res = await request(getServer(app))
        .patch(`/tasks/${taskId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'done' })
        .expect(200);

      expect(parseBody<{ status: string }>(res.body).status).toBe('done');
    });

    it('should return 400 when status is invalid', async () => {
      const { accessToken } = await registerAndVerify(app);
      const categoryId = await createCategory(app, accessToken);

      const createRes = await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Task', categoryIds: [categoryId] })
        .expect(201);

      const taskId = parseBody<{ id: string }>(createRes.body).id;

      await request(getServer(app))
        .patch(`/tasks/${taskId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'invalid_status' })
        .expect(400);
    });

    it('should return 404 when task does not exist', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .patch('/tasks/019251f0-b3c1-7a2d-8f4e-1c2d3e4f5a6b/status')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'done' })
        .expect(404);
    });
  });

  // -------------------------------------------------------------------------
  // PATCH /tasks/:id/categories
  // -------------------------------------------------------------------------

  describe('PATCH /tasks/:id/categories', () => {
    it('should return 401 when no token is provided', async () => {
      await request(getServer(app))
        .patch('/tasks/00000000-0000-0000-0000-000000000000/categories')
        .send({ categoryIds: [] })
        .expect(401);
    });

    it('should update task categories', async () => {
      const { accessToken } = await registerAndVerify(app);
      const categoryId1 = await createCategory(app, accessToken, {
        name: 'Cat1',
        color: '#ff0000',
      });
      const categoryId2 = await createCategory(app, accessToken, {
        name: 'Cat2',
        color: '#00ff00',
      });

      const createRes = await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Task', categoryIds: [categoryId1] })
        .expect(201);

      const taskId = parseBody<{ id: string }>(createRes.body).id;

      const res = await request(getServer(app))
        .patch(`/tasks/${taskId}/categories`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ categoryIds: [categoryId2] })
        .expect(200);

      expect(res.body).toBeDefined();
    });

    it('should return 400 when categoryIds is empty', async () => {
      const { accessToken } = await registerAndVerify(app);
      const categoryId = await createCategory(app, accessToken);

      const createRes = await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Task', categoryIds: [categoryId] })
        .expect(201);

      const taskId = parseBody<{ id: string }>(createRes.body).id;

      await request(getServer(app))
        .patch(`/tasks/${taskId}/categories`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ categoryIds: [] })
        .expect(400);
    });

    it('should return 404 when task does not exist', async () => {
      const { accessToken } = await registerAndVerify(app);
      const categoryId = await createCategory(app, accessToken);

      await request(getServer(app))
        .patch('/tasks/019251f0-b3c1-7a2d-8f4e-1c2d3e4f5a6b/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ categoryIds: [categoryId] })
        .expect(404);
    });
  });

  // -------------------------------------------------------------------------
  // DELETE /tasks/:id
  // -------------------------------------------------------------------------

  describe('DELETE /tasks/:id', () => {
    it('should return 401 when no token is provided', async () => {
      await request(getServer(app))
        .delete('/tasks/00000000-0000-0000-0000-000000000000')
        .expect(401);
    });

    it('should delete a task and return 204', async () => {
      const { accessToken } = await registerAndVerify(app);
      const categoryId = await createCategory(app, accessToken);

      const createRes = await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Task to Delete', categoryIds: [categoryId] })
        .expect(201);

      const taskId = parseBody<{ id: string }>(createRes.body).id;

      await request(getServer(app))
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      // Confirm it's gone
      await request(getServer(app))
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 404 when task does not exist', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .delete('/tasks/019251f0-b3c1-7a2d-8f4e-1c2d3e4f5a6b')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it("should return 404 when deleting another user's task", async () => {
      const { accessToken: userToken } = await registerAndVerify(app, testUser);
      const { accessToken: secondToken } = await registerAndVerify(
        app,
        secondUser,
      );

      const categoryId = await createCategory(app, secondToken);
      const createRes = await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${secondToken}`)
        .send({ name: "Second User's Task", categoryIds: [categoryId] })
        .expect(201);

      const taskId = parseBody<{ id: string }>(createRes.body).id;

      await request(getServer(app))
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      // Original owner can still find it
      await request(getServer(app))
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${secondToken}`)
        .expect(200);
    });
  });

  // -------------------------------------------------------------------------
  // DELETE /tasks/:id/:categoryId/category
  // -------------------------------------------------------------------------

  describe('DELETE /tasks/:id/:categoryId/category', () => {
    it('should return 401 when no token is provided', async () => {
      await request(getServer(app))
        .delete(
          '/tasks/00000000-0000-0000-0000-000000000000/00000000-0000-0000-0000-000000000001/category',
        )
        .expect(401);
    });

    it('should remove a category from a task', async () => {
      const { accessToken } = await registerAndVerify(app);
      const categoryId1 = await createCategory(app, accessToken, {
        name: 'Cat1',
        color: '#ff0000',
      });
      const categoryId2 = await createCategory(app, accessToken, {
        name: 'Cat2',
        color: '#00ff00',
      });

      const createRes = await request(getServer(app))
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Task', categoryIds: [categoryId1, categoryId2] })
        .expect(201);

      const taskId = parseBody<{ id: string }>(createRes.body).id;

      await request(getServer(app))
        .delete(`/tasks/${taskId}/${categoryId1}/category`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });

    it('should return 400 when task or category is not found', async () => {
      const { accessToken } = await registerAndVerify(app);

      // The service uses innerJoin on task.categories — if task doesn't exist
      // OR the category isn't linked, it returns BAD_REQUEST (not NOT_FOUND)
      await request(getServer(app))
        .delete(
          '/tasks/019251f0-b3c1-7a2d-8f4e-1c2d3e4f5a6b/019251f0-b3c1-7a2d-8f4e-1c2d3e4f5a6c/category',
        )
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('should return 400 when task id is not a valid UUID', async () => {
      const { accessToken } = await registerAndVerify(app);
      const categoryId = await createCategory(app, accessToken);

      await request(getServer(app))
        .delete(`/tasks/not-a-uuid/${categoryId}/category`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });
});
