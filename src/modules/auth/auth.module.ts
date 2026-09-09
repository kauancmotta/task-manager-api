import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { EnvConfig } from '@common/config/env.config';
import { AuthController } from '@modules/auth/controllers/auth.controller';
import { RefreshToken } from '@modules/auth/entities/refresh-token.entity';
import { AuthService } from '@modules/auth/services/auth.service';
import { User } from '@modules/users/entities/user.entity';
import { RefreshTokensService } from '@modules/auth/services/refresh-tokens.service';
import { UsersModule } from '@modules/users/users.module';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';
import { GoogleAuthModule } from '@modules/auth/google-auth.module';
import { MailModule } from '@common/mail/mail.module';
import { EmailVerificationsService } from '@modules/auth/services/email-verifications.service';
import { EmailVerification } from '@modules/auth/entities/email-verification.entity';

const isGoogleOAuthEnabled = process.env.GOOGLE_OAUTH_ENABLED === 'true';
@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, User, EmailVerification]),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvConfig, true>) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', { infer: true }),
        },
      }),
    }),
    ...(isGoogleOAuthEnabled ? [GoogleAuthModule] : []),
    ScheduleModule.forRoot(),
    UsersModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshTokensService,
    EmailVerificationsService,
    JwtStrategy,
  ],
})
export class AuthModule {}
