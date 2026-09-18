import { TaskPriority } from '@modules/tasks/enums/task-priority.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinDate,
} from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Fix login bug on mobile' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    example:
      'Users are unable to login on iOS devices running version 16+. Investigate and fix the authentication flow.',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 1, enum: TaskPriority })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority!: TaskPriority;

  @ApiProperty({ example: '01a0b2c3-710f-7c0e-813c-e8d53206c864' })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('7', { each: true, message: 'categoryIds must UUID V7 format' })
  categoryIds!: string[];

  @ApiPropertyOptional({ example: '2026-09-19T14:38:42.356Z', nullable: true })
  @IsDate()
  @IsOptional()
  @MinDate(() => new Date(), { message: 'Due date must be in the future' })
  @Type(() => Date)
  dueDate?: Date;
}
