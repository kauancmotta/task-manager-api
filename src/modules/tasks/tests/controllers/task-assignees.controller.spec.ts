import { Test } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';

import { createMockLogger } from '@common/testing/mock-logger';
import {
  createMockConfigService,
  createMockTaskAssigneeService,
} from '@common/testing/mock-services';
import { ConfigService } from '@nestjs/config';
import { TaskAssigneesController } from '@modules/tasks/controllers/task-assignees.controller';
import { TaskAssigneesService } from '@modules/tasks/services/task-assignees.service';
import {
  createMockJwtPayload,
  createMockTask,
  createMockTaskAssignee,
} from '@common/testing/mock-entities';

describe('TaskAssigneesController', () => {
  let controller: TaskAssigneesController;
  let taskAssigneeService: TaskAssigneesService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TaskAssigneesController],
      providers: [
        {
          provide: TaskAssigneesService,
          useValue: createMockTaskAssigneeService(),
        },
        {
          provide: ConfigService,
          useValue: createMockConfigService(),
        },
        {
          provide: Logger,
          useValue: createMockLogger(),
        },
      ],
    }).compile();

    controller = moduleRef.get(TaskAssigneesController);
    taskAssigneeService = moduleRef.get(TaskAssigneesService);
  });

  describe('findAll', () => {
    it('should call service.findAll return task assignees', async () => {
      const jwtPayload = createMockJwtPayload();
      const mockTask = createMockTask({ createdByUserId: jwtPayload.sub });
      const mockTaskAssignees = [
        createMockTaskAssignee({
          taskId: mockTask.id,
          userId: jwtPayload.sub,
        }),
      ];

      vi.mocked(taskAssigneeService.findAll).mockResolvedValue(
        mockTaskAssignees,
      );

      const result = await controller.findAll(jwtPayload, mockTask.id);

      expect(result).toEqual(mockTaskAssignees);
      expect(taskAssigneeService.findAll).toHaveBeenCalledWith({
        userId: jwtPayload.sub,
        taskId: mockTask.id,
      });
      expect(taskAssigneeService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne return task assignee', async () => {
      const jwtPayload = createMockJwtPayload();
      const mockTask = createMockTask();
      const mockTaskAssignee = createMockTaskAssignee({
        taskId: mockTask.id,
        userId: jwtPayload.sub,
      });

      vi.mocked(taskAssigneeService.findOne).mockResolvedValue(
        mockTaskAssignee,
      );

      const result = await controller.findOne(
        jwtPayload,
        mockTask.id,
        mockTaskAssignee.id,
      );

      expect(result).toEqual(mockTaskAssignee);
      expect(taskAssigneeService.findOne).toHaveBeenCalledWith({
        userId: jwtPayload.sub,
        taskId: mockTask.id,
        assigneeId: mockTaskAssignee.id,
      });
      expect(taskAssigneeService.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should call service.create return task assignee', async () => {
      const jwtPayload = createMockJwtPayload();
      const mockTask = createMockTask();
      const mockTaskAssignee = createMockTaskAssignee({
        taskId: mockTask.id,
        userId: jwtPayload.sub,
      });

      vi.mocked(taskAssigneeService.create).mockResolvedValue(mockTaskAssignee);

      const result = await controller.create(jwtPayload, mockTask.id);

      expect(result).toEqual(mockTaskAssignee);
      expect(taskAssigneeService.create).toHaveBeenCalledWith({
        userId: jwtPayload.sub,
        taskId: mockTask.id,
      });
      expect(taskAssigneeService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should call service.remove return void', async () => {
      const jwtPayload = createMockJwtPayload();
      const mockTask = createMockTask();
      const mockTaskAssignee = createMockTaskAssignee({
        taskId: mockTask.id,
        userId: jwtPayload.sub,
      });

      vi.mocked(taskAssigneeService.remove).mockResolvedValue(undefined);

      const result = await controller.remove(
        jwtPayload,
        mockTask.id,
        mockTaskAssignee.id,
      );

      expect(result).toEqual(undefined);
      expect(taskAssigneeService.remove).toHaveBeenCalledWith({
        userId: jwtPayload.sub,
        taskId: mockTask.id,
        assigneeId: mockTaskAssignee.id,
      });
      expect(taskAssigneeService.remove).toHaveBeenCalledTimes(1);
    });
  });
});
