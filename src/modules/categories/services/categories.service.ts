import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Logger } from 'nestjs-pino';

import { Category } from '@modules/categories/entities/categories.entity';
import { CreateCategoryDto, UpdateCategoryDto } from '@modules/categories/dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly logger: Logger,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll() {
    return this.categoryRepository.find();
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('category not found');
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    await this.validateExistName(createCategoryDto.name);

    const category = this.categoryRepository.create(createCategoryDto);
    await this.categoryRepository.save(category);

    this.logger.log(`Category ID: ${category.id} created successfully`);

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    if (updateCategoryDto.name) {
      await this.validateExistName(updateCategoryDto.name, id);
    }

    const result = await this.categoryRepository.update(id, updateCategoryDto);

    if (!result.affected) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    this.logger.log(`Category ID: ${id} updated successfully`);

    return this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.categoryRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    this.logger.log(`Category ID: ${id} removed successfully`);
  }

  private async validateExistName(name: string, excludeId?: string) {
    const exists = await this.categoryRepository.existsBy({
      name,
      id: excludeId ? Not(excludeId) : undefined,
    });

    if (exists) {
      throw new ConflictException(`Category "${name}" already exists`);
    }
  }
}
