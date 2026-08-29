import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateUserDto } from '@modules/users/dto';

describe('UpdateUserDto', () => {
  it('should pass with empty object', async () => {
    const dto = plainToInstance(UpdateUserDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
