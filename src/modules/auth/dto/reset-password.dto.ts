import { IsString, IsStrongPassword, Length } from 'class-validator';
import { Match } from '@common/decorators/match.decorator';
import { Trim } from '@common/decorators/trim.decorator';

export class ResetPasswordDto {
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 characters' })
  otp!: string;

  @IsStrongPassword()
  @Trim()
  newPassword!: string;

  @IsString()
  @Match('newPassword', { message: 'Passwords do not match' })
  confirmPassword!: string;
}
