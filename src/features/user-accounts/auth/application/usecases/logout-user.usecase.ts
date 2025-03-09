import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../../security/infrastructure/security-devices.repository';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain-exceptions';

export class LogoutUserCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async execute({ userId, deviceId }: LogoutUserCommand) {
    const foundDeviceByDeviceAndUserId =
      await this.securityDevicesRepository.getDeviceByUserAndDeviceId(
        userId,
        deviceId,
      );

    if (!foundDeviceByDeviceAndUserId) {
      throw BadRequestDomainException.create();
    }

    const status = await this.securityDevicesRepository.delete(deviceId);

    if (!status) {
      throw BadRequestDomainException.create();
    }

    // foundDeviceByDeviceAndUserId.makeExpired();
    // const savedDevice = await this.securityDevicesRepository.save(
    //   foundDeviceByDeviceAndUserId,
    // );

    // if (!savedDevice) {
    //   throw BadRequestDomainException.create();
    // }
  }
}
