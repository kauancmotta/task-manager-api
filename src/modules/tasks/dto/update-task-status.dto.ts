import { IsEnum } from 'class-validator';
import { TaskStatus } from '@modules/tasks/enums/task-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskStatusDto {
  @ApiProperty({
    example: 'todo',
    enum: TaskStatus,
  })
  @IsEnum(TaskStatus)
  status!: TaskStatus;
}
