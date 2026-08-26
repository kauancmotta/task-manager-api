import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from 'nestjs-pino';

import { Category } from '@modules/categories/entities/categories.entity';

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

    if(!category) {
      this.logger.warn(`Category ID: ${id} not found`)
      throw new NotFoundException('category not found');
    }

    return category;
  }
}
