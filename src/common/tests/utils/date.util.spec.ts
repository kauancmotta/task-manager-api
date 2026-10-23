import { calculateExpiresAt } from '@common/utils/date.util';

describe('dateUtil', () => {
  describe('calculateExpiresAt', () => {
    it('should return a future date', () => {
      const now = new Date();
      const result = calculateExpiresAt('30m');

      expect(result.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should return correct expiration for 30 minutes', () => {
      const mockDate = new Date('2026-09-29T22:00:00.000Z');
      vi.setSystemTime(mockDate);

      const result = calculateExpiresAt('30m');

      expect(result).toEqual(new Date('2026-09-29T22:30:00.000Z'));

      vi.useRealTimers();
    });

    it('should return correct expiration for 7 days', () => {
      const mockDate = new Date('2026-09-29T22:00:00.000Z');
      vi.setSystemTime(mockDate);

      const result = calculateExpiresAt('7d');

      expect(result).toEqual(new Date('2026-10-06T22:00:00.000Z'));

      vi.useRealTimers();
    });
  });
});
