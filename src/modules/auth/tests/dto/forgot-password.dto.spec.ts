import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ForgotPasswordDto } from '@modules/auth/dto';

describe('ForgotPasswordDto', () => {
  describe('email', () => {
    it('should fail when email is invalid', async () => {
      const dto = plainToInstance(ForgotPasswordDto, {
        email: 'invalid-email',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints!['isEmail']).toBeTruthy();
    });

    it('should fail when email is greater than 100', async () => {
      const dto = plainToInstance(ForgotPasswordDto, {
        email: 'm'.repeat(101),
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints!['maxLength']).toBeTruthy();
    });

    it('should pass when email are valid', async () => {
      const dto = plainToInstance(ForgotPasswordDto, {
        email: 'mock@domain.com',
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });
});
