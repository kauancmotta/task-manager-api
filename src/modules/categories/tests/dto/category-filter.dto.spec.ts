import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CategoryFilterDto } from '@modules/categories/dto';

describe('CategoryFilterDto', () => {
  describe('search', () => {
    it('should fail when search is not a string', async () => {
      const dto = plainToInstance(CategoryFilterDto, {
        search: 123,
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('search');
      expect(errors[0].constraints!['isString']).toBeTruthy();
    });

    it('should fail when search is optional', async () => {
      const dto = plainToInstance(CategoryFilterDto, {
        search: undefined,
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should pass when search is valid', async () => {
      const dto = plainToInstance(CategoryFilterDto, {
        search: 'mock-search',
      });
      const errors = await validate(dto);

      expect(errors.filter((e) => e.property === 'search')).toHaveLength(0);
    });
  });

  it('should pass when all fields are valid', async () => {
    const dto = plainToInstance(CategoryFilterDto, {
      search: 'mock-search',
    });
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
