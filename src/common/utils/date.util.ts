import ms from 'ms';
import { StringValue } from 'ms';

export function calculateExpiresAt(duration: StringValue): Date {
  return new Date(new Date().getTime() + ms(duration));
}
