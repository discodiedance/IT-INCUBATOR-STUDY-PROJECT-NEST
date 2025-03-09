import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from './../../infrastructure/security-devices.repository';
import {
  BadRequestDomainException,
  ForbiddenDomainException,
  NotFoundDomainException,
  UnauthorizedDomainException,
} from '../../../../../core/exceptions/domain-exceptions';

export class DeleteDeviceCommand {
  constructor(
    public userId: string,
    public deviceId: string,
    public usersDeviceId: string,
  ) {}
}

@CommandHandler(DeleteDeviceCommand)
export class DeleteDeviceUseCase
  implements ICommandHandler<DeleteDeviceCommand>
{
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async execute({ userId, deviceId, usersDeviceId }: DeleteDeviceCommand) {
    const usersDevice =
      await this.securityDevicesRepository.getDeviceByUserAndDeviceId(
        userId,
        usersDeviceId,
      );

    if (!usersDevice) {
      throw UnauthorizedDomainException.create("User doesn't have session!");
    }

    const foundDevice =
      await this.securityDevicesRepository.getDevicebyDeviceId(deviceId);

    if (!foundDevice) {
      throw NotFoundDomainException.create('Device not found!');
    }

    if (usersDevice.isSessionEquals(foundDevice.userId, foundDevice.deviceId)) {
      throw BadRequestDomainException.create(
        "You can't terminate current session!",
      );
    }

    if (!usersDevice.isDeviceUserEquals(foundDevice.userId)) {
      throw ForbiddenDomainException.create(
        "You can't terminate this session!",
      );
    }

    const deletedSession =
      await this.securityDevicesRepository.delete(deviceId);

    if (!deletedSession) {
      throw BadRequestDomainException.create("Can't delete device!");
    }
  }
}
