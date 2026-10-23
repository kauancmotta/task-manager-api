import { INestApplication } from '@nestjs/common';
import { Server } from 'node:http';
import request from 'supertest';
import {
  setupApp,
  teardownApp,
  getDataSource,
  getLastSentMailToken,
  clearCapturedMails,
} from './helpers/app.helper';
import { clearDatabase } from './helpers/db.helper';
import { AuthTokensResponse, UserResponse } from './interfaces/auth.interfaces';

// ---------------------------------------------------------------------------
// Typed matchers
// ---------------------------------------------------------------------------

const anyString = expect.any(String) as unknown as string;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getServer(app: INestApplication): Server {
  return app.getHttpServer() as Server;
}

const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'StrongPass@123',
  confirmPassword: 'StrongPass@123',
};

/**
 * Returns the most-recently sent plaintext token for the given email address.
 *
 * The application hashes tokens before persisting them, so we capture the
 * plaintext value from the mail payload instead of querying the DB.
 */
function getEmailVerificationToken(email: string): string {
  return getLastSentMailToken(email, 'EMAIL_CONFIRMATION');
}

function getPasswordResetOtp(email: string): string {
  return getLastSentMailToken(email, 'PASSWORD_RESET');
}

async function registerAndVerify(
  app: INestApplication,
  user = testUser,
): Promise<{ accessToken: string; refreshToken: string }> {
  const registerRes = await request(getServer(app))
    .post('/auth/register')
    .send(user)
    .expect(201);

  const tokens = registerRes.body as AuthTokensResponse;

  const emailToken = getEmailVerificationToken(user.email);
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

describe('Auth E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupApp();
  });

  afterAll(async () => {
    await teardownApp();
  });

  beforeEach(async () => {
    clearCapturedMails();
    await clearDatabase(getDataSource());
  });

  // ---------------------------------------------------------------------------
  // POST /auth/register
  // ---------------------------------------------------------------------------
  describe('POST /auth/register', () => {
    it('should register a new user and return access + refresh tokens (201)', async () => {
      const res = await request(getServer(app))
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      const body = res.body as AuthTokensResponse;

      expect(body.accessToken).toMatchObject({
        token: anyString,
        expiresAt: anyString,
        tokenType: anyString,
      });
      expect(body.refreshToken).toMatchObject({
        token: anyString,
        expiresAt: anyString,
      });
    });

    it('should return 409 when email is already registered', async () => {
      await request(getServer(app))
        .post('/auth/register')
        .send(testUser)
        .expect(201);
      await request(getServer(app))
        .post('/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('should return 400 when name is missing', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { name, ...payload } = testUser;
      await request(getServer(app))
        .post('/auth/register')
        .send(payload)
        .expect(400);
    });

    it('should return 400 when email is missing', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { email, ...payload } = testUser;
      await request(getServer(app))
        .post('/auth/register')
        .send(payload)
        .expect(400);
    });

    it('should return 400 when email is invalid', async () => {
      await request(getServer(app))
        .post('/auth/register')
        .send({ ...testUser, email: 'not-an-email' })
        .expect(400);
    });

    it('should return 400 when password is weak', async () => {
      await request(getServer(app))
        .post('/auth/register')
        .send({ ...testUser, password: 'weak', confirmPassword: 'weak' })
        .expect(400);
    });

    it('should return 400 when confirmPassword does not match password', async () => {
      await request(getServer(app))
        .post('/auth/register')
        .send({ ...testUser, confirmPassword: 'DifferentPass@456' })
        .expect(400);
    });

    it('should return 400 when extra unknown fields are sent (forbidNonWhitelisted)', async () => {
      await request(getServer(app))
        .post('/auth/register')
        .send({ ...testUser, unknownField: 'value' })
        .expect(400);
    });
  });

  // ---------------------------------------------------------------------------
  // POST /auth/verify-email
  // ---------------------------------------------------------------------------
  describe('POST /auth/verify-email', () => {
    it('should verify email with a valid token (204)', async () => {
      await request(getServer(app))
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      const token = getEmailVerificationToken(testUser.email);
      expect(token).toBeTruthy();

      await request(getServer(app))
        .post('/auth/verify-email')
        .send({ token })
        .expect(204);
    });

    it('should return 400 or 404 for an invalid / unknown token', async () => {
      const res = await request(getServer(app))
        .post('/auth/verify-email')
        .send({ token: 'totally-invalid-token' });

      expect([400, 404]).toContain(res.status);
    });

    it('should return 400 when token field is missing', async () => {
      await request(getServer(app))
        .post('/auth/verify-email')
        .send({})
        .expect(400);
    });
  });

  // ---------------------------------------------------------------------------
  // POST /auth/login
  // ---------------------------------------------------------------------------
  describe('POST /auth/login', () => {
    it('should return 403 when email is not verified', async () => {
      await request(getServer(app))
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      await request(getServer(app))
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(403);
    });

    it('should login successfully after email verification (200)', async () => {
      await registerAndVerify(app);

      const res = await request(getServer(app))
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      const body = res.body as AuthTokensResponse;

      expect(body.accessToken).toMatchObject({
        token: anyString,
        expiresAt: anyString,
        tokenType: anyString,
      });
      expect(body.refreshToken).toMatchObject({
        token: anyString,
        expiresAt: anyString,
      });
    });

    it('should return 401 for wrong password', async () => {
      await registerAndVerify(app);

      await request(getServer(app))
        .post('/auth/login')
        .send({ email: testUser.email, password: 'WrongPass@999' })
        .expect(401);
    });

    it('should return 401 for non-existent email', async () => {
      await request(getServer(app))
        .post('/auth/login')
        .send({ email: 'nobody@example.com', password: testUser.password })
        .expect(401);
    });

    it('should return 400 when email is missing', async () => {
      await request(getServer(app))
        .post('/auth/login')
        .send({ password: testUser.password })
        .expect(400);
    });

    it('should return 400 when password is missing', async () => {
      await request(getServer(app))
        .post('/auth/login')
        .send({ email: testUser.email })
        .expect(400);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /auth/me
  // ---------------------------------------------------------------------------
  describe('GET /auth/me', () => {
    it('should return the authenticated user (200)', async () => {
      const { accessToken } = await registerAndVerify(app);

      const res = await request(getServer(app))
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const body = res.body as UserResponse;

      expect(body).toMatchObject({
        email: testUser.email,
        name: testUser.name,
      });
    });

    it('should return 401 when no token is provided', async () => {
      const res = await request(getServer(app)).get('/auth/me');
      expect(res.status).toBe(401);
    });

    it('should return 401 when an invalid token is provided', async () => {
      const res = await request(getServer(app))
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.status).toBe(401);
    });
  });

  // ---------------------------------------------------------------------------
  // POST /auth/refresh
  // ---------------------------------------------------------------------------
  describe('POST /auth/refresh', () => {
    it('should rotate the refresh token and return new tokens (200)', async () => {
      const { refreshToken } = await registerAndVerify(app);

      const res = await request(getServer(app))
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      const body = res.body as { token: string; expiresAt: string };

      expect(body.token).toEqual(anyString);
      expect(body.expiresAt).toEqual(anyString);
      expect(body.token).not.toBe(refreshToken);
    });

    it('should return 4xx for an invalid refresh token', async () => {
      const res = await request(getServer(app))
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-refresh-token' });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it('should return 400 when refreshToken field is missing', async () => {
      await request(getServer(app)).post('/auth/refresh').send({}).expect(400);
    });
  });

  // ---------------------------------------------------------------------------
  // POST /auth/logout
  // ---------------------------------------------------------------------------
  describe('POST /auth/logout', () => {
    it('should revoke the refresh token and return 204', async () => {
      const { accessToken, refreshToken } = await registerAndVerify(app);

      await request(getServer(app))
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(204);
    });

    it('should not allow the revoked refresh token to be used again', async () => {
      const { accessToken, refreshToken } = await registerAndVerify(app);

      await request(getServer(app))
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(204);

      const res = await request(getServer(app))
        .post('/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it('should return 400 when refreshToken field is missing', async () => {
      const { accessToken } = await registerAndVerify(app);
      await request(getServer(app))
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(400);
    });
  });

  // ---------------------------------------------------------------------------
  // POST /auth/logout-all
  // ---------------------------------------------------------------------------
  describe('POST /auth/logout-all', () => {
    it('should revoke all refresh tokens and return 204', async () => {
      const { accessToken } = await registerAndVerify(app);

      const loginRes = await request(getServer(app))
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      const { refreshToken: secondRefreshToken } =
        loginRes.body as AuthTokensResponse;

      await request(getServer(app))
        .post('/auth/logout-all')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      const res = await request(getServer(app))
        .post('/auth/refresh')
        .send({ refreshToken: secondRefreshToken.token });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it('should return 401 when no Bearer token is provided', async () => {
      const res = await request(getServer(app)).post('/auth/logout-all');
      expect(res.status).toBe(401);
    });
  });

  // ---------------------------------------------------------------------------
  // POST /auth/resend-verification-email
  // ---------------------------------------------------------------------------
  describe('POST /auth/resend-verification-email', () => {
    it('should resend verification email for an unverified account (204)', async () => {
      await request(getServer(app))
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      await request(getServer(app))
        .post('/auth/resend-verification-email')
        .send({ email: testUser.email })
        .expect(204);
    });

    it('should return 409 when the email is already verified', async () => {
      await registerAndVerify(app);

      await request(getServer(app))
        .post('/auth/resend-verification-email')
        .send({ email: testUser.email })
        .expect(409);
    });

    it('should return 400 when email field is missing', async () => {
      await request(getServer(app))
        .post('/auth/resend-verification-email')
        .send({})
        .expect(400);
    });
  });

  // ---------------------------------------------------------------------------
  // POST /auth/forgot-password
  // ---------------------------------------------------------------------------
  describe('POST /auth/forgot-password', () => {
    it('should initiate password reset for an existing verified user (204)', async () => {
      await registerAndVerify(app);

      await request(getServer(app))
        .post('/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(204);
    });

    it('should return 204 even for an unknown email (prevent enumeration)', async () => {
      await request(getServer(app))
        .post('/auth/forgot-password')
        .send({ email: 'nobody@example.com' })
        .expect(204);
    });

    it('should return 400 when email field is missing', async () => {
      await request(getServer(app))
        .post('/auth/forgot-password')
        .send({})
        .expect(400);
    });
  });

  // ---------------------------------------------------------------------------
  // POST /auth/reset-password
  // ---------------------------------------------------------------------------
  describe('POST /auth/reset-password', () => {
    it('should reset password using OTP from email (204)', async () => {
      await registerAndVerify(app);

      await request(getServer(app))
        .post('/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(204);

      const otp = getPasswordResetOtp(testUser.email);
      expect(otp).toBeTruthy();

      const newPassword = 'NewStrongPass@456';
      await request(getServer(app))
        .post('/auth/reset-password')
        .send({ otp, newPassword, confirmPassword: newPassword })
        .expect(204);
    });

    it('should allow login with the new password after reset', async () => {
      await registerAndVerify(app);

      await request(getServer(app))
        .post('/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(204);

      const otp = getPasswordResetOtp(testUser.email);
      const newPassword = 'NewStrongPass@456';

      await request(getServer(app))
        .post('/auth/reset-password')
        .send({ otp, newPassword, confirmPassword: newPassword })
        .expect(204);

      await request(getServer(app))
        .post('/auth/login')
        .send({ email: testUser.email, password: newPassword })
        .expect(200);
    });

    it('should return 4xx for an invalid OTP', async () => {
      const res = await request(getServer(app))
        .post('/auth/reset-password')
        .send({
          otp: '000000',
          newPassword: 'NewStrongPass@456',
          confirmPassword: 'NewStrongPass@456',
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it('should return 400 when confirmPassword does not match newPassword', async () => {
      await request(getServer(app))
        .post('/auth/reset-password')
        .send({
          otp: '123456',
          newPassword: 'NewStrongPass@456',
          confirmPassword: 'DifferentPass@789',
        })
        .expect(400);
    });

    it('should return 400 when newPassword is weak', async () => {
      await request(getServer(app))
        .post('/auth/reset-password')
        .send({ otp: '123456', newPassword: 'weak', confirmPassword: 'weak' })
        .expect(400);
    });

    it('should return 400 when any required field is missing', async () => {
      await request(getServer(app))
        .post('/auth/reset-password')
        .send({ otp: '123456' })
        .expect(400);
    });
  });

  // ---------------------------------------------------------------------------
  // Full happy-path flow
  // ---------------------------------------------------------------------------
  describe('Full auth flow (register → verify → login → me → refresh → logout)', () => {
    it('should complete the entire flow successfully', async () => {
      // 1. Register
      await request(getServer(app))
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      // 2. Login fails before verification
      await request(getServer(app))
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(403);

      // 3. Verify email using the plaintext token captured from the mail
      const emailToken = getEmailVerificationToken(testUser.email);
      await request(getServer(app))
        .post('/auth/verify-email')
        .send({ token: emailToken })
        .expect(204);

      // 4. Login succeeds after verification
      const loginRes = await request(getServer(app))
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      const loginBody = loginRes.body as AuthTokensResponse;
      const accessToken: string = loginBody.accessToken.token;
      const refreshToken: string = loginBody.refreshToken.token;

      // 5. Get current user
      const meRes = await request(getServer(app))
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const meBody = meRes.body as UserResponse;
      expect(meBody.email).toBe(testUser.email);

      // 6. Refresh tokens
      const refreshRes = await request(getServer(app))
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      const refreshBody = refreshRes.body as {
        token: string;
        expiresAt: string;
      };
      const newRefreshToken: string = refreshBody.token;
      expect(newRefreshToken).not.toBe(refreshToken);

      // 7. Old refresh token is invalidated after rotation
      const oldRefreshRes = await request(getServer(app))
        .post('/auth/refresh')
        .send({ refreshToken });
      expect(oldRefreshRes.status).toBeGreaterThanOrEqual(400);

      // 8. Logout
      await request(getServer(app))
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken: newRefreshToken })
        .expect(204);

      // 9. Refresh after logout fails
      const afterLogoutRes = await request(getServer(app))
        .post('/auth/refresh')
        .send({ refreshToken: newRefreshToken });
      expect(afterLogoutRes.status).toBeGreaterThanOrEqual(400);
    });
  });
});
