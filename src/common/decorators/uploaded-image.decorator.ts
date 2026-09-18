import { ErrorCodes } from '@common/enums/error-codes.enum';
import { AppException } from '@common/exceptions/app.exception';
import {
  FileTypeValidator,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  UploadedFile,
} from '@nestjs/common';

export const UploadedImage = (keyNameFile: string) =>
  UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        new FileTypeValidator({
          fileType: /image\/(jpeg|png|webp)/,
          errorMessage: 'FILE_INVALID_TYPE',
        }),
      ],
      fileIsRequired: true,
      exceptionFactory: (error) => {
        if (error.includes('FILE_INVALID_TYPE')) {
          return new AppException(
            ErrorCodes.FILE_INVALID_TYPE,
            `${keyNameFile} must be in format: .jpeg, .png, .webp`,
            HttpStatus.BAD_REQUEST,
          );
        }

        if (error.includes('too large')) {
          return new AppException(
            ErrorCodes.FILE_TOO_LARGE,
            `${keyNameFile} size must be less than 5MB`,
            HttpStatus.BAD_REQUEST,
          );
        }

        return new AppException(
          ErrorCodes.FILE_REQUIRED,
          `${keyNameFile} is required and must be sent as multipart/form-data`,
          HttpStatus.BAD_REQUEST,
        );
      },
    }),
  );
