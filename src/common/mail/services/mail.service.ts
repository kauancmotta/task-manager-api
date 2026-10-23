import nodemailer, { Transporter } from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import * as handlebars from 'handlebars';
import { join } from 'path';

import { EnvConfig } from '@common/config/env.config';
import { MailContext, MailTemplate } from '@common/mail/interfaces';
import { readFile } from 'fs/promises';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;

  constructor(
    private configService: ConfigService<EnvConfig, true>,
    private readonly logger: Logger,
  ) {
    this.transporter = nodemailer.createTransport({
      host: configService.get('MAIL_HOST', { infer: true }),
      port: configService.get('MAIL_PORT', { infer: true }),
    });
  }

  async sendMail<T>({ to, subject, template }: MailContext<T>) {
    const html = await this.templateHtml<T>(template);

    await this.transporter.sendMail({
      from: this.configService.get('MAIL_FROM', { infer: true }),
      to,
      subject,
      html,
    });

    if (this.configService.get('NODE_ENV') !== 'production') {
      this.logger.log(JSON.stringify({ email: to, subject, html }, null, 2));
    } else {
      this.logger.log(`Email sent to: ${to} - Subject: ${subject}`);
    }
  }

  private async templateHtml<T>({
    nameFileTemplate,
    variables,
  }: MailTemplate<T>) {
    const templatePath = join(
      __dirname,
      '../templates',
      `${nameFileTemplate}.hbs`,
    );
    const templateContent = await readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);
    return template({ ...variables });
  }
}
