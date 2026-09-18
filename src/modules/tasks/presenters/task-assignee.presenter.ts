import { ApiProperty } from '@nestjs/swagger';

export class TaskAssigneePresenter {
  @ApiProperty({ example: '01a0b4f8-9492-7572-9cc0-887450cb9474' })
  id!: string;

  @ApiProperty({ example: '2026-09-18T14:43:04.977Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-18T14:43:04.977Z' })
  updatedAt!: Date;

  @ApiProperty({ example: '01a0b4f4-92b6-7d53-b757-bc43360a8607' })
  taskId!: string;

  @ApiProperty({ example: '01a0a5b6-6f69-77ce-8f8f-16155cef8fa5' })
  userId!: string;
}
