import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import type { JwtPayload } from '@modules/auth/interfaces';
import { CategoriesService } from '@modules/categories/services/categories.service';
import { UuidParam } from '@common/decorators/uuid-param.decorator';
import {
  CategoryFilterDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@modules/categories/dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() filters: CategoryFilterDto,
  ) {
    return this.categoriesService.findAll({ userId: user.sub, filters });
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: JwtPayload,
    @UuidParam('id') categoryId: string,
  ) {
    return this.categoriesService.findOne({ userId: user.sub, categoryId });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: JwtPayload,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.create({
      userId: user.sub,
      createCategoryDto,
    });
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @UuidParam('id') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update({
      userId: user.sub,
      categoryId,
      updateCategoryDto,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @UuidParam('id') categoryId: string) {
    return this.categoriesService.remove({ userId: user.sub, categoryId });
  }
}
