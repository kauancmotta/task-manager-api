export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}
