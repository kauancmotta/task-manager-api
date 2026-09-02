import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from 'nestjs-pino';

import { TaskAttachment } from '@modules/tasks/entities/task-attachment.entity';
import { Task } from '@modules/tasks/entities/task.entity';
import { StorageService } from '@common/storage/storage.interface';

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

  async findAll(taskId: string) {
    return this.taskAttachmentRepository.find({
      where: { taskId },
    });
  }

  async create(taskId: string, file: Express.Multer.File) {
    await this.validateExistTask(taskId);

    const fileUrl = await this.storageService.upload(file);

    const taskAttachment = this.taskAttachmentRepository.create({
      taskId,
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

  async remove(id: string, taskId: string) {
    const attachment = await this.taskAttachmentRepository.findOne({
      where: { id, taskId },
    });

    if (!attachment) {
      throw new NotFoundException(`Task Attachment ${id} not found`);
    }

    await this.storageService.delete(attachment.fileUrl);
    await this.taskAttachmentRepository.softDelete({ id, taskId });

    this.logger.log(`Task Attachment ID: ${id} deleted successfully`);
  }

  private async validateExistTask(id: string) {
    const exists = await this.taskRepository.existsBy({ id });

    if (!exists) {
      throw new NotFoundException(`Task ${id} not found`);
    }
  }
}
