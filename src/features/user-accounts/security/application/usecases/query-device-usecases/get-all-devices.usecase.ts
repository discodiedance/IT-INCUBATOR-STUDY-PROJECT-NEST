import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QuerySecurityDevicesRepository } from './../../../infrastructure/security-devices.query.repository';

export class GetAllDevicesCommand {
  constructor(public userId: string) {}
}

@QueryHandler(GetAllDevicesCommand)
export class GetAllDevicesUseCase
  implements IQueryHandler<GetAllDevicesCommand>
{
  constructor(
    private readonly querySecurityDevicesRepository: QuerySecurityDevicesRepository,
  ) {}

  async execute({ userId }: GetAllDevicesCommand) {
    return await this.querySecurityDevicesRepository.getAllDevices(userId);
  }
}
