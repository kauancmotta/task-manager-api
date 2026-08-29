import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { Trim } from '@common/decorators/trim.decorator';
import { Lowercase } from '@common/decorators/lowercase.decorator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Trim()
  name!: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(100)
  @Lowercase()
  email!: string;
}
