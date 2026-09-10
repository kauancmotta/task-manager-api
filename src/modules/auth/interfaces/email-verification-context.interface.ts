import { EntityManager } from 'typeorm';

import { EmailVerificationTypes } from '@modules/auth/enums';
import { MailContext } from '@common/mail/interfaces';

export interface EmailVerificationContext {
  userId: string;
  type: EmailVerificationTypes;
}

export type EmailVerificationContextWithManager = EmailVerificationContext & {
  token: string;
  manager?: EntityManager;
};

export type EmailVerificationContextWithValidate = Omit<
  EmailVerificationContext,
  'userId'
> & {
  token: string;
};

export type EmailVerificationContextWithRevoke = EmailVerificationContext & {
  token: string;
  manager?: EntityManager;
};

export interface EmailVerificationVariables {
  appUrl: string;
  token: string;
  expiresIn: string;
}

export interface PasswordResetVariables {
  otp: string;
  expiresIn: string;
}

export type EmailVerificationContextWithSendEmail<T> = Omit<
  MailContext<T>,
  'subject'
> & {
  type: EmailVerificationTypes;
};
