import { IsEnum } from 'class-validator';
import { BaseSortablePaginationParams } from '../../../../../../core/dto/base.query-params.input-dto';

export class CreateBlogDataType {
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

export enum BlogsSortBy {
  createdAt = 'createdAt',
  name = 'name',
}

export class GetBlogsQueryParams extends BaseSortablePaginationParams<BlogsSortBy> {
  @IsEnum(BlogsSortBy)
  sortBy = BlogsSortBy.createdAt;
  searchNameTerm: string | null = null;
}
