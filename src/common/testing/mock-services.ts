import { Mock } from 'vitest';

import { CategoriesService } from '@modules/categories/services/categories.service';
import { UsersService } from '@modules/users/services/users.service';
import { StorageService } from '@common/storage/storage.interface';

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
  findOne: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
});

export const createMockStorageService = (): Partial<
  Record<keyof StorageService, Mock>
> => ({
  upload: vi.fn(),
  delete: vi.fn(),
});
