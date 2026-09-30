import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { LogoutDto } from '@modules/auth/dto';

describe('LogoutDto', () => {
  describe('refreshToken', () => {
    it('should fail when refreshToken is not a string', async () => {
      const dto = plainToInstance(LogoutDto, {
        refreshToken: 123,
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('refreshToken');
      expect(errors[0].constraints!['isString']).toBeTruthy();
    });

    it('should fail when refreshToken is empty', async () => {
      const dto = plainToInstance(LogoutDto, {
        refreshToken: '',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('refreshToken');
      expect(errors[0].constraints!['isNotEmpty']).toBeTruthy();
    });

    it('should pass when refreshToken is valid', async () => {
      const dto = plainToInstance(LogoutDto, {
        refreshToken: 'mock-valid-refresh-token',
      });
      const errors = await validate(dto);

      expect(errors.filter((e) => e.property === 'refreshToken')).toHaveLength(
        0,
      );
    });
  });

  it('should pass when all fields are valid', async () => {
    const dto = plainToInstance(LogoutDto, {
      refreshToken: 'mock-valid-refresh-token',
    });
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
