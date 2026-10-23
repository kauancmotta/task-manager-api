import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutDto {
  @ApiProperty({
    example: '54470afbd8fd67c769e2be86d06fd44fd63c9d2b0a1961e7073e3066e7bd43cf',
    description: 'User refresh token',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
