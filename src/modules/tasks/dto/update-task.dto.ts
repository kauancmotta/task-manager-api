import { CreateTaskDto } from '@modules/tasks/dto/create-task.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
