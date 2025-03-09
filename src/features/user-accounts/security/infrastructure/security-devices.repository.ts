import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeviceDocument, DeviceModelType } from '../api/models/device.entities';
import { Device } from '../application/security-device.entity';
import { DeviceDataType } from '../api/models/dto/dto';

@Injectable()
export class SecurityDevicesRepository {
  constructor(@InjectModel(Device.name) private DeviceModel: DeviceModelType) {}

  async save(model: DeviceDocument) {
    return await model.save();
  }

  async getDeviceByUserAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<DeviceDocument | null> {
    const device = await this.DeviceModel.findOne({
      deviceId,
      userId,
    });

    if (!device) {
      return null;
    }
    return device;
  }

  async getDevicebyDeviceId(deviceId: string): Promise<DeviceDocument | null> {
    const device = await this.DeviceModel.findOne({
      deviceId,
    });

    if (!device) {
      return null;
    }
    return device;
  }

  async delete(deviceId: string): Promise<boolean> {
    const deleteReuslt = await this.DeviceModel.deleteOne({
      deviceId,
    });
    return deleteReuslt.deletedCount === 1;
  }

  async deleteAllDevicesExcludeCurrent(
    sessionData: DeviceDataType,
  ): Promise<boolean> {
    const result = await this.DeviceModel.deleteMany({
      userId: sessionData.userId,
      deviceId: { $ne: sessionData.deviceId },
    });

    return result.acknowledged === true;
  }
}
