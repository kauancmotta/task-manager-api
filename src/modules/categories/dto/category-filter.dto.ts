import { IsOptional, IsString } from 'class-validator';

export class CategoryFilterDto {
  @IsString()
  @IsOptional()
  search?: string;
}
