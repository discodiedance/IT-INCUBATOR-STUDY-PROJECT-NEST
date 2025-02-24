import { IsEnum, IsString } from 'class-validator';
import { PostDocument } from '../../../../../posts/api/models/post.entities';

export enum PostLikesConstraints {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export class CreatePostLikeDataType {
  constructor(
    public post: PostDocument,
    public likeStatus: 'None' | 'Like' | 'Dislike',
    public parentId: string,
    public parentLogin: string,
  ) {}
}

export class InputCreatePostLikeDataType {
  @IsEnum(PostLikesConstraints)
  @IsString()
  public likeStatus: 'None' | 'Like' | 'Dislike';
}

export class ExtendedLikesInfoType {
  constructor(
    public likesCount: number,
    public dislikesCount: number,
    public myStatus: 'None' | 'Like' | 'Dislike',
    public newestLikes: NewestLikesType[] | [],
  ) {}
}

export class NewestLikesType {
  constructor(
    public addedAt: string,
    public userId: string,
    public login: string,
  ) {}
}
