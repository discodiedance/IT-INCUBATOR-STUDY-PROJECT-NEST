import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { SecurityDevicesRepository } from '../../../security/infrastructure/security-devices.repository';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../../users/constants/auth-tokens.inject-constants';

export class UpdateTokensCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(UpdateTokensCommand)
export class UpdateTokensUseCase
  implements ICommandHandler<UpdateTokensCommand>
{
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly refreshTokenContext: JwtService,
    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async execute({ userId, deviceId }: UpdateTokensCommand) {
    const device =
      await this.securityDevicesRepository.getDevicebyDeviceId(deviceId);
    if (!device) {
      throw BadRequestDomainException.create();
    }

    const newAccessToken = this.accessTokenContext.sign({
      userId: userId,
    });

    const newRefreshToken = this.refreshTokenContext.sign({
      userId: userId,
      deviceId: deviceId,
    });

    const decodedRefreshToken =
      await this.refreshTokenContext.decode(newRefreshToken);
    if (!decodedRefreshToken) {
      throw BadRequestDomainException.create();
    }

    const decodedAcessToken =
      await this.accessTokenContext.decode(newAccessToken);
    if (!decodedAcessToken) {
      throw BadRequestDomainException.create();
    }

    const newExpirationDate = new Date(
      decodedRefreshToken.exp * 1000,
    ).toISOString();
    const newLastActiveDate = new Date(
      decodedAcessToken.iat * 1000,
    ).toISOString();

    device.updateDevice(newExpirationDate, newLastActiveDate);
    const updatedDevice = await this.securityDevicesRepository.save(device);

    if (!updatedDevice) {
      throw BadRequestDomainException.create(
        'Device is not updated after updating expiration date and last active date',
      );
    }

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
