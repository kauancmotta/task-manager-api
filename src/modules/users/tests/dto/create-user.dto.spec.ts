import { CreateUserDto } from '@modules/users/dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('CreateUserDto', () => {
  describe('Name', () => {
    it('should pass with valid name', async () => {
      const dto = plainToInstance(CreateUserDto, {
        name: 'Mock Name',
        email: 'mock@email.com',
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should fail when name is empty', async () => {
      const dto = plainToInstance(CreateUserDto, {
        name: '',
        email: 'mock@email.com',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors![0].property).toBe('name');
      expect(errors![0].constraints!.isNotEmpty).toBe(
        'name should not be empty',
      );
    });

    it('should fail when name is string', async () => {
      const dto = plainToInstance(CreateUserDto, {
        name: 123,
        email: 'mock@email.com',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors![0].property).toBe('name');
      expect(errors![0].constraints!.isString).toBe('name must be a string');
    });

    it('should fail when name exceeds 100 characters', async () => {
      const dto = plainToInstance(CreateUserDto, {
        name: 'm'.repeat(101),
        email: 'mock@email.com',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors![0].property).toBe('name');
      expect(errors![0].constraints!.maxLength).toBe(
        'name must be shorter than or equal to 100 characters',
      );
    });
  });

  describe('Email', () => {
    it('should pass when email is valid', async () => {
      const validFormats = [
        'mock@email.com',
        'mock.name@email.com',
        'mock+tag@email.com',
        'mock@sub.email.com',
      ];

      await Promise.all(
        validFormats.map(async (emailFormat) => {
          const dto = plainToInstance(CreateUserDto, {
            name: 'Mock Name',
            email: emailFormat,
          });

          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        }),
      );
    });

    it('should fail when email is invalid formats', async () => {
      const invalidFormats = [
        'mock e',
        'mock@',
        '@mock',
        'mock@em',
        'mock@email',
        'mock@email.',
        'mock@email.com a',
        '',
        ' ',
        'mock',
        'mock@@email.com',
      ];

      await Promise.all(
        invalidFormats.map(async (emailFormat) => {
          const dto = plainToInstance(CreateUserDto, {
            name: 'Mock Name',
            email: emailFormat,
          });

          const errors = await validate(dto);

          expect(errors.length).toBeGreaterThan(0);
          expect(errors![0]!.property).toBe('email');
          expect(errors![0]!.constraints!.isEmail).toBe('Invalid email format');
        }),
      );
    });

    it('should fail when email exceeds 100 characters', async () => {
      const dto = plainToInstance(CreateUserDto, {
        name: 'Mock Name',
        email: 'm'.repeat(101),
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors![0]!.property).toBe('email');
      expect(errors![0]!.constraints!.maxLength).toBe(
        'email must be shorter than or equal to 100 characters',
      );
    });
  });
});
