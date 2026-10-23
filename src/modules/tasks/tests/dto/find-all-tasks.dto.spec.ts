import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { uuidv7 } from 'uuidv7';

import { FindAllTasksDto } from '@modules/tasks/dto';
import { TaskPriority } from '@modules/tasks/enums/task-priority.enum';
import { TaskStatus } from '@modules/tasks/enums/task-status.enum';

describe('FindAllTasksDto', () => {
  it('should pass when all fields are optional', async () => {
    const dto = plainToInstance(FindAllTasksDto, {});
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail when page is less than 1', async () => {
    const dto = plainToInstance(FindAllTasksDto, { page: 0 });
    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'page')).toBe(true);
  });

  it('should fail when priority is invalid', async () => {
    const dto = plainToInstance(FindAllTasksDto, { priority: 99 });
    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'priority')).toBe(true);
  });

  it('should pass when all fields are valid', async () => {
    const dto = plainToInstance(FindAllTasksDto, {
      page: 1,
      limit: 10,
      priority: TaskPriority.HIGH,
      status: TaskStatus.TODO,
      search: 'mock task',
      categoryIds: [uuidv7()],
      dueDateBefore: '2026-12-31',
      dueDateAfter: '2026-01-01',
    });
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
