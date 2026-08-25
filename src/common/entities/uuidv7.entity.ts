import { BeforeInsert, PrimaryColumn } from 'typeorm';
import { uuidv7 } from 'uuidv7';

export abstract class UUIDV7Entity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }
}