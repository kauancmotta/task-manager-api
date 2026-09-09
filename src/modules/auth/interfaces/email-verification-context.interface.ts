import { EntityManager } from 'typeorm';

import { EmailVerificationTypes } from '@modules/auth/enums';
import { MailContext } from '@common/mail/interfaces';

export interface EmailVerificationContext {
  userId: string;
}

export type EmailVerificationContextWithManager = EmailVerificationContext & {
  manager?: EntityManager;
};

export type EmailVerificationContextWithRevoke = EmailVerificationContext & {
  token: string;
  manager?: EntityManager;
};

export interface EmailVerificationVariable {
  appUrl: string;
  token: string;
  expiresIn: string;
}

export type EmailVerificationContextWithSendEmail = Omit<
  MailContext<EmailVerificationVariable>,
  'subject'
> & {
  type: EmailVerificationTypes;
};
