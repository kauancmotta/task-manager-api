import { Column, Entity, OneToMany } from 'typeorm';

import { BaseEntity } from '@common/entities/base.entity';
import { TaskAssignee } from '@modules/tasks/entities/task-assignee.entity';
import { Task } from '@modules/tasks/entities/task.entity';
import { RefreshToken } from '@modules/auth/entities/refresh-token.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl?: string | null;

  @Exclude()
  @Column({ nullable: true, select: false })
  password?: string;

  @Column({ name: 'google_id', nullable: true })
  googleId?: string;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens!: RefreshToken[];

  @OneToMany(() => Task, (task) => task.createdByUser)
  tasks!: Task[];

  @OneToMany(() => TaskAssignee, (taskAssignee) => taskAssignee.user)
  taskAssignees!: TaskAssignee[];
}
