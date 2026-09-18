import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserPresenter {
  @ApiProperty({ example: '01a0a170-d764-7f9c-8b9a-98ad13f6880c' })
  id!: string;

  @ApiProperty({ example: '2026-09-14T19:42:02.081Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-14T19:42:02.081Z' })
  updatedAt!: Date;

  @ApiProperty({ example: 'Georgia C. Rice' })
  name!: string;

  @ApiProperty({ example: 'email@domain.com' })
  email!: string;

  @ApiPropertyOptional({
    example: 'https://example-avatar-url.png',
  })
  avatarUrl?: string | null;

  @ApiProperty({ example: true })
  isEmailVerified!: boolean;
}
