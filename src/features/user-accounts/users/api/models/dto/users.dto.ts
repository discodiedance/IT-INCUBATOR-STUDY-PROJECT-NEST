import { IsEnum } from 'class-validator';
import { BaseSortablePaginationParams } from '../../../../../../core/dto/base.query-params.input-dto';

export class CreateUserAccountDataType {
  constructor(
    public login: string,
    public email: string,
    public password: string,
  ) {}
}

export class CreateUserDataType {
  constructor(
    public login: string,
    public email: string,
    public passwordHash: string,
  ) {}
}

export class UserSortDataType {
  constructor(
    public sortBy?: string,
    public sortDirection?: 'asc' | 'desc',
    public pageNumber?: number,
    public pageSize?: number,
    public searchLoginTerm?: string,
    public searchEmailTerm?: string,
  ) {}
}

export enum UsersSortBy {
  createdAt = 'createdAt',
  login = 'login',
  email = 'email',
}

export class GetUsersQueryParams extends BaseSortablePaginationParams<UsersSortBy> {
  @IsEnum(UsersSortBy)
  sortBy = UsersSortBy.createdAt;
  searchLoginTerm: string | null = null;
  searchEmailTerm: string | null = null;
}
