import { CreateTaskDto } from '@modules/tasks/dto/create-task.dto';
import { OmitType, PartialType } from '@nestjs/mapped-types';

export class UpdateTaskDto extends PartialType(
  OmitType(CreateTaskDto, ['categoryIds'] as const),
) {}
