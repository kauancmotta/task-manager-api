import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@common/entities/base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl?: string | null;
}
