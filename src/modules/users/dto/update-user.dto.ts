import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { Trim } from '@common/decorators/trim.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'Georgia C. Rice' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Trim()
  name!: string;
}
