import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Category } from '@modules/categories/entities/categories.entity';
import { CategoriesController } from '@modules/categories/controllers/categories.controller';
import { CategoriesService } from '@modules/categories/services/categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
