import { Test } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Task } from '@modules/tasks/entities/task.entity';
import { uuidv7 } from 'uuidv7';

import { createMockLogger } from '@common/testing/mock-logger';
import {
  createMockRepository,
  MockRepository,
} from '@common/testing/mock-repository';
import { TaskAttachmentsController } from '@modules/tasks/controllers/task-attachments.controller';
import { TaskAttachment } from '@modules/tasks/entities/task-attachment.entity';
import { TaskAttachmentsService } from '@modules/tasks/services/task-attachments.service';
import {
  createMockConfigService,
  createMockStorageService,
} from '@common/testing/mock-services';
import {
  createMockFile,
  createMockJwtPayload,
  createMockTaskAttachment,
} from '@common/testing/mock-entities';
import { AppException } from '@common/exceptions/app.exception';
import { ErrorCodes } from '@common/enums/error-codes.enum';
import { HttpStatus } from '@nestjs/common';
import { StorageService } from '@common/storage/storage.interface';
import { createMockUpdateResult } from '@common/testing/mock-typeorm';

describe('TaskAttachmentsService', () => {
  let service: TaskAttachmentsService;
  let taskAttachmentRepository: MockRepository<TaskAttachment>;
  let taskRepository: MockRepository<Task>;
  let storageService: StorageService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TaskAttachmentsController],
      providers: [
        TaskAttachmentsService,
        {
          provide: Logger,
          useValue: createMockLogger(),
        },
        {
          provide: getRepositoryToken(TaskAttachment),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Task),
          useValue: createMockRepository(),
        },
        {
          provide: 'STORAGE_SERVICE',
          useValue: createMockStorageService(),
        },
        {
          provide: ConfigService,
          useValue: createMockConfigService(),
        },
      ],
    }).compile();

    service = moduleRef.get(TaskAttachmentsService);
    taskAttachmentRepository = moduleRef.get(
      getRepositoryToken(TaskAttachment),
    );
    taskRepository = moduleRef.get(getRepositoryToken(Task));
    storageService = moduleRef.get('STORAGE_SERVICE');
  });

  describe('findAll', () => {
    it('should return task attachments when task belongs to user', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockTaskId = uuidv7();
      const mockTaskAttachments = [
        createMockTaskAttachment({
          taskId: mockTaskId,
          uploadedByUserId: mockJwtPayload.sub,
        }),
      ];

      vi.mocked(taskAttachmentRepository.find!).mockResolvedValue(
        mockTaskAttachments,
      );

      const result = await service.findAll({
        userId: mockJwtPayload.sub,
        taskId: mockTaskId,
      });

      expect(taskAttachmentRepository.find).toHaveBeenCalledWith({
        where: {
          taskId: mockTaskId,
          uploadedByUserId: mockJwtPayload.sub,
        },
      });
      expect(result).toEqual(mockTaskAttachments);
    });
  });

  describe('create', () => {
    it('should throw NotFoundException when task not found', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockTaskId = uuidv7();
      const mockFile = createMockFile();

      vi.mocked(taskRepository.existsBy!).mockResolvedValue(false);

      await expect(
        service.create({
          userId: mockJwtPayload.sub,
          taskId: mockTaskId,
          file: mockFile,
        }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.TASK_NOT_FOUND,
          'Task not found',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(taskRepository.existsBy).toHaveBeenCalledWith({ id: mockTaskId });
      expect(storageService.upload).not.toHaveBeenCalled();
      expect(taskAttachmentRepository.create).not.toHaveBeenCalled();
      expect(taskAttachmentRepository.save).not.toHaveBeenCalled();
    });

    it('should create task attachment successfully', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockTaskId = uuidv7();
      const mockFile = createMockFile();
      const mockTaskAttachment = createMockTaskAttachment({
        taskId: mockTaskId,
        uploadedByUserId: mockJwtPayload.sub,
      });

      vi.mocked(taskRepository.existsBy!).mockResolvedValue(true);
      vi.mocked(storageService.upload).mockResolvedValue('mock-path-file');
      vi.mocked(taskAttachmentRepository.create!).mockReturnValue(
        mockTaskAttachment,
      );
      vi.mocked(taskAttachmentRepository.save!).mockResolvedValue(
        mockTaskAttachment,
      );

      const result = await service.create({
        userId: mockJwtPayload.sub,
        taskId: mockTaskId,
        file: mockFile,
      });

      expect(taskRepository.existsBy).toHaveBeenCalledWith({ id: mockTaskId });
      expect(storageService.upload).toHaveBeenCalledWith(mockFile);
      expect(taskAttachmentRepository.create).toHaveBeenCalledWith({
        taskId: mockTaskId,
        uploadedByUserId: mockJwtPayload.sub,
        fileUrl: 'mock-path-file',
        fileName: mockFile.originalname,
        fileSize: mockFile.size,
        mimeType: mockFile.mimetype,
      });
      expect(taskAttachmentRepository.save).toHaveBeenCalledWith(
        mockTaskAttachment,
      );
      expect(result).toEqual(mockTaskAttachment);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException when task attachment not found', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockTaskId = uuidv7();
      const mockTaskAttachmentId = uuidv7();

      vi.mocked(taskAttachmentRepository.findOne!).mockResolvedValue(null);

      await expect(
        service.remove({
          userId: mockJwtPayload.sub,
          taskId: mockTaskId,
          attachmentId: mockTaskAttachmentId,
        }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.TASK_ATTACHMENT_NOT_FOUND,
          'Task Attachment not found',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(taskAttachmentRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: mockTaskAttachmentId,
          taskId: mockTaskId,
          uploadedByUserId: mockJwtPayload.sub,
        },
      });
      expect(taskAttachmentRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should soft delete task attachment successfully', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockTaskId = uuidv7();
      const mockTaskAttachment = createMockTaskAttachment({
        taskId: mockTaskId,
        uploadedByUserId: mockJwtPayload.sub,
      });

      vi.mocked(taskAttachmentRepository.findOne!).mockResolvedValue(
        mockTaskAttachment,
      );

      const mockUpdateResult = createMockUpdateResult(1);
      vi.mocked(taskAttachmentRepository.softDelete!).mockResolvedValue(
        mockUpdateResult,
      );

      const result = await service.remove({
        userId: mockJwtPayload.sub,
        taskId: mockTaskId,
        attachmentId: mockTaskAttachment.id,
      });

      expect(taskAttachmentRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: mockTaskAttachment.id,
          taskId: mockTaskId,
          uploadedByUserId: mockJwtPayload.sub,
        },
      });
      expect(taskAttachmentRepository.softDelete).toHaveBeenCalledWith({
        id: mockTaskAttachment.id,
        taskId: mockTaskId,
        uploadedByUserId: mockJwtPayload.sub,
      });
      expect(result).toBeUndefined();
    });
  });
});
