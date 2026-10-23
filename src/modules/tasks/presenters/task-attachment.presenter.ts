import { ApiProperty } from '@nestjs/swagger';

export class TaskAttachmentPresenter {
  @ApiProperty({ example: '01a0b4fb-664d-74a5-ad79-30c7cca9d31e' })
  id!: string;

  @ApiProperty({ example: '2026-09-18T14:46:09.740Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-18T14:46:09.740Z' })
  updatedAt!: Date;

  @ApiProperty({ example: 'https://example-file-url/photo.jpg' })
  fileUrl!: string;

  @ApiProperty({ example: 'photo.jpg' })
  fileName!: string;

  @ApiProperty({ example: 249103 })
  fileSize!: number;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType!: string;

  @ApiProperty({ example: '01a0b4f4-92b6-7d53-b757-bc43360a8607' })
  taskId!: string;

  @ApiProperty({ example: '01a0a5b6-6f69-77ce-8f8f-16155cef8fa5' })
  uploadedByUserId!: string;
}
