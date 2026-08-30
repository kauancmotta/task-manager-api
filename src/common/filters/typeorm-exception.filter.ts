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
  private readonly isDevelopment = process.env.NODE_ENV !== 'production';

  catch(
    exception: QueryFailedError | ConnectionNotFoundError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // connect
    if (exception instanceof ConnectionNotFoundError) {
      this.logger.error('Database connection lost', exception.stack);
      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Service temporarily unavailable',
      });
      return;
    }

    const driverError = exception.driverError as { code?: string };

    // logs stack trace
    this.logger.error(
      'Database query failed',
      this.isDevelopment
        ? {
            message: exception.message,
            query: exception.query,
            code: driverError.code,
            stack: exception.stack,
          }
        : { code: driverError.code },
    );

    const status: number =
      driverError.code === PostgresErrorCode.UniqueViolation
        ? HttpStatus.CONFLICT
        : driverError.code === PostgresErrorCode.NotNullViolation
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      driverError.code === PostgresErrorCode.UniqueViolation
        ? 'Record already exists'
        : driverError.code === PostgresErrorCode.NotNullViolation
          ? 'Missing required fields'
          : 'Database error';

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
