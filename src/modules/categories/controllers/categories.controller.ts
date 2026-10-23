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
import { ApiTags } from '@nestjs/swagger';

import type { JwtPayload } from '@modules/auth/interfaces';
import { CategoriesService } from '@modules/categories/services/categories.service';
import { UuidParam } from '@common/decorators/uuid-param.decorator';
import {
  CategoryFilterDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@modules/categories/dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import {
  SwaggerCategoryCreateDoc,
  SwaggerCategoryFindAllDoc,
  SwaggerCategoryFindOneDoc,
  SwaggerCategoryRemoveDoc,
  SwaggerCategoryUpdateDoc,
} from '@modules/categories/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @SwaggerCategoryFindAllDoc()
  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() filters: CategoryFilterDto,
  ) {
    return this.categoriesService.findAll({ userId: user.sub, filters });
  }

  @SwaggerCategoryFindOneDoc()
  @Get(':id')
  findOne(
    @CurrentUser() user: JwtPayload,
    @UuidParam('id') categoryId: string,
  ) {
    return this.categoriesService.findOne({ userId: user.sub, categoryId });
  }

  @SwaggerCategoryCreateDoc()
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

  @SwaggerCategoryUpdateDoc()
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
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

  @SwaggerCategoryRemoveDoc()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @UuidParam('id') categoryId: string) {
    return this.categoriesService.remove({ userId: user.sub, categoryId });
  }
}
