import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../../users/constants/auth-tokens.inject-constants';
import { CreateDeviceDataType } from '../../../security/api/models/dto/dto';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { Device } from '../../../security/application/security-device.entity';
import { DeviceModelType } from '../../../security/api/models/device.entities';
import { SecurityDevicesRepository } from '../../../security/infrastructure/security-devices.repository';
import { ObjectId } from 'mongodb';

export class LoginUserCommand {
  constructor(
    public userId: string,
    public ip: string,
    public title: string,
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    @InjectModel(Device.name)
    private readonly deviceModel: DeviceModelType,
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly refreshTokenContext: JwtService,
    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async execute({ userId, ip, title }: LoginUserCommand) {
    const accessToken = this.accessTokenContext.sign({
      userId: userId,
    });

    const deviceId = new ObjectId().toString();

    const refreshToken = this.refreshTokenContext.sign({
      userId: userId,
      deviceId: deviceId,
    });

    const decodedRefresh = this.refreshTokenContext.decode(refreshToken);
    const decodedAccess = this.accessTokenContext.decode(accessToken);

    const expirationDate = new Date(decodedRefresh.exp * 1000).toISOString();
    const lastActiveDate = new Date(decodedAccess.iat * 1000).toISOString();

    const deviceCreateData: CreateDeviceDataType = {
      deviceId,
      ip,
      userId,
      title,
      lastActiveDate,
      expirationDate,
    };

    const createdDevice = this.deviceModel.createDevice(deviceCreateData);

    const savedDevice =
      await this.securityDevicesRepository.save(createdDevice);

    if (!savedDevice) {
      throw BadRequestDomainException.create('Device was not created');
    }

    return {
      accessToken,
      refreshToken,
    };
  }
}
