import { ErrorCodes } from '@common/enums/error-codes.enum';
import { AppException } from '@common/exceptions/app.exception';
import { ValidationPipe, ValidationError, HttpStatus } from '@nestjs/common';

export class AppValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const fields = errors.reduce(
          (acc, error) => {
            acc[error.property] = Object.values(error.constraints ?? {});
            return acc;
          },
          {} as Record<string, string[]>,
        );

        return new AppException(
          ErrorCodes.VALIDATION_ERROR,
          'Validation failed',
          HttpStatus.BAD_REQUEST,
          { fields },
        );
      },
    });
  }
}
