import { Lowercase } from '@common/decorators/lowercase.decorator';
import { Match } from '@common/decorators/match.decorator';
import { Trim } from '@common/decorators/trim.decorator';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Trim()
  name!: string;

  @IsEmail()
  @Lowercase()
  @Trim()
  email!: string;

  @IsStrongPassword()
  @Trim()
  password!: string;

  @IsString()
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword!: string;
}
