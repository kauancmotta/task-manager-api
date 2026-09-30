import { createMockRepository } from '@common/testing/mock-repository';
import { UpdateResult, DeleteResult, EntityManager } from 'typeorm';
import { Mock } from 'vitest';

export const createMockUpdateResult = (affected = 1): UpdateResult => ({
  affected,
  raw: [],
  generatedMaps: [],
});

export const createMockDeleteResult = (affected = 1): DeleteResult => ({
  affected,
  raw: [],
});

export const createMockDataSource = () => ({
  transaction: vi.fn().mockImplementation((cb: (manager: unknown) => unknown) =>
    cb({
      save: vi.fn(),
      update: vi.fn(),
      getRepository: vi.fn().mockReturnValue({ save: vi.fn() }),
    }),
  ),
});

export const createMockEntityManager = (
  repository = createMockRepository(),
  overrides?: { deleteAffected?: number; updateAffected?: number },
) => {
  const repo = {
    ...repository,
    delete: vi
      .fn()
      .mockResolvedValue({ affected: overrides?.deleteAffected ?? 1 }),
    update: vi
      .fn()
      .mockResolvedValue({ affected: overrides?.updateAffected ?? 1 }),
  };

  return {
    getRepository: vi.fn().mockReturnValue(repo),
    save: vi.fn().mockResolvedValue({}),
    update: vi
      .fn()
      .mockResolvedValue({ affected: overrides?.updateAffected ?? 1 }),
    delete: vi
      .fn()
      .mockResolvedValue({ affected: overrides?.deleteAffected ?? 1 }),
  } as unknown as EntityManager & { getRepository: Mock };
};
export const createMockQueryBuilder = () => ({
  select: vi.fn().mockReturnThis(),
  addSelect: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  andWhere: vi.fn().mockReturnThis(),
  orWhere: vi.fn().mockReturnThis(),
  innerJoin: vi.fn().mockReturnThis(),
  innerJoinAndSelect: vi.fn().mockReturnThis(),
  leftJoin: vi.fn().mockReturnThis(),
  leftJoinAndSelect: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  addOrderBy: vi.fn().mockReturnThis(),
  take: vi.fn().mockReturnThis(),
  skip: vi.fn().mockReturnThis(),
  setParameter: vi.fn().mockReturnThis(),
  relation: vi.fn().mockReturnThis(),
  of: vi.fn().mockReturnThis(),
  add: vi.fn().mockReturnThis(),
  remove: vi.fn().mockReturnThis(),
  getOne: vi.fn(),
  getMany: vi.fn(),
  getManyAndCount: vi.fn(),
  getExists: vi.fn(),
  getRawOne: vi.fn(),
  getRawMany: vi.fn(),
  getCount: vi.fn(),
});
