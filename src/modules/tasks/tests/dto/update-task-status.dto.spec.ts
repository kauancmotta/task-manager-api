import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateTaskStatusDto } from '@modules/tasks/dto';
import { TaskStatus } from '@modules/tasks/enums/task-status.enum';

describe('UpdateTaskStatusDto', () => {
  describe('status', () => {
    it('should fail when status is invalid', async () => {
      const dto = plainToInstance(UpdateTaskStatusDto, {
        status: 'invalid-status',
      });
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'status')).toBe(true);
      expect(
        errors.find((e) => e.property === 'status')?.constraints!['isEnum'],
      ).toBeTruthy();
    });

    it('should fail when status is missing', async () => {
      const dto = plainToInstance(UpdateTaskStatusDto, {});
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'status')).toBe(true);
    });

    it('should pass when status is valid', async () => {
      const dto = plainToInstance(UpdateTaskStatusDto, {
        status: TaskStatus.IN_PROGRESS,
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should pass for each valid status value', async () => {
      for (const status of Object.values(TaskStatus)) {
        const dto = plainToInstance(UpdateTaskStatusDto, { status });
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
      }
    });
  });
});
