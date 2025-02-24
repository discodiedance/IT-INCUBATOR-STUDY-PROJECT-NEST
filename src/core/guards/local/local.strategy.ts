import { Injectable } from '@nestjs/common';
import { UnauthorizedDomainException } from '../../exceptions/domain-exceptions';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../../../features/user-accounts/auth/application/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private AuthService: AuthService) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<string> {
    const userId = await this.AuthService.validateUser({
      loginOrEmail,
      password,
    });

    if (!userId) {
      throw UnauthorizedDomainException.create();
    }

    return userId;
  }
}
