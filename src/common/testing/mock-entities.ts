import { uuidv7 } from 'uuidv7';

import { Category } from '@modules/categories/entities/categories.entity';
import { User } from '@modules/users/entities/user.entity';

export const createMockCategory = (overrides?: Partial<Category>): Category =>
  ({
    id: uuidv7(),
    name: 'Mock Name',
    description: 'Mock description',
    color: '#000000',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  }) as Category;

export const createMockUser = (overrides?: Partial<User>): User =>
  ({
    id: uuidv7(),
    name: 'Mock Name',
    email: 'mock@email.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  }) as User;
