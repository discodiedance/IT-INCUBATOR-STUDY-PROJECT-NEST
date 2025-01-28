import { Injectable } from '@nestjs/common';
import { UnauthorizedDomainException } from '../../core/exceptions/domain-exceptions';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../crypto/crypto.service';
import { UserRepository } from '../users/infrastructure/user.repository';
import { LoginDataType } from '../users/api/models/dto/input';

@Injectable()
export class AuthService {
  constructor(
    private UserRepository: UserRepository,
    private JwtService: JwtService,
    private CryptoService: CryptoService,
  ) {}

  async validateUser(inpuitLoginData: LoginDataType): Promise<string> {
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

  login(userId: string) {
    const accessToken = this.JwtService.sign({ userId });

    return accessToken;
  }
}
