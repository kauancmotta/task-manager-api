import { Request } from 'express';
import { JwtPayload } from '@modules/auth/interfaces';

export interface AuthRequest extends Request {
  user: JwtPayload;
}
