import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodes } from '@common/enums/error-codes.enum';

export class AppException extends HttpException {
  constructor(
    errorCode: ErrorCodes,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    data?: Record<string, unknown>,
  ) {
    super({ statusCode: status, errorCode, message, ...data }, status);
  }
}
