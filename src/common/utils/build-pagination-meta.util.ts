interface PaginationMetaParams {
  total: number;
  page: number;
  limit: number;
}

export function buildPaginationMeta({
  total,
  limit,
  page,
}: PaginationMetaParams) {
  return {
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    limit,
  };
}
