import { CreateTaskDto } from '@modules/tasks/dto/create-task.dto';
import { OmitType, PartialType } from '@nestjs/swagger';

export class UpdateTaskDto extends PartialType(
  OmitType(CreateTaskDto, ['categoryIds'] as const),
) {}
