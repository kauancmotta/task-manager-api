import { ErrorCodes } from '@common/enums/error-codes.enum';
import { AppException } from '@common/exceptions/app.exception';
import { HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { validate as isUuid } from 'uuid';

@Injectable()
export class ParseUuidPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isUuid(value)) {
      throw new AppException(
        ErrorCodes.UUID_INVALID,
        'The value is not a valid UUID',
        HttpStatus.BAD_REQUEST,
      );
    }
    return value;
  }
}
