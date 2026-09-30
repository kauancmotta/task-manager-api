import { IsString, IsNotEmpty } from 'class-validator';

import { AppValidationPipe } from '@common/pipes/validation.pipe';
import { ErrorCodes } from '@common/enums/error-codes.enum';

class MockDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

describe('AppValidationPipe', () => {
  let pipe: AppValidationPipe;

  beforeEach(() => {
    pipe = new AppValidationPipe();
  });

  it('should throw AppException with fields when dto is invalid', async () => {
    const dto: MockDto = { name: '' };

    await expect(
      pipe.transform(dto, {
        type: 'body' as const,
        metatype: MockDto,
      }),
    ).rejects.toMatchObject({
      response: {
        errorCode: ErrorCodes.VALIDATION_ERROR,
        message: 'Validation failed',
        fields: {
          name: expect.any(Array) as string[],
        },
      },
    });
  });

  it('should pass when dto is valid', async () => {
    const dto: MockDto = { name: 'valid name' };

    const result = (await pipe.transform(dto, {
      type: 'body' as const,
      metatype: MockDto,
    })) as MockDto;

    expect(result).toEqual(dto);
  });
});
