import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateUserDto } from '@modules/users/dto';

describe('UpdateUserDto', () => {
  describe('name', () => {
    it('should fail when name is not a string', async () => {
      const dto = plainToInstance(UpdateUserDto, { name: 123 });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'name')).toBe(true);
      expect(
        errors.find((e) => e.property === 'name')?.constraints!['isString'],
      ).toBeTruthy();
    });

    it('should fail when name is empty', async () => {
      const dto = plainToInstance(UpdateUserDto, { name: '' });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'name')).toBe(true);
      expect(
        errors.find((e) => e.property === 'name')?.constraints!['isNotEmpty'],
      ).toBeTruthy();
    });

    it('should fail when name exceeds 100 characters', async () => {
      const dto = plainToInstance(UpdateUserDto, { name: 'a'.repeat(101) });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'name')).toBe(true);
      expect(
        errors.find((e) => e.property === 'name')?.constraints!['maxLength'],
      ).toBeTruthy();
    });

    it('should trim name whitespace', () => {
      const dto = plainToInstance(UpdateUserDto, { name: '  Mock Name  ' });

      expect(dto.name).toBe('Mock Name');
    });

    it('should pass when name is valid', async () => {
      const dto = plainToInstance(UpdateUserDto, { name: 'Mock Name' });
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });
});
