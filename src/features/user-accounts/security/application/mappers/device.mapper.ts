import { DeviceDocument } from '../../api/models/device.entities';
import { OutputDeviceType } from '../../api/models/dto/output';

export const securityMapper = (
  devices: DeviceDocument[],
): OutputDeviceType[] => {
  return devices.map((device) => ({
    ip: device.ip,
    title: device.title,
    lastActiveDate: device.issuedAt,
    deviceId: device.deviceId,
  }));
};
