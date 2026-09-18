import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryPresenter {
  @ApiProperty({ example: '01a0b2c3-710f-7c0e-813c-e8d53206c864' })
  id!: string;

  @ApiProperty({ example: '2026-09-18T04:25:48.046Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-18T04:25:48.046Z' })
  updatedAt!: Date;

  @ApiProperty({ example: 'Work' })
  name!: string;

  @ApiPropertyOptional({
    example: 'Organize tasks related to work activities',
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({ example: '#aaa' })
  color!: string;

  @ApiProperty({ example: '01a0a170-d764-7f9c-8b9a-98ad13f6880c' })
  createdByUserId!: string;
}
