import { TaskPriority } from '@modules/tasks/enums/task-priority.enum';
import { TaskStatus } from '@modules/tasks/enums/task-status.enum';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class TaskFilterDto {
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsDateString()
  dueDateBefore?: string;

  @IsOptional()
  @IsDateString()
  dueDateAfter?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('7', { each: true, message: 'categoryIds must UUID V7 format' })
  categoryIds?: string[];

  @IsOptional()
  @IsString()
  search?: string;
}
