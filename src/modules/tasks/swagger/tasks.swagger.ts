import { ErrorCodes } from '@common/enums/error-codes.enum';
import {
  SwaggerBadRequestResponse,
  SwaggerNotFoundResponse,
} from '@common/swagger';
import { TaskPriority } from '@modules/tasks/enums/task-priority.enum';
import { TaskStatus } from '@modules/tasks/enums/task-status.enum';
import { TaskPresenter } from '@modules/tasks/presenters';
import { PaginatedTasksPresenter } from '@modules/tasks/presenters/paginated-tasks.presenter';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

export const SwaggerTaskFindAllDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'List all tasks',
      description:
        'Returns all tasks for the authenticated user with pagination and optional filters.',
    }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiQuery({ name: 'search', required: false, example: 'Fix login bug' }),
    ApiQuery({ name: 'priority', required: false, enum: TaskPriority }),
    ApiQuery({ name: 'status', required: false, enum: TaskStatus }),
    ApiQuery({ name: 'dueDateBefore', required: false, example: '2026-12-31' }),
    ApiQuery({ name: 'dueDateAfter', required: false, example: '2026-01-01' }),
    ApiQuery({
      name: 'categoryIds',
      required: false,
      isArray: true,
      example: [
        '01a0b2c3-710f-7c0e-813c-e8d53206c864',
        '01a0b5bb-84e3-7b7a-b0e5-0f84fd86d339',
      ],
    }),
    ApiResponse({ status: HttpStatus.OK, type: PaginatedTasksPresenter }),
  );

export const SwaggerTaskFindOneDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get a task',
      description: 'Returns a single task by ID with its categories.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: TaskPresenter }),
    SwaggerNotFoundResponse({
      errorCode: ErrorCodes.TASK_NOT_FOUND,
      message: 'Task not found',
    }),
  );

export const SwaggerTaskCreateDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Create a task',
      description:
        'Creates a new task with at least one category for the authenticated user.',
    }),
    ApiResponse({ status: HttpStatus.CREATED, type: TaskPresenter }),
    SwaggerNotFoundResponse([
      {
        errorCode: ErrorCodes.TASK_INVALID_CATEGORY,
        message: 'One or more categories not found',
      },
      {
        errorCode: ErrorCodes.TASK_NOT_FOUND,
        message: 'Task not found',
      },
    ]),
  );

export const SwaggerTaskUpdateDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Update a task',
      description:
        'Updates name, description, priority or due date of an existing task.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: TaskPresenter }),
    SwaggerNotFoundResponse({
      errorCode: ErrorCodes.TASK_NOT_FOUND,
      message: 'Task not found',
    }),
  );

export const SwaggerTaskUpdateCategoryDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Add categories to task',
      description:
        'Adds one or more categories to an existing task without removing the current ones.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: TaskPresenter }),
    SwaggerNotFoundResponse([
      {
        errorCode: ErrorCodes.TASK_NOT_FOUND,
        message: 'Task not found',
      },
      {
        errorCode: ErrorCodes.TASK_INVALID_CATEGORY,
        message: 'One or more categories not found',
      },
    ]),
  );

export const SwaggerTaskUpdateStatusDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Update task status',
      description:
        'Updates the task status following the allowed transitions: todo → pending → in_progress → done.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: TaskPresenter }),
    SwaggerNotFoundResponse([
      {
        errorCode: ErrorCodes.TASK_NOT_FOUND,
        message: 'Task not found',
      },
      {
        errorCode: ErrorCodes.TASK_INVALID_STATUS_TRANSITION,
        message: 'Cannot transition from "todo" to "done"',
      },
    ]),
  );

export const SwaggerTaskRemoveDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Delete a task',
      description: 'Permanently deletes a task and all its associated data.',
    }),
    ApiResponse({ status: HttpStatus.NO_CONTENT }),
    SwaggerNotFoundResponse({
      errorCode: ErrorCodes.TASK_NOT_FOUND,
      message: 'Task not found',
    }),
  );

export const SwaggerTaskRemoveCategoryDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Remove a category from task',
      description:
        'Removes a specific category from a task. The task must have at least one category remaining.',
    }),
    ApiResponse({ status: HttpStatus.NO_CONTENT }),
    SwaggerBadRequestResponse([
      {
        errorCode: ErrorCodes.TASK_CATEGORY_NOT_FOUND,
        message: 'No category was found for this task',
      },
      {
        errorCode: ErrorCodes.TASK_MINIMUM_ONE_CATEGORY,
        message: 'Task must have at least one category',
      },
    ]),
  );
