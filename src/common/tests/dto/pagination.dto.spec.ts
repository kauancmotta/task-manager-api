import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { PaginationDto } from '@common/dto/pagination.dto';

describe('PaginationDto', () => {
  describe('page', () => {
    it('should fail when page is not a number', async () => {
      const dto = plainToInstance(PaginationDto, { page: 'invalid-type' });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints!['isNumber']).toBeTruthy();
    });

    it('should fail when page is less than 1', async () => {
      const dto = plainToInstance(PaginationDto, { page: 0 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints!['min']).toBeTruthy();
    });
  });

  describe('limit', () => {
    it('should fail when limit is not a number', async () => {
      const dto = plainToInstance(PaginationDto, { limit: 'invalid-type' });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('limit');
      expect(errors[0].constraints!['isNumber']).toBeTruthy();
    });

    it('should fail when limit is less than 1', async () => {
      const dto = plainToInstance(PaginationDto, { limit: 0 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('limit');
      expect(errors[0].constraints!['min']).toBeTruthy();
    });

    it('should fail when limit is greater than 100', async () => {
      const dto = plainToInstance(PaginationDto, { limit: 101 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('limit');
      expect(errors[0].constraints!['max']).toBeTruthy();
    });
  });

  it('should pass when page and limit are valid', async () => {
    const dto = plainToInstance(PaginationDto, { page: 1, limit: 10 });
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
