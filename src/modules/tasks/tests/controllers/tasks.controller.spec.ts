import { Test } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';

import { createMockLogger } from '@common/testing/mock-logger';
import {
  createMockConfigService,
  createMockTasksService,
} from '@common/testing/mock-services';
import { ConfigService } from '@nestjs/config';
import { TasksController } from '@modules/tasks/controllers/tasks.controller';
import { TasksService } from '@modules/tasks/services/tasks.service';
import {
  createMockCategory,
  createMockJwtPayload,
  createMockPaginatedResponse,
  createMockTask,
} from '@common/testing/mock-entities';
import {
  CreateTaskDto,
  FindAllTasksDto,
  UpdateTaskCategoriesDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
} from '@modules/tasks/dto';
import { TaskPresenter } from '@modules/tasks/presenters';
import { TaskStatus } from '@modules/tasks/enums/task-status.enum';
import { TaskPriority } from '@modules/tasks/enums/task-priority.enum';

describe('TasksController', () => {
  let controller: TasksController;
  let taskService: TasksService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: createMockTasksService(),
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

    controller = moduleRef.get(TasksController);
    taskService = moduleRef.get(TasksService);
  });

  describe('findAll', () => {
    it('should return all tasks without filters', async () => {
      const dto = new FindAllTasksDto();
      dto.page = 1;
      dto.limit = 5;

      const jwtPayload = createMockJwtPayload();
      const mockTasks = [
        createMockTask({ name: 'mock task 1' }),
        createMockTask({ name: 'mock task 2' }),
      ] as unknown as TaskPresenter[];
      const mockPaginatedResponse = createMockPaginatedResponse(mockTasks);

      vi.mocked(taskService.findAll).mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(jwtPayload, dto);

      expect(taskService.findAll).toHaveBeenCalledWith(jwtPayload.sub, dto);
      expect(result).toEqual(mockPaginatedResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should return filtered tasks when filters are provided', async () => {
      const dto = new FindAllTasksDto();
      dto.page = 1;
      dto.limit = 5;
      dto.search = 'mock task 1';
      dto.status = TaskStatus.TODO;
      dto.priority = TaskPriority.HIGH;

      const jwtPayload = createMockJwtPayload();
      const mockTasks = [
        createMockTask({ name: 'mock task 1' }),
      ] as unknown as TaskPresenter[];
      const mockPaginatedResponse = createMockPaginatedResponse(mockTasks);

      vi.mocked(taskService.findAll).mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(jwtPayload, dto);

      expect(taskService.findAll).toHaveBeenCalledWith(jwtPayload.sub, dto);
      expect(result).toEqual(mockPaginatedResponse);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('mock task 1');
    });
  });

  describe('findOne', () => {
    it('should call service.findOne and return task', async () => {
      const jwtPayload = createMockJwtPayload();
      const mockTask = createMockTask({
        createdByUserId: jwtPayload.sub,
      }) as unknown as TaskPresenter;

      vi.mocked(taskService.findOne).mockResolvedValue(mockTask);

      const result = await controller.findOne(jwtPayload, mockTask.id);

      expect(taskService.findOne).toHaveBeenCalledWith({
        userId: jwtPayload.sub,
        taskId: mockTask.id,
      });
      expect(taskService.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTask);
    });
  });

  describe('create', () => {
    it('should call service.create and return task', async () => {
      const jwtPayload = createMockJwtPayload();
      const mockCategories = [
        createMockCategory({ createdByUserId: jwtPayload.sub }),
      ];

      const dto = new CreateTaskDto();
      dto.name = 'mock task';
      dto.description = 'mock description';
      dto.dueDate = new Date();
      dto.priority = TaskPriority.LOW;
      dto.categoryIds = mockCategories.map((category) => category.id);

      const mockTask = createMockTask({
        name: dto.name,
        description: dto.description,
        dueDate: dto.dueDate,
        priority: dto.priority,
        categories: mockCategories,
        createdByUserId: jwtPayload.sub,
      }) as unknown as TaskPresenter;

      vi.mocked(taskService.create).mockResolvedValue(mockTask);

      const result = await controller.create(jwtPayload, dto);

      expect(taskService.create).toHaveBeenCalledWith({
        userId: jwtPayload.sub,
        createTaskDto: dto,
      });
      expect(taskService.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTask);
    });
  });

  describe('update', () => {
    it('should call service.update and return task', async () => {
      const jwtPayload = createMockJwtPayload();

      const dto = new UpdateTaskDto();
      dto.name = 'mock task update';
      dto.description = 'mock description update';
      dto.dueDate = new Date();
      dto.priority = TaskPriority.MODERATE;

      const mockTask = createMockTask({
        name: dto.name,
        description: dto.description,
        dueDate: dto.dueDate,
        priority: dto.priority,
        createdByUserId: jwtPayload.sub,
      }) as unknown as TaskPresenter;

      vi.mocked(taskService.update).mockResolvedValue(mockTask);

      const result = await controller.update(jwtPayload, mockTask.id, dto);

      expect(taskService.update).toHaveBeenCalledWith({
        userId: jwtPayload.sub,
        taskId: mockTask.id,
        updateTaskDto: dto,
      });
      expect(taskService.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTask);
    });
  });

  describe('updateCategories', () => {
    it('should call service.updateCategories and return task', async () => {
      const jwtPayload = createMockJwtPayload();
      const mockCategories = [
        createMockCategory({ createdByUserId: jwtPayload.sub }),
      ];

      const dto = new UpdateTaskCategoriesDto();
      dto.categoryIds = mockCategories.map((category) => category.id);

      const mockTask = createMockTask({
        categories: mockCategories,
        createdByUserId: jwtPayload.sub,
      }) as unknown as TaskPresenter;

      vi.mocked(taskService.updateCategories).mockResolvedValue(mockTask);

      const result = await controller.updateCategories(
        jwtPayload,
        mockTask.id,
        dto,
      );

      expect(taskService.updateCategories).toHaveBeenCalledWith({
        userId: jwtPayload.sub,
        taskId: mockTask.id,
        updateTaskCategoriesDto: dto,
      });
      expect(taskService.updateCategories).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTask);
    });
  });

  describe('updateStatus', () => {
    it('should call service.updateStatus and return task', async () => {
      const dto = new UpdateTaskStatusDto();
      dto.status = TaskStatus.IN_PROGRESS;

      const jwtPayload = createMockJwtPayload();
      const mockTask = createMockTask({
        status: dto.status,
        createdByUserId: jwtPayload.sub,
      }) as unknown as TaskPresenter;

      vi.mocked(taskService.updateStatus).mockResolvedValue(mockTask);

      const result = await controller.updateStatus(
        jwtPayload,
        mockTask.id,
        dto,
      );

      expect(taskService.updateStatus).toHaveBeenCalledWith({
        userId: jwtPayload.sub,
        taskId: mockTask.id,
        updateTaskStatusDto: dto,
      });
      expect(taskService.updateStatus).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTask);
    });
  });

  describe('remove', () => {
    it('should call service.remove and return void', async () => {
      const jwtPayload = createMockJwtPayload();
      const mockTask = createMockTask({ createdByUserId: jwtPayload.sub });

      vi.mocked(taskService.remove).mockResolvedValue(undefined);

      const result = await controller.remove(jwtPayload, mockTask.id);

      expect(taskService.remove).toHaveBeenCalledWith({
        userId: jwtPayload.sub,
        taskId: mockTask.id,
      });
      expect(taskService.remove).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });

  describe('removeTaskCategory', () => {
    it('should call service.removeTaskCategory and return void', async () => {
      const jwtPayload = createMockJwtPayload();
      const mockCategory = createMockCategory({
        createdByUserId: jwtPayload.sub,
      });
      const mockTask = createMockTask({ createdByUserId: jwtPayload.sub });

      vi.mocked(taskService.removeTaskCategory).mockResolvedValue(undefined);

      const result = await controller.removeTaskCategory(
        jwtPayload,
        mockTask.id,
        mockCategory.id,
      );

      expect(taskService.removeTaskCategory).toHaveBeenCalledWith({
        userId: jwtPayload.sub,
        taskId: mockTask.id,
        categoryId: mockCategory.id,
      });
      expect(taskService.removeTaskCategory).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });
});
