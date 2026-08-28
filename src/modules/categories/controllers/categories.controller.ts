import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';

import { Category } from '@modules/categories/entities/categories.entity';
import { CategoriesService } from '@modules/categories/services/categories.service';
import { UuidParam } from '@common/decorators/uuid-param.decorator';
import { CreateCategoryDto, UpdateCategoryDto } from '@modules/categories/dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@UuidParam('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Patch(':id')
  update(
    @UuidParam('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@UuidParam('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
