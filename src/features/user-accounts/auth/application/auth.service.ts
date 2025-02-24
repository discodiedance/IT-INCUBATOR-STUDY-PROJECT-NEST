import { Injectable } from '@nestjs/common';
import { UnauthorizedDomainException } from '../../../../core/exceptions/domain-exceptions';
import { InputLoginDataType } from '../../users/api/models/dto/input';
import { UserRepository } from '../../users/infrastructure/user.repository';
import { CryptoService } from '../../crypto/crypto.service';

@Injectable()
export class AuthService {
  constructor(
    private UserRepository: UserRepository,
    private CryptoService: CryptoService,
  ) {}

  async validateUser(inpuitLoginData: InputLoginDataType): Promise<string> {
    const user = await this.UserRepository.getByLoginOrEmail(
      inpuitLoginData.loginOrEmail,
    );

    if (!user) {
      throw UnauthorizedDomainException.create();
    }

    const isPasswordValid = await this.CryptoService.comparePasswords(
      inpuitLoginData.password,
      user.accountData.passwordHash,
    );

    if (!isPasswordValid) {
      throw UnauthorizedDomainException.create();
    }
    return user.id;
  }
}
