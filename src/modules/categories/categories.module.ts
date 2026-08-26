import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Category } from '@modules/categories/entities/categories.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  providers: [],
  controllers: [],
})
export class CategoriesModule {}
