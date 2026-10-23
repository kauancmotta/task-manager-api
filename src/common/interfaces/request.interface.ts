import { Request } from 'express';
import { JwtPayload } from '@modules/auth/interfaces';

export interface AuthRequest<
  T extends Express.User | undefined = JwtPayload,
> extends Request {
  user: T;
}
