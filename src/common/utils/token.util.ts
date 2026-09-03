import * as Crypto from 'crypto';

export function generateRefreshToken(): string {
  return Crypto.randomBytes(32).toString('hex');
}

export function hashToken(hash: string): string {
  return Crypto.createHash('sha256').update(hash).digest('hex');
}
