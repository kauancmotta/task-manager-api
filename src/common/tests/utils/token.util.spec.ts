import {
  generateToken,
  hashToken,
  generateOTP,
} from '@common/utils/token.util';

describe('tokenUtil', () => {
  describe('generateToken', () => {
    it('should return different tokens on each call', () => {
      const token1 = generateToken();
      const token2 = generateToken();

      expect(token1).not.toBe(token2);
    });

    it('should return a token string', () => {
      const result = generateToken();

      expect(result).toBeTypeOf('string');
      expect(result).toHaveLength(64);
    });
  });

  describe('hashToken', () => {
    it('should return the same hash for the same token', () => {
      const token = 'mock-token';

      const hash1 = hashToken(token);
      const hash2 = hashToken(token);

      expect(hash1).toBe(hash2);
    });

    it('should return a hashed token', () => {
      const token = 'mock-token';

      const result = hashToken(token);

      expect(result).not.toBe(token);
      expect(result).toHaveLength(64);
    });
  });

  describe('generateOTP', () => {
    it('should return different OTPs on each call', () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();

      expect(otp1).not.toBe(otp2);
    });

    it('should return a 6 digit numeric string', () => {
      const result = generateOTP();

      expect(result).toHaveLength(6);
      expect(result).toMatch(/^\d{6}$/);
    });
  });
});
