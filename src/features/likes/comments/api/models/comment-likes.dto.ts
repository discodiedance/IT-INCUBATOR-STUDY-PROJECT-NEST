import { OutputCommentType } from './../../../../comments/api/models/output';

export class CreateCommentLikeData {
  constructor(
    public comment: OutputCommentType,
    public likeStatus: 'None' | 'Like' | 'Dislike',
    public parentId: string,
  ) {}
}

export class UpdateCommentLikeData {
  constructor(
    public comment: OutputCommentType,
    public likeStatus: 'None' | 'Like' | 'Dislike',
    public parentId: string,
  ) {}
}

export class CommentLikesDBType {
  constructor(
    public id: string,
    public createdAt: string,
    public status: 'None' | 'Like' | 'Dislike',
    public parentId: string,
    public commentId: string,
  ) {}
}
