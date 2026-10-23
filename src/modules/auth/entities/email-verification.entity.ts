import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { BaseWithoutSoftDeleteEntity } from '@common/entities/base-without-soft-delete.entity';
import { User } from '@modules/users/entities/user.entity';
import { EmailVerificationTypes } from '@modules/auth/enums';

@Entity('email_verifications')
@Unique(['token'])
export class EmailVerification extends BaseWithoutSoftDeleteEntity {
  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ select: false })
  token!: string;

  @Column({ type: 'enum', enum: EmailVerificationTypes })
  type!: EmailVerificationTypes;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'fk_email_verifications_user_id',
  })
  user!: User;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;
}
