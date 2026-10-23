import { PaginatedResponsePresenter } from '@common/presenters';
import { TaskPresenter } from '@modules/tasks/presenters/task.presenter';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedTasksPresenter extends PaginatedResponsePresenter<TaskPresenter> {
  @ApiProperty({ type: [TaskPresenter] })
  declare data: TaskPresenter[];
}
