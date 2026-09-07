import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from '@common/entities/base.entity';
import { TaskPriority } from '@modules/tasks/enums/task-priority.enum';
import { TaskStatus } from '@modules/tasks/enums/task-status.enum';
import { Category } from '@modules/categories/entities/categories.entity';
import { TaskAssignee } from '@modules/tasks/entities/task-assignee.entity';
import { User } from '@modules/users/entities/user.entity';
import { TaskAttachment } from '@modules/tasks/entities/task-attachment.entity';

@Entity('tasks')
export class Task extends BaseEntity {
  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
  status!: TaskStatus;

  @Column({ type: 'int', default: TaskPriority.LOW })
  priority!: TaskPriority;

  @Column({ name: 'category_id', nullable: true })
  categoryId?: string;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate?: Date;

  @Column({ name: 'created_by_user_id' })
  createdByUserId!: string;

  @ManyToOne(() => Category, (category) => category.tasks, { nullable: true })
  @JoinColumn({
    name: 'category_id',
    foreignKeyConstraintName: 'fk_tasks_category_id',
  })
  category?: Category;

  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn({
    name: 'created_by_user_id',
    foreignKeyConstraintName: 'fk_tasks_created_by_user_id',
  })
  createdByUser!: User;

  @OneToMany(() => TaskAssignee, (taskAssignee) => taskAssignee.task)
  taskAssignees!: TaskAssignee[];

  @OneToMany(() => TaskAttachment, (taskAttachment) => taskAttachment.task)
  taskAttachments!: TaskAttachment[];
}
