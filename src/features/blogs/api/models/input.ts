export class InputBlogDataType {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
  ) {}
}

export class InputBlogSortDataType {
  constructor(
    public searchNameTerm?: string,
    public sortBy?: string,
    public sortDirection?: 'asc' | 'desc',
    public pageNumber?: number,
    public pageSize?: number,
  ) {}
}
