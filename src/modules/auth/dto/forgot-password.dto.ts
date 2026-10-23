import { Lowercase } from '@common/decorators/lowercase.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'email@domain.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(100)
  @Lowercase()
  email!: string;
}
