import { IsEnum } from 'class-validator';
import { TaskStatus } from '@modules/tasks/enums/task-status.enum';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  status!: TaskStatus;
}
