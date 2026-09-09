import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
import { EntityManager, LessThan, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

import { RefreshToken } from '@modules/auth/entities/refresh-token.entity';
import { calculateExpiresAt, generateToken, hashToken } from '@common/utils';
import { EnvConfig } from '@common/config/env.config';

@Injectable()
export class RefreshTokensService {
  constructor(
    private readonly logger: Logger,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {}

  async create(userId: string, manager?: EntityManager) {
    const refreshTokenRepo = manager
      ? manager.getRepository(RefreshToken)
      : this.refreshTokenRepository;

    const token = generateToken();
    const hashedToken = hashToken(token);

    const refreshToken = refreshTokenRepo.create({
      userId,
      refreshToken: hashedToken,
      expiresAt: calculateExpiresAt(
        this.configService.get('JWT_REFRESH_EXPIRES_IN', {
          infer: true,
        }),
      ),
    });

    await refreshTokenRepo.save(refreshToken);

    this.logger.log(`Refresh token created for User ID: ${userId}`);

    return { token, expiresAt: refreshToken.expiresAt };
  }

  async validate(refreshToken: string) {
    const hashedToken = hashToken(refreshToken);

    const refresh = await this.refreshTokenRepository.findOne({
      where: {
        refreshToken: hashedToken,
      },
    });

    if (!refresh || refresh.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return refresh;
  }

  async rotate(refreshToken: string) {
    const refresh = await this.validate(refreshToken);

    await this.refreshTokenRepository.delete({ id: refresh.id });

    return await this.create(refresh.userId);
  }

  async revoke(refreshToken: string) {
    const hashedToken = hashToken(refreshToken);

    const result = await this.refreshTokenRepository.delete({
      refreshToken: hashedToken,
    });

    if (!result.affected) {
      throw new NotFoundException('Refresh Token not found');
    }

    this.logger.log(`Refresh Token: ${refreshToken} removed successfully`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanExpired() {
    const result = await this.refreshTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    this.logger.log(`Cleaned ${result.affected} expired refresh tokens`);
  }
}
