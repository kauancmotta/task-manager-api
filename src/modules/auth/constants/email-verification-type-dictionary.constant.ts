import { EmailVerificationTypes } from '@modules/auth/enums';

export const EMAIL_VERIFICATION_TYPE_DICTIONARY: Record<
  EmailVerificationTypes,
  string
> = {
  email_change: 'Alteração de Email',
  email_verification: 'Confirmação de Email',
  password_reset: 'Redefinição de Senha',
  password_changed: 'Senha Alterada',
};
