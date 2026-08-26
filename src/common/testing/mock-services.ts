import { Mock } from 'vitest';
import { CategoriesService } from '@modules/categories/services/categories.service';

export const createMockCategoriesService = (): Partial<Record<keyof CategoriesService, Mock>> => ({
  findAll: vi.fn(),
  findOne: vi.fn(),
});