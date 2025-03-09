export abstract class PaginatedViewDto<T> {
  abstract items: T;
  totalCount: number | null;
  pagesCount: number | null;
  page: number | null;
  pageSize: number | null;

  public static mapToView<T>(data: {
    items: T;
    page: number;
    size: number;
    totalCount: number;
  }): PaginatedViewDto<T> {
    return {
      pagesCount: Math.ceil(data.totalCount / data.size),
      page: data.page ?? 1,
      pageSize: data.size ?? 10,
      totalCount: data.totalCount,
      items: data.items,
    };
  }
}
