import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { uuidv7 } from 'uuidv7';

import { UpdateTaskCategoriesDto } from '@modules/tasks/dto';

describe('UpdateTaskCategoriesDto', () => {
  describe('categoryIds', () => {
    it('should fail when categoryIds is not an array', async () => {
      const dto = plainToInstance(UpdateTaskCategoriesDto, {
        categoryIds: 'invalid',
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'categoryIds')).toBe(true);
      expect(
        errors.find((e) => e.property === 'categoryIds')?.constraints![
          'isArray'
        ],
      ).toBeTruthy();
    });

    it('should fail when categoryIds is empty array', async () => {
      const dto = plainToInstance(UpdateTaskCategoriesDto, {
        categoryIds: [],
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'categoryIds')).toBe(true);
      expect(
        errors.find((e) => e.property === 'categoryIds')?.constraints![
          'arrayMinSize'
        ],
      ).toBeTruthy();
    });

    it('should fail when categoryIds contains invalid UUID', async () => {
      const dto = plainToInstance(UpdateTaskCategoriesDto, {
        categoryIds: ['invalid-uuid'],
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'categoryIds')).toBe(true);
      expect(
        errors.find((e) => e.property === 'categoryIds')?.constraints![
          'isUuid'
        ],
      ).toBeTruthy();
    });

    it('should pass when categoryIds has valid UUIDs', async () => {
      const dto = plainToInstance(UpdateTaskCategoriesDto, {
        categoryIds: [uuidv7(), uuidv7()],
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });
});
