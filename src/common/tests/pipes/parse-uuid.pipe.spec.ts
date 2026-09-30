import { HttpStatus } from '@nestjs/common';
import { uuidv7 } from 'uuidv7';

import { ParseUuidPipe } from '@common/pipes/parse-uuid.pipe';
import { AppException } from '@common/exceptions/app.exception';
import { ErrorCodes } from '@common/enums/error-codes.enum';

describe('ParseUuidPipe', () => {
  let pipe: ParseUuidPipe;

  beforeEach(() => {
    pipe = new ParseUuidPipe();
  });

  it('should throw AppException when invalid UUID', () => {
    expect(() => pipe.transform('invalid-uuid')).toThrow(
      new AppException(
        ErrorCodes.UUID_INVALID,
        'The value is not a valid UUID',
        HttpStatus.BAD_REQUEST,
      ),
    );
  });

  it('should throw AppException when empty string', () => {
    expect(() => pipe.transform('')).toThrow(
      new AppException(
        ErrorCodes.UUID_INVALID,
        'The value is not a valid UUID',
        HttpStatus.BAD_REQUEST,
      ),
    );
  });

  it('should return the value when valid UUID', () => {
    const validUuid = uuidv7();

    const result = pipe.transform(validUuid);

    expect(result).toBe(validUuid);
  });
});
