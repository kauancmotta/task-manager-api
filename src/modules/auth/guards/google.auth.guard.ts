import { ErrorCodes } from '@common/enums/error-codes.enum';
import { AppException } from '@common/exceptions/app.exception';
import { GoogleProfile } from '@modules/auth/interfaces';
import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  canActivate(context: ExecutionContext) {
    if (process.env.GOOGLE_OAUTH_ENABLED !== 'true') {
      throw new AppException(
        ErrorCodes.GOOGLE_OAUTH_DISABLED,
        'Google OAuth2 is not enabled',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = GoogleProfile>(err: Error, user: TUser): TUser {
    if (err || !user) {
      throw new AppException(
        ErrorCodes.AUTH_GOOGLE_OAUTH_FAILED,
        'Google authentication failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }
}
