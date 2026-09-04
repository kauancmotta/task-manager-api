import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

import { BaseWithoutSoftDeleteEntity } from '@common/entities/base-without-soft-delete.entity';
import { Task } from '@modules/tasks/entities/task.entity';
import { User } from '@modules/users/entities/user.entity';

@Entity('categories')
export class Category extends BaseWithoutSoftDeleteEntity {
  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  color!: string;

  @Column({ name: 'created_by_user_id' })
  createdByUserId!: string;

  @OneToMany(() => Task, (task) => task.category)
  tasks!: Task[];

  @ManyToOne(() => User, (user) => user.categories)
  @JoinColumn({
    name: 'created_by_user_id',
    foreignKeyConstraintName: 'fk_categories_created_by_user_id',
  })
  createdByUser!: User;
}
