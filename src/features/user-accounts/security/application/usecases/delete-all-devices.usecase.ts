import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from './../../infrastructure/security-devices.repository';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DeviceDataType } from '../../api/models/dto/dto';

export class DeleteAllDevicesCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(DeleteAllDevicesCommand)
export class DeleteAllDevicesUseCase
  implements ICommandHandler<DeleteAllDevicesCommand>
{
  constructor(
    private readonly securityDevicesRepositroy: SecurityDevicesRepository,
  ) {}

  async execute({ userId, deviceId }: DeleteAllDevicesCommand) {
    const savedSession: DeviceDataType | null =
      await this.securityDevicesRepositroy.getDeviceByUserAndDeviceId(
        userId,
        deviceId,
      );

    if (!savedSession) {
      throw BadRequestDomainException.create("Can't delete all sessions");
    }

    const deletedAllSessionsExcludeCurrent =
      await this.securityDevicesRepositroy.deleteAllDevicesExcludeCurrent(
        savedSession,
      );

    if (!deletedAllSessionsExcludeCurrent) {
      throw BadRequestDomainException.create("Can't delete all sessions");
    }
  }
}
