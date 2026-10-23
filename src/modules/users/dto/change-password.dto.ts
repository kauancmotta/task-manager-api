import { Match } from '@common/decorators/match.decorator';
import { Trim } from '@common/decorators/trim.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'currentPassword' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: 'newPasswordStrong@123' })
  @IsStrongPassword()
  @Trim()
  newPassword!: string;

  @ApiProperty({ example: 'newPasswordStrong@123' })
  @IsString()
  @Match('newPassword', { message: 'Passwords do not match' })
  confirmPassword!: string;
}
