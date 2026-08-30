import { IsUUID } from 'class-validator';

export class CreateTaskAssigneeDto {
  @IsUUID('7', { message: 'userId must UUID V7 format' })
  userId!: string;
}
