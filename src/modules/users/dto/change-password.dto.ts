import { Match } from '@common/decorators/match.decorator';
import { Trim } from '@common/decorators/trim.decorator';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsStrongPassword()
  @Trim()
  newPassword!: string;

  @IsString()
  @Match('newPassword', { message: 'Passwords do not match' })
  confirmPassword!: string;
}
