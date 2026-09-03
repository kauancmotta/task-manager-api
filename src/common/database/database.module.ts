import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EnvConfig } from '@common/config/env.config';
import { Category } from '@modules/categories/entities/categories.entity';
import { User } from '@modules/users/entities/user.entity';
import { Task } from '@modules/tasks/entities/task.entity';
import { TaskAssignee } from '@modules/tasks/entities/task-assignee.entity';
import { TaskAttachment } from '@modules/tasks/entities/task-attachment.entity';
import { RefreshToken } from '@modules/auth/entities/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvConfig, true>) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL', { infer: true }),
        entities: [
          RefreshToken,
          User,
          Category,
          Task,
          TaskAssignee,
          TaskAttachment,
        ],
        migrations: [__dirname + '/migrations/*.js'],
        synchronize: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
