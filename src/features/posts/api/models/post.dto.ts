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

export class ExtendedLikesInfoType {
  constructor(
    public likesCount: number,
    public dislikesCount: number,
    public myStatus: any[string] | string,
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
