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
// Helpers
// ---------------------------------------------------------------------------

function getServer(app: INestApplication): Server {
  return app.getHttpServer() as Server;
}

const testUser = {
  name: 'Test User',
  email: 'user-test@example.com',
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

describe('Users E2E', () => {
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
  // PATCH /users/me
  // -------------------------------------------------------------------------

  describe('PATCH /users/me', () => {
    it('should return 401 when no token is provided', async () => {
      await request(getServer(app))
        .patch('/users/me')
        .send({ name: 'New Name' })
        .expect(401);
    });

    it('should update the user name successfully', async () => {
      const { accessToken } = await registerAndVerify(app);

      const res = await request(getServer(app))
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(res.body).toMatchObject({
        name: 'Updated Name',
        email: testUser.email,
      });
    });

    it('should return 400 when name is empty', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: '' })
        .expect(400);
    });

    it('should return 400 when name exceeds 100 characters', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'a'.repeat(101) })
        .expect(400);
    });

    it('should return 400 when name is missing', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(400);
    });
  });

  // -------------------------------------------------------------------------
  // PATCH /users/me/change-password
  // -------------------------------------------------------------------------

  describe('PATCH /users/me/change-password', () => {
    it('should return 401 when no token is provided', async () => {
      await request(getServer(app))
        .patch('/users/me/change-password')
        .send({
          password: 'StrongPass@123',
          newPassword: 'NewStrongPass@456',
          confirmPassword: 'NewStrongPass@456',
        })
        .expect(401);
    });

    it('should change the password successfully', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .patch('/users/me/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          password: testUser.password,
          newPassword: 'NewStrongPass@456',
          confirmPassword: 'NewStrongPass@456',
        })
        .expect(204);
    });

    it('should return 4xx when current password is wrong', async () => {
      const { accessToken } = await registerAndVerify(app);

      const res = await request(getServer(app))
        .patch('/users/me/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          password: 'WrongPassword@123',
          newPassword: 'NewStrongPass@456',
          confirmPassword: 'NewStrongPass@456',
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it('should return 400 when confirmPassword does not match newPassword', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .patch('/users/me/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          password: testUser.password,
          newPassword: 'NewStrongPass@456',
          confirmPassword: 'DifferentPass@789',
        })
        .expect(400);
    });

    it('should return 400 when newPassword is not strong', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .patch('/users/me/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          password: testUser.password,
          newPassword: 'weak',
          confirmPassword: 'weak',
        })
        .expect(400);
    });

    it('should return 400 when any field is missing', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .patch('/users/me/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          password: testUser.password,
          newPassword: 'NewStrongPass@456',
          // missing confirmPassword
        })
        .expect(400);
    });

    it('should allow login with new password after change', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .patch('/users/me/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          password: testUser.password,
          newPassword: 'NewStrongPass@456',
          confirmPassword: 'NewStrongPass@456',
        })
        .expect(204);

      // Login with new password
      await request(getServer(app))
        .post('/auth/login')
        .send({ email: testUser.email, password: 'NewStrongPass@456' })
        .expect(200);
    });
  });

  // -------------------------------------------------------------------------
  // PATCH /users/me/avatar
  // -------------------------------------------------------------------------

  describe('PATCH /users/me/avatar (file upload)', () => {
    it('should return 401 when no token is provided', async () => {
      await request(getServer(app)).patch('/users/me/avatar').expect(401);
    });

    it('should return 400 when no file is provided', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .patch('/users/me/avatar')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });

  // -------------------------------------------------------------------------
  // DELETE /users/me/avatar
  // -------------------------------------------------------------------------

  describe('DELETE /users/me/avatar', () => {
    it('should return 401 when no token is provided', async () => {
      await request(getServer(app)).delete('/users/me/avatar').expect(401);
    });

    it('should return 2xx or 4xx when removing avatar (even if none set)', async () => {
      const { accessToken } = await registerAndVerify(app);

      // API may return 204 (idempotent delete) or 404 (no avatar set)
      const res = await request(getServer(app))
        .delete('/users/me/avatar')
        .set('Authorization', `Bearer ${accessToken}`);

      expect([204, 404]).toContain(res.status);
    });
  });

  // -------------------------------------------------------------------------
  // DELETE /users/me
  // -------------------------------------------------------------------------

  describe('DELETE /users/me', () => {
    it('should return 401 when no token is provided', async () => {
      await request(getServer(app)).delete('/users/me').expect(401);
    });

    it('should delete the user account and return 204', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .delete('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });

    it('should not allow login after account deletion', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .delete('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      await request(getServer(app))
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(401);
    });

    it('should not allow further requests after account deletion', async () => {
      const { accessToken } = await registerAndVerify(app);

      await request(getServer(app))
        .delete('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      // Using the old token should be rejected — API may return 401 (invalid token)
      // or 404 (user no longer exists), both are correct rejection behaviors
      const res = await request(getServer(app))
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Ghost' });

      expect([401, 404]).toContain(res.status);
    });
  });
});
