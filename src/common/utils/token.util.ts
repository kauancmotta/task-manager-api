import * as Crypto from 'crypto';

export function generateToken(): string {
  return Crypto.randomBytes(32).toString('hex');
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashToken(hash: string): string {
  return Crypto.createHash('sha256').update(hash).digest('hex');
}
