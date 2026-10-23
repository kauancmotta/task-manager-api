import { Repository } from 'typeorm';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';

import { TaskAssignee } from '@modules/tasks/entities/task-assignee.entity';
import { Task } from '@modules/tasks/entities/task.entity';
import {
  TaskContext,
  TaskContextWithAssigneeId,
} from '@modules/tasks/interfaces';
import { AppException } from '@common/exceptions/app.exception';
import { ErrorCodes } from '@common/enums/error-codes.enum';
@Injectable()
export class TaskAssigneesService {
  constructor(
    private readonly logger: Logger,
    @InjectRepository(TaskAssignee)
    private readonly taskAssigneeRepository: Repository<TaskAssignee>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async findAll({ userId, taskId }: TaskContext) {
    return this.taskAssigneeRepository.find({ where: { taskId, userId } });
  }

  async findOne({ userId, taskId, assigneeId }: TaskContextWithAssigneeId) {
    const taskAssignee = await this.taskAssigneeRepository.findOne({
      where: { userId, taskId, id: assigneeId },
    });

    if (!taskAssignee) {
      throw new AppException(
        ErrorCodes.TASK_ASSIGNEE_NOT_FOUND,
        'Task Assignee not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return taskAssignee;
  }

  async create({ userId, taskId }: TaskContext) {
    await this.validateExistTask({ userId, taskId });
    await this.validateUserAlreadyAssigned({ userId, taskId });

    const taskAssignee = this.taskAssigneeRepository.create({
      userId,
      taskId,
    });
    await this.taskAssigneeRepository.save(taskAssignee);

    this.logger.log(
      `Task Assignee ID: ${taskAssignee.id} created successfully`,
    );

    return taskAssignee;
  }

  async remove({ userId, taskId, assigneeId }: TaskContextWithAssigneeId) {
    const result = await this.taskAssigneeRepository.softDelete({
      id: assigneeId,
      userId,
      taskId,
    });

    if (!result.affected) {
      throw new AppException(
        ErrorCodes.TASK_ASSIGNEE_NOT_FOUND,
        'Task Assignee not found',
        HttpStatus.NOT_FOUND,
      );
    }

    this.logger.log(`Task Assignee ID: ${assigneeId} deleted successfully`);
  }

  private async validateExistTask({ userId, taskId }: TaskContext) {
    const exists = await this.taskRepository.exists({
      where: { createdByUserId: userId, id: taskId },
    });

    if (!exists) {
      throw new AppException(
        ErrorCodes.TASK_NOT_FOUND,
        'Task not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  private async validateUserAlreadyAssigned({ userId, taskId }: TaskContext) {
    const exists = await this.taskAssigneeRepository.exists({
      where: { userId, taskId },
    });

    if (exists) {
      throw new AppException(
        ErrorCodes.TASK_ASSIGNEE_ALREADY_EXISTS,
        'User is already assigned to this task',
        HttpStatus.CONFLICT,
      );
    }
  }
}
