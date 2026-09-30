import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateTaskDto } from '@modules/tasks/dto';
import { TaskPriority } from '@modules/tasks/enums/task-priority.enum';

describe('UpdateTaskDto', () => {
  it('should pass when all fields are optional', async () => {
    const dto = plainToInstance(UpdateTaskDto, {});
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  describe('name', () => {
    it('should fail when name is not a string', async () => {
      const dto = plainToInstance(UpdateTaskDto, { name: 123 });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'name')).toBe(true);
      expect(
        errors.find((e) => e.property === 'name')?.constraints!['isString'],
      ).toBeTruthy();
    });

    it('should fail when name is empty', async () => {
      const dto = plainToInstance(UpdateTaskDto, { name: '' });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'name')).toBe(true);
      expect(
        errors.find((e) => e.property === 'name')?.constraints!['isNotEmpty'],
      ).toBeTruthy();
    });
  });

  describe('priority', () => {
    it('should fail when priority is invalid', async () => {
      const dto = plainToInstance(UpdateTaskDto, { priority: 99 });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'priority')).toBe(true);
      expect(
        errors.find((e) => e.property === 'priority')?.constraints!['isEnum'],
      ).toBeTruthy();
    });

    it('should pass when priority is valid', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        priority: TaskPriority.HIGH,
      });
      const errors = await validate(dto);

      expect(errors.filter((e) => e.property === 'priority')).toHaveLength(0);
    });
  });

  describe('dueDate', () => {
    it('should fail when dueDate is in the past', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        dueDate: new Date('2020-01-01'),
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'dueDate')).toBe(true);
      expect(
        errors.find((e) => e.property === 'dueDate')?.constraints!['minDate'],
      ).toBeTruthy();
    });

    it('should pass when dueDate is in the future', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        dueDate: new Date(Date.now() + 86400000),
      });
      const errors = await validate(dto);

      expect(errors.filter((e) => e.property === 'dueDate')).toHaveLength(0);
    });
  });

  it('should not have categoryIds field', async () => {
    const dto = plainToInstance(UpdateTaskDto, {
      categoryIds: ['invalid-uuid'],
    });
    const errors = await validate(dto);

    expect(errors.filter((e) => e.property === 'categoryIds')).toHaveLength(0);
  });
});
