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
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { JwtPayload } from '@modules/auth/interfaces';
import { ApiTags } from '@nestjs/swagger';
import {
  SwaggerTaskAttachmentCreateDoc,
  SwaggerTaskAttachmentFindAllDoc,
  SwaggerTaskAttachmentRemoveDoc,
} from '@modules/tasks/swagger';

@ApiTags('Task Attachments')
@Controller('tasks/:taskId/attachments')
export class TaskAttachmentsController {
  constructor(
    private readonly taskAttachmentsService: TaskAttachmentsService,
  ) {}

  @SwaggerTaskAttachmentFindAllDoc()
  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @UuidParam('taskId') taskId: string,
  ) {
    return this.taskAttachmentsService.findAll({ userId: user.sub, taskId });
  }

  @SwaggerTaskAttachmentCreateDoc()
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: JwtPayload,
    @UuidParam('taskId') taskId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.taskAttachmentsService.create({
      userId: user.sub,
      taskId,
      file,
    });
  }

  @SwaggerTaskAttachmentRemoveDoc()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: JwtPayload,
    @UuidParam('taskId') taskId: string,
    @UuidParam('id') attachmentId: string,
  ) {
    return this.taskAttachmentsService.remove({
      userId: user.sub,
      taskId,
      attachmentId,
    });
  }
}
