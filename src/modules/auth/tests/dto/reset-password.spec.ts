import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ResetPasswordDto } from '@modules/auth/dto';

describe('ResetPasswordDto', () => {
  describe('otp', () => {
    it('should fail when otp is not a string', async () => {
      const dto = plainToInstance(ResetPasswordDto, {
        otp: 123456,
        newPassword: 'passwordStrong@123',
        confirmPassword: 'passwordStrong@123',
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'otp')).toBe(true);
      expect(
        errors.find((e) => e.property === 'otp')?.constraints!['isString'],
      ).toBeTruthy();
    });

    it('should fail when otp is less than 6 characters', async () => {
      const dto = plainToInstance(ResetPasswordDto, {
        otp: '12345',
        newPassword: 'passwordStrong@123',
        confirmPassword: 'passwordStrong@123',
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'otp')).toBe(true);
      expect(
        errors.find((e) => e.property === 'otp')?.constraints!['isLength'],
      ).toBeTruthy();
    });

    it('should fail when otp is more than 6 characters', async () => {
      const dto = plainToInstance(ResetPasswordDto, {
        otp: '1234567',
        newPassword: 'passwordStrong@123',
        confirmPassword: 'passwordStrong@123',
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'otp')).toBe(true);
      expect(
        errors.find((e) => e.property === 'otp')?.constraints!['isLength'],
      ).toBeTruthy();
    });

    it('should pass when otp has exactly 6 characters', async () => {
      const dto = plainToInstance(ResetPasswordDto, {
        otp: '123456',
        newPassword: 'passwordStrong@123',
        confirmPassword: 'passwordStrong@123',
      });
      const errors = await validate(dto);

      expect(errors.filter((e) => e.property === 'otp')).toHaveLength(0);
    });
  });

  describe('newPassword', () => {
    it('should fail when newPassword is weak', async () => {
      const dto = plainToInstance(ResetPasswordDto, {
        otp: '123456',
        newPassword: '123456',
        confirmPassword: '123456',
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'newPassword')).toBe(true);
      expect(
        errors.find((e) => e.property === 'newPassword')?.constraints![
          'isStrongPassword'
        ],
      ).toBeTruthy();
    });
  });

  describe('confirmPassword', () => {
    it('should fail when confirmPassword does not match newPassword', async () => {
      const dto = plainToInstance(ResetPasswordDto, {
        otp: '123456',
        newPassword: 'passwordStrong@123',
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
    const dto = plainToInstance(ResetPasswordDto, {
      otp: '123456',
      newPassword: 'passwordStrong@123',
      confirmPassword: 'passwordStrong@123',
    });
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
