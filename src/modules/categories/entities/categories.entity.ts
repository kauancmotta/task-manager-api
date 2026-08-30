import { Entity, Column, OneToMany } from 'typeorm';

import { BaseWithoutSoftDeleteEntity } from '@common/entities/base-without-soft-delete.entity';
import { Task } from '@modules/tasks/entities/task.entity';

@Entity('categories')
export class Category extends BaseWithoutSoftDeleteEntity {
  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  color!: string;

  @OneToMany(() => Task, (task) => task.category)
  tasks!: Task[];
}
