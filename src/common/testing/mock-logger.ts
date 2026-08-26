import { Logger } from 'nestjs-pino';

export const createMockLogger = (): Partial<Record<keyof Logger, jest.Mock>> => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
});