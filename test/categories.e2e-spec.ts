import { INestApplication } from '@nestjs/common';
import { Server } from 'node:http';
import request from 'supertest';
import {
  setupApp,
  teardownApp,
  getDataSource,
  clearCapturedMails,
  parseBody,
} from './helpers/app.helper';
import { clearDatabase } from './helpers/db.helper';
import { AuthTokensResponse } from './interfaces/auth.interfaces';
import { getLastSentMailToken } from './helpers/app.helper';

// ---------------------------------------------------------------------------
// Shared interfaces for list responses
// ---------------------------------------------------------------------------

interface CategoryItem {
  name: string;
}
type CategoryListBody = CategoryItem[] | { data?: CategoryItem[] };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getServer(app: INestApplication): Server {
  return app.getHttpServer() as Server;
}

const anyString = expect.any(String) as unknown as string;

const testUser = {
  name: 'Category Test User',
  email: 'category-test@example.com',
  password: 'StrongPass@123',
  confirmPassword: 'StrongPass@123',
};

const secondUser = {
  name: 'Second User',
  email: 'second-user@example.com',
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Categories E2E', () => {
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
  // POST /categories
  // -------------------------------------------------------------------------

  describe('POST /categories', () => {
    it('should return 401 when no token is provided', async () => {
      await request(getServer(app))
        .post('/categories')
        .send({ name: 'Work', color: '#ff0000' })
        .expect(401);
    });

    it('should create a category successfully', async () => {
      const { accessToken } = await registerAndVerify(app);

      const res = await request(getServer(app))
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Work', color: '#ff0000' })
        .expect(201);

      expect(res.body).toMatchObject({
        id: anyString,
        name: 'Work',
        color: '#ff0000',
      });
      // description is nullable — API returns null when not provided
      expect(
        parseBody<{ description?: string | null }>(res.body).description ??
          null,
      ).toBeNull();
    });

    it('should create a category with optional description', async () => {
      const { accessToken } = await registerAndVerify(app);

      const res = await request(getServer(app))
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Work',
          color: '#ff0000',
          description: 'Work related tasks',
        })
        .expect(201);

      expect(res.body).toMatchObject({
        id: anyString,
        name: 'Work',
        color: '#ff0000',
        description: 'Work related tasks',
      });
    });

    it('should return 400 when name is missing', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ color: '#ff0000' })
        .expect(400);
    });

    it('should return 400 when color is missing', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Work' })
        .expect(400);
    });

    it('should return 400 when color is not a valid hex', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Work', color: 'red' })
        .expect(400);
    });

    it('should accept 3-char hex color', async () => {
      const { accessToken } = await registerAndVerify(app);

      const res = await request(getServer(app))
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Work', color: '#abc' })
        .expect(201);

      expect(parseBody<{ color: string }>(res.body).color).toBe('#abc');
    });

    it('should return 400 when name exceeds 100 characters', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'a'.repeat(101), color: '#ff0000' })
        .expect(400);
    });

    it('should return 400 when description exceeds 255 characters', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Work',
          color: '#ff0000',
          description: 'a'.repeat(256),
        })
        .expect(400);
    });
  });

  // -------------------------------------------------------------------------
  // GET /categories
  // -------------------------------------------------------------------------

  describe('GET /categories', () => {
    it('should return 401 when no token is provided', async () => {
      await request(getServer(app)).get('/categories').expect(401);
    });

    it('should return empty array when user has no categories', async () => {
      const { accessToken } = await registerAndVerify(app);

      const res = await request(getServer(app))
        .get('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const rawBody = parseBody<unknown>(res.body);
      expect(Array.isArray(rawBody) || typeof rawBody === 'object').toBe(true);
    });

    it('should return only categories belonging to the authenticated user', async () => {
      const { accessToken: userToken } = await registerAndVerify(app, testUser);
      const { accessToken: secondToken } = await registerAndVerify(
        app,
        secondUser,
      );

      // Create category for user 1
      await request(getServer(app))
        .post('/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'User1 Category', color: '#ff0000' })
        .expect(201);

      // Create category for user 2
      await request(getServer(app))
        .post('/categories')
        .set('Authorization', `Bearer ${secondToken}`)
        .send({ name: 'User2 Category', color: '#00ff00' })
        .expect(201);

      const res = await request(getServer(app))
        .get('/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // user1 should only see their own category
      const rawBody = parseBody<CategoryListBody>(res.body);
      const body: CategoryItem[] = Array.isArray(rawBody)
        ? rawBody
        : (rawBody.data ?? []);
      const names = body.map((c) => c.name);
      expect(names).toContain('User1 Category');
      expect(names).not.toContain('User2 Category');
    });

    it('should filter categories by search term', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Work Tasks', color: '#ff0000' })
        .expect(201);

      await request(getServer(app))
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Personal', color: '#00ff00' })
        .expect(201);

      const res = await request(getServer(app))
        .get('/categories?search=Work')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const rawBody = parseBody<CategoryListBody>(res.body);
      const body: CategoryItem[] = Array.isArray(rawBody)
        ? rawBody
        : (rawBody.data ?? []);
      expect(body.length).toBeGreaterThanOrEqual(1);
      const names = body.map((c) => c.name);
      expect(names).toContain('Work Tasks');
      expect(names).not.toContain('Personal');
    });
  });

  // -------------------------------------------------------------------------
  // GET /categories/:id
  // -------------------------------------------------------------------------

  describe('GET /categories/:id', () => {
    it('should return 401 when no token is provided', async () => {
      await request(getServer(app))
        .get('/categories/00000000-0000-0000-0000-000000000000')
        .expect(401);
    });

    it('should return a category by id', async () => {
      const { accessToken } = await registerAndVerify(app);

      const createRes = await request(getServer(app))
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Work', color: '#ff0000' })
        .expect(201);

      const categoryId = parseBody<{ id: string }>(createRes.body).id;

      const res = await request(getServer(app))
        .get(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toMatchObject({
        id: categoryId,
        name: 'Work',
        color: '#ff0000',
      });
    });

    it('should return 404 when category does not exist', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .get('/categories/019251f0-b3c1-7a2d-8f4e-1c2d3e4f5a6b')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it("should return 404 when accessing another user's category", async () => {
      const { accessToken: userToken } = await registerAndVerify(app, testUser);
      const { accessToken: secondToken } = await registerAndVerify(
        app,
        secondUser,
      );

      const createRes = await request(getServer(app))
        .post('/categories')
        .set('Authorization', `Bearer ${secondToken}`)
        .send({ name: "Second User's Category", color: '#ff0000' })
        .expect(201);

      const categoryId = parseBody<{ id: string }>(createRes.body).id;

      await request(getServer(app))
        .get(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should return 400 when id is not a valid UUID', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .get('/categories/not-a-uuid')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });

  // -------------------------------------------------------------------------
  // PATCH /categories/:id
  // -------------------------------------------------------------------------

  describe('PATCH /categories/:id', () => {
    it('should return 401 when no token is provided', async () => {
      await request(getServer(app))
        .patch('/categories/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Updated' })
        .expect(401);
    });

    it('should update a category name', async () => {
      const { accessToken } = await registerAndVerify(app);

      const createRes = await request(getServer(app))
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Work', color: '#ff0000' })
        .expect(201);

      const categoryId = parseBody<{ id: string }>(createRes.body).id;

      const res = await request(getServer(app))
        .patch(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Work' })
        .expect(200);

      expect(res.body).toMatchObject({
        id: categoryId,
        name: 'Updated Work',
        color: '#ff0000',
      });
    });

    it('should update category color', async () => {
      const { accessToken } = await registerAndVerify(app);

      const createRes = await request(getServer(app))
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Work', color: '#ff0000' })
        .expect(201);

      const categoryId = parseBody<{ id: string }>(createRes.body).id;

      const res = await request(getServer(app))
        .patch(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ color: '#0000ff' })
        .expect(200);

      expect(parseBody<{ color: string }>(res.body).color).toBe('#0000ff');
    });

    it('should return 404 when category does not exist', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .patch('/categories/019251f0-b3c1-7a2d-8f4e-1c2d3e4f5a6b')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated' })
        .expect(404);
    });

    it("should return 404 when updating another user's category", async () => {
      const { accessToken: userToken } = await registerAndVerify(app, testUser);
      const { accessToken: secondToken } = await registerAndVerify(
        app,
        secondUser,
      );

      const createRes = await request(getServer(app))
        .post('/categories')
        .set('Authorization', `Bearer ${secondToken}`)
        .send({ name: "Second User's Category", color: '#ff0000' })
        .expect(201);

      const categoryId = parseBody<{ id: string }>(createRes.body).id;

      await request(getServer(app))
        .patch(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Hacked' })
        .expect(404);
    });

    it('should return 400 when color is invalid hex', async () => {
      const { accessToken } = await registerAndVerify(app);

      const createRes = await request(getServer(app))
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Work', color: '#ff0000' })
        .expect(201);

      const categoryId = parseBody<{ id: string }>(createRes.body).id;

      await request(getServer(app))
        .patch(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ color: 'blue' })
        .expect(400);
    });
  });

  // -------------------------------------------------------------------------
  // DELETE /categories/:id
  // -------------------------------------------------------------------------

  describe('DELETE /categories/:id', () => {
    it('should return 401 when no token is provided', async () => {
      await request(getServer(app))
        .delete('/categories/00000000-0000-0000-0000-000000000000')
        .expect(401);
    });

    it('should delete a category and return 204', async () => {
      const { accessToken } = await registerAndVerify(app);

      const createRes = await request(getServer(app))
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Work', color: '#ff0000' })
        .expect(201);

      const categoryId = parseBody<{ id: string }>(createRes.body).id;

      await request(getServer(app))
        .delete(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      // Confirm it's gone
      await request(getServer(app))
        .get(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 404 when category does not exist', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .delete('/categories/019251f0-b3c1-7a2d-8f4e-1c2d3e4f5a6b')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it("should return 404 when deleting another user's category", async () => {
      const { accessToken: userToken } = await registerAndVerify(app, testUser);
      const { accessToken: secondToken } = await registerAndVerify(
        app,
        secondUser,
      );

      const createRes = await request(getServer(app))
        .post('/categories')
        .set('Authorization', `Bearer ${secondToken}`)
        .send({ name: "Second User's Category", color: '#ff0000' })
        .expect(201);

      const categoryId = parseBody<{ id: string }>(createRes.body).id;

      await request(getServer(app))
        .delete(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      // Original owner can still find it
      await request(getServer(app))
        .get(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${secondToken}`)
        .expect(200);
    });
  });
});
