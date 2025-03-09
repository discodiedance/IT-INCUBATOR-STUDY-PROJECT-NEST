import { HydratedDocument, Model } from 'mongoose';
import { CreateDeviceDataType } from './dto/dto';
import { Device } from '../../application/security-device.entity';

export type DeviceModelStaticType = {
  createDevice: (newDevice: CreateDeviceDataType) => DeviceDocument;
};

export type DeviceMethodsType = {
  isDeviceUserEquals: (userId: string) => boolean;
  isSessionEquals: (userId: string, deviceId: string) => boolean;
  updateDevice: (expirationDate: string, lastActiveDate: string) => void;
  makeExpired: () => void;
  isDeviceExpDateAndUserIdEquals: (userId: string, exp: string) => boolean;
};

export type DeviceDocument = HydratedDocument<Device, DeviceMethodsType>;

export type DeviceModelType = Model<DeviceDocument> & DeviceModelStaticType;
