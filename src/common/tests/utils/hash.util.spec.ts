import { hashPassword, comparePassword } from '@common/utils/hash.util';

describe('hashUtil', () => {
  describe('hashPassword', () => {
    it('should return different hashes for the same password', async () => {
      const password = 'passwordStrong@123';

      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should return a hashed password', async () => {
      const password = 'passwordStrong@123';

      const result = await hashPassword(password);

      expect(result).not.toBe(password);
      expect(result).toHaveLength(60);
    });
  });

  describe('comparePassword', () => {
    it('should return false when password does not match hash', async () => {
      const password = 'passwordStrong@123';
      const wrongPassword = 'wrongPassword@123';
      const hash = await hashPassword(password);

      const result = await comparePassword(wrongPassword, hash);

      expect(result).toBe(false);
    });
  });

  it('should return true when password matches hash', async () => {
    const password = 'passwordStrong@123';
    const hash = await hashPassword(password);

    const result = await comparePassword(password, hash);

    expect(result).toBe(true);
  });
});
