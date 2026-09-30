import { buildPaginationMeta } from '@common/utils/build-pagination-meta.util';

describe('buildPaginationMeta', () => {
  it('should round up totalPages when total is not divisible by limit', () => {
    const result = buildPaginationMeta({ total: 101, page: 1, limit: 10 });

    expect(result.totalPages).toBe(11);
  });

  it('should return totalPages as 0 when total is 0', () => {
    const result = buildPaginationMeta({ total: 0, page: 1, limit: 10 });

    expect(result.totalPages).toBe(0);
  });

  it('should return correct currentPage', () => {
    const result = buildPaginationMeta({ total: 100, page: 3, limit: 10 });

    expect(result.currentPage).toBe(3);
  });

  it('should return correct pagination meta', () => {
    const result = buildPaginationMeta({ total: 100, page: 1, limit: 10 });

    expect(result).toEqual({
      total: 100,
      totalPages: 10,
      currentPage: 1,
      limit: 10,
    });
  });
});
