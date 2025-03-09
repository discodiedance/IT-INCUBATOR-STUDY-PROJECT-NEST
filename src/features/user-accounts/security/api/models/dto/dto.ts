export class CreateDeviceDataType {
  constructor(
    public deviceId: string,
    public ip: string,
    public lastActiveDate: string,
    public title: string,
    public userId: string,
    public expirationDate: string,
  ) {}
}

export class DeviceDataType {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}
