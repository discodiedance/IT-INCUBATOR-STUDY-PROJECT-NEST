import { ExtendedLikesInfoType } from '../../../../likes/posts/api/models/dto/post-likes.dto';
import { PostDocument } from '../post.entities';

export class OutputPostType {
  constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string,
    public extendedLikesInfo: {
      likesCount: number;
      dislikesCount: number;
      newestLikes:
        | {
            addedAt: string;
            userId: string;
            login: string;
          }[]
        | [];
    },
  ) {}
}

export class OutputPostTypeWithStatus {
  public id: string;
  public title: string;
  public shortDescription: string;
  public content: string;
  public blogId: string;
  public blogName: string;
  public createdAt: string;
  public extendedLikesInfo: ExtendedLikesInfoType;
}
