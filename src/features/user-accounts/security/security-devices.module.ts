import { Module } from '@nestjs/common';
import { SecurityDevicesRepository } from './infrastructure/security-devices.repository';
import { QuerySecurityDevicesRepository } from './infrastructure/security-devices.query.repository';
import { Device, DeviceSchema } from './application/security-device.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { SecurityDevicesController } from './api/security-devices.controller';
import { UserAccountsConfig } from '../config/user-accounts.config';
import { GetAllDevicesUseCase } from './application/usecases/query-device-usecases/get-all-devices.usecase';
import { DeleteAllDevicesUseCase } from './application/usecases/delete-all-devices.usecase';
import { DeleteDeviceUseCase } from './application/usecases/delete-device.usecase';

@Module({
  imports: [
    JwtModule,
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
  ],
  controllers: [SecurityDevicesController],
  providers: [
    SecurityDevicesRepository,
    QuerySecurityDevicesRepository,
    UserAccountsConfig,
    GetAllDevicesUseCase,
    DeleteAllDevicesUseCase,
    DeleteDeviceUseCase,
  ],

  exports: [SecurityDevicesRepository],
})
export class DevicesModule {}
