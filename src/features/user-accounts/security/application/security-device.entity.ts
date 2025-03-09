import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateDeviceDataType } from '../api/models/dto/dto';
import { DeviceDocument } from '../api/models/device.entities';

@Schema()
export class Device {
  @Prop({ type: String, required: true })
  deviceId: string;

  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  issuedAt: string;

  @Prop({ type: String, required: true })
  expirationDate: string;

  static createDevice(newDevice: CreateDeviceDataType): DeviceDocument {
    const device = new this();

    device.deviceId = newDevice.deviceId;
    device.ip = newDevice.ip;
    device.title = newDevice.title;
    device.userId = newDevice.userId;
    device.issuedAt = newDevice.lastActiveDate;
    device.expirationDate = newDevice.expirationDate;

    return device as DeviceDocument;
  }

  isSessionEquals(userId: string, deviceId: string): boolean {
    return this.userId === userId && this.deviceId === deviceId;
  }

  isDeviceUserEquals(userId: string): boolean {
    return this.userId === userId;
  }

  isDeviceExpDateAndUserIdEquals(userId: string, exp: string): boolean {
    return this.userId === userId && this.expirationDate === exp;
  }

  updateDevice(expirationDate: string, lastActiveDate: string) {
    this.expirationDate = expirationDate;
    this.issuedAt = lastActiveDate;
  }

  makeExpired() {
    this.expirationDate = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();
  }
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

DeviceSchema.statics = {
  createDevice: Device.createDevice,
};

DeviceSchema.loadClass(Device);
