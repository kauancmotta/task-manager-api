import { Mock } from 'vitest';
import { Logger } from 'nestjs-pino';

export const createMockLogger = (): Partial<Record<keyof Logger, Mock>> => ({
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  verbose: vi.fn(),
});