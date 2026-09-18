import { ErrorCodes } from '@common/enums/error-codes.enum';
import { SwaggerNotFoundResponse } from '@common/swagger';
import { TaskAttachmentPresenter } from '@modules/tasks/presenters';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const SwaggerTaskAttachmentFindAllDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'List all task attachments',
      description:
        'Returns all task attachments belonging to the authenticated user.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: [TaskAttachmentPresenter] }),
  );

export const SwaggerTaskAttachmentCreateDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Create a task attachment',
      description: 'Creates a new task attachment for the authenticated user.',
    }),
    ApiResponse({ status: HttpStatus.CREATED, type: TaskAttachmentPresenter }),
    SwaggerNotFoundResponse({
      errorCode: ErrorCodes.TASK_NOT_FOUND,
      message: 'Task not found',
    }),
  );

export const SwaggerTaskAttachmentRemoveDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Delete a task attachment',
      description:
        'Permanently deletes a task attachment belonging to the authenticated user.',
    }),
    ApiResponse({ status: HttpStatus.NO_CONTENT }),
    SwaggerNotFoundResponse({
      errorCode: ErrorCodes.TASK_ATTACHMENT_NOT_FOUND,
      message: 'Task Attachment not found',
    }),
  );
