import { Trim } from '@common/decorators/trim.decorator';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsStrongPassword()
  @Trim()
  newPassword!: string;
}
