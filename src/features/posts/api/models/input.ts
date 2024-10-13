export class InputUpdatePostDataType {
  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
  ) {}
}

export class InputCreatePostDataType {
  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
  ) {}
}

export class InputPostSortDataType {
  constructor(
    public pageNumber?: number,
    public pageSize?: number,
    public sortBy?: string,
    public sortDirection?: 'asc' | 'desc',
  ) {}
}

export class InputCreatePostToBlogDataType {
  constructor(
    public content: string,
    public shortDescription: string,
    public title: string,
  ) {}
}
