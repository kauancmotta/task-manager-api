import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

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

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate?: Date | null;

  @Column({ name: 'created_by_user_id' })
  createdByUserId!: string;

  @ManyToMany(() => Category, (category) => category.tasks)
  @JoinTable({
    name: 'task_categories',
    joinColumn: {
      name: 'task_id',
      foreignKeyConstraintName: 'fk_task_categories_task_id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      foreignKeyConstraintName: 'fk_task_categories_category_id',
    },
  })
  categories!: Category[];

  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn({
    name: 'created_by_user_id',
    foreignKeyConstraintName: 'fk_tasks_created_by_user_id',
  })
  createdByUser!: User;

  @OneToMany(() => TaskAssignee, (taskAssignee) => taskAssignee.task, {
    cascade: ['soft-remove'],
  })
  taskAssignees!: TaskAssignee[];

  @OneToMany(() => TaskAttachment, (taskAttachment) => taskAttachment.task, {
    cascade: ['soft-remove'],
  })
  taskAttachments!: TaskAttachment[];
}
