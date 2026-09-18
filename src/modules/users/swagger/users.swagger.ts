import { ErrorCodes } from '@common/enums/error-codes.enum';
import {
  SwaggerNotFoundResponse,
  SwaggerUnauthorizedResponse,
  SwaggerValidationResponse,
  SwaggerValidationUploadedImageResponse,
} from '@common/swagger';
import { UserPresenter } from '@modules/users/presenters';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

export const SwaggerUserUpdateDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Update user profile',
      description: 'Updates the authenticated user name.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: UserPresenter }),
    SwaggerValidationResponse(),
    SwaggerNotFoundResponse({
      errorCode: ErrorCodes.USER_NOT_FOUND,
      message: 'User not found',
    }),
  );

export const SwaggerUserUpdateAvatarDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Upload profile avatar',
      description:
        'Uploads and sets a new avatar image for the authenticated user. Accepted formats: .jpeg, .png, .webp. Max size: 5MB.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: UserPresenter }),
    SwaggerValidationUploadedImageResponse('avatarFile'),
    SwaggerNotFoundResponse({
      errorCode: ErrorCodes.USER_NOT_FOUND,
      message: 'User not found',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          avatarFile: {
            type: 'string',
            format: 'binary',
            description: 'Image file (.jpeg, .png, .webp) — max 5MB',
          },
        },
        required: ['avatarFile'],
      },
    }),
  );

export const SwaggerUserRemoveAvatarDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Remove profile avatar',
      description:
        'Removes the current avatar image from the authenticated user profile.',
    }),
    SwaggerNotFoundResponse([
      {
        errorCode: ErrorCodes.USER_AVATAR_NOT_FOUND,
        message: 'User avatar not found',
      },
      {
        errorCode: ErrorCodes.USER_NOT_FOUND,
        message: 'User not found',
      },
    ]),
  );

export const SwaggerUserChangePasswordDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Change account password',
      description:
        'Updates the authenticated user password. Requires the current password for confirmation.',
    }),
    ApiResponse({ status: HttpStatus.NO_CONTENT }),
    SwaggerValidationResponse(),
    SwaggerUnauthorizedResponse({
      errorCode: ErrorCodes.USER_INVALID_PASSWORD,
      message: 'Invalid credentials',
    }),
  );

export const SwaggerUserRemoveDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Remove account',
      description:
        'Permanently deletes the authenticated user account and all associated data.',
    }),
    ApiResponse({ status: HttpStatus.NO_CONTENT }),
    SwaggerNotFoundResponse({
      errorCode: ErrorCodes.USER_NOT_FOUND,
      message: 'User not found',
    }),
  );
