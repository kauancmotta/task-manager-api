import {
  CreateTaskDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
} from '@modules/tasks/dto';

export interface TaskContext {
  userId: string;
  taskId: string;
}

export type TaskContextWithCreateTaskDto = Omit<TaskContext, 'taskId'> & {
  createTaskDto: CreateTaskDto;
};
export type TaskContextWithUpdateTaskDto = TaskContext & {
  updateTaskDto: UpdateTaskDto;
};
export type TaskContextWithUpdateTaskStatusDto = TaskContext & {
  updateTaskStatusDto: UpdateTaskStatusDto;
};

export type TaskContextWithAssigneeId = TaskContext & { assigneeId: string };

export type TaskContextWithAttachmentId = TaskContext & {
  attachmentId: string;
};
export type TaskContextWithFile = TaskContext & { file: Express.Multer.File };
