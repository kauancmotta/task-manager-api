import { Lowercase } from '@common/decorators/lowercase.decorator';
import { Trim } from '@common/decorators/trim.decorator';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @Lowercase()
  @Trim()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
