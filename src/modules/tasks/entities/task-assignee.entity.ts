import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '@common/entities/base.entity';
import { Task } from '@modules/tasks/entities/task.entity';
import { User } from '@modules/users/entities/user.entity';

@Entity('task_assignees')
export class TaskAssignee extends BaseEntity {
  @Column({ name: 'task_id' })
  taskId!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => Task)
  @JoinColumn({
    name: 'task_id',
    foreignKeyConstraintName: 'fk_task_assignees_task_id',
  })
  task!: Task;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'fk_task_assignees_user_id',
  })
  user!: User;
}
