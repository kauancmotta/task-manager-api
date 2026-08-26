// database.module.ts
import { EnvConfig } from '@common/config/env.config';
import { Category } from '@modules/categories/entities/categories.entity';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvConfig, true>) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL', { infer: true }),
        entities: [Category],
        synchronize: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
