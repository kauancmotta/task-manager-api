import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';

import { Lowercase } from '@common/decorators/lowercase.decorator';

export class ResendEmailDto {
  @ApiProperty({ example: 'email@domain.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(100)
  @Lowercase()
  email!: string;
}
