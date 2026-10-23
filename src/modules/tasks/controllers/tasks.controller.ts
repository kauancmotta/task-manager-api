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
import { ApiTags } from '@nestjs/swagger';

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
import {
  SwaggerTaskCreateDoc,
  SwaggerTaskFindAllDoc,
  SwaggerTaskFindOneDoc,
  SwaggerTaskRemoveCategoryDoc,
  SwaggerTaskRemoveDoc,
  SwaggerTaskUpdateCategoryDoc,
  SwaggerTaskUpdateDoc,
  SwaggerTaskUpdateStatusDoc,
} from '@modules/tasks/swagger';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @SwaggerTaskFindAllDoc()
  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query() filters: FindAllTasksDto) {
    return this.tasksService.findAll(user.sub, filters);
  }

  @SwaggerTaskFindOneDoc()
  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @UuidParam('id') taskId: string) {
    return this.tasksService.findOne({ userId: user.sub, taskId });
  }

  @SwaggerTaskCreateDoc()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: JwtPayload,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.tasksService.create({ userId: user.sub, createTaskDto });
  }

  @SwaggerTaskUpdateDoc()
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
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

  @SwaggerTaskUpdateCategoryDoc()
  @Patch(':id/categories')
  @HttpCode(HttpStatus.OK)
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

  @SwaggerTaskUpdateStatusDoc()
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
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

  @SwaggerTaskRemoveDoc()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @UuidParam('id') taskId: string) {
    return this.tasksService.remove({ userId: user.sub, taskId });
  }

  @SwaggerTaskRemoveCategoryDoc()
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
