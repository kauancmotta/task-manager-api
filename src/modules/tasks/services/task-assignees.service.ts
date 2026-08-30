import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';

import { TaskAssignee } from '@modules/tasks/entities/task-assignee.entity';
import { Task } from '@modules/tasks/entities/task.entity';
import { User } from '@modules/users/entities/user.entity';
import { CreateTaskAssigneeDto } from '@modules/tasks/dto/create-task-assignee.dto';

@Injectable()
export class TaskAssigneesService {
  constructor(
    private readonly logger: Logger,
    @InjectRepository(TaskAssignee)
    private readonly taskAssigneeRepository: Repository<TaskAssignee>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(taskId: string) {
    return this.taskAssigneeRepository.find({ where: { taskId } });
  }

  async findOne(taskId: string, id: string) {
    const taskAssignee = await this.taskAssigneeRepository.findOne({
      where: { id, taskId },
    });

    if (!taskAssignee) {
      throw new NotFoundException(`Task Assignee ${id} not found`);
    }

    return taskAssignee;
  }

  async create(taskId: string, createTaskAssigneeDto: CreateTaskAssigneeDto) {
    await this.validateExistTask(taskId);
    await this.validateExistUser(createTaskAssigneeDto.userId);

    const taskAssignee = this.taskAssigneeRepository.create(
      createTaskAssigneeDto,
    );
    await this.taskAssigneeRepository.save(taskAssignee);

    this.logger.log(
      `Task Assignee ID: ${taskAssignee.id} created successfully`,
    );

    return taskAssignee;
  }

  async remove(taskId: string, id: string) {
    const result = await this.taskAssigneeRepository.softDelete({ id, taskId });

    if (!result.affected) {
      throw new NotFoundException(`Task Assignee ${id} not found`);
    }

    this.logger.log(`Task Assignee ID: ${id} deleted successfully`);
  }

  private async validateExistTask(id: string) {
    const exists = await this.taskRepository.exists({ where: { id } });

    if (!exists) {
      throw new NotFoundException(`Task ${id} not found`);
    }
  }

  private async validateExistUser(id: string) {
    const exists = await this.userRepository.exists({ where: { id } });

    if (!exists) {
      throw new NotFoundException(`User ${id} not found`);
    }
  }
}
