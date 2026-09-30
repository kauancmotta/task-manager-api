import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
import { uuidv7 } from 'uuidv7';

import {
  createMockRepository,
  MockRepository,
} from '@common/testing/mock-repository';
import { TaskAssigneesController } from '@modules/tasks/controllers/task-assignees.controller';
import { TaskAssignee } from '@modules/tasks/entities/task-assignee.entity';
import { TaskAssigneesService } from '@modules/tasks/services/task-assignees.service';
import { createMockLogger } from '@common/testing/mock-logger';
import { createMockConfigService } from '@common/testing/mock-services';
import {
  createMockJwtPayload,
  createMockTaskAssignee,
} from '@common/testing/mock-entities';
import { Task } from '@modules/tasks/entities/task.entity';
import { AppException } from '@common/exceptions/app.exception';
import { ErrorCodes } from '@common/enums/error-codes.enum';
import { HttpStatus } from '@nestjs/common';
import { createMockDeleteResult } from '@common/testing/mock-typeorm';

describe('TaskAssigneesService', () => {
  let service: TaskAssigneesService;
  let taskAssigneeRepository: MockRepository<TaskAssignee>;
  let taskRepository: MockRepository<Task>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TaskAssigneesController],
      providers: [
        TaskAssigneesService,
        {
          provide: Logger,
          useValue: createMockLogger(),
        },
        {
          provide: getRepositoryToken(TaskAssignee),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Task),
          useValue: createMockRepository(),
        },
        {
          provide: ConfigService,
          useValue: createMockConfigService(),
        },
      ],
    }).compile();

    service = moduleRef.get(TaskAssigneesService);
    taskAssigneeRepository = moduleRef.get(getRepositoryToken(TaskAssignee));
    taskRepository = moduleRef.get(getRepositoryToken(Task));
  });

  describe('findAll', () => {
    it('should return task assignees', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockTaskId = uuidv7();
      const mockTaskAssignees = [
        createMockTaskAssignee({
          userId: mockJwtPayload.sub,
          taskId: mockTaskId,
        }),
      ];

      vi.mocked(taskAssigneeRepository.find!).mockResolvedValue(
        mockTaskAssignees,
      );

      const result = await service.findAll({
        userId: mockJwtPayload.sub,
        taskId: mockTaskId,
      });

      expect(taskAssigneeRepository.find).toHaveBeenCalledWith({
        where: {
          taskId: mockTaskId,
          userId: mockJwtPayload.sub,
        },
      });
      expect(result).toEqual(mockTaskAssignees);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when task assignee not found', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockTaskId = uuidv7();
      const mockTaskAssigneeId = uuidv7();

      vi.mocked(taskAssigneeRepository.findOne!).mockResolvedValue(null);

      await expect(
        service.findOne({
          userId: mockJwtPayload.sub,
          taskId: mockTaskId,
          assigneeId: mockTaskAssigneeId,
        }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.TASK_ASSIGNEE_NOT_FOUND,
          'Task Assignee not found',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should return task assignee when task assignee found', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockTaskId = uuidv7();
      const mockTaskAssignee = createMockTaskAssignee({
        userId: mockJwtPayload.sub,
      });

      vi.mocked(taskAssigneeRepository.findOne!).mockResolvedValue(
        mockTaskAssignee,
      );

      const result = await service.findOne({
        userId: mockJwtPayload.sub,
        taskId: mockTaskId,
        assigneeId: mockTaskAssignee.id,
      });

      expect(taskAssigneeRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: mockJwtPayload.sub,
          taskId: mockTaskId,
          id: mockTaskAssignee.id,
        },
      });
      expect(result).toEqual(mockTaskAssignee);
    });
  });

  describe('create', () => {
    it('should throw NotFoundException when task not found', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockTaskId = uuidv7();

      vi.mocked(taskRepository.exists!).mockResolvedValue(false);

      await expect(
        service.create({ userId: mockJwtPayload.sub, taskId: mockTaskId }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.TASK_NOT_FOUND,
          'Task not found',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(taskAssigneeRepository.create).not.toHaveBeenCalled();
      expect(taskAssigneeRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when user is already assigned to this task', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockTaskId = uuidv7();

      vi.mocked(taskRepository.exists!).mockResolvedValue(true);
      vi.mocked(taskAssigneeRepository.exists!).mockResolvedValue(true);

      await expect(
        service.create({ userId: mockJwtPayload.sub, taskId: mockTaskId }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.TASK_ASSIGNEE_ALREADY_EXISTS,
          'User is already assigned to this task',
          HttpStatus.CONFLICT,
        ),
      );
      expect(taskAssigneeRepository.create).not.toHaveBeenCalled();
      expect(taskAssigneeRepository.save).not.toHaveBeenCalled();
    });

    it('should assign user to task successfully', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockTaskId = uuidv7();
      const mockTaskAssignee = createMockTaskAssignee({
        userId: mockJwtPayload.sub,
        taskId: mockTaskId,
      });

      vi.mocked(taskRepository.exists!).mockResolvedValue(true);
      vi.mocked(taskAssigneeRepository.exists!).mockResolvedValue(false);
      vi.mocked(taskAssigneeRepository.create!).mockReturnValue(
        mockTaskAssignee,
      );
      vi.mocked(taskAssigneeRepository.save!).mockResolvedValue(
        mockTaskAssignee,
      );

      const result = await service.create({
        userId: mockJwtPayload.sub,
        taskId: mockTaskId,
      });

      expect(taskRepository.exists!).toHaveBeenCalledWith({
        where: {
          createdByUserId: mockJwtPayload.sub,
          id: mockTaskId,
        },
      });
      expect(taskAssigneeRepository.exists!).toHaveBeenCalledWith({
        where: {
          userId: mockJwtPayload.sub,
          taskId: mockTaskId,
        },
      });
      expect(taskAssigneeRepository.create!).toHaveBeenCalledWith({
        userId: mockJwtPayload.sub,
        taskId: mockTaskId,
      });
      expect(taskAssigneeRepository.save!).toHaveBeenCalledWith(
        mockTaskAssignee,
      );
      expect(result).toEqual(mockTaskAssignee);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException when task assignee not found', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockTaskId = uuidv7();
      const mockTaskAssigneeId = uuidv7();

      const mockDeleteResult = createMockDeleteResult(0);

      vi.mocked(taskAssigneeRepository.softDelete!).mockResolvedValue(
        mockDeleteResult,
      );

      await expect(
        service.remove({
          userId: mockJwtPayload.sub,
          taskId: mockTaskId,
          assigneeId: mockTaskAssigneeId,
        }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.TASK_ASSIGNEE_NOT_FOUND,
          'Task Assignee not found',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(taskAssigneeRepository.softDelete).toHaveBeenCalledWith({
        id: mockTaskAssigneeId,
        userId: mockJwtPayload.sub,
        taskId: mockTaskId,
      });
    });

    it('should unassign user from task successfully', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockTaskId = uuidv7();
      const mockTaskAssigneeId = uuidv7();

      const mockDeleteResult = createMockDeleteResult(1);

      vi.mocked(taskAssigneeRepository.softDelete!).mockResolvedValue(
        mockDeleteResult,
      );

      const result = await service.remove({
        userId: mockJwtPayload.sub,
        taskId: mockTaskId,
        assigneeId: mockTaskAssigneeId,
      });

      expect(taskAssigneeRepository.softDelete).toHaveBeenCalledWith({
        id: mockTaskAssigneeId,
        userId: mockJwtPayload.sub,
        taskId: mockTaskId,
      });
      expect(result).toBeUndefined();
    });
  });
});
