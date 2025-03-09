import { HttpStatus, INestApplication } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device } from '../../../src/features/user-accounts/security/application/security-device.entity';
import { DeviceModelType } from '../../../src/features/user-accounts/security/api/models/device.entities';
import { GLOBAL_PREFIX } from '../../../src/settings/glolbal-prefix.setup';
import request from 'supertest';

export class DevicesTestManager {
  constructor(
    private app: INestApplication,
    @InjectModel(Device.name) private DeviceModel: DeviceModelType,
  ) {}

  async getDeviceIdByTitle(title: string) {
    const device = await this.DeviceModel.findOne({ title }).lean();
    return device!.deviceId;
  }

  async getAllDevicesWithIncorrectRefreshToken(
    refreshToken: string,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/security/devices`)
      .set('Cookie', refreshToken)
      .expect(statusCode);

    return response;
  }

  async getAllDevices(
    refreshToken: string,
    statusCode: number = HttpStatus.OK,
  ) {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/security/devices`)
      .set('Cookie', refreshToken)
      .expect(statusCode);

    return response;
  }

  async deleteAllDevicesWithIncorrectRefreshToken(
    refreshToken: string,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const response = await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/security/devices`)
      .set('Cookie', refreshToken)
      .expect(statusCode);

    return response;
  }

  async deleteAllDevicesExcludeCurrent(
    refreshToken: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    const response = await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/security/devices`)
      .set('Cookie', refreshToken)
      .expect(statusCode);

    return response;
  }

  async deleteDeviceIdWithIncorrectRefreshToken(
    refreshToken: string,
    deviceId: string,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const response = await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/security/devices/${deviceId}`)
      .set('Cookie', refreshToken)
      .expect(statusCode);

    return response;
  }

  async deleteDeviceWithNotExistingDeviceId(
    refreshToken: string,
    deviceId: string,
    statusCode: number = HttpStatus.NOT_FOUND,
  ) {
    const response = await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/security/devices/${deviceId}`)
      .set('Cookie', refreshToken)
      .expect(statusCode);

    return response;
  }

  async deleteDeviceByOtherUser(
    refreshToken: string,
    deviceId: string,
    statusCode: number = HttpStatus.FORBIDDEN,
  ) {
    const response = await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/security/devices/${deviceId}`)
      .set('Cookie', refreshToken)
      .expect(statusCode);

    return response;
  }

  async deleteDeviceId(
    refreshToken: string,
    deviceId: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    const response = await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/security/devices/${deviceId}`)
      .set('Cookie', refreshToken)
      .expect(statusCode);

    return response;
  }
}
