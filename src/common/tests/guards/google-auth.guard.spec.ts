import { ExecutionContext } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';

import { GoogleAuthGuard } from '@modules/auth/guards/google.auth.guard';
import { AppException } from '@common/exceptions/app.exception';
import { ErrorCodes } from '@common/enums/error-codes.enum';

describe('GoogleAuthGuard', () => {
  let guard: GoogleAuthGuard;

  beforeEach(() => {
    guard = new GoogleAuthGuard();
  });

  it('should throw ServiceUnavailableException when Google OAuth is disabled', () => {
    process.env.GOOGLE_OAUTH_ENABLED = 'false';

    const mockContext = {} as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(
      new AppException(
        ErrorCodes.GOOGLE_OAUTH_DISABLED,
        'Google OAuth2 is not enabled',
        HttpStatus.SERVICE_UNAVAILABLE,
      ),
    );
  });

  it('should throw UnauthorizedException when Google authentication fails', () => {
    expect(() => guard.handleRequest(new Error('auth failed'), null)).toThrow(
      new AppException(
        ErrorCodes.AUTH_GOOGLE_OAUTH_FAILED,
        'Google authentication failed',
        HttpStatus.UNAUTHORIZED,
      ),
    );
  });

  it('should return user when Google authentication succeeds', () => {
    process.env.GOOGLE_OAUTH_ENABLED = 'true';

    const mockUser = { googleId: 'mock-google-id', email: 'mock@email.com' };

    const result = guard.handleRequest(null as unknown as Error, mockUser);

    expect(result).toEqual(mockUser);
  });
});
