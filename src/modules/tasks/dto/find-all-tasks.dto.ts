import { IntersectionType } from '@nestjs/mapped-types';

import { PaginationDto } from '@common/dto/pagination.dto';
import { TaskFilterDto } from './task-filter.dto';

export class FindAllTasksDto extends IntersectionType(
  PaginationDto,
  TaskFilterDto,
) {}
