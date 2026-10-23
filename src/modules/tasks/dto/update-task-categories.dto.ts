import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class UpdateTaskCategoriesDto {
  @ApiProperty({ example: '01a0b2c3-710f-7c0e-813c-e8d53206c864' })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('7', { each: true, message: 'categoryIds must UUID V7 format' })
  categoryIds!: string[];
}
