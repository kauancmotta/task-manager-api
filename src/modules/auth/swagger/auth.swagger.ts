import { ErrorCodes } from '@common/enums/error-codes.enum';
import {
  SwaggerConflictResponse,
  SwaggerForbiddenResponse,
  SwaggerNotFoundResponse,
  SwaggerServiceUnavailableResponse,
  SwaggerUnauthorizedResponse,
  SwaggerValidationResponse,
} from '@common/swagger';
import { AuthPresenter, RefreshTokenPresenter } from '@modules/auth/presenters';
import { UserPresenter } from '@modules/users/presenters';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const SwaggerAuthRegisterDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Register a new user account',
      description: 'Creates a new user account and sends a verification email.',
    }),
    ApiResponse({ status: HttpStatus.CREATED, type: AuthPresenter }),
    SwaggerValidationResponse(),
    SwaggerConflictResponse({
      errorCode: ErrorCodes.AUTH_EMAIL_ALREADY_EXISTS,
      message: 'Email already exists',
    }),
  );

export const SwaggerAuthLoginDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Authenticate with email and password',
      description:
        'Returns access and refresh tokens on successful authentication.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: AuthPresenter }),
    SwaggerValidationResponse(),
    SwaggerUnauthorizedResponse({
      errorCode: ErrorCodes.AUTH_INVALID_CREDENTIALS,
      message: 'Invalid credentials',
    }),
    SwaggerForbiddenResponse({
      errorCode: ErrorCodes.AUTH_EMAIL_NOT_VERIFIED,
      message: 'Email not verified',
    }),
  );

export const SwaggerAuthRefreshDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Rotate access and refresh tokens',
      description:
        'Invalidates the current refresh token and returns a new pair of tokens.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: RefreshTokenPresenter }),
    SwaggerValidationResponse(),
    SwaggerUnauthorizedResponse({
      errorCode: ErrorCodes.AUTH_INVALID_REFRESH_TOKEN,
      message: 'Invalid refresh token',
    }),
  );

export const SwaggerAuthLogoutDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Invalidate refresh token and end session',
      description:
        'Revokes the refresh token, preventing it from being used again.',
    }),
    ApiResponse({ status: HttpStatus.NO_CONTENT }),
    SwaggerValidationResponse(),
    SwaggerUnauthorizedResponse({
      errorCode: ErrorCodes.AUTH_INVALID_REFRESH_TOKEN,
      message: 'Invalid refresh token',
    }),
  );

export const SwaggerAuthGoogleDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Initiate Google OAuth2 authentication',
      description: 'Redirects the user to Google consent screen.',
    }),
    ApiResponse({ status: HttpStatus.FOUND }),
    SwaggerServiceUnavailableResponse({
      errorCode: ErrorCodes.GOOGLE_OAUTH_DISABLED,
      message: 'Google OAuth2 is not enabled',
    }),
  );

export const SwaggerAuthVerifyEmailDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Confirm email address with verification token',
      description:
        'Validates the email verification token and activates the account.',
    }),
    ApiResponse({ status: HttpStatus.NO_CONTENT }),
    SwaggerValidationResponse(),
    SwaggerNotFoundResponse([
      {
        errorCode: ErrorCodes.EMAIL_VERIFICATION_INVALID,
        message: 'Email verification expired or not found',
      },
      {
        errorCode: ErrorCodes.USER_NOT_FOUND,
        message: 'User not found',
      },
    ]),
  );

export const SwaggerAuthForgotPasswordDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Request password reset',
      description: 'Sends a password reset code to the provided email address.',
    }),
    ApiResponse({ status: HttpStatus.NO_CONTENT }),
    SwaggerValidationResponse(),
    SwaggerForbiddenResponse({
      errorCode: ErrorCodes.AUTH_EMAIL_NOT_VERIFIED,
      message: 'Email not verified',
    }),
  );

export const SwaggerAuthResetPasswordDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Set a new password using OTP code',
      description: 'Validates the OTP and updates the user password.',
    }),
    ApiResponse({ status: HttpStatus.NO_CONTENT }),
    SwaggerValidationResponse(),
    SwaggerNotFoundResponse([
      {
        errorCode: ErrorCodes.EMAIL_VERIFICATION_INVALID,
        message: 'Email verification expired or not found',
      },
      {
        errorCode: ErrorCodes.USER_NOT_FOUND,
        message: 'User not found',
      },
    ]),
  );

export const SwaggerAuthGetMeDoc = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get authenticated user profile',
      description: 'Returns the profile of the currently authenticated user.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: UserPresenter }),
    SwaggerNotFoundResponse({
      errorCode: ErrorCodes.USER_NOT_FOUND,
      message: 'User not found',
    }),
  );
