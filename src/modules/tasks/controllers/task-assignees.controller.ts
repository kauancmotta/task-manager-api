import {
  Controller,
  Get,
  Post,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { UuidParam } from '@common/decorators/uuid-param.decorator';
import { TaskAssigneesService } from '@modules/tasks/services/task-assignees.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { JwtPayload } from '@modules/auth/interfaces';
import {
  SwaggerTaskAssigneeCreateDoc,
  SwaggerTaskAssigneeFindAllDoc,
  SwaggerTaskAssigneeFindOneDoc,
  SwaggerTaskAssigneeRemoveDoc,
} from '@modules/tasks/swagger';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Task Assignees')
@Controller('tasks/:taskId/assignees')
export class TaskAssigneesController {
  constructor(private readonly taskAssigneesService: TaskAssigneesService) {}

  @SwaggerTaskAssigneeFindAllDoc()
  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @UuidParam('taskId') taskId: string,
  ) {
    return this.taskAssigneesService.findAll({ userId: user.sub, taskId });
  }

  @SwaggerTaskAssigneeFindOneDoc()
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

  @SwaggerTaskAssigneeCreateDoc()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: JwtPayload, @UuidParam('taskId') taskId: string) {
    return this.taskAssigneesService.create({ userId: user.sub, taskId });
  }

  @SwaggerTaskAssigneeRemoveDoc()
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
