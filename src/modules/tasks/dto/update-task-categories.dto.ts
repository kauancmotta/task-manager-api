import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class UpdateTaskCategoriesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('7', { each: true, message: 'categoryIds must UUID V7 format' })
  categoryIds!: string[];
}
