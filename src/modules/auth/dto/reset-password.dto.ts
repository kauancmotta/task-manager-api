import { Trim } from '@common/decorators/trim.decorator';
import { IsString, IsStrongPassword, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 characters' })
  otp!: string;

  @IsStrongPassword()
  @Trim()
  newPassword!: string;
}
