import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';

import {
  EmailVerificationContextWithManager,
  EmailVerificationContextWithRevoke,
  EmailVerificationContextWithSendEmail,
  EmailVerificationContextWithValidate,
} from '@modules/auth/interfaces';
import { EmailVerification } from '@modules/auth/entities/email-verification.entity';
import { EnvConfig } from '@common/config/env.config';
import { calculateExpiresAt, hashToken } from '@common/utils';
import { MailService } from '@common/mail/services/mail.service';
import { EMAIL_VERIFICATION_TYPE_DICTIONARY } from '@modules/auth/constants/email-verification-type-dictionary.constant';

@Injectable()
export class EmailVerificationsService {
  constructor(
    private readonly logger: Logger,
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepository: Repository<EmailVerification>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {}

  async create({
    userId,
    type,
    token,
    manager,
  }: EmailVerificationContextWithManager) {
    const emailVerificationRepo = manager
      ? manager.getRepository(EmailVerification)
      : this.emailVerificationRepository;

    const hashedToken = hashToken(token);

    const emailVerification = emailVerificationRepo.create({
      userId,
      token: hashedToken,
      type,
      expiresAt: calculateExpiresAt(
        this.configService.get('MAIL_EXPIRES_IN', {
          infer: true,
        }),
      ),
    });

    await emailVerificationRepo.save(emailVerification);

    this.logger.log(`Email verification created for User ID: ${userId}`);

    return token;
  }

  async sendEmail<T>({
    to,
    type,
    template,
  }: EmailVerificationContextWithSendEmail<T>) {
    await this.mailService.sendMail({
      to,
      subject: EMAIL_VERIFICATION_TYPE_DICTIONARY[type],
      template,
    });
  }

  async validate({ token, type }: EmailVerificationContextWithValidate) {
    const hashedToken = hashToken(token);

    const emailVerification = await this.emailVerificationRepository
      .createQueryBuilder('emailVerification')
      .innerJoin('emailVerification.user', 'user')
      .addSelect(['user.id', 'user.email'])
      .where('emailVerification.type = :type', { type })
      .andWhere('emailVerification.token = :token', { token: hashedToken })
      .getOne();

    if (
      !emailVerification ||
      !emailVerification.user?.id ||
      !emailVerification.user?.email ||
      emailVerification.expiresAt < new Date()
    ) {
      throw new NotFoundException('Email verification expires or not found');
    }

    return emailVerification;
  }

  async revoke({
    userId,
    token,
    type,
    manager,
  }: EmailVerificationContextWithRevoke) {
    const emailVerificationRepo = manager
      ? manager.getRepository(EmailVerification)
      : this.emailVerificationRepository;

    const hashedToken = hashToken(token);

    const result = await emailVerificationRepo.delete({
      userId,
      type,
      token: hashedToken,
    });

    if (!result.affected) {
      throw new NotFoundException('Email verification not found');
    }

    this.logger.log(`Email verification revoked for User ID: ${userId}`);
  }
}
