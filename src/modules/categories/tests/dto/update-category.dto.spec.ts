import { UpdateCategoryDto } from '@modules/categories/dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('UpdateCategoryDto', () => {
  it('should pass with empty object', async () => {
    const dto = plainToInstance(UpdateCategoryDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
