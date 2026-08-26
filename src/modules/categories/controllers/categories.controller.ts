import { Controller, Get } from '@nestjs/common';

import { Category } from '@modules/categories/entities/categories.entity';
import { CategoriesService } from '@modules/categories/services/categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }
}
