import { Lowercase } from '@common/decorators/lowercase.decorator';
import { Trim } from '@common/decorators/trim.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'email@domain.com' })
  @IsEmail()
  @Lowercase()
  @Trim()
  email!: string;

  @ApiProperty({ example: 'passwordStrong@123' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
