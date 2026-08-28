import { Mock } from 'vitest';
import { ObjectLiteral, Repository } from 'typeorm';

export type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, Mock>
>;

export const createMockRepository = <
  T extends ObjectLiteral = any,
>(): MockRepository<T> => ({
  find: vi.fn(),
  findOne: vi.fn(),
  findOneBy: vi.fn(),
  findAndCount: vi.fn(),
  save: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  softDelete: vi.fn(),
  restore: vi.fn(),
  count: vi.fn(),
  exists: vi.fn(),
  existsBy: vi.fn(),
});
