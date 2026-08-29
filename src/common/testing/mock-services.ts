import { Mock } from 'vitest';

import { CategoriesService } from '@modules/categories/services/categories.service';
import { UsersService } from '@modules/users/services/users.service';

export const createMockCategoriesService = (): Partial<
  Record<keyof CategoriesService, Mock>
> => ({
  findAll: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
});

export const createMockUsersService = (): Partial<
  Record<keyof UsersService, Mock>
> => ({
  findAll: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
});
