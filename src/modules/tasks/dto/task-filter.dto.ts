import { TaskPriority } from '@modules/tasks/enums/task-priority.enum';
import { TaskStatus } from '@modules/tasks/enums/task-status.enum';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class TaskFilterDto {
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsOptional()
  @IsDateString()
  dueDateBefore?: string;

  @IsOptional()
  @IsDateString()
  dueDateAfter?: string;
}
