import { HttpStatus, Injectable } from '@nestjs/common';
import { LessThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

import {
  EmailVerificationContextWithManager,
  EmailVerificationContextWithRevoke,
  EmailVerificationContextWithRevokeAll,
  EmailVerificationContextWithValidate,
} from '@modules/auth/interfaces';
import { EmailVerification } from '@modules/auth/entities/email-verification.entity';
import { EnvConfig } from '@common/config/env.config';
import { calculateExpiresAt, hashToken } from '@common/utils';
import { AppException } from '@common/exceptions/app.exception';
import { ErrorCodes } from '@common/enums/error-codes.enum';

@Injectable()
export class EmailVerificationsService {
  constructor(
    private readonly logger: Logger,
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepository: Repository<EmailVerification>,
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

  async validate({ token, type }: EmailVerificationContextWithValidate) {
    const hashedToken = hashToken(token);

    const emailVerification = await this.emailVerificationRepository
      .createQueryBuilder('emailVerification')
      .innerJoin('emailVerification.user', 'user')
      .addSelect(['user.id', 'user.email'])
      .where('emailVerification.type = :type', { type })
      .andWhere('emailVerification.token = :token', { token: hashedToken })
      .andWhere('emailVerification.expiresAt > :now', { now: new Date() })
      .getOne();

    if (!emailVerification) {
      throw new AppException(
        ErrorCodes.EMAIL_VERIFICATION_INVALID,
        'Email verification expired or not found',
        HttpStatus.NOT_FOUND,
      );
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
      throw new AppException(
        ErrorCodes.EMAIL_VERIFICATION_INVALID,
        'Email verification expired or not found',
        HttpStatus.NOT_FOUND,
      );
    }

    this.logger.log(`Email verification revoked for User ID: ${userId}`);
  }

  async revokeAll({
    type,
    userId,
    manager,
  }: EmailVerificationContextWithRevokeAll) {
    const emailVerificationRepo = manager
      ? manager.getRepository(EmailVerification)
      : this.emailVerificationRepository;

    const result = await emailVerificationRepo.delete({
      userId,
      type,
    });

    if (result.affected) {
      this.logger.log(`Email verifications revoked for User ID: ${userId}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanExpired() {
    const result = await this.emailVerificationRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    this.logger.log(`Cleaned ${result.affected} expired email verifications`);
  }
}
