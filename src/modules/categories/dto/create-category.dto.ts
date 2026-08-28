import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'color must be a valid hex color (e.g. #ffffff or #fff)',
  })
  color!: string;
}
