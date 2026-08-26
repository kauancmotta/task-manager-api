import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CategoriesModule } from '@modules/categories/categories.module';
import { DatabaseModule } from '@common/database/database.module';
import { AppLoggerModule } from '@common/logger/logger.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AppLoggerModule,
    DatabaseModule,
    CategoriesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
