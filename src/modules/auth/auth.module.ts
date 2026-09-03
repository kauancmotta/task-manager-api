import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { EnvConfig } from '@common/config/env.config';
import { AuthController } from '@modules/auth/controllers/auth.controller';
import { RefreshToken } from '@modules/auth/entities/refresh-token.entity';
import { AuthService } from '@modules/auth/services/auth.service';
import { User } from '@modules/users/entities/user.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { RefreshTokensService } from '@modules/auth/services/refresh-tokens.service';
import { UsersModule } from '@modules/users/users.module';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, User]),
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
    ScheduleModule.forRoot(),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokensService, JwtStrategy],
})
export class AuthModule {}
