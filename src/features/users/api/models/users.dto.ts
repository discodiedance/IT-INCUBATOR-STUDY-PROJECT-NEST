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

export class UserSortDataUserType {
  constructor(
    public sortBy?: string,
    public sortDirection?: 'asc' | 'desc',
    public pageNumber?: number,
    public pageSize?: number,
    public searchLoginTerm?: string,
    public searchEmailTerm?: string,
  ) {}
}

class UserAccountType {
  constructor(
    public email: string,
    public login: string,
    public createdAt: string,
    public passwordHash: string,
  ) {}
}

class EmailConfirmationType {
  constructor(
    public confirmationCode: string,
    public expirationDate: Date,
    public isConfirmed: boolean,
  ) {}
}

class PasswordRecoveryType {
  constructor(
    public recoveryCode: string,
    public expirationDate: Date | null,
  ) {}
}

export class UserDBType {
  constructor(
    public id: string,
    public accountData: UserAccountType,
    public emailConfirmation: EmailConfirmationType,
    public passwordRecoveryConfirmation: PasswordRecoveryType,
  ) {}
}
