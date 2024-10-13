import { PostDocument } from './../../../../posts/api/models/post.entities';

export class CreatePostLikeData {
  constructor(
    public post: PostDocument,
    public likeStatus: 'None' | 'Like' | 'Dislike',
    public parentId: string,
    public parentLogin: string,
  ) {}
}

export class UpdatePostLikeData {
  constructor(
    public post: PostDocument,
    public likeStatus: 'None' | 'Like' | 'Dislike',
    public parentId: string,
    public parentLogin: string,
  ) {}
}

export class PostLikesDBType {
  constructor(
    public id: string,
    public createdAt: string,
    public status: 'None' | 'Like' | 'Dislike',
    public parentId: string,
    public parentLogin: string,
    public postId: string,
    public isFirstReaction: boolean,
    public isDeleted: boolean,
  ) {}
}
