import {
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  canActivate(context: ExecutionContext) {
    if (process.env.GOOGLE_OAUTH_ENABLED !== 'true') {
      throw new ServiceUnavailableException('Google OAuth2 is not enabled');
    }

    return super.canActivate(context);
  }
}
