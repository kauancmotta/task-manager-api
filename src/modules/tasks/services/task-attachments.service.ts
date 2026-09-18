import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from 'nestjs-pino';

import { TaskAttachment } from '@modules/tasks/entities/task-attachment.entity';
import { Task } from '@modules/tasks/entities/task.entity';
import { StorageService } from '@common/storage/storage.interface';
import {
  TaskContext,
  TaskContextWithAttachmentId,
  TaskContextWithFile,
} from '@modules/tasks/interfaces';
import { AppException } from '@common/exceptions/app.exception';
import { ErrorCodes } from '@common/enums/error-codes.enum';

@Injectable()
export class TaskAttachmentsService {
  constructor(
    private readonly logger: Logger,
    @InjectRepository(TaskAttachment)
    private readonly taskAttachmentRepository: Repository<TaskAttachment>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @Inject('STORAGE_SERVICE')
    private readonly storageService: StorageService,
  ) {}

  async findAll({ userId, taskId }: TaskContext) {
    return this.taskAttachmentRepository.find({
      where: { taskId, uploadedByUserId: userId },
    });
  }

  async create({ userId, taskId, file }: TaskContextWithFile) {
    await this.validateExistTask(taskId);

    const fileUrl = await this.storageService.upload(file);

    const taskAttachment = this.taskAttachmentRepository.create({
      taskId,
      uploadedByUserId: userId,
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    });

    await this.taskAttachmentRepository.save(taskAttachment);

    this.logger.log(
      `Task Attachment ID: ${taskAttachment.id} created successfully`,
    );

    return taskAttachment;
  }

  async remove({ userId, taskId, attachmentId }: TaskContextWithAttachmentId) {
    const attachment = await this.taskAttachmentRepository.findOne({
      where: { id: attachmentId, taskId, uploadedByUserId: userId },
    });

    if (!attachment) {
      throw new AppException(
        ErrorCodes.TASK_ATTACHMENT_NOT_FOUND,
        'Task Attachment not found',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.storageService.delete(attachment.fileUrl);
    await this.taskAttachmentRepository.softDelete({
      id: attachmentId,
      taskId,
      uploadedByUserId: userId,
    });

    this.logger.log(`Task Attachment ID: ${attachmentId} deleted successfully`);
  }

  private async validateExistTask(taskId: string) {
    const exists = await this.taskRepository.existsBy({ id: taskId });

    if (!exists) {
      throw new AppException(
        ErrorCodes.TASK_NOT_FOUND,
        'Task not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
