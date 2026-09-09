import { MailTemplates } from '@common/mail/enums';

export interface MailContext<T> {
  to: string;
  subject: string;
  template: MailTemplate<T>;
}

export interface MailTemplate<T> {
  nameFileTemplate: MailTemplates;
  variables: T;
}
