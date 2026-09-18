import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

import { UUIDV7Entity } from './uuidv7.entity';
import { Exclude } from 'class-transformer';

export abstract class BaseEntity extends UUIDV7Entity {
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Exclude()
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;
}
