import { IsString, Matches } from 'class-validator';
import { IsStringWithTrim } from './../../../../../../core/decorators/validation/is-string-with-trim.decorator';
import {
  loginConstraints,
  passwordConstraints,
  emailConstraints,
} from '../../../constants/validation-constants';
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

export class InputLoginDataType {
  @IsString()
  public loginOrEmail: string;

  @IsString()
  public password: string;
}
