import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';

import { UuidParam } from '@common/decorators/uuid-param.decorator';
import { TaskAssigneesService } from '@modules/tasks/services/task-assignees.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { JwtPayload } from '@modules/auth/interfaces';

@Controller('tasks/:taskId/assignees')
export class TaskAssigneesController {
  constructor(private readonly taskAssigneesService: TaskAssigneesService) {}
  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @UuidParam('taskId') taskId: string,
  ) {
    return this.taskAssigneesService.findAll({ userId: user.sub, taskId });
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: JwtPayload,
    @UuidParam('taskId') taskId: string,
    @UuidParam('id') assigneeId: string,
  ) {
    return this.taskAssigneesService.findOne({
      userId: user.sub,
      taskId,
      assigneeId,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: JwtPayload, @UuidParam('taskId') taskId: string) {
    return this.taskAssigneesService.create({ userId: user.sub, taskId });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: JwtPayload,
    @UuidParam('taskId') taskId: string,
    @UuidParam('id') assigneeId: string,
  ) {
    return this.taskAssigneesService.remove({
      userId: user.sub,
      taskId,
      assigneeId,
    });
  }
}
