import { UserDocument } from '../user.enitities';

export class OutputUserType {
  public createdAt: string;
  public email: string;
  public login: string;
  public id: string;

  static mapToView(user: UserDocument): OutputUserType {
    const dto = new OutputUserType();

    dto.createdAt = user.accountData.createdAt;
    dto.email = user.accountData.email;
    dto.login = user.accountData.login;
    dto.id = user.id;

    return dto;
  }
}

export class OutputMeType {
  public email: string;
  public login: string;
  public userId: string;

  static mapToView(user: UserDocument): OutputMeType {
    {
      const dto = new OutputMeType();

      dto.email = user.accountData.email;
      dto.login = user.accountData.login;
      dto.userId = user.id;

      return dto;
    }
  }
}
