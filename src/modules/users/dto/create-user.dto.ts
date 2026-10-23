import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { Trim } from '@common/decorators/trim.decorator';
import { Lowercase } from '@common/decorators/lowercase.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Georgia C. Rice' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Trim()
  name!: string;

  @ApiProperty({ example: 'email@domain.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(100)
  @Lowercase()
  email!: string;
}
