class PaginationParams {
  pageNumber: number | null = 1;
  pageSize: number | null = 10;

  calculateSkip() {
    return ((this.pageNumber ?? 1) - 1) * (this.pageSize ?? 10);
  }
}

export enum SortDirection {
  asc = 'asc',
  desc = 'desc',
}

export abstract class BaseSortablePaginationParams<T> extends PaginationParams {
  sortDirection: SortDirection = SortDirection.desc;
  abstract sortBy: T;
}
