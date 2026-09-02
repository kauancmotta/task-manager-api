import {
  Controller,
  Get,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { TaskAttachmentsService } from '@modules/tasks/services/task-attachments.service';
import { UuidParam } from '@common/decorators/uuid-param.decorator';

@Controller('tasks/:taskId/attachments')
export class TaskAttachmentsController {
  constructor(
    private readonly taskAttachmentsService: TaskAttachmentsService,
  ) {}

  @Get()
  findAll(@UuidParam('taskId') taskId: string) {
    return this.taskAttachmentsService.findAll(taskId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @UuidParam('taskId') taskId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.taskAttachmentsService.create(taskId, file);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@UuidParam('taskId') taskId: string, @UuidParam('id') id: string) {
    return this.taskAttachmentsService.remove(id, taskId);
  }
}
