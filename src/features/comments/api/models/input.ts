export class InputCommentDataType {
  constructor(public content: string) {}
}

export class InputUpdateCommentDataType {
  constructor(public content: string) {}
}

export class InputCommentSortDataType {
  constructor(
    public pageNumber?: number,
    public pageSize?: number,
    public sortBy?: string,
    public sortDirection?: 'asc' | 'desc',
  ) {}
}
