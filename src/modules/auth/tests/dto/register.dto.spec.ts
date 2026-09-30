import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { RegisterDto } from '@modules/auth/dto';

describe('RegisterDto', () => {
  describe('name', () => {
    it('should fail when name is not a string', async () => {
      const dto = plainToInstance(RegisterDto, {
        name: 123,
        email: 'mock@domain.com',
        password: 'passwordStrong@123',
        confirmPassword: 'passwordStrong@123',
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'name')).toBe(true);
      expect(
        errors.find((e) => e.property === 'name')?.constraints!['isString'],
      ).toBeTruthy();
    });

    it('should fail when name is empty', async () => {
      const dto = plainToInstance(RegisterDto, {
        name: '',
        email: 'mock@domain.com',
        password: 'passwordStrong@123',
        confirmPassword: 'passwordStrong@123',
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('should fail when name exceeds 100 characters', async () => {
      const dto = plainToInstance(RegisterDto, {
        name: 'a'.repeat(101),
        email: 'mock@domain.com',
        password: 'passwordStrong@123',
        confirmPassword: 'passwordStrong@123',
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'name')).toBe(true);
      expect(
        errors.find((e) => e.property === 'name')?.constraints!['maxLength'],
      ).toBeTruthy();
    });

    it('should trim name whitespace', () => {
      const dto = plainToInstance(RegisterDto, {
        name: '  Mock Name  ',
        email: 'mock@domain.com',
        password: 'passwordStrong@123',
        confirmPassword: 'passwordStrong@123',
      });

      expect(dto.name).toBe('Mock Name');
    });
  });

  describe('email', () => {
    it('should fail when email is invalid', async () => {
      const dto = plainToInstance(RegisterDto, {
        name: 'Mock Name',
        email: 'invalid-email',
        password: 'passwordStrong@123',
        confirmPassword: 'passwordStrong@123',
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'email')).toBe(true);
      expect(
        errors.find((e) => e.property === 'email')?.constraints!['isEmail'],
      ).toBeTruthy();
    });

    it('should lowercase email', () => {
      const dto = plainToInstance(RegisterDto, {
        name: 'Mock Name',
        email: 'MOCK@DOMAIN.COM',
        password: 'passwordStrong@123',
        confirmPassword: 'passwordStrong@123',
      });

      expect(dto.email).toBe('mock@domain.com');
    });
  });

  describe('password', () => {
    it('should fail when password is weak', async () => {
      const dto = plainToInstance(RegisterDto, {
        name: 'Mock Name',
        email: 'mock@domain.com',
        password: '123456',
        confirmPassword: '123456',
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'password')).toBe(true);
      expect(
        errors.find((e) => e.property === 'password')?.constraints![
          'isStrongPassword'
        ],
      ).toBeTruthy();
    });
  });

  describe('confirmPassword', () => {
    it('should fail when confirmPassword does not match password', async () => {
      const dto = plainToInstance(RegisterDto, {
        name: 'Mock Name',
        email: 'mock@domain.com',
        password: 'passwordStrong@123',
        confirmPassword: 'differentPassword@123',
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'confirmPassword')).toBe(true);
      expect(
        errors.find((e) => e.property === 'confirmPassword')?.constraints![
          'Match'
        ],
      ).toBeTruthy();
    });
  });

  it('should pass when all fields are valid', async () => {
    const dto = plainToInstance(RegisterDto, {
      name: 'Mock Name',
      email: 'mock@domain.com',
      password: 'passwordStrong@123',
      confirmPassword: 'passwordStrong@123',
    });
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
