import { EmailVerificationTypes } from '@modules/auth/enums';

export const EMAIL_VERIFICATION_TYPE_DICTIONARY: Record<
  EmailVerificationTypes,
  string
> = {
  email_confirmation: 'Email Confirmation',
  email_verified: 'Email Verified',
  email_change: 'Email Changed',
  password_reset: 'Password Reset',
  password_changed: 'Password Changed',
};
