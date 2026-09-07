import { TaskPriority } from '@modules/tasks/enums/task-priority.enum';
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
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority!: TaskPriority;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('7', { each: true, message: 'categoryIds must UUID V7 format' })
  categoryIds!: string[];

  @IsDate()
  @IsOptional()
  @MinDate(() => new Date(), { message: 'Due date must be in the future' })
  @Type(() => Date)
  dueDate?: Date;
}
