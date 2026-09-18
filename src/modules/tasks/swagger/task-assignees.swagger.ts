import { ErrorCodes } from '@common/enums/error-codes.enum';
import { SwaggerNotFoundResponse } from '@common/swagger';
import { TaskAssigneePresenter } from '@modules/tasks/presenters';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const SwaggerTaskAssigneeFindAllDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'List all task assigness',
      description:
        'Returns all task assigness belonging to the authenticated user.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: [TaskAssigneePresenter] }),
  );

export const SwaggerTaskAssigneeFindOneDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get a task assignee',
      description:
        'Returns a single task assignee by ID belonging to the authenticated user.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: TaskAssigneePresenter }),
    SwaggerNotFoundResponse({
      errorCode: ErrorCodes.TASK_ASSIGNEE_NOT_FOUND,
      message: 'Task Assignee not found',
    }),
  );

export const SwaggerTaskAssigneeCreateDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Create a task assignee',
      description: 'Creates a new task assignee for the authenticated user.',
    }),
    ApiResponse({ status: HttpStatus.CREATED, type: TaskAssigneePresenter }),
    SwaggerNotFoundResponse({
      errorCode: ErrorCodes.TASK_NOT_FOUND,
      message: 'Task not found',
    }),
  );

export const SwaggerTaskAssigneeRemoveDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Delete a task assignee',
      description:
        'Permanently deletes a task assignee belonging to the authenticated user.',
    }),
    ApiResponse({ status: HttpStatus.NO_CONTENT }),
    SwaggerNotFoundResponse({
      errorCode: ErrorCodes.TASK_ASSIGNEE_NOT_FOUND,
      message: 'Task Assignee not found',
    }),
  );
