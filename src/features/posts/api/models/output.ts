import { ExtendedLikesInfoType } from './post.dto';

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
  constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string,
    public extendedLikesInfo: ExtendedLikesInfoType,
  ) {}
}
