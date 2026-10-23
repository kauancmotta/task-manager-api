import { CategoryPresenter } from '@modules/categories/presenters';
import { TaskPriority } from '@modules/tasks/enums/task-priority.enum';
import { TaskStatus } from '@modules/tasks/enums/task-status.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaskPresenter {
  @ApiProperty({ example: '01a0b4f4-92b6-7d53-b757-bc43360a8607' })
  id!: string;

  @ApiProperty({ example: '2026-09-18T14:46:09.740Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-18T14:46:09.740Z' })
  updatedAt!: Date;

  @ApiProperty({ example: 'Fix login bug on mobile' })
  name!: string;

  @ApiPropertyOptional({
    example:
      'Users are unable to login on iOS devices running version 16+. Investigate and fix the authentication flow.',
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    example: 'todo',
    enum: TaskStatus,
  })
  status!: TaskStatus;

  @ApiProperty({ example: 1, examples: [2, 3, 4] })
  priority!: TaskPriority;

  @ApiProperty({ example: '2026-09-19T14:38:42.356Z', nullable: true })
  dueDate?: Date | null;

  @ApiProperty({ example: '01a0a5b6-6f69-77ce-8f8f-16155cef8fa5' })
  createdByUserId!: string;

  categories!: CategoryPresenter[];

  @ApiProperty({ example: false })
  overdue!: boolean;
}
