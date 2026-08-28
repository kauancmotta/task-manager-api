import { UpdateResult, DeleteResult } from 'typeorm';

export const createMockUpdateResult = (affected = 1): UpdateResult => ({
  affected,
  raw: [],
  generatedMaps: [],
});

export const createMockDeleteResult = (affected = 1): DeleteResult => ({
  affected,
  raw: [],
});
