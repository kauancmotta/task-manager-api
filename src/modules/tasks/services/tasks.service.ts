import { HttpStatus, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Logger } from 'nestjs-pino';
import { InjectRepository } from '@nestjs/typeorm';

import { Task } from '@modules/tasks/entities/task.entity';
import { Category } from '@modules/categories/entities/categories.entity';
import { TaskStatus } from '@modules/tasks/enums/task-status.enum';
import { TaskMapper } from '@modules/tasks/mappers/task.mapper';
import {
  TaskContext,
  TaskContextWithCreateTaskDto,
  TaskContextWithCategoryId,
  TaskContextWithUpdateTaskCategoriesDto,
  TaskContextWithUpdateTaskDto,
  TaskContextWithUpdateTaskStatusDto,
} from '@modules/tasks/interfaces';
import { PaginatedResponse } from '@common/interfaces';
import { FindAllTasksDto } from '@modules/tasks/dto';
import { buildPaginationMeta } from '@common/utils';
import { ErrorCodes } from '@common/enums/error-codes.enum';
import { AppException } from '@common/exceptions/app.exception';
import { TaskPresenter } from '@modules/tasks/presenters';

@Injectable()
export class TasksService {
  constructor(
    private readonly logger: Logger,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(
    userId: string,
    filters: FindAllTasksDto,
  ): Promise<PaginatedResponse<TaskPresenter>> {
    const [tasks, total] = await this.buildQueryTasks(userId, filters);

    return {
      data: TaskMapper.toPresenterList(tasks),
      meta: buildPaginationMeta({
        total,
        limit: filters.limit,
        page: filters.page,
      }),
    };
  }

  private async buildQueryTasks(userId: string, filters: FindAllTasksDto) {
    const query = this.taskRepository
      .createQueryBuilder('task')
      .where('task.createdByUserId = :userId', { userId })
      .innerJoinAndSelect('task.categories', 'categories');

    if (filters.priority) {
      query.andWhere('task.priority = :priority', {
        priority: filters.priority,
      });
    }

    if (filters.status) {
      query.andWhere('task.status = :status', { status: filters.status });
    }

    if (filters.dueDateBefore) {
      query.andWhere('task.dueDate <= :dueDateBefore', {
        dueDateBefore: filters.dueDateBefore,
      });
    }

    if (filters.dueDateAfter) {
      query.andWhere('task.dueDate >= :dueDateAfter', {
        dueDateAfter: filters.dueDateAfter,
      });
    }

    if (filters.categoryIds?.length) {
      query.andWhere('categories.id IN (:...categoryIds)', {
        categoryIds: filters.categoryIds,
      });
    }

    if (filters.search) {
      query.andWhere('task.name ILIKE :name', {
        name: `%${filters.search}%`,
      });
    }

    query
      .orderBy('task.priority', 'DESC')
      .addOrderBy('task.dueDate', 'ASC')
      .addOrderBy('task.updatedAt', 'DESC')
      .take(filters.limit)
      .skip((filters.page - 1) * filters.limit);

    return query.getManyAndCount();
  }

  async findOne({ userId, taskId }: TaskContext) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId, createdByUserId: userId },
      relations: { categories: true },
    });

    if (!task) {
      throw new AppException(
        ErrorCodes.TASK_NOT_FOUND,
        'Task not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return TaskMapper.toPresenter(task);
  }

  async create({ userId, createTaskDto }: TaskContextWithCreateTaskDto) {
    const categories = await this.findCategoriesWithIds(
      userId,
      createTaskDto.categoryIds,
    );

    const task = this.taskRepository.create({
      ...createTaskDto,
      categories,
      createdByUserId: userId,
    });
    await this.taskRepository.save(task);

    this.logger.log(`Task ID: ${task.id} created successfully`);

    return this.findOne({ userId, taskId: task.id });
  }

  async update({
    userId,
    taskId,
    updateTaskDto,
  }: TaskContextWithUpdateTaskDto) {
    const result = await this.taskRepository.update(
      { id: taskId, createdByUserId: userId },
      updateTaskDto,
    );

    if (!result.affected) {
      throw new AppException(
        ErrorCodes.TASK_NOT_FOUND,
        'Task not found',
        HttpStatus.NOT_FOUND,
      );
    }

    this.logger.log(`Task ID: ${taskId} updated successfully`);

    return this.findOne({ userId, taskId });
  }

  async updateCategories({
    userId,
    taskId,
    updateTaskCategoriesDto,
  }: TaskContextWithUpdateTaskCategoriesDto) {
    await this.findOne({ userId, taskId });

    const categories = await this.findCategoriesWithIds(
      userId,
      updateTaskCategoriesDto.categoryIds,
    );

    await this.taskRepository
      .createQueryBuilder()
      .relation(Task, 'categories')
      .of(taskId)
      .add(categories.map((category) => category.id));

    this.logger.log(`Task ID: ${taskId} categories updated successfully`);

    return this.findOne({ userId, taskId });
  }

  async updateStatus({
    userId,
    taskId,
    updateTaskStatusDto,
  }: TaskContextWithUpdateTaskStatusDto) {
    const task = await this.findOne({ userId, taskId });

    if (!this.isValidTransition(task.status, updateTaskStatusDto.status)) {
      throw new AppException(
        ErrorCodes.TASK_INVALID_STATUS_TRANSITION,
        `Cannot transition from "${task.status}" to "${updateTaskStatusDto.status}"`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.taskRepository.update(taskId, {
      status: updateTaskStatusDto.status,
    });

    this.logger.log(
      `Task ID: ${taskId} status updated to "${updateTaskStatusDto.status}"`,
    );

    return this.findOne({ userId, taskId });
  }

  async remove({ userId, taskId }: TaskContext) {
    const result = await this.taskRepository.softDelete({
      id: taskId,
      createdByUserId: userId,
    });

    if (!result.affected) {
      throw new AppException(
        ErrorCodes.TASK_NOT_FOUND,
        'Task not found',
        HttpStatus.NOT_FOUND,
      );
    }

    this.logger.log(`Task ID: ${taskId} deleted successfully`);
  }

  async removeTaskCategory({
    userId,
    taskId,
    categoryId,
  }: TaskContextWithCategoryId) {
    await this.validateTaskCategoryRemoval({ userId, taskId, categoryId });

    await this.taskRepository
      .createQueryBuilder()
      .relation(Task, 'categories')
      .of(taskId)
      .remove(categoryId);

    this.logger.log(
      `Category ID: ${categoryId} removed from Task ID: ${taskId}`,
    );
  }

  private async findCategoriesWithIds(userId: string, categoryIds: string[]) {
    const categories = await this.categoryRepository.findBy({
      id: In(categoryIds),
      createdByUserId: userId,
    });

    if (categories.length !== categoryIds.length) {
      throw new AppException(
        ErrorCodes.TASK_INVALID_CATEGORY,
        'One or more categories not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return categories;
  }

  private async validateTaskCategoryRemoval({
    userId,
    taskId,
    categoryId,
  }: TaskContextWithCategoryId) {
    const result = await this.taskRepository
      .createQueryBuilder('task')
      .innerJoin('task.categories', 'category')
      .where('task.id = :taskId', { taskId })
      .andWhere('task.createdByUserId = :userId', { userId })
      .select('COUNT(category.id)', 'total')
      .addSelect(
        `SUM(CASE WHEN category.id = :categoryId THEN 1 ELSE 0 END)`,
        'hasCategory',
      )
      .setParameter('categoryId', categoryId)
      .getRawOne<{ total: string; hasCategory: string }>();

    if (!Number(result?.hasCategory)) {
      throw new AppException(
        ErrorCodes.TASK_CATEGORY_NOT_FOUND,
        'No category was found for this task',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (Number(result?.total) <= 1) {
      throw new AppException(
        ErrorCodes.TASK_MINIMUM_ONE_CATEGORY,
        'Task must have at least one category',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private isValidTransition(current: TaskStatus, next: TaskStatus): boolean {
    const transitions: Record<TaskStatus, TaskStatus[]> = {
      [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS, TaskStatus.PENDING],
      [TaskStatus.PENDING]: [TaskStatus.IN_PROGRESS],
      [TaskStatus.IN_PROGRESS]: [TaskStatus.DONE],
      [TaskStatus.DONE]: [],
    };

    return transitions[current].includes(next);
  }
}
