import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

import { TasksController } from '@modules/tasks/controllers/tasks.controller';
import { TasksService } from '@modules/tasks/services/tasks.service';
import { Task } from '@modules/tasks/entities/task.entity';
import {
  createMockRepository,
  MockRepository,
} from '@common/testing/mock-repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMockLogger } from '@common/testing/mock-logger';
import {
  createMockConfigService,
  createMockMailService,
  createMockStorageService,
} from '@common/testing/mock-services';
import { MailService } from '@common/mail/services/mail.service';
import { TaskPresenter } from '@modules/tasks/presenters';
import {
  createMockCategory,
  createMockJwtPayload,
  createMockPaginatedResponse,
  createMockTask,
} from '@common/testing/mock-entities';
import {
  createMockDeleteResult,
  createMockQueryBuilder,
  createMockUpdateResult,
} from '@common/testing/mock-typeorm';
import { Category } from '@modules/categories/entities/categories.entity';
import {
  CreateTaskDto,
  FindAllTasksDto,
  UpdateTaskCategoriesDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
} from '@modules/tasks/dto';
import { TaskStatus } from '@modules/tasks/enums/task-status.enum';
import { TaskPriority } from '@modules/tasks/enums/task-priority.enum';
import { AppException } from '@common/exceptions/app.exception';
import { ErrorCodes } from '@common/enums/error-codes.enum';
import { HttpStatus } from '@nestjs/common';
import { uuidv7 } from 'uuidv7';
import { In } from 'typeorm';

describe('TasksService', () => {
  let service: TasksService;
  let taskRepository: MockRepository<Task>;
  let categoryRepository: MockRepository<Category>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        TasksService,
        {
          provide: Logger,
          useValue: createMockLogger(),
        },
        {
          provide: getRepositoryToken(Task),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Category),
          useValue: createMockRepository(),
        },
        {
          provide: ConfigService,
          useValue: createMockConfigService(),
        },
        {
          provide: MailService,
          useValue: createMockMailService(),
        },
        {
          provide: 'STORAGE_SERVICE',
          useValue: createMockStorageService(),
        },
      ],
    }).compile();

    service = moduleRef.get(TasksService);
    taskRepository = moduleRef.get(getRepositoryToken(Task));
    categoryRepository = moduleRef.get(getRepositoryToken(Category));
  });

  describe('findAll', () => {
    it('should return paginated tasks without filters', async () => {
      const dto = new FindAllTasksDto();
      dto.page = 1;
      dto.limit = 10;
      dto.search = undefined;
      dto.categoryIds = undefined;
      dto.dueDateBefore = undefined;
      dto.dueDateAfter = undefined;
      dto.priority = undefined;
      dto.status = undefined;

      const mockJwtPayload = createMockJwtPayload();
      const mockQueryBuilder = createMockQueryBuilder();
      const mockTasks = [
        createMockTask({
          name: 'mock task 1',
          createdByUserId: mockJwtPayload.sub,
        }),
        createMockTask({
          name: 'mock task 2',
          createdByUserId: mockJwtPayload.sub,
        }),
      ] as unknown as TaskPresenter[];

      vi.mocked(taskRepository.createQueryBuilder!).mockReturnValue(
        mockQueryBuilder,
      );
      vi.mocked(mockQueryBuilder.getManyAndCount).mockResolvedValue([
        mockTasks,
        mockTasks.length,
      ]);

      const mockPaginatedResponse = createMockPaginatedResponse(mockTasks);

      const result = await service.findAll(mockJwtPayload.sub, dto);

      expect(taskRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should return paginated tasks with filters', async () => {
      const dto = new FindAllTasksDto();
      dto.page = 1;
      dto.limit = 10;
      dto.search = 'mock task 1';
      dto.status = TaskStatus.TODO;
      dto.priority = TaskPriority.HIGH;

      const mockJwtPayload = createMockJwtPayload();
      const mockQueryBuilder = createMockQueryBuilder();
      const mockTasks = [
        createMockTask({
          name: 'mock task 1',
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
          createdByUserId: mockJwtPayload.sub,
        }),
      ] as unknown as TaskPresenter[];

      vi.mocked(taskRepository.createQueryBuilder!).mockReturnValue(
        mockQueryBuilder,
      );
      vi.mocked(mockQueryBuilder.getManyAndCount).mockResolvedValue([
        mockTasks,
        mockTasks.length,
      ]);

      const mockPaginatedResponse = createMockPaginatedResponse(mockTasks);

      const result = await service.findAll(mockJwtPayload.sub, dto);

      expect(taskRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when task not found', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockTaskId = uuidv7();

      vi.mocked(taskRepository.findOne!).mockResolvedValue(null);

      await expect(
        service.findOne({
          userId: mockJwtPayload.sub,
          taskId: mockTaskId,
        }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.TASK_NOT_FOUND,
          'Task not found',
          HttpStatus.NOT_FOUND,
        ),
      );

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTaskId, createdByUserId: mockJwtPayload.sub },
        relations: { categories: true },
      });
    });

    it('should return task when task exists and belongs to user', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockCategory = createMockCategory({
        createdByUserId: mockJwtPayload.sub,
      });
      const mockTask = createMockTask({
        createdByUserId: mockJwtPayload.sub,
        categories: [mockCategory],
      });

      vi.mocked(taskRepository.findOne!).mockResolvedValue(mockTask);

      const result = await service.findOne({
        userId: mockJwtPayload.sub,
        taskId: mockTask.id,
      });

      expect(result).toEqual(mockTask);
      expect(taskRepository.findOne!).toHaveBeenCalledWith({
        where: { id: mockTask.id, createdByUserId: mockJwtPayload.sub },
        relations: { categories: true },
      });
    });
  });

  describe('create', () => {
    it('should throw NotFoundException when one or more categories not found', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockCategories = [
        createMockCategory({
          name: 'mock category 1',
          createdByUserId: mockJwtPayload.sub,
        }),
        createMockCategory({
          name: 'mock category 2',
          createdByUserId: mockJwtPayload.sub,
        }),
      ];

      const dto = new CreateTaskDto();
      dto.name = 'mock task';
      dto.description = 'mock description';
      dto.dueDate = undefined;
      dto.priority = TaskPriority.LOW;
      dto.categoryIds = mockCategories.map((category) => category.id);

      vi.mocked(categoryRepository.findBy!).mockResolvedValue([]);

      await expect(
        service.create({ userId: mockJwtPayload.sub, createTaskDto: dto }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.TASK_INVALID_CATEGORY,
          'One or more categories not found',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(taskRepository.create).not.toHaveBeenCalled();
      expect(taskRepository.save).not.toHaveBeenCalled();
      expect(taskRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when task not found', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockCategories = [
        createMockCategory({
          name: 'mock category 1',
          createdByUserId: mockJwtPayload.sub,
        }),
        createMockCategory({
          name: 'mock category 2',
          createdByUserId: mockJwtPayload.sub,
        }),
      ];
      const categoryIds = mockCategories.map((category) => category.id);

      const dto = new CreateTaskDto();
      dto.name = 'mock task';
      dto.description = 'mock description';
      dto.dueDate = undefined;
      dto.priority = TaskPriority.LOW;
      dto.categoryIds = categoryIds;

      const mockTask = createMockTask({
        name: 'mock task',
        description: 'mock description',
        priority: TaskPriority.LOW,
        categories: mockCategories,
        createdByUserId: mockJwtPayload.sub,
      });

      vi.mocked(categoryRepository.findBy!).mockResolvedValue(mockCategories);
      vi.mocked(taskRepository.create!).mockReturnValue(mockTask);
      vi.mocked(taskRepository.save!).mockResolvedValue(mockTask);
      vi.mocked(taskRepository.findOne!).mockResolvedValue(null);

      await expect(
        service.create({
          userId: mockJwtPayload.sub,
          createTaskDto: dto,
        }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.TASK_NOT_FOUND,
          'Task not found',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(categoryRepository.findBy).toHaveBeenCalledWith({
        id: In(categoryIds),
        createdByUserId: mockJwtPayload.sub,
      });
      expect(taskRepository.create).toHaveBeenCalledWith({
        ...dto,
        categories: mockCategories,
        createdByUserId: mockJwtPayload.sub,
      });
      expect(taskRepository.save).toHaveBeenCalledWith(mockTask);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTask.id, createdByUserId: mockJwtPayload.sub },
        relations: { categories: true },
      });
    });

    it('should create task successfully and return task presenter', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockCategories = [
        createMockCategory({
          name: 'mock category 1',
          createdByUserId: mockJwtPayload.sub,
        }),
        createMockCategory({
          name: 'mock category 2',
          createdByUserId: mockJwtPayload.sub,
        }),
      ];
      const categoryIds = mockCategories.map((category) => category.id);

      const dto = new CreateTaskDto();
      dto.name = 'mock task';
      dto.description = 'mock description';
      dto.dueDate = undefined;
      dto.priority = TaskPriority.LOW;
      dto.categoryIds = categoryIds;

      const mockTask = createMockTask({
        name: 'mock task',
        description: 'mock description',
        priority: TaskPriority.LOW,
        categories: mockCategories,
        createdByUserId: mockJwtPayload.sub,
      });

      vi.mocked(categoryRepository.findBy!).mockResolvedValue(mockCategories);
      vi.mocked(taskRepository.create!).mockReturnValue(mockTask);
      vi.mocked(taskRepository.save!).mockResolvedValue(mockTask);
      vi.mocked(taskRepository.findOne!).mockResolvedValue(mockTask);

      const result = await service.create({
        userId: mockJwtPayload.sub,
        createTaskDto: dto,
      });

      expect(result).toEqual(mockTask);
      expect(categoryRepository.findBy).toHaveBeenCalledWith({
        id: In(categoryIds),
        createdByUserId: mockJwtPayload.sub,
      });
      expect(taskRepository.create).toHaveBeenCalledWith({
        ...dto,
        categories: mockCategories,
        createdByUserId: mockJwtPayload.sub,
      });
      expect(taskRepository.save).toHaveBeenCalledWith(mockTask);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTask.id, createdByUserId: mockJwtPayload.sub },
        relations: { categories: true },
      });
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when task does not exist or does not belong to user', async () => {
      const dto = new UpdateTaskDto();
      dto.name = 'mock task update';

      const mockJwtPayload = createMockJwtPayload();
      const mockTaskId = uuidv7();
      const mockUpdateResult = createMockUpdateResult(0);

      vi.mocked(taskRepository.update!).mockResolvedValue(mockUpdateResult);

      await expect(
        service.update({
          userId: mockJwtPayload.sub,
          taskId: mockTaskId,
          updateTaskDto: dto,
        }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.TASK_NOT_FOUND,
          'Task not found',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(taskRepository.findOne!).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when task not found after update', async () => {
      const dto = new UpdateTaskDto();
      dto.name = 'mock task update';

      const mockJwtPayload = createMockJwtPayload();
      const mockTaskId = uuidv7();
      const mockUpdateResult = createMockUpdateResult(1);
      vi.mocked(taskRepository.update!).mockResolvedValue(mockUpdateResult);

      await expect(
        service.update({
          userId: mockJwtPayload.sub,
          taskId: mockTaskId,
          updateTaskDto: dto,
        }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.TASK_NOT_FOUND,
          'Task not found',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTaskId, createdByUserId: mockJwtPayload.sub },
        relations: { categories: true },
      });
    });

    it('should update task successfully and return updated task', async () => {
      const dto = new UpdateTaskDto();
      dto.name = 'mock task update';
      dto.description = 'mock description update';
      dto.priority = TaskPriority.HIGH;

      const mockJwtPayload = createMockJwtPayload();
      const mockTask = createMockTask({
        name: 'mock task update',
        description: 'mock description update',
        priority: TaskPriority.HIGH,
        createdByUserId: mockJwtPayload.sub,
      });
      const mockUpdateResult = createMockUpdateResult(1);
      vi.mocked(taskRepository.update!).mockResolvedValue(mockUpdateResult);
      vi.mocked(taskRepository.findOne!).mockResolvedValue(mockTask);

      const result = await service.update({
        userId: mockJwtPayload.sub,
        taskId: mockTask.id,
        updateTaskDto: dto,
      });

      expect(result).toEqual(mockTask);
      expect(taskRepository.update!).toHaveBeenCalledTimes(1);
      expect(taskRepository.findOne!).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateCategories', () => {
    it('should throw NotFoundException when task does not exist or does not belong to user', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockCategories = [
        createMockCategory({
          name: 'mock category 1',
          createdByUserId: mockJwtPayload.sub,
        }),
        createMockCategory({
          name: 'mock category 2',
          createdByUserId: mockJwtPayload.sub,
        }),
      ];
      const mockTask = createMockTask({ createdByUserId: mockJwtPayload.sub });

      const dto = new UpdateTaskCategoriesDto();
      dto.categoryIds = mockCategories.map((category) => category.id);

      vi.mocked(taskRepository.findOne!).mockResolvedValue(null);

      await expect(
        service.updateCategories({
          userId: mockJwtPayload.sub,
          taskId: mockTask.id,
          updateTaskCategoriesDto: dto,
        }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.TASK_NOT_FOUND,
          'Task not found',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should throw NotFoundException when one or more categories not found', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockCategories = [
        createMockCategory({
          name: 'mock category 1',
          createdByUserId: mockJwtPayload.sub,
        }),
        createMockCategory({
          name: 'mock category 2',
          createdByUserId: mockJwtPayload.sub,
        }),
      ];
      const mockTask = createMockTask({ createdByUserId: mockJwtPayload.sub });

      const dto = new UpdateTaskCategoriesDto();
      dto.categoryIds = mockCategories.map((category) => category.id);

      vi.mocked(taskRepository.findOne!).mockResolvedValue(mockTask);
      vi.mocked(categoryRepository.findBy!).mockResolvedValue([]);

      await expect(
        service.updateCategories({
          userId: mockJwtPayload.sub,
          taskId: mockTask.id,
          updateTaskCategoriesDto: dto,
        }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.TASK_INVALID_CATEGORY,
          'One or more categories not found',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should add categories to task successfully', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockCategory = createMockCategory({
        createdByUserId: mockJwtPayload.sub,
      });
      const mockTask = createMockTask({ createdByUserId: mockJwtPayload.sub });
      const mockUpdatedTask = createMockTask({
        createdByUserId: mockJwtPayload.sub,
        categories: [mockCategory],
      }) as unknown as TaskPresenter;

      const dto = new UpdateTaskCategoriesDto();
      dto.categoryIds = [mockCategory.id];

      vi.mocked(taskRepository.findOne!)
        .mockResolvedValueOnce(mockTask)
        .mockResolvedValueOnce(mockUpdatedTask);

      vi.mocked(categoryRepository.findBy!).mockResolvedValue([mockCategory]);

      const mockQueryBuilder = createMockQueryBuilder();
      vi.mocked(taskRepository.createQueryBuilder!).mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.updateCategories({
        userId: mockJwtPayload.sub,
        taskId: mockTask.id,
        updateTaskCategoriesDto: dto,
      });

      expect(mockQueryBuilder.add).toHaveBeenCalledTimes(1);
      expect(taskRepository.findOne).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockUpdatedTask);
    });
  });

  describe('updateStatus', () => {
    it('should throw NotFoundException when task does not exist or does not belong to user', async () => {
      const dto = new UpdateTaskStatusDto();
      dto.status = TaskStatus.IN_PROGRESS;

      const mockJwtPayload = createMockJwtPayload();
      const mockTask = createMockTask({ createdByUserId: mockJwtPayload.sub });

      vi.mocked(taskRepository.findOne!).mockResolvedValue(null);

      await expect(
        service.updateStatus({
          userId: mockJwtPayload.sub,
          taskId: mockTask.id,
          updateTaskStatusDto: dto,
        }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.TASK_NOT_FOUND,
          'Task not found',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should throw BadRequestException when status transition is invalid', async () => {
      const dto = new UpdateTaskStatusDto();
      dto.status = TaskStatus.DONE;

      const mockJwtPayload = createMockJwtPayload();
      const mockTask = createMockTask({
        status: TaskStatus.TODO,
        createdByUserId: mockJwtPayload.sub,
      }) as unknown as TaskPresenter;

      vi.mocked(taskRepository.findOne!).mockResolvedValue(mockTask);

      await expect(
        service.updateStatus({
          userId: mockJwtPayload.sub,
          taskId: mockTask.id,
          updateTaskStatusDto: dto,
        }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.TASK_INVALID_STATUS_TRANSITION,
          `Cannot transition from "${TaskStatus.TODO}" to "${TaskStatus.DONE}"`,
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should update task status successfully', async () => {
      const dto = new UpdateTaskStatusDto();
      dto.status = TaskStatus.IN_PROGRESS;

      const mockJwtPayload = createMockJwtPayload();
      const mockTask = createMockTask({
        status: TaskStatus.TODO,
        createdByUserId: mockJwtPayload.sub,
      });
      const mockUpdatedTask = createMockTask({
        status: TaskStatus.IN_PROGRESS,
        createdByUserId: mockJwtPayload.sub,
      }) as unknown as TaskPresenter;

      vi.mocked(taskRepository.findOne!)
        .mockResolvedValueOnce(mockTask)
        .mockResolvedValueOnce(mockUpdatedTask);

      vi.mocked(taskRepository.update!).mockResolvedValue(
        createMockUpdateResult(1),
      );

      const result = await service.updateStatus({
        userId: mockJwtPayload.sub,
        taskId: mockTask.id,
        updateTaskStatusDto: dto,
      });

      expect(taskRepository.update).toHaveBeenCalledWith(mockTask.id, {
        status: TaskStatus.IN_PROGRESS,
      });
      expect(result).toEqual(mockUpdatedTask);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException when task does not exist or does not belong to user', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockTask = createMockTask({ createdByUserId: mockJwtPayload.sub });

      vi.mocked(taskRepository.softDelete!).mockResolvedValue(
        createMockDeleteResult(0),
      );

      await expect(
        service.remove({
          userId: mockJwtPayload.sub,
          taskId: mockTask.id,
        }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.TASK_NOT_FOUND,
          'Task not found',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should remove task successfully', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockTask = createMockTask({ createdByUserId: mockJwtPayload.sub });

      vi.mocked(taskRepository.softDelete!).mockResolvedValue(
        createMockDeleteResult(1),
      );

      const result = await service.remove({
        userId: mockJwtPayload.sub,
        taskId: mockTask.id,
      });

      expect(taskRepository.softDelete).toHaveBeenCalledWith({
        id: mockTask.id,
        createdByUserId: mockJwtPayload.sub,
      });
      expect(result).toBeUndefined();
    });
  });

  describe('removeTaskCategory', () => {
    it('should throw BadRequestException when category not found in task', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockTask = createMockTask({ createdByUserId: mockJwtPayload.sub });
      const mockCategory = createMockCategory({
        createdByUserId: mockJwtPayload.sub,
      });

      const mockQueryBuilder = createMockQueryBuilder();
      vi.mocked(taskRepository.createQueryBuilder!).mockReturnValue(
        mockQueryBuilder,
      );
      vi.mocked(mockQueryBuilder.getExists).mockResolvedValue(false);

      await expect(
        service.removeTaskCategory({
          userId: mockJwtPayload.sub,
          taskId: mockTask.id,
          categoryId: mockCategory.id,
        }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.TASK_CATEGORY_NOT_FOUND,
          'No category was found for this task',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw BadRequestException when task has only one category', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockTask = createMockTask({ createdByUserId: mockJwtPayload.sub });
      const mockCategory = createMockCategory({
        createdByUserId: mockJwtPayload.sub,
      });

      const mockQueryBuilder = createMockQueryBuilder();
      vi.mocked(taskRepository.createQueryBuilder!).mockReturnValue(
        mockQueryBuilder,
      );
      vi.mocked(mockQueryBuilder.getRawOne).mockResolvedValue({
        total: '1',
        hasCategory: '1',
      });

      await expect(
        service.removeTaskCategory({
          userId: mockJwtPayload.sub,
          taskId: mockTask.id,
          categoryId: mockCategory.id,
        }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.TASK_MINIMUM_ONE_CATEGORY,
          'Task must have at least one category',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should remove category from task successfully', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockTask = createMockTask({ createdByUserId: mockJwtPayload.sub });
      const mockCategory = createMockCategory({
        createdByUserId: mockJwtPayload.sub,
      });

      const mockQueryBuilder = createMockQueryBuilder();
      vi.mocked(taskRepository.createQueryBuilder!).mockReturnValue(
        mockQueryBuilder,
      );
      vi.mocked(mockQueryBuilder.getRawOne).mockResolvedValue({
        total: '2',
        hasCategory: '1',
      });

      const result = await service.removeTaskCategory({
        userId: mockJwtPayload.sub,
        taskId: mockTask.id,
        categoryId: mockCategory.id,
      });

      expect(mockQueryBuilder.remove).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });
});
