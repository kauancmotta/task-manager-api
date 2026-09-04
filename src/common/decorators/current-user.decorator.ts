import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@modules/auth/interfaces';
import { AuthRequest } from '@common/interfaces';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    return request.user;
  },
);
