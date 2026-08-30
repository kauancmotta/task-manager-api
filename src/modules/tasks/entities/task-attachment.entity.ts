import { Entity, ManyToOne } from 'typeorm';

import { BaseEntity } from '@common/entities/base.entity';

@Entity('task_attachments')
export class TaskAttachment extends BaseEntity {
}
