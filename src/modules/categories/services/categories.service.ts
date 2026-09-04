import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Logger } from 'nestjs-pino';

import { Category } from '@modules/categories/entities/categories.entity';
import {
  CategoryContext,
  CategoryContextWithCreateCategoryDto,
  CategoryContextWithUpdateCategoryDto,
  CategoryContextWithValidationName,
} from '@modules/categories/interfaces';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly logger: Logger,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(userId: string) {
    return this.categoryRepository.find({ where: { createdByUserId: userId } });
  }

  async findOne({ userId, categoryId }: CategoryContext) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId, createdByUserId: userId },
    });

    if (!category) {
      throw new NotFoundException('category not found');
    }

    return category;
  }

  async create({
    userId,
    createCategoryDto,
  }: CategoryContextWithCreateCategoryDto) {
    await this.validateExistName({ userId, name: createCategoryDto.name });

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      createdByUserId: userId,
    });
    await this.categoryRepository.save(category);

    this.logger.log(`Category ID: ${category.id} created successfully`);

    return category;
  }

  async update({
    userId,
    categoryId,
    updateCategoryDto,
  }: CategoryContextWithUpdateCategoryDto) {
    if (updateCategoryDto.name) {
      await this.validateExistName({
        userId,
        name: updateCategoryDto.name,
        excludeCategoryId: categoryId,
      });
    }

    const result = await this.categoryRepository.update(
      { id: categoryId, createdByUserId: userId },
      updateCategoryDto,
    );

    if (!result.affected) {
      throw new NotFoundException(`Category ${categoryId} not found`);
    }

    this.logger.log(`Category ID: ${categoryId} updated successfully`);

    return this.findOne({ userId, categoryId });
  }

  async remove({ userId, categoryId }: CategoryContext) {
    const result = await this.categoryRepository.delete({
      createdByUserId: userId,
      id: categoryId,
    });

    if (!result.affected) {
      throw new NotFoundException(`Category ${categoryId} not found`);
    }

    this.logger.log(`Category ID: ${categoryId} removed successfully`);
  }

  private async validateExistName({
    userId,
    name,
    excludeCategoryId,
  }: CategoryContextWithValidationName) {
    const exists = await this.categoryRepository.existsBy({
      name,
      createdByUserId: userId,
      ...(excludeCategoryId && { id: Not(excludeCategoryId) }),
    });

    if (exists) {
      throw new ConflictException(`Category "${name}" already exists`);
    }
  }
}
