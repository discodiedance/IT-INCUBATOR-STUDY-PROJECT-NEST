export class CreateCommentToPostDataType {
  constructor(
    public postId: string,
    public content: string,
    public userId: string,
    public login: string,
  ) {}
}

export class UpdateCommentDataType {
  constructor(public content: string) {}
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
