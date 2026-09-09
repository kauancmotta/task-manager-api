import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';

import {
  EmailVerificationContextWithManager,
  EmailVerificationContextWithRevoke,
  EmailVerificationContextWithSendEmail,
} from '@modules/auth/interfaces';
import { EmailVerification } from '@modules/auth/entities/email-verification.entity';
import { EnvConfig } from '@common/config/env.config';
import { calculateExpiresAt, generateToken, hashToken } from '@common/utils';
import { MailService } from '@common/mail/services/mail.service';
import { EMAIL_VERIFICATION_TYPE_DICTIONARY } from '@modules/auth/constants/email-verification-type-dictionary.constant';
import { EmailVerificationTypes } from '@modules/auth/enums';

@Injectable()
export class EmailVerificationsService {
  constructor(
    private readonly logger: Logger,
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepository: Repository<EmailVerification>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {}

  async create({ userId, manager }: EmailVerificationContextWithManager) {
    const emailVerificationRepo = manager
      ? manager.getRepository(EmailVerification)
      : this.emailVerificationRepository;

    const token = generateToken();
    const hashedToken = hashToken(token);

    const emailVerification = emailVerificationRepo.create({
      userId,
      token: hashedToken,
      type: EmailVerificationTypes.EMAIL_VERIFICATION,
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

  async sendEmail({
    to,
    type,
    template,
  }: EmailVerificationContextWithSendEmail) {
    await this.mailService.sendMail({
      to,
      subject: EMAIL_VERIFICATION_TYPE_DICTIONARY[type],
      template,
    });
  }

  async validate(token: string) {
    const hashedToken = hashToken(token);

    const emailVerification = await this.emailVerificationRepository.findOne({
      where: {
        type: EmailVerificationTypes.EMAIL_VERIFICATION,
        token: hashedToken,
      },
    });

    if (!emailVerification || emailVerification.expiresAt < new Date()) {
      throw new NotFoundException('Email verification expires or not found');
    }

    return emailVerification;
  }

  async revoke({ userId, token, manager }: EmailVerificationContextWithRevoke) {
    const emailVerificationRepo = manager
      ? manager.getRepository(EmailVerification)
      : this.emailVerificationRepository;

    const hashedToken = hashToken(token);

    const result = await emailVerificationRepo.delete({
      userId,
      type: EmailVerificationTypes.EMAIL_VERIFICATION,
      token: hashedToken,
    });

    if (!result.affected) {
      throw new NotFoundException('Email verification not found');
    }

    this.logger.log(`Email verification revoked for User ID: ${userId}`);
  }
}
