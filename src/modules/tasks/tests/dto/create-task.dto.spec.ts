import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { uuidv7 } from 'uuidv7';

import { CreateTaskDto } from '@modules/tasks/dto';
import { TaskPriority } from '@modules/tasks/enums/task-priority.enum';

describe('CreateTaskDto', () => {
  describe('name', () => {
    it('should fail when name is not a string', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        name: 123,
        categoryIds: [uuidv7()],
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'name')).toBe(true);
      expect(
        errors.find((e) => e.property === 'name')?.constraints!['isString'],
      ).toBeTruthy();
    });

    it('should fail when name is empty', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        name: '',
        categoryIds: [uuidv7()],
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'name')).toBe(true);
      expect(
        errors.find((e) => e.property === 'name')?.constraints!['isNotEmpty'],
      ).toBeTruthy();
    });
  });

  describe('description', () => {
    it('should fail when description is not a string', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        name: 'Mock Task',
        description: 123,
        categoryIds: [uuidv7()],
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'description')).toBe(true);
    });

    it('should pass when description is optional', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        name: 'Mock Task',
        categoryIds: [uuidv7()],
      });
      const errors = await validate(dto);

      expect(errors.filter((e) => e.property === 'description')).toHaveLength(
        0,
      );
    });
  });

  describe('priority', () => {
    it('should fail when priority is invalid', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        name: 'Mock Task',
        categoryIds: [uuidv7()],
        priority: 99,
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'priority')).toBe(true);
      expect(
        errors.find((e) => e.property === 'priority')?.constraints!['isEnum'],
      ).toBeTruthy();
    });

    it('should pass when priority is optional', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        name: 'Mock Task',
        categoryIds: [uuidv7()],
      });
      const errors = await validate(dto);

      expect(errors.filter((e) => e.property === 'priority')).toHaveLength(0);
    });
  });

  describe('categoryIds', () => {
    it('should fail when categoryIds is empty array', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        name: 'Mock Task',
        categoryIds: [],
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'categoryIds')).toBe(true);
      expect(
        errors.find((e) => e.property === 'categoryIds')?.constraints![
          'arrayMinSize'
        ],
      ).toBeTruthy();
    });

    it('should fail when categoryIds contains invalid UUID', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        name: 'Mock Task',
        categoryIds: ['invalid-uuid'],
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'categoryIds')).toBe(true);
      expect(
        errors.find((e) => e.property === 'categoryIds')?.constraints![
          'isUuid'
        ],
      ).toBeTruthy();
    });

    it('should pass when categoryIds has valid UUIDs', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        name: 'Mock Task',
        categoryIds: [uuidv7()],
      });
      const errors = await validate(dto);

      expect(errors.filter((e) => e.property === 'categoryIds')).toHaveLength(
        0,
      );
    });
  });

  describe('dueDate', () => {
    it('should fail when dueDate is in the past', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        name: 'Mock Task',
        categoryIds: [uuidv7()],
        dueDate: new Date('2020-01-01'),
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'dueDate')).toBe(true);
      expect(
        errors.find((e) => e.property === 'dueDate')?.constraints!['minDate'],
      ).toBeTruthy();
    });

    it('should pass when dueDate is optional', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        name: 'Mock Task',
        categoryIds: [uuidv7()],
      });
      const errors = await validate(dto);

      expect(errors.filter((e) => e.property === 'dueDate')).toHaveLength(0);
    });
  });

  it('should pass when all required fields are valid', async () => {
    const TOMORROW_MILLI_SECONDS = 86400000;

    const dto = plainToInstance(CreateTaskDto, {
      name: 'Mock Task',
      categoryIds: [uuidv7()],
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() + TOMORROW_MILLI_SECONDS),
    });
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
