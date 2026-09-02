import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validate } from '@common/config/env.validation';
import { CategoriesModule } from '@modules/categories/categories.module';
import { DatabaseModule } from '@common/database/database.module';
import { AppLoggerModule } from '@common/logger/logger.module';
import { UsersModule } from '@modules/users/users.module';
import { TasksModule } from '@modules/tasks/tasks.module';
import { StorageModule } from '@common/storage/storage.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    AppLoggerModule,
    DatabaseModule,
    StorageModule,
    CategoriesModule,
    UsersModule,
    TasksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
