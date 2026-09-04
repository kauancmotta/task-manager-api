import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';

import { TaskAssignee } from '@modules/tasks/entities/task-assignee.entity';
import { Task } from '@modules/tasks/entities/task.entity';
import {
  TaskContext,
  TaskContextWithAssigneeId,
} from '@modules/tasks/interfaces';
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
      throw new NotFoundException(`Task Assignee ${assigneeId} not found`);
    }

    return taskAssignee;
  }

  async create({ userId, taskId }: TaskContext) {
    await this.validateExistTask({ userId, taskId });

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
      userId,
      taskId,
      id: assigneeId,
    });

    if (!result.affected) {
      throw new NotFoundException(`Task Assignee ${assigneeId} not found`);
    }

    this.logger.log(`Task Assignee ID: ${assigneeId} deleted successfully`);
  }

  private async validateExistTask({ userId, taskId }: TaskContext) {
    const exists = await this.taskRepository.exists({
      where: { createdByUserId: userId, id: taskId },
    });

    if (!exists) {
      throw new NotFoundException(`Task ${taskId} not found`);
    }
  }
}
