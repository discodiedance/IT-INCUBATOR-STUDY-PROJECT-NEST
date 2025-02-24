import { IsEnum, IsString } from 'class-validator';
import { OutputCommentType } from '../../../../../comments/api/models/dto/output';

export enum CommentLikesConstraints {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export class InputCreateCommentLikeDataType {
  @IsEnum(CommentLikesConstraints)
  @IsString()
  public likeStatus: 'None' | 'Like' | 'Dislike';
}

export class CreateCommentLikeDataType {
  constructor(
    public comment: OutputCommentType,
    public likeStatus: 'None' | 'Like' | 'Dislike',
    public parentId: string,
  ) {}
}
