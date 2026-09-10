import { MailTemplates } from '@common/mail/enums';
import {
  EmailConfirmationVariables,
  EmailVerifiedVariables,
  MailContext,
  MailFactoryContext,
  PasswordChangedVariables,
  PasswordResetVariables,
} from '@common/mail/interfaces';
import { EMAIL_VERIFICATION_TYPE_DICTIONARY } from '@modules/auth/constants/email-verification-type-dictionary.constant';
import { EmailVerificationTypes } from '@modules/auth/enums';

export const buildEmailConfirmationMail = ({
  to,
  variables,
}: MailFactoryContext<EmailConfirmationVariables>): MailContext<EmailConfirmationVariables> => ({
  to,
  subject:
    EMAIL_VERIFICATION_TYPE_DICTIONARY[
      EmailVerificationTypes.EMAIL_CONFIRMATION
    ],
  template: {
    nameFileTemplate: MailTemplates.EMAIL_CONFIRMATION,
    variables,
  },
});

export const buildPasswordResetMail = ({
  to,
  variables,
}: MailFactoryContext<PasswordResetVariables>): MailContext<PasswordResetVariables> => ({
  to,
  subject:
    EMAIL_VERIFICATION_TYPE_DICTIONARY[EmailVerificationTypes.PASSWORD_RESET],
  template: {
    nameFileTemplate: MailTemplates.PASSWORD_RESET,
    variables,
  },
});

export const buildPasswordChangedMail = ({
  to,
  variables,
}: MailFactoryContext<
  Omit<PasswordChangedVariables, 'changedAt'>
>): MailContext<PasswordChangedVariables> => ({
  to,
  subject:
    EMAIL_VERIFICATION_TYPE_DICTIONARY[EmailVerificationTypes.PASSWORD_CHANGED],
  template: {
    nameFileTemplate: MailTemplates.PASSWORD_CHANGED,
    variables: {
      appUrl: variables.appUrl,
      changedAt: new Intl.DateTimeFormat('en-US', {
        dateStyle: 'long',
        timeStyle: 'short',
      }).format(new Date()),
    },
  },
});

export const buildEmailVerifiedMail = ({
  to,
  variables,
}: MailFactoryContext<EmailVerifiedVariables>): MailContext<EmailVerifiedVariables> => ({
  to,
  subject:
    EMAIL_VERIFICATION_TYPE_DICTIONARY[EmailVerificationTypes.EMAIL_VERIFIED],
  template: {
    nameFileTemplate: MailTemplates.EMAIL_VERIFIED,
    variables,
  },
});
