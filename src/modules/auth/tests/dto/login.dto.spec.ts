import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { LoginDto } from '@modules/auth/dto';

describe('LoginDto', () => {
  describe('email', () => {
    it('should fail when email is invalid', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'invalid-email',
        password: 'passwordStrong@123',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints!['isEmail']).toBeTruthy();
    });

    it('should fail when email is empty', async () => {
      const dto = plainToInstance(LoginDto, {
        email: '',
        password: 'passwordStrong@123',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should lowercase email', () => {
      const dto = plainToInstance(LoginDto, {
        email: 'MOCK@DOMAIN.COM',
        password: 'passwordStrong@123',
      });

      expect(dto.email).toBe('mock@domain.com');
    });

    it('should trim name whitespace', () => {
      const dto = plainToInstance(LoginDto, {
        email: '  mock@domain.com  ',
        password: 'passwordStrong@123',
      });

      expect(dto.email).toBe('mock@domain.com');
    });

    it('should pass when email is valid', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'mock@domain.com',
        password: 'passwordStrong@123',
      });
      const errors = await validate(dto);

      expect(errors.filter((e) => e.property === 'email')).toHaveLength(0);
    });
  });

  describe('password', () => {
    it('should fail when password is not a string', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'mock@domain.com',
        password: 123,
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints!['isString']).toBeTruthy();
    });

    it('should fail when password is empty', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'mock@domain.com',
        password: '',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints!['isNotEmpty']).toBeTruthy();
    });

    it('should pass when password is valid', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'mock@domain.com',
        password: 'passwordStrong@123',
      });
      const errors = await validate(dto);

      expect(errors.filter((e) => e.property === 'password')).toHaveLength(0);
    });
  });

  it('should pass when all fields are valid', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'mock@domain.com',
      password: 'passwordStrong@123',
    });
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
