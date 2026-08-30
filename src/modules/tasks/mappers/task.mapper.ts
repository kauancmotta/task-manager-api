import { Task } from '@modules/tasks/entities/task.entity';

export type TaskPresenter = Omit<Task, 'generateId'> & {
  overdue: boolean;
};

export class TaskMapper {
  static toPresenter = (task: Task): TaskPresenter => ({
    ...task,
    overdue: task.dueDate ? task.dueDate < new Date() : false,
  });

  static toPresenterList = (tasks: Task[]): TaskPresenter[] =>
    tasks.map(TaskMapper.toPresenter);
}
