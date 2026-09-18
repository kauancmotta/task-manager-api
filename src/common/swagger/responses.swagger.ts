import { HttpStatus } from '@nestjs/common';
import {
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiServiceUnavailableResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { ErrorCodes } from '@common/enums/error-codes.enum';

interface ErrorScenario {
  errorCode: ErrorCodes;
  message: string;
}

const buildErrorSchema = (
  statusCode: HttpStatus,
  errorCode: ErrorCodes,
  message: string,
) => ({
  schema: { example: { statusCode, errorCode, message } },
});

const buildMultipleErrorSchema = (
  statusCode: HttpStatus,
  scenarios: ErrorScenario[],
) => ({
  schema: {
    oneOf: scenarios.map(({ errorCode, message }) => ({
      example: { statusCode, errorCode, message },
    })),
  },
});

type ResponseInput = ErrorScenario | ErrorScenario[];

const resolveSchema = (statusCode: HttpStatus, input: ResponseInput) =>
  Array.isArray(input)
    ? buildMultipleErrorSchema(statusCode, input)
    : buildErrorSchema(statusCode, input.errorCode, input.message);

export const SwaggerUnauthorizedResponse = (input: ResponseInput) =>
  ApiUnauthorizedResponse(resolveSchema(HttpStatus.UNAUTHORIZED, input));

export const SwaggerNotFoundResponse = (input: ResponseInput) =>
  ApiNotFoundResponse(resolveSchema(HttpStatus.NOT_FOUND, input));

export const SwaggerConflictResponse = (input: ResponseInput) =>
  ApiConflictResponse(resolveSchema(HttpStatus.CONFLICT, input));

export const SwaggerForbiddenResponse = (input: ResponseInput) =>
  ApiForbiddenResponse(resolveSchema(HttpStatus.FORBIDDEN, input));

export const SwaggerServiceUnavailableResponse = (input: ResponseInput) =>
  ApiServiceUnavailableResponse(
    resolveSchema(HttpStatus.SERVICE_UNAVAILABLE, input),
  );

export const SwaggerInternalServerErrorResponse = (input: ResponseInput) =>
  ApiInternalServerErrorResponse(
    resolveSchema(HttpStatus.INTERNAL_SERVER_ERROR, input),
  );

export const SwaggerBadRequestResponse = (input: ResponseInput) =>
  ApiBadRequestResponse(resolveSchema(HttpStatus.BAD_REQUEST, input));

export const SwaggerValidationResponse = () =>
  ApiBadRequestResponse({
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCodes.VALIDATION_ERROR,
        message: 'Validation failed',
        fields: { fieldName: ['error message'] },
      },
    },
  });

export const SwaggerValidationUploadedImageResponse = (keyNameFile: string) =>
  ApiBadRequestResponse({
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCodes.FILE_INVALID_TYPE,
        message: `${keyNameFile} must be in format: .jpeg, .png, .webp`,
      },
    },
    examples: {
      invalidType: {
        summary: 'Invalid file type',
        value: {
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCodes.FILE_INVALID_TYPE,
          message: `${keyNameFile} must be in format: .jpeg, .png, .webp`,
        },
      },
      tooLarge: {
        summary: 'File too large',
        value: {
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCodes.FILE_TOO_LARGE,
          message: `${keyNameFile} size must be less than 5MB`,
        },
      },
      required: {
        summary: 'File required',
        value: {
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCodes.FILE_REQUIRED,
          message: `${keyNameFile} is required and must be sent as multipart/form-data`,
        },
      },
    },
  });
