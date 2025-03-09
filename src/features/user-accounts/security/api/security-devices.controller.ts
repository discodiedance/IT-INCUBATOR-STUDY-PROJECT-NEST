import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { DeleteAllDevicesCommand } from '../application/usecases/delete-all-devices.usecase';
import { GetAllDevicesCommand } from '../application/usecases/query-device-usecases/get-all-devices.usecase';
import { DeleteDeviceCommand } from '../application/usecases/delete-device.usecase';
import { RefreshTokenGuard } from '../../../../core/guards/refresh/refresh-token.guard';

@UseGuards(RefreshTokenGuard)
@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getAllDevices(@Req() req: any) {
    return await this.queryBus.execute(
      new GetAllDevicesCommand(req.user.userId),
    );
  }

  @Delete()
  @HttpCode(204)
  async deleteAllDevices(@Req() req: any) {
    return await this.commandBus.execute(
      new DeleteAllDevicesCommand(req.user.userId, req.user.deviceId),
    );
  }

  @Delete(':deviceId')
  @HttpCode(204)
  async deleteDevice(@Req() req: any, @Param('deviceId') deviceId: string) {
    return await this.commandBus.execute(
      new DeleteDeviceCommand(req.user.userId, deviceId, req.user.deviceId),
    );
  }
}
