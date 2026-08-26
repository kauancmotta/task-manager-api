import { Controller, Get } from '@nestjs/common';

import { Category } from '@modules/categories/entities/categories.entity';
import { CategoriesService } from '@modules/categories/services/categories.service';
import { UuidParam } from '@common/decorators/uuid-param.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@UuidParam('id') id: string): Promise<Category | null> {
    return this.categoriesService.findOne(id);
  }
}
