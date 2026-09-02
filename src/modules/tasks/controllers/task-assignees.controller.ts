import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { UuidParam } from '@common/decorators/uuid-param.decorator';
import { CreateTaskAssigneeDto } from '@modules/tasks/dto';
import { TaskAssigneesService } from '@modules/tasks/services/task-assignees.service';

@Controller('tasks/:taskId/assignees')
export class TaskAssigneesController {
  constructor(private readonly taskAssigneesService: TaskAssigneesService) {}
  @Get()
  findAll(@UuidParam('taskId') taskId: string) {
    return this.taskAssigneesService.findAll(taskId);
  }

  @Get(':id')
  findOne(@UuidParam('taskId') taskId: string, @UuidParam('id') id: string) {
    return this.taskAssigneesService.findOne(taskId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @UuidParam('taskId') taskId: string,
    @Body() createTaskAssigneeDto: CreateTaskAssigneeDto,
  ) {
    return this.taskAssigneesService.create(taskId, createTaskAssigneeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@UuidParam('taskId') taskId: string, @UuidParam('id') id: string) {
    return this.taskAssigneesService.remove(taskId, id);
  }
}
