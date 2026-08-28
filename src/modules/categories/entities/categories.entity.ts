import { BaseWithoutSoftDeleteEntity } from '@common/entities/base-without-soft-delete.entity';
import { Entity, Column } from 'typeorm';

@Entity('categories')
export class Category extends BaseWithoutSoftDeleteEntity {
  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  color!: string;
}
