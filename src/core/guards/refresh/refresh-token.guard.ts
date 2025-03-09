import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedDomainException } from '../../exceptions/domain-exceptions';
import { UserAccountsConfig } from '../../../features/user-accounts/config/user-accounts.config';
import { Request } from 'express';
import { SecurityDevicesRepository } from './../../../features/user-accounts/security/infrastructure/security-devices.repository';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userAccountsConfig: UserAccountsConfig,
    private readonly securityDevicesRepository: SecurityDevicesRepository, // TODO: replace with actual repository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const refreshToken = request.cookies.refreshToken;

    if (!refreshToken) {
      throw UnauthorizedDomainException.create(
        'There is no refresh token in request',
      );
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.userAccountsConfig.refreshTokenSecret,
      });

      const device = await this.securityDevicesRepository.getDevicebyDeviceId(
        payload.deviceId,
      );

      if (!device) {
        throw UnauthorizedDomainException.create();
      }

      const exp = new Date(payload.exp * 1000).toISOString();

      if (!device.isDeviceExpDateAndUserIdEquals(payload.userId, exp)) {
        throw UnauthorizedDomainException.create();
      }

      request.user = payload;
    } catch (error) {
      throw UnauthorizedDomainException.create('Refresh token is expired');
    }
    return true;
  }
}
