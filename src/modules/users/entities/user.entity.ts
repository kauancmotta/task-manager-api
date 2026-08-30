import { Column, Entity, OneToMany } from 'typeorm';

import { BaseEntity } from '@common/entities/base.entity';
import { TaskAssignee } from '@modules/tasks/entities/task-assignee.entity';
import { Task } from '@modules/tasks/entities/task.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl?: string | null;

  @OneToMany(() => Task, (task) => task.createdByUser)
  tasks!: Task[];

  @OneToMany(() => TaskAssignee, (taskAssignee) => taskAssignee.user)
  taskAssignees!: TaskAssignee[];
}
