import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestDomainException } from '../../../../core/exceptions/domain-exceptions';
import { DeviceModelType } from '../api/models/device.entities';
import { Device } from '../application/security-device.entity';
import { securityMapper } from '../application/mappers/device.mapper';
import { OutputDeviceType } from '../api/models/dto/output';

@Injectable()
export class QuerySecurityDevicesRepository {
  constructor(
    @InjectModel(Device.name)
    private readonly DeviceModel: DeviceModelType,
  ) {}

  async getAllDevices(userId: string): Promise<OutputDeviceType[] | null> {
    const allDevices = await this.DeviceModel.find({ userId: userId }).lean();

    return securityMapper(allDevices);
  }
}
