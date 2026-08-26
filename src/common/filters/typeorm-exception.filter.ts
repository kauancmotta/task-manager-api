import { Response } from 'express';
import { QueryFailedError, ConnectionNotFoundError } from 'typeorm';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { PostgresErrorCode } from '@common/constants/postgres-error-codes';

@Catch(QueryFailedError, ConnectionNotFoundError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TypeOrmExceptionFilter.name);

  catch(
    exception: QueryFailedError | ConnectionNotFoundError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // connection
    if (exception instanceof ConnectionNotFoundError) {
      this.logger.error('Database connection lost');
      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Service temporarily unavailable',
      });
      return;
    }

    // query
    const driverError = exception.driverError as { code?: string };

    const status: number =
      driverError.code === PostgresErrorCode.UniqueViolation
        ? HttpStatus.CONFLICT
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      driverError.code === PostgresErrorCode.UniqueViolation
        ? 'Record already exists'
        : 'Database error';

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
