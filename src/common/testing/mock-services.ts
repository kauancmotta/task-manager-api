import { CategoriesService } from '@modules/categories/services/categories.service';

export const createMockCategoriesService = (): Partial<Record<keyof CategoriesService, jest.Mock>> => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
});