import { Column, Entity, OneToMany } from 'typeorm';

import { BaseEntity } from '@common/entities/base.entity';
import { TaskAssignee } from '@modules/tasks/entities/task-assignee.entity';
import { Task } from '@modules/tasks/entities/task.entity';
import { RefreshToken } from '@modules/auth/entities/refresh-token.entity';
import { Exclude } from 'class-transformer';
import { TaskAttachment } from '@modules/tasks/entities/task-attachment.entity';
import { Category } from '@modules/categories/entities/categories.entity';
import { EmailVerification } from '@modules/auth/entities/email-verification.entity';

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

  @Exclude()
  @Column({ name: 'google_id', nullable: true })
  googleId?: string;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified!: boolean;

  @OneToMany(
    () => EmailVerification,
    (emailVerification) => emailVerification.user,
  )
  emailVerifications!: EmailVerification[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens!: RefreshToken[];

  @OneToMany(() => Category, (category) => category.createdByUser)
  categories!: Category[];

  @OneToMany(() => Task, (task) => task.createdByUser)
  tasks!: Task[];

  @OneToMany(() => TaskAssignee, (taskAssignee) => taskAssignee.user)
  taskAssignees!: TaskAssignee[];

  @OneToMany(
    () => TaskAttachment,
    (taskAttachment) => taskAttachment.uploadedByUser,
  )
  taskAttachments!: TaskAttachment[];
}
