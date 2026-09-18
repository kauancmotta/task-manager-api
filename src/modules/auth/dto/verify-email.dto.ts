import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email token',
    example: '3ca7797df319ad90f6d857c39405bff6415ba8e68539fe841935caa525d0dd8d',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;
}
