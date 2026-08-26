import { uuidv7 } from 'uuidv7';

import { Category } from '@modules/categories/entities/categories.entity';

export const createMockCategory = (overrides?: Partial<Category>): Category => ({
  id: uuidv7(),
  name: 'Mock Name',
  description: 'Mock description',
  color: '#000000',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
}) as Category;