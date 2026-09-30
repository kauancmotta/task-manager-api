import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { VerifyEmailDto } from '@modules/auth/dto';

describe('VerifyEmailDto', () => {
  describe('token', () => {
    it('should fail when token is not a string', async () => {
      const dto = plainToInstance(VerifyEmailDto, {
        token: 123,
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('token');
      expect(errors[0].constraints!['isString']).toBeTruthy();
    });

    it('should fail when token is empty', async () => {
      const dto = plainToInstance(VerifyEmailDto, {
        token: '',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('token');
      expect(errors[0].constraints!['isNotEmpty']).toBeTruthy();
    });

    it('should pass when token is valid', async () => {
      const dto = plainToInstance(VerifyEmailDto, {
        token: 'mock-valid-refresh-token',
      });
      const errors = await validate(dto);

      expect(errors.filter((e) => e.property === 'token')).toHaveLength(0);
    });
  });

  it('should pass when all fields are valid', async () => {
    const dto = plainToInstance(VerifyEmailDto, {
      token: 'mock-valid-refresh-token',
    });
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
