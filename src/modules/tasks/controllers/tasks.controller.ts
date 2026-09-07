import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';

import { UuidParam } from '@common/decorators/uuid-param.decorator';
import { TasksService } from '@modules/tasks/services/tasks.service';
import {
  CreateTaskDto,
  FindAllTasksDto,
  UpdateTaskCategoriesDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
} from '@modules/tasks/dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { JwtPayload } from '@modules/auth/interfaces';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query() filters: FindAllTasksDto) {
    return this.tasksService.findAll(user.sub, filters);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @UuidParam('id') taskId: string) {
    return this.tasksService.findOne({ userId: user.sub, taskId });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: JwtPayload,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.tasksService.create({ userId: user.sub, createTaskDto });
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @UuidParam('id') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update({
      userId: user.sub,
      taskId,
      updateTaskDto,
    });
  }

  @Patch(':id/categories')
  updateCategories(
    @CurrentUser() user: JwtPayload,
    @UuidParam('id') taskId: string,
    @Body() updateTaskCategoriesDto: UpdateTaskCategoriesDto,
  ) {
    return this.tasksService.updateCategories({
      userId: user.sub,
      taskId,
      updateTaskCategoriesDto,
    });
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @UuidParam('id') taskId: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateStatus({
      userId: user.sub,
      taskId,
      updateTaskStatusDto,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @UuidParam('id') taskId: string) {
    return this.tasksService.remove({ userId: user.sub, taskId });
  }

  @Delete(':id/:categoryId/category')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTaskCategory(
    @CurrentUser() user: JwtPayload,
    @UuidParam('id') taskId: string,
    @UuidParam('categoryId') categoryId: string,
  ) {
    return this.tasksService.removeTaskCategory({
      userId: user.sub,
      taskId,
      categoryId,
    });
  }
}
