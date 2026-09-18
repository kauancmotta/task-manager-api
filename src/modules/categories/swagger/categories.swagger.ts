import { ErrorCodes } from '@common/enums/error-codes.enum';
import {
  SwaggerConflictResponse,
  SwaggerNotFoundResponse,
} from '@common/swagger';
import { CategoryPresenter } from '@modules/categories/presenters';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const SwaggerCategoryFindAllDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'List all categories',
      description:
        'Returns all categories belonging to the authenticated user.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: [CategoryPresenter] }),
  );

export const SwaggerCategoryFindOneDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get a category',
      description:
        'Returns a single category by ID belonging to the authenticated user.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: CategoryPresenter }),
    SwaggerNotFoundResponse({
      errorCode: ErrorCodes.CATEGORY_NOT_FOUND,
      message: 'Category not found',
    }),
  );

export const SwaggerCategoryCreateDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Create a category',
      description: 'Creates a new category for the authenticated user.',
    }),
    ApiResponse({ status: HttpStatus.CREATED, type: CategoryPresenter }),
    SwaggerConflictResponse({
      errorCode: ErrorCodes.CATEGORY_NAME_ALREADY_EXISTS,
      message: 'Category already exists',
    }),
  );

export const SwaggerCategoryUpdateDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Update a category',
      description:
        'Updates name, color or description of an existing category.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: CategoryPresenter }),
    SwaggerConflictResponse({
      errorCode: ErrorCodes.CATEGORY_NAME_ALREADY_EXISTS,
      message: 'Category already exists',
    }),
    SwaggerNotFoundResponse({
      errorCode: ErrorCodes.CATEGORY_NOT_FOUND,
      message: 'Category not found',
    }),
  );

export const SwaggerCategoryRemoveDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Delete a category',
      description:
        'Permanently deletes a category belonging to the authenticated user.',
    }),
    ApiResponse({ status: HttpStatus.NO_CONTENT }),
    SwaggerNotFoundResponse({
      errorCode: ErrorCodes.CATEGORY_NOT_FOUND,
      message: 'Category not found',
    }),
  );
