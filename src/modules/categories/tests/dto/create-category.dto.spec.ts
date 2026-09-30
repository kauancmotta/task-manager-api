import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateCategoryDto } from '@modules/categories/dto';

describe('CreateCategoryDto', () => {
  describe('name', () => {
    it('should fail when name is empty', async () => {
      const dto = plainToInstance(CreateCategoryDto, {
        name: '',
        description: 'Mock Description',
        color: '#ffffff',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'name should not be empty',
      );
    });

    it('should fail when name is not string', async () => {
      const dto = plainToInstance(CreateCategoryDto, {
        name: null,
        description: 'Mock Description',
        color: '#ffffff',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints?.isString).toBe('name must be a string');
    });

    it('should fail when name exceeds 100 characters', async () => {
      const dto = plainToInstance(CreateCategoryDto, {
        name: 'm'.repeat(101),
        description: 'Mock Description',
        color: '#ffffff',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints?.maxLength).toBe(
        'name must be shorter than or equal to 100 characters',
      );
    });

    it('should pass with valid name', async () => {
      const dto = plainToInstance(CreateCategoryDto, {
        name: 'Mock Name',
        description: 'Mock Description',
        color: '#ffffff',
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });

  describe('description', () => {
    it('should fail when description is not string', async () => {
      const dto = plainToInstance(CreateCategoryDto, {
        name: 'Mock Name',
        description: 33,
        color: '#ffffff',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('description');
      expect(errors[0].constraints?.isString).toBe(
        'description must be a string',
      );
    });

    it('should fail when description exceeds 255 characters', async () => {
      const dto = plainToInstance(CreateCategoryDto, {
        name: 'Mock Name',
        description: 'm'.repeat(256),
        color: '#ffffff',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('description');
      expect(errors[0].constraints?.maxLength).toBe(
        'description must be shorter than or equal to 255 characters',
      );
    });

    it('should description valid is optional', async () => {
      const dto = plainToInstance(CreateCategoryDto, {
        name: 'Mock Name',
        color: '#ffffff',
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
      expect(errors?.[0]?.property).not.toBe('description');
    });

    it('should pass with valid description', async () => {
      const dto = plainToInstance(CreateCategoryDto, {
        name: 'Mock Name',
        description: 'Mock Description',
        color: '#ffffff',
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });

  describe('color', () => {
    it('should fail when color is regex invalid', async () => {
      const colorDtoFormats = [
        '',
        null,
        undefined,
        'aaaa',
        '@aaaa',
        '####',
        '#ffxx',
        '@@@@',
      ];

      await Promise.all(
        colorDtoFormats.map(async (color) => {
          const dto = plainToInstance(CreateCategoryDto, {
            name: 'Mock Name',
            description: 'Mock Description',
            color,
          });

          const errors = await validate(dto);

          expect(errors.length).toBeGreaterThan(0);
          expect(errors.some((e) => e.property === 'color')).toBe(true);
        }),
      );
    });

    it('should pass with valid color', async () => {
      const dto = plainToInstance(CreateCategoryDto, {
        name: 'Mock Name',
        description: 'Mock Description',
        color: '#ffffff',
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });
});
