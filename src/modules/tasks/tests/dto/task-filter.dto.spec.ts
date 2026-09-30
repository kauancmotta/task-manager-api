import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { uuidv7 } from 'uuidv7';

import { TaskFilterDto } from '@modules/tasks/dto';
import { TaskPriority } from '@modules/tasks/enums/task-priority.enum';
import { TaskStatus } from '@modules/tasks/enums/task-status.enum';

describe('TaskFilterDto', () => {
  describe('priority', () => {
    it('should fail when priority is invalid', async () => {
      const dto = plainToInstance(TaskFilterDto, { priority: 99 });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'priority')).toBe(true);
      expect(
        errors.find((e) => e.property === 'priority')?.constraints!['isEnum'],
      ).toBeTruthy();
    });

    it('should pass when priority is optional', async () => {
      const dto = plainToInstance(TaskFilterDto, {});
      const errors = await validate(dto);

      expect(errors.filter((e) => e.property === 'priority')).toHaveLength(0);
    });
  });

  describe('status', () => {
    it('should fail when status is invalid', async () => {
      const dto = plainToInstance(TaskFilterDto, { status: 'invalid-status' });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'status')).toBe(true);
      expect(
        errors.find((e) => e.property === 'status')?.constraints!['isEnum'],
      ).toBeTruthy();
    });

    it('should pass when status is optional', async () => {
      const dto = plainToInstance(TaskFilterDto, {});
      const errors = await validate(dto);

      expect(errors.filter((e) => e.property === 'status')).toHaveLength(0);
    });
  });

  describe('dueDateBefore', () => {
    it('should fail when dueDateBefore is not a date string', async () => {
      const dto = plainToInstance(TaskFilterDto, {
        dueDateBefore: 'invalid-date',
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'dueDateBefore')).toBe(true);
      expect(
        errors.find((e) => e.property === 'dueDateBefore')?.constraints![
          'isDateString'
        ],
      ).toBeTruthy();
    });

    it('should pass when dueDateBefore is a valid date string', async () => {
      const dto = plainToInstance(TaskFilterDto, {
        dueDateBefore: '2026-12-31',
      });
      const errors = await validate(dto);

      expect(errors.filter((e) => e.property === 'dueDateBefore')).toHaveLength(
        0,
      );
    });
  });

  describe('dueDateAfter', () => {
    it('should fail when dueDateAfter is not a date string', async () => {
      const dto = plainToInstance(TaskFilterDto, {
        dueDateAfter: 'invalid-date',
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'dueDateAfter')).toBe(true);
      expect(
        errors.find((e) => e.property === 'dueDateAfter')?.constraints![
          'isDateString'
        ],
      ).toBeTruthy();
    });

    it('should pass when dueDateAfter is optional', async () => {
      const dto = plainToInstance(TaskFilterDto, {});
      const errors = await validate(dto);

      expect(errors.filter((e) => e.property === 'dueDateAfter')).toHaveLength(
        0,
      );
    });
  });

  describe('categoryIds', () => {
    it('should fail when categoryIds contains invalid UUID', async () => {
      const dto = plainToInstance(TaskFilterDto, {
        categoryIds: ['invalid-uuid'],
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'categoryIds')).toBe(true);
    });

    it('should pass when categoryIds is optional', async () => {
      const dto = plainToInstance(TaskFilterDto, {});
      const errors = await validate(dto);

      expect(errors.filter((e) => e.property === 'categoryIds')).toHaveLength(
        0,
      );
    });

    it('should pass when categoryIds has valid UUIDs', async () => {
      const dto = plainToInstance(TaskFilterDto, { categoryIds: [uuidv7()] });
      const errors = await validate(dto);

      expect(errors.filter((e) => e.property === 'categoryIds')).toHaveLength(
        0,
      );
    });
  });

  describe('search', () => {
    it('should fail when search is not a string', async () => {
      const dto = plainToInstance(TaskFilterDto, { search: 123 });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'search')).toBe(true);
      expect(
        errors.find((e) => e.property === 'search')?.constraints!['isString'],
      ).toBeTruthy();
    });

    it('should pass when search is optional', async () => {
      const dto = plainToInstance(TaskFilterDto, {});
      const errors = await validate(dto);

      expect(errors.filter((e) => e.property === 'search')).toHaveLength(0);
    });
  });

  it('should pass when all filters are valid', async () => {
    const dto = plainToInstance(TaskFilterDto, {
      priority: TaskPriority.HIGH,
      status: TaskStatus.TODO,
      dueDateBefore: '2026-12-31',
      dueDateAfter: '2026-01-01',
      categoryIds: [uuidv7()],
      search: 'mock task',
    });
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
