import { TaskPriority } from '@modules/tasks/enums/task-priority.enum';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
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

  @IsUUID('7', { message: 'CategoryId must UUID V7 format' })
  @IsOptional()
  categoryId?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDate?: Date;
}
