import { IsString, IsStrongPassword, Length } from 'class-validator';
import { Match } from '@common/decorators/match.decorator';
import { Trim } from '@common/decorators/trim.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'User otp code',
    example: '765416',
  })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 characters' })
  otp!: string;

  @ApiProperty({ example: 'passwordStrong@123' })
  @IsStrongPassword()
  @Trim()
  newPassword!: string;

  @ApiProperty({ example: 'passwordStrong@123' })
  @IsString()
  @Match('newPassword', { message: 'Passwords do not match' })
  confirmPassword!: string;
}
