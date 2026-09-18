import { PaginationMetaPresenter } from '@common/presenters/pagination-meta.presenter';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponsePresenter<T> {
  @ApiProperty({ isArray: true })
  data!: T[];

  @ApiProperty({ type: PaginationMetaPresenter })
  meta!: PaginationMetaPresenter;
}
