import { Test } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';

import { TaskAttachmentsController } from '@modules/tasks/controllers/task-attachments.controller';
import { TaskAttachmentsService } from '@modules/tasks/services/task-attachments.service';
import {
  createMockConfigService,
  createMockTaskAttachmentService,
} from '@common/testing/mock-services';
import { createMockLogger } from '@common/testing/mock-logger';
import {
  createMockFile,
  createMockJwtPayload,
  createMockTask,
  createMockTaskAttachment,
} from '@common/testing/mock-entities';

describe('TaskAttachmentsController', () => {
  let controller: TaskAttachmentsController;
  let taskAttachmentService: TaskAttachmentsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TaskAttachmentsController],
      providers: [
        {
          provide: TaskAttachmentsService,
          useValue: createMockTaskAttachmentService(),
        },
        {
          provide: ConfigService,
          useValue: createMockConfigService(),
        },
        {
          provide: Logger,
          useValue: createMockLogger(),
        },
      ],
    }).compile();

    controller = moduleRef.get(TaskAttachmentsController);
    taskAttachmentService = moduleRef.get(TaskAttachmentsService);
  });

  describe('findAll', () => {
    it('should call service.findAll return task attachments', async () => {
      const jwtPayload = createMockJwtPayload();
      const mockTask = createMockTask({ createdByUserId: jwtPayload.sub });
      const mockTaskAttachments = [
        createMockTaskAttachment({ uploadedByUserId: jwtPayload.sub }),
      ];

      vi.mocked(taskAttachmentService.findAll).mockResolvedValue(
        mockTaskAttachments,
      );

      const result = await controller.findAll(jwtPayload, mockTask.id);

      expect(result).toEqual(mockTaskAttachments);
      expect(taskAttachmentService.findAll).toHaveBeenCalledWith({
        userId: jwtPayload.sub,
        taskId: mockTask.id,
      });
      expect(taskAttachmentService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should call service.create return task attachment', async () => {
      const jwtPayload = createMockJwtPayload();
      const mockTask = createMockTask({ createdByUserId: jwtPayload.sub });
      const mockTaskAttachment = createMockTaskAttachment({
        uploadedByUserId: jwtPayload.sub,
      });
      const mockFile = createMockFile();

      vi.mocked(taskAttachmentService.create).mockResolvedValue(
        mockTaskAttachment,
      );

      const result = await controller.create(jwtPayload, mockTask.id, mockFile);

      expect(result).toEqual(mockTaskAttachment);
      expect(taskAttachmentService.create).toHaveBeenCalledWith({
        userId: jwtPayload.sub,
        taskId: mockTask.id,
        file: mockFile,
      });
      expect(taskAttachmentService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should call service.remove return void', async () => {
      const jwtPayload = createMockJwtPayload();
      const mockTask = createMockTask({ createdByUserId: jwtPayload.sub });
      const mockTaskAttachment = createMockTaskAttachment({
        uploadedByUserId: jwtPayload.sub,
      });

      vi.mocked(taskAttachmentService.remove).mockResolvedValue(undefined);

      const result = await controller.remove(
        jwtPayload,
        mockTask.id,
        mockTaskAttachment.id,
      );

      expect(result).toBeUndefined();
      expect(taskAttachmentService.remove).toHaveBeenCalledWith({
        userId: jwtPayload.sub,
        taskId: mockTask.id,
        attachmentId: mockTaskAttachment.id,
      });
      expect(taskAttachmentService.remove).toHaveBeenCalledTimes(1);
    });
  });
});
