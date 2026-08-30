import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Logger } from 'nestjs-pino';
import { InjectRepository } from '@nestjs/typeorm';

import { Task } from '@modules/tasks/entities/task.entity';
import {
  CreateTaskDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
} from '@modules/tasks/dto';
import { Category } from '@modules/categories/entities/categories.entity';
import { TaskStatus } from '@modules/tasks/enums/task-status.enum';
import { TaskMapper } from '@modules/tasks/mappers/task.mapper';

@Injectable()
export class TasksService {
  constructor(
    private readonly logger: Logger,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll() {
    const tasks = await this.taskRepository.find();

    return TaskMapper.toPresenterList(tasks);
  }

  async findOne(id: string) {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task ID: ${id} not found`);
    }

    return TaskMapper.toPresenter(task);
  }

  async create(createTaskDto: CreateTaskDto) {
    if (createTaskDto.categoryId) {
      await this.validateExistCategory(createTaskDto.categoryId);
    }

    const task = this.taskRepository.create(createTaskDto);
    await this.taskRepository.save(task);

    this.logger.log(`Task ID: ${task.id} created successfully`);

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    if (updateTaskDto.categoryId) {
      await this.validateExistCategory(updateTaskDto.categoryId);
    }

    const result = await this.taskRepository.update(id, updateTaskDto);

    if (!result.affected) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    this.logger.log(`Task ID: ${id} updated successfully`);

    return this.findOne(id);
  }

  async updateStatus(id: string, updateTaskStatusDto: UpdateTaskStatusDto) {
    const task = await this.findOne(id);

    if (!this.isValidTransition(task.status, updateTaskStatusDto.status)) {
      throw new BadRequestException(
        `Cannot transition from "${task.status}" to "${updateTaskStatusDto.status}"`,
      );
    }

    await this.taskRepository.update(id, {
      status: updateTaskStatusDto.status,
    });

    this.logger.log(
      `Task ID: ${id} status updated to "${updateTaskStatusDto.status}"`,
    );

    return this.findOne(id);
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

  async remove(id: string) {
    const result = await this.taskRepository.softDelete(id);

    if (!result.affected) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    this.logger.log(`Task ID: ${id} deleted successfully`);
  }

  private async validateExistCategory(id: string) {
    const exists = await this.categoryRepository.exists({ where: { id } });

    if (!exists) {
      throw new NotFoundException(`Category ${id} not found`);
    }
  }
}
