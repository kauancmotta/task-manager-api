import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '@common/entities/base.entity';
import { Task } from '@modules/tasks/entities/task.entity';
import { User } from '@modules/users/entities/user.entity';

@Entity('task_attachments')
export class TaskAttachment extends BaseEntity {
  @Column({ name: 'file_url' })
  fileUrl!: string;

  @Column({ name: 'file_name' })
  fileName!: string;

  @Column({ name: 'file_size' })
  fileSize!: number;

  @Column({ name: 'mime_type' })
  mimeType!: string;

  @Column({ name: 'task_id' })
  taskId!: string;

  @Column({ name: 'uploaded_by_user_id', nullable: true })
  uploadedByUserId?: string | null;

  @ManyToOne(() => Task, (task) => task.taskAttachments)
  @JoinColumn({
    name: 'task_id',
    foreignKeyConstraintName: 'fk_task_attachments_task_id',
  })
  task!: Task;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({
    name: 'uploaded_by_user_id',
    foreignKeyConstraintName: 'fk_task_attachments_uploaded_by_user_id',
  })
  uploadedByUser?: User | null;
}
