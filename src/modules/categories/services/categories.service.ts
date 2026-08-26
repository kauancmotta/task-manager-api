import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Category } from '@modules/categories/entities/categories.entity';
import { Repository } from 'typeorm';


@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>
  ) {}

  async findAll() {
    return this.categoryRepository.find();
  }
}
