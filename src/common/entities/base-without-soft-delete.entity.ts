import { UUIDV7Entity } from "@common/entities/uuidv7.entity";
import { CreateDateColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseWithoutSoftDeleteEntity extends UUIDV7Entity {
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
