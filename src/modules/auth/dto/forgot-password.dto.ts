import { Lowercase } from '@common/decorators/lowercase.decorator';
import { IsEmail, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(100)
  @Lowercase()
  email!: string;
}
