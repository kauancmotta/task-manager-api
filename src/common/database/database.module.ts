import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EnvConfig } from '@common/config/env.config';
import { Category } from '@modules/categories/entities/categories.entity';
import { User } from '@modules/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvConfig, true>) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL', { infer: true }),
        entities: [Category, User],
        migrations: [__dirname + '/migrations/*.js'],
        synchronize: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
