import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ChangePasswordDto } from '@modules/users/dto';

describe('ChangePasswordDto', () => {
  describe('password', () => {
    it('should fail when password is not a string', async () => {
      const dto = plainToInstance(ChangePasswordDto, {
        password: 123,
        newPassword: 'newPasswordStrong@123',
        confirmPassword: 'newPasswordStrong@123',
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'password')).toBe(true);
      expect(
        errors.find((e) => e.property === 'password')?.constraints!['isString'],
      ).toBeTruthy();
    });

    it('should fail when password is empty', async () => {
      const dto = plainToInstance(ChangePasswordDto, {
        password: '',
        newPassword: 'newPasswordStrong@123',
        confirmPassword: 'newPasswordStrong@123',
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'password')).toBe(true);
      expect(
        errors.find((e) => e.property === 'password')?.constraints![
          'isNotEmpty'
        ],
      ).toBeTruthy();
    });
  });

  describe('newPassword', () => {
    it('should fail when newPassword is weak', async () => {
      const dto = plainToInstance(ChangePasswordDto, {
        password: 'currentPassword',
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

    it('should trim newPassword whitespace', () => {
      const dto = plainToInstance(ChangePasswordDto, {
        password: 'currentPassword',
        newPassword: '  newPasswordStrong@123  ',
        confirmPassword: 'newPasswordStrong@123',
      });

      expect(dto.newPassword).toBe('newPasswordStrong@123');
    });
  });

  describe('confirmPassword', () => {
    it('should fail when confirmPassword does not match newPassword', async () => {
      const dto = plainToInstance(ChangePasswordDto, {
        password: 'currentPassword',
        newPassword: 'newPasswordStrong@123',
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
    const dto = plainToInstance(ChangePasswordDto, {
      password: 'currentPassword',
      newPassword: 'newPasswordStrong@123',
      confirmPassword: 'newPasswordStrong@123',
    });
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
