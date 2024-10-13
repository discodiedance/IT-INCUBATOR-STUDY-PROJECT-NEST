export class CreateBlogDataType {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
  ) {}
}

export class UpdateBlogDataType {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
  ) {}
}

export class BlogSortDataType {
  constructor(
    public searchNameTerm?: string,
    public sortBy?: string,
    public sortDirection?: 'asc' | 'desc',
    public pageNumber?: number,
    public pageSize?: number,
  ) {}
}
