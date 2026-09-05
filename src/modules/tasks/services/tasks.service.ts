import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Logger } from 'nestjs-pino';
import { InjectRepository } from '@nestjs/typeorm';

import { Task } from '@modules/tasks/entities/task.entity';
import { Category } from '@modules/categories/entities/categories.entity';
import { TaskStatus } from '@modules/tasks/enums/task-status.enum';
import { TaskMapper, TaskPresenter } from '@modules/tasks/mappers/task.mapper';
import {
  TaskContext,
  TaskContextWithCreateTaskDto,
  TaskContextWithUpdateTaskDto,
  TaskContextWithUpdateTaskStatusDto,
} from '@modules/tasks/interfaces';
import { PaginatedResponse } from '@common/interfaces';
import { FindAllTasksDto } from '@modules/tasks/dto';

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
    const query = this.taskRepository
      .createQueryBuilder('task')
      .where('task.createdByUserId = :userId', { userId });

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

    query
      .orderBy('task.priority', 'DESC')
      .addOrderBy('task.dueDate', 'ASC')
      .take(filters.limit)
      .skip((filters.page - 1) * filters.limit);

    const [tasks, total] = await query.getManyAndCount();

    return {
      data: TaskMapper.toPresenterList(tasks),
      meta: {
        total,
        totalPages: Math.ceil(total / filters.limit),
        currentPage: filters.page,
        limit: filters.limit,
      },
    };
  }

  async findOne({ userId, taskId }: TaskContext) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId, createdByUserId: userId },
    });

    if (!task) {
      throw new NotFoundException(`Task ID: ${taskId} not found`);
    }

    return TaskMapper.toPresenter(task);
  }

  async create({ userId, createTaskDto }: TaskContextWithCreateTaskDto) {
    if (createTaskDto.categoryId) {
      await this.validateExistCategory(createTaskDto.categoryId);
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      createdByUserId: userId,
    });
    await this.taskRepository.save(task);

    this.logger.log(`Task ID: ${task.id} created successfully`);

    return task;
  }

  async update({
    userId,
    taskId,
    updateTaskDto,
  }: TaskContextWithUpdateTaskDto) {
    if (updateTaskDto.categoryId) {
      await this.validateExistCategory(updateTaskDto.categoryId);
    }

    const result = await this.taskRepository.update(
      { id: taskId, createdByUserId: userId },
      updateTaskDto,
    );

    if (!result.affected) {
      throw new NotFoundException(`Task ${taskId} not found`);
    }

    this.logger.log(`Task ID: ${taskId} updated successfully`);

    return this.findOne({ userId, taskId });
  }

  async updateStatus({
    userId,
    taskId,
    updateTaskStatusDto,
  }: TaskContextWithUpdateTaskStatusDto) {
    const task = await this.findOne({ userId, taskId });

    if (!this.isValidTransition(task.status, updateTaskStatusDto.status)) {
      throw new BadRequestException(
        `Cannot transition from "${task.status}" to "${updateTaskStatusDto.status}"`,
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
      throw new NotFoundException(`Task ${taskId} not found`);
    }

    this.logger.log(`Task ID: ${taskId} deleted successfully`);
  }

  private async validateExistCategory(id: string) {
    const exists = await this.categoryRepository.exists({ where: { id } });

    if (!exists) {
      throw new NotFoundException(`Category ${id} not found`);
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
