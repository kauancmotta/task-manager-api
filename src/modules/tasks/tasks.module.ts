import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TasksController } from '@modules/tasks/controllers/tasks.controller';
import { Task } from '@modules/tasks/entities/task.entity';
import { TaskAssignee } from '@modules/tasks/entities/task-assignee.entity';
import { TaskAttachment } from '@modules/tasks/entities/task-attachment.entity';
import { TasksService } from '@modules/tasks/services/tasks.service';
import { Category } from '@modules/categories/entities/categories.entity';
import { User } from '@modules/users/entities/user.entity';
import { TaskAssigneesService } from '@modules/tasks/services/task-assignees.service';
import { TaskAssigneesController } from '@modules/tasks/controllers/task-assignees.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      User,
      Task,
      TaskAssignee,
      TaskAttachment,
    ]),
  ],
  controllers: [TasksController, TaskAssigneesController],
  providers: [TasksService, TaskAssigneesService],
})
export class TasksModule {}
