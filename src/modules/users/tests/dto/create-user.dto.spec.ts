import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateUserDto } from '@modules/users/dto';

describe('CreateUserDto', () => {
  describe('name', () => {
    it('should fail when name is not a string', async () => {
      const dto = plainToInstance(CreateUserDto, {
        name: 123,
        email: 'mock@domain.com',
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'name')).toBe(true);
      expect(
        errors.find((e) => e.property === 'name')?.constraints!['isString'],
      ).toBeTruthy();
    });

    it('should fail when name is empty', async () => {
      const dto = plainToInstance(CreateUserDto, {
        name: '',
        email: 'mock@domain.com',
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'name')).toBe(true);
      expect(
        errors.find((e) => e.property === 'name')?.constraints!['isNotEmpty'],
      ).toBeTruthy();
    });

    it('should fail when name exceeds 100 characters', async () => {
      const dto = plainToInstance(CreateUserDto, {
        name: 'a'.repeat(101),
        email: 'mock@domain.com',
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'name')).toBe(true);
      expect(
        errors.find((e) => e.property === 'name')?.constraints!['maxLength'],
      ).toBeTruthy();
    });

    it('should trim name whitespace', () => {
      const dto = plainToInstance(CreateUserDto, {
        name: '  Mock Name  ',
        email: 'mock@domain.com',
      });

      expect(dto.name).toBe('Mock Name');
    });
  });

  describe('email', () => {
    it('should fail when email is invalid', async () => {
      const dto = plainToInstance(CreateUserDto, {
        name: 'Mock Name',
        email: 'invalid-email',
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'email')).toBe(true);
      expect(
        errors.find((e) => e.property === 'email')?.constraints!['isEmail'],
      ).toBeTruthy();
    });

    it('should fail when email exceeds 100 characters', async () => {
      const dto = plainToInstance(CreateUserDto, {
        name: 'Mock Name',
        email: `${'a'.repeat(90)}@domain.com`,
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'email')).toBe(true);
      expect(
        errors.find((e) => e.property === 'email')?.constraints!['maxLength'],
      ).toBeTruthy();
    });

    it('should lowercase email', () => {
      const dto = plainToInstance(CreateUserDto, {
        name: 'Mock Name',
        email: 'MOCK@DOMAIN.COM',
      });

      expect(dto.email).toBe('mock@domain.com');
    });
  });

  it('should pass when all fields are valid', async () => {
    const dto = plainToInstance(CreateUserDto, {
      name: 'Mock Name',
      email: 'mock@domain.com',
    });
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
