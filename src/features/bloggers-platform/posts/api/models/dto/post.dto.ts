import { IsEnum } from 'class-validator';
import { BaseSortablePaginationParams } from '../../../../../../core/dto/base.query-params.input-dto';

export class UpdatePostDataType {
  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
  ) {}
}

export class CreatePostDataType {
  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
  ) {}
}

export class PostSortDataType {
  constructor(
    public pageNumber?: number,
    public pageSize?: number,
    public sortBy?: string,
    public sortDirection?: 'asc' | 'desc',
    public blogId?: string,
  ) {}
}

export enum PostsSortBy {
  createdAt = 'createdAt',
}

export class GetPostsQueryParams extends BaseSortablePaginationParams<PostsSortBy> {
  @IsEnum(PostsSortBy)
  sortBy = PostsSortBy.createdAt;
}
