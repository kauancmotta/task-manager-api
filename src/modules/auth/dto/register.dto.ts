import { Lowercase } from '@common/decorators/lowercase.decorator';
import { Match } from '@common/decorators/match.decorator';
import { Trim } from '@common/decorators/trim.decorator';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Georgia C. Rice' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Trim()
  name!: string;

  @ApiProperty({ example: 'email@domain.com' })
  @IsEmail()
  @Lowercase()
  @Trim()
  email!: string;

  @ApiProperty({ example: 'passwordStrong@123' })
  @IsStrongPassword()
  @Trim()
  password!: string;

  @ApiProperty({ example: 'passwordStrong@123' })
  @IsString()
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword!: string;
}
