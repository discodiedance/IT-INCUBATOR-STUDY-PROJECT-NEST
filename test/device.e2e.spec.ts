import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../src/features/user-accounts/users/constants/auth-tokens.inject-constants';
import { UserAccountsConfig } from '../src/features/user-accounts/config/user-accounts.config';
import { DevicesTestManager } from './helpers/managers/devices-test-manager';
import { AuthTestManager } from './helpers/managers/auth-test-manager';

describe('Devices', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManager;
  let devicesTestManager: DevicesTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder
        .overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
        .useFactory({
          factory: (userAccountsConfig: UserAccountsConfig) => {
            return new JwtService({
              secret: userAccountsConfig.accessTokenSecret,
              signOptions: { expiresIn: '5m' },
            });
          },
          inject: [UserAccountsConfig],
        }),
    );
    app = result.app;
    authTestManager = result.authTestManager;
    devicesTestManager = result.devicesTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Get all devices', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    let refreshToken: string;

    it('Register and 2 times login user', async () => {
      const registerResponse = await authTestManager.registrationUser({
        login: 'finelog',
        password: 'finelog',
        email: 'finelog@email.em',
      });
      expect(registerResponse.status).toEqual(204);
      const loginResponse1 = await authTestManager.login({
        loginOrEmail: 'finelog',
        password: 'finelog',
      });
      expect(loginResponse1.status).toEqual(200);
      refreshToken = loginResponse1.headers['set-cookie'][0].split(';')[0];
      const loginResponse2 = await authTestManager.login({
        loginOrEmail: 'finelog',
        password: 'finelog',
      });
      expect(loginResponse2.status).toEqual(200);
    });

    it("It shouldn't get all devices with incorrect auth refresh token", async () => {
      const response =
        await devicesTestManager.getAllDevicesWithIncorrectRefreshToken(
          'incorrectAuthToken',
        );

      expect(response.statusCode).toBe(401);
    });

    it('It should get all devices', async () => {
      const response = await devicesTestManager.getAllDevices(refreshToken);
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual;
      {
        [
          {
            ip: expect.any(String),
            title: 'Test',
            lastActiveDate: expect.any(String),
            deviceId: expect.any(String),
          },
          {
            ip: expect.any(String),
            title: 'Test',
            lastActiveDate: expect.any(String),
            deviceId: expect.any(String),
          },
        ];
      }
    });
  });

  describe('Delete all devices', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    let refreshToken: string;
    let lastDeviceTitle: string = 'LastDevice';

    it('Register and 2 times login user', async () => {
      const registerResponse = await authTestManager.registrationUser({
        login: 'finelog',
        password: 'finelog',
        email: 'finelog@email.em',
      });
      expect(registerResponse.status).toEqual(204);
      const loginResponse1 = await authTestManager.login({
        loginOrEmail: 'finelog',
        password: 'finelog',
      });
      expect(loginResponse1.status).toEqual(200);

      const loginResponse2 = await authTestManager.login(
        {
          loginOrEmail: 'finelog',
          password: 'finelog',
        },
        lastDeviceTitle,
      );
      expect(loginResponse2.status).toEqual(200);
      refreshToken = loginResponse2.headers['set-cookie'][0].split(';')[0];
    });

    it("It shouldn't delete all devices with incorrect auth refresh token", async () => {
      const response =
        await devicesTestManager.deleteAllDevicesWithIncorrectRefreshToken(
          'incorrectAuthToken',
        );

      expect(response.statusCode).toBe(401);
      const allDevices = await devicesTestManager.getAllDevices(refreshToken);
      expect(allDevices.body.length).toBe(2);
    });

    it('It should delete all devices exclude current device', async () => {
      const lastLoginnedDeviceId =
        await devicesTestManager.getDeviceIdByTitle(lastDeviceTitle);
      const response =
        await devicesTestManager.deleteAllDevicesExcludeCurrent(refreshToken);
      expect(response.statusCode).toBe(204);
      const allDevices = await devicesTestManager.getAllDevices(refreshToken);
      expect(allDevices.body).toEqual;
      {
        [
          {
            ip: expect.any(String),
            title: lastDeviceTitle,
            lastActiveDate: expect.any(String),
            deviceId: expect.any(String),
          },
        ];
      }
    });
  });

  describe('Delete device', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    let refreshToken: string;
    let user1DeviceId: string;
    let refreshToken2: string;

    it('Register and 2 times login user1, register and login user2 ', async () => {
      const registerResponse = await authTestManager.registrationUser({
        login: 'user111',
        password: 'finelog',
        email: 'finelog@email.em',
      });

      expect(registerResponse.status).toEqual(204);

      const loginResponse1 = await authTestManager.login({
        loginOrEmail: 'user111',
        password: 'finelog',
      });

      expect(loginResponse1.status).toEqual(200);

      const loginResponse2 = await authTestManager.login({
        loginOrEmail: 'user111',
        password: 'finelog',
      });
      expect(loginResponse2.status).toEqual(200);

      refreshToken = loginResponse2.headers['set-cookie'][0].split(';')[0];

      const registerResponse2 = await authTestManager.registrationUser({
        login: 'user222',
        password: 'finelog',
        email: 'finelog2@email.em',
      });

      expect(registerResponse2.status).toEqual(204);

      const loginResponse3 = await authTestManager.login({
        loginOrEmail: 'user222',
        password: 'finelog',
      });
      expect(loginResponse3.status).toEqual(200);
      refreshToken2 = loginResponse3.headers['set-cookie'][0].split(';')[0];
    });

    it('Get all devices of user1', async () => {
      const response = await devicesTestManager.getAllDevices(refreshToken);
      expect(response.statusCode).toBe(200);
      user1DeviceId = response.body[0].deviceId;
    });

    it("It shouldn't delete device by id with incorrect auth refresh token", async () => {
      const response =
        await devicesTestManager.deleteDeviceIdWithIncorrectRefreshToken(
          'incorrectAuthToken',
          user1DeviceId,
        );
      expect(response.statusCode).toBe(401);
      const allDevices = await devicesTestManager.getAllDevices(refreshToken);
      expect(allDevices.body.length).toBe(2);
    });

    it("It shouldn't delete device with not found device id", async () => {
      const response =
        await devicesTestManager.deleteDeviceWithNotExistingDeviceId(
          refreshToken,
          'incorrectDeviceId',
        );
      expect(response.statusCode).toBe(404);
      const allDevices = await devicesTestManager.getAllDevices(refreshToken);
      expect(allDevices.body.length).toBe(2);
    });

    it("It shouldn't delete device by other user", async () => {
      const response = await devicesTestManager.deleteDeviceByOtherUser(
        refreshToken2,
        user1DeviceId,
      );
      expect(response.statusCode).toBe(403);
      const allDevices = await devicesTestManager.getAllDevices(refreshToken);
      expect(allDevices.body.length).toBe(2);
    });

    it('It should delete device by id', async () => {
      const response = await devicesTestManager.deleteDeviceId(
        refreshToken,
        user1DeviceId,
      );
      expect(response.statusCode).toBe(204);
      const allDevices = await devicesTestManager.getAllDevices(refreshToken);
      expect(allDevices.body.length).toBe(1);
    });
  });
});
