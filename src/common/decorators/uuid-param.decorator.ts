import { Param } from '@nestjs/common';
import { ParseUuidPipe } from '@common/pipes/parse-uuid.pipe';

export const UuidParam = (param: string) => Param(param, ParseUuidPipe);
