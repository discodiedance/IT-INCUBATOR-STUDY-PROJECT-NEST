import { IsEnum } from 'class-validator';
import { BaseSortablePaginationParams } from '../../../../../../core/dto/base.query-params.input-dto';

export class CreateCommentToPostDataType {
  constructor(
    public content: string,
    public commentatorInfo: {
      userId: string;
      userLogin: string;
    },
    public postId: string,
  ) {}
}

export class CreateCommentDataType {
  constructor(
    public content: string,
    public commentatorInfo: {
      userId: string;
      userLogin: string;
    },
    public postId: string,
  ) {}
}

export class CommentSortDataType {
  constructor(
    public postId?: string,
    public pageNumber?: number,
    public pageSize?: number,
    public sortBy?: string,
    public sortDirection?: 'asc' | 'desc',
  ) {}
}

export class UpdateCommentDataType {
  constructor(public content: string) {}
}

export enum CommentsSortBy {
  createdAt = 'createdAt',
}

export class GetCommentsQueryParams extends BaseSortablePaginationParams<CommentsSortBy> {
  @IsEnum(CommentsSortBy)
  sortBy = CommentsSortBy.createdAt;
}
