import { IsStringWithTrim } from './../../../../../core/decorators/validation/is-string-with-trim.decorator';
import { IsEnum, IsString, Matches } from 'class-validator';
import {
  emailConstraints,
  loginConstraints,
  passwordConstraints,
} from '../../../application/user.entity';
import { BaseSortablePaginationParams } from '../../../../../core/dto//base.query-params.input-dto';

export class InputCreateUserAccountDataType {
  @Matches(loginConstraints.match)
  @IsStringWithTrim(loginConstraints.minLength, loginConstraints.maxLength)
  public login: string;

  @IsStringWithTrim(
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  public password: string;

  @IsStringWithTrim(emailConstraints.minLength, emailConstraints.maxLength)
  @Matches(emailConstraints.match)
  public email: string;
}

export class InputEmaillResendingDataType {
  @Matches(emailConstraints.match)
  @IsStringWithTrim(emailConstraints.minLength, emailConstraints.maxLength)
  public email: string;
}

export class InputEmailConfirmationDataType {
  @IsString()
  public code: string;
}

export class InputNewPasswordDataType {
  @IsStringWithTrim(
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  public newPassword: string;

  @IsString()
  public recoveryCode: string;
}

export class LoginDataType {
  @IsString()
  public loginOrEmail: string;

  @IsString()
  public password: string;
}

export enum UsersSortBy {
  CreatedAt = 'createdAt',
  Login = 'login',
  Email = 'email',
}

export class GetUsersQueryParams extends BaseSortablePaginationParams<UsersSortBy> {
  @IsEnum(UsersSortBy)
  sortBy = UsersSortBy.CreatedAt;
  searchLoginTerm: string | null = null;
  searchEmailTerm: string | null = null;
}
