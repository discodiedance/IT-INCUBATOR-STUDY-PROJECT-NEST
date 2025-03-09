import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import {
  InputCreateUserAccountDataType,
  InputEmaillResendingDataType,
  InputLoginDataType,
  InputNewPasswordDataType,
} from '../src/features/user-accounts/users/api/models/dto/input';
import { AuthTestManager } from './helpers/managers/auth-test-manager';
import { UsersTestManager } from './helpers/managers/user-test-manager';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../src/features/user-accounts/users/constants/auth-tokens.inject-constants';
import { UserAccountsConfig } from '../src/features/user-accounts/config/user-accounts.config';
import { DevicesTestManager } from './helpers/managers/devices-test-manager';

describe('Auth', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManager;
  let userTestManger: UsersTestManager;
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
    userTestManger = result.userTestManger;
    devicesTestManager = result.devicesTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Login user', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    const goodUser = {
      login: 'goodlogin',
      password: 'goodpassword',
      email: 'goodemail@email.em',
    };

    it('Register user', async () => {
      const response = await authTestManager.registrationUser(goodUser);
      expect(response.status).toEqual(204);
    });
    it("It shouldn't login user by login with not existing user", async () => {
      const body: InputLoginDataType = {
        loginOrEmail: 'notExistingUser',
        password: 'goodpassword',
      };

      const response =
        await authTestManager.loginWithWrongDataOrNotExistingUser(body);

      expect(response.status).toEqual(401);
    });

    it("It shouldn't login user by email with not existing user", async () => {
      const body: InputLoginDataType = {
        loginOrEmail: 'notExistingUser@email.em',
        password: 'goodpassword',
      };

      const response =
        await authTestManager.loginWithWrongDataOrNotExistingUser(body);

      expect(response.status).toEqual(401);
    });

    it("It shouldn't login user with incorrect password", async () => {
      const body = {
        loginOrEmail: goodUser.login,
        password: null,
      };

      const response = await authTestManager.loginWithIncorrectLoginData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'password',
          },
        ],
      });
    });

    it("It shouldn't login user with incorrect login", async () => {
      const body = {
        loginOrEmail: null,
        password: goodUser.password,
      };

      const response = await authTestManager.loginWithIncorrectLoginData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'loginOrEmail',
          },
        ],
      });
    });

    it("It shouldn't login user with wrong login", async () => {
      const body: InputLoginDataType = {
        loginOrEmail: 'wrongLogin',
        password: goodUser.password,
      };
      const response =
        await authTestManager.loginWithWrongDataOrNotExistingUser(body);

      expect(response.status).toEqual(401);
    });

    it("It shouldn't login user with wrong email", async () => {
      const body: InputLoginDataType = {
        loginOrEmail: 'wrong@email.em',
        password: goodUser.password,
      };

      const response =
        await authTestManager.loginWithWrongDataOrNotExistingUser(body);

      expect(response.status).toEqual(401);
    });

    it("It shouldn't login user with wrong password", async () => {
      const body: InputLoginDataType = {
        loginOrEmail: goodUser.login,
        password: 'wrongPassword',
      };

      const response =
        await authTestManager.loginWithWrongDataOrNotExistingUser(body);

      expect(response.status).toEqual(401);
    });

    it('It should login user', async () => {
      const body: InputLoginDataType = {
        loginOrEmail: goodUser.login,
        password: goodUser.password,
      };

      const response = await authTestManager.login(body);

      expect(response.status).toEqual(200);
      expect(response.body.accessToken).toBeDefined();

      const refreshToken =
        response.headers['set-cookie'][0].startsWith('refreshToken=');
      expect(refreshToken).toBeTruthy();
    });

    it("It shouldn't login user with too many requests", async () => {
      const body: InputLoginDataType = {
        loginOrEmail: goodUser.login,
        password: goodUser.password,
      };

      const ip = '1.2.3.4.5.6.7';

      await authTestManager.loginUserSeveralTimesWithTheSameIp(body, 5, ip);

      const response = await authTestManager.loginWithTooManyRequests(body, ip);
      expect(response.status).toEqual(429);
    });
  });

  describe('Logout user', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    let refreshToken: string;

    it('Register and login user', async () => {
      const registerResponse = await authTestManager.registrationUser({
        login: 'finelog',
        password: 'finelog',
        email: 'finelog@email.em',
      });
      expect(registerResponse.status).toEqual(204);
      const loginResponse = await authTestManager.login({
        loginOrEmail: 'finelog',
        password: 'finelog',
      });
      expect(loginResponse.status).toEqual(200);
      refreshToken = loginResponse.headers['set-cookie'][0].split(';')[0];
    });

    it("It shouldn't logout user with incorrect refresh token", async () => {
      const response =
        await authTestManager.logoutWithIncorrectRefreshToken('sdasaodjka');
      expect(response.status).toEqual(401);
      const allDevices = await devicesTestManager.getAllDevices(refreshToken);
      expect(allDevices.status).toEqual(200);
      expect(allDevices.body.length).toEqual(1);
    });

    it('It should logout user', async () => {
      const response = await authTestManager.logout(refreshToken);

      expect(response.status).toEqual(204);
      const allDevices =
        await devicesTestManager.getAllDevicesWithIncorrectRefreshToken(
          refreshToken,
        );
      expect(allDevices.status).toEqual(401);
    });
  });
  describe('Refresh token', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    let refreshToken: string;

    it('Register and login user', async () => {
      const registerResponse = await authTestManager.registrationUser({
        login: 'finelog',
        password: 'finelog',
        email: 'finelog@email.em',
      });
      expect(registerResponse.status).toEqual(204);

      const loginResponse = await authTestManager.login({
        loginOrEmail: 'finelog',
        password: 'finelog',
      });

      refreshToken = loginResponse.headers['set-cookie'][0].split(';')[0];
      expect(loginResponse.status).toEqual(200);
    });

    it('It should refresh tokens', async () => {
      const response = await authTestManager.refreshTokens(refreshToken);

      const allDevices =
        await devicesTestManager.getAllDevicesWithIncorrectRefreshToken(
          refreshToken,
        );

      expect(response.status).toEqual(200);
      expect(response.body.accessToken).toBeDefined;
      expect(allDevices.status).toEqual(401);
    });

    it("It shouldn't refresh tokens with incorrect refresh token", async () => {
      const response = await authTestManager.refreshTokensWithIncorrectAuth(
        'incorrectRefreshToken',
      );
      expect(response.status).toEqual(401);
    });
  });

  describe('Registration user', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    const fineUser = {
      login: 'finelog',
      password: 'finepassw',
      email: 'finemail@email.em',
    };

    const uniqueGoodUser = {
      login: 'unique',
      password: 'uniquePassword',
      email: 'uniqueemail@email.em',
    };

    it('It should register user', async () => {
      const body: InputCreateUserAccountDataType = {
        login: uniqueGoodUser.login,
        password: uniqueGoodUser.password,
        email: uniqueGoodUser.email,
      };

      const response = await authTestManager.registrationUser(body);

      const allUsersBody = await userTestManger.getAllUsers();

      expect(allUsersBody.items[0]).toEqual({
        id: expect.any(String),
        login: uniqueGoodUser.login,
        email: uniqueGoodUser.email,
        createdAt: expect.any(String),
      });

      expect(response.status).toEqual(204);
    });

    it("It shouldn't register user with already existing login", async () => {
      const body: InputCreateUserAccountDataType = {
        login: uniqueGoodUser.login,
        password: fineUser.password,
        email: fineUser.email,
      };

      const response =
        await authTestManager.registrationUserWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'login',
          },
        ],
      });
    });

    it("It shouldn't register user with long login", async () => {
      const body: InputCreateUserAccountDataType = {
        login: 'LongLoginLongLoginLongLoginLongLogin',
        password: fineUser.password,
        email: fineUser.email,
      };

      const response =
        await authTestManager.registrationUserWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'login',
          },
        ],
      });
    });

    it("It shouldn't register user with short login", async () => {
      const body: InputCreateUserAccountDataType = {
        login: '1',
        password: fineUser.password,
        email: fineUser.email,
      };

      const response =
        await authTestManager.registrationUserWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'login',
          },
        ],
      });
    });

    it("It shouldn't register user with invalid login", async () => {
      const body = {
        login: null,
        password: fineUser.password,
        email: fineUser.email,
      };

      const response =
        await authTestManager.registrationUserWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'login',
          },
        ],
      });
    });

    it("It shouldn't register user with long password", async () => {
      const body: InputCreateUserAccountDataType = {
        login: fineUser.login,
        password: 'LongPasswordLongPasswordLongPasswordLongPassword',
        email: fineUser.email,
      };

      const response =
        await authTestManager.registrationUserWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'password',
          },
        ],
      });
    });

    it("It shouldn't register user with short password", async () => {
      const body: InputCreateUserAccountDataType = {
        login: fineUser.login,
        password: '1',
        email: fineUser.email,
      };

      const response =
        await authTestManager.registrationUserWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'password',
          },
        ],
      });
    });

    it("It shouldn't register user with invalid password", async () => {
      const body = {
        login: fineUser.login,
        password: null,
        email: fineUser.email,
      };

      const response =
        await authTestManager.registrationUserWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'password',
          },
        ],
      });
    });

    it("It shouldn't register user with already existing email", async () => {
      const body: InputCreateUserAccountDataType = {
        login: fineUser.login,
        password: fineUser.password,
        email: uniqueGoodUser.email,
      };

      const response =
        await authTestManager.registrationUserWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'email',
          },
        ],
      });
    });

    it("It shouldn't register user with invalid email", async () => {
      const body = {
        login: fineUser.login,
        password: fineUser.password,
        email: null,
      };

      const response =
        await authTestManager.registrationUserWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'email',
          },
        ],
      });
    });

    it("It shouldn't register user with too many requests", async () => {
      const body: InputCreateUserAccountDataType = {
        login: 'hello',
        password: 'qwerty',
        email: 'itsme@gmail.com',
      };

      const ip = '1.23.45.6';

      await authTestManager.registerSeveralUsersWithTheSameIp(body, 5, ip);
      const response = await authTestManager.registrationWithTooManyRequests(
        body,
        ip,
      );
      expect(response.status).toEqual(429);
    });
  });

  describe('Registration confirmation', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    const confirmedUser = {
      login: 'confi',
      password: 'confPass',
      email: 'confirmed@email.em',
    };

    const goodUser = {
      login: 'goood',
      password: 'goodpass',
      email: 'goodemail@email.em',
    };

    it('Register confirmed and good user', async () => {
      const body: InputCreateUserAccountDataType = {
        login: confirmedUser.login,
        password: confirmedUser.password,
        email: confirmedUser.email,
      };

      const body2: InputCreateUserAccountDataType = {
        login: goodUser.login,
        password: goodUser.password,
        email: goodUser.email,
      };

      const response = await authTestManager.registrationUser(body);
      const response2 = await authTestManager.registrationUser(body2);

      expect(response.status).toEqual(204);
      expect(response2.status).toEqual(204);
    });

    it("It shouldn't confrim user's registration with wrong code", async () => {
      const code = 'invalidCode';
      const response =
        await authTestManager.confirmUserRegistrationWithWrongData({
          code,
        });

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: 'code',
            message: expect.any(String),
          },
        ],
      });
    });

    it("It shouldn't confrim user's registration with invalid code", async () => {
      const code = null;
      const response =
        await authTestManager.confirmUserRegistrationWithIncorrectData(code);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: 'code',
            message: expect.any(String),
          },
        ],
      });
      expect(response.status).toEqual(400);
    });

    it("It shouldn't confrim user's registration with expired code", async () => {
      const expiredUser = await userTestManger.createExpiredUserInDB();
      const code = expiredUser.emailConfirmation.confirmationCode;

      const response =
        await authTestManager.confirmUserRegistrationWithWrongData({
          code,
        });
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: 'code',
            message: expect.any(String),
          },
        ],
      });
    });

    it("It should confirm user's registration", async () => {
      const code = await userTestManger.getRegistrationCodeByEmail(
        confirmedUser.email,
      );

      const response = await authTestManager.confirmUserRegistration({ code });

      const user = await userTestManger.getUserByLogin(confirmedUser.login);

      expect(response.status).toEqual(204);
      expect(user!.emailConfirmation.isConfirmed).toEqual(true);
    });

    it("It shouldn't confrim user's registration with already applied code", async () => {
      const code = await userTestManger.getRegistrationCodeByEmail(
        confirmedUser.email,
      );
      const response =
        await authTestManager.confirmUserRegistrationWithWrongData({
          code,
        });

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: 'code',
            message: expect.any(String),
          },
        ],
      });
    });

    it("It shouldn't confirm user's registration with too many requests", async () => {
      const code = await userTestManger.getRegistrationCodeByEmail(
        goodUser.email,
      );

      const ip = '1.3.4.5.6.7';

      await authTestManager.confirmSeveralUsersRegistrationWithWrongDataWithTheSameIp(
        'invalidCode',
        5,
        ip,
      );

      const response =
        await authTestManager.confirmUserRegistrationWithTooManyRequests(
          {
            code,
          },
          ip,
        );

      const user = await userTestManger.getUserByLogin(goodUser.login);
      expect(user!.emailConfirmation.isConfirmed).toEqual(false);
      expect(response.status).toEqual(429);
    });
  });

  describe('Registration email resending code', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    const goodUser = {
      login: 'goodlogin',
      password: 'goodpassword',
      email: 'goodemail@email.em',
    };

    const confirmedUser = {
      login: 'logg1n',
      password: 'uniquePassword',
      email: 'uniqueemael@email.em',
    };

    it('Register goodUser and confirmedUser', async () => {
      const body1: InputCreateUserAccountDataType = {
        login: goodUser.login,
        password: goodUser.password,
        email: goodUser.email,
      };

      const body2: InputCreateUserAccountDataType = {
        login: confirmedUser.login,
        password: confirmedUser.password,
        email: confirmedUser.email,
      };

      const response1 = await authTestManager.registrationUser(body1);
      const response2 = await authTestManager.registrationUser(body2);

      expect(response1.status).toEqual(204);
      expect(response2.status).toEqual(204);
    });

    it('It should resend email registration code', async () => {
      const body: InputEmaillResendingDataType = {
        email: goodUser.email,
      };

      const response = await authTestManager.registrationEmailResending(body);
      expect(response.status).toEqual(204);
    });

    it('Confirm user registration', async () => {
      const code = await userTestManger.getRegistrationCodeByEmail(
        confirmedUser.email,
      );

      const response = await authTestManager.confirmUserRegistration({ code });

      const user = await userTestManger.getUserByLogin(confirmedUser.login);
      expect(user!.emailConfirmation.isConfirmed).toEqual(true);
      expect(response.status).toEqual(204);
    });

    it("It shouldn't resend email code user with already confirmed email", async () => {
      const body: InputEmaillResendingDataType = {
        email: confirmedUser.email,
      };

      const response =
        await authTestManager.registrationEmailResendingWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [{ field: 'email', message: expect.any(String) }],
      });
    });

    it("It shouldn't resend email code to not existing registered email", async () => {
      const body: InputEmaillResendingDataType = {
        email: 'notexisting@email.em',
      };

      const response =
        await authTestManager.registrationEmailResendingWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [{ field: 'email', message: expect.any(String) }],
      });
    });

    it("It shouldn't resend email code to user with invalid email", async () => {
      const body: Object = {
        email: null,
      };

      const response =
        await authTestManager.registrationEmailResendingWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: 'email',
            message: expect.any(String),
          },
        ],
      });
    });

    it("It shouldn't resend email registration code with too many requests", async () => {
      const body: InputEmaillResendingDataType = {
        email: 'itsme@gmail.com',
      };

      const ip = '2.3.5.7.2';

      await authTestManager.resendRegistrationEmailWithIncorrectDataWithTheSameIp(
        body,
        5,
        ip,
      );

      const response =
        await authTestManager.registrationEmailResendingWithTooManyRequests(
          body,
          ip,
        );

      expect(response.status).toEqual(429);
    });
  });

  describe('Send new password recovery code', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    const goodUser = {
      login: 'goodlogin',
      password: 'goodpassword',
      email: 'goodemail@email.em',
    };

    it('Register goodUser user', async () => {
      const body: InputCreateUserAccountDataType = {
        login: goodUser.login,
        password: goodUser.password,
        email: goodUser.email,
      };

      const response = await authTestManager.registrationUser(body);

      expect(response.status).toEqual(204);
    });

    it("Shouldn't send recovery password to not existing user", async () => {
      const body: InputEmaillResendingDataType = {
        email: 'notexisting@email.em',
      };

      const response =
        await authTestManager.passwordRecoveryWithNotExistingEmail(body);

      expect(response.status).toEqual(204);
    });

    it('It should send recovery password', async () => {
      const body: InputEmaillResendingDataType = {
        email: goodUser.email,
      };

      const codeBefore = await userTestManger.getRecoveryPasswordCodeByEmail(
        goodUser.email,
      );

      const response = await authTestManager.passwordRecovery(body);

      const codeAfter = await userTestManger.getRecoveryPasswordCodeByEmail(
        goodUser.email,
      );

      expect(response.status).toBe(204);
      expect(codeBefore).toEqual('');
      expect(codeAfter).not.toEqual(codeBefore);
      expect(codeAfter).not.toEqual('');
    });

    it("It shouldn't send recovery password to user with invalid email", async () => {
      const body: Object = {
        email: null,
      };

      const response =
        await authTestManager.passwordRecoveryWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: 'email',
            message: expect.any(String),
          },
        ],
      });
    });

    it("It shouldn't send recovery password to user with too many requests", async () => {
      const body: InputEmaillResendingDataType = {
        email: goodUser.email,
      };

      const ip = '1.2.5.7.9.1';

      await authTestManager.sendSeveralPasswordRecoveryEmailWithTheSameIp(
        body,
        5,
        ip,
      );

      const response =
        await authTestManager.passwordRecoveryWithTooManyRequests(body, ip);

      expect(response.status).toEqual(429);
    });
  });

  describe('New password confirm', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    const goodUser = {
      login: 'goodlogin',
      password: 'goodpassword',
      email: 'goodemail@email.em',
    };

    it('Registration goodUser user', async () => {
      const body: InputCreateUserAccountDataType = {
        login: goodUser.login,
        password: goodUser.password,
        email: goodUser.email,
      };

      const response = await authTestManager.registrationUser(body);
      expect(response.status).toEqual(204);
    });

    it('Send password recovery code', async () => {
      const body: InputEmaillResendingDataType = {
        email: goodUser.email,
      };

      const response = await authTestManager.passwordRecovery(body);
      expect(response.status).toEqual(204);
    });

    it("It shouldn't confirm new password with invalid recoveryCode", async () => {
      const body: Object = {
        newPassword: '1234567',
        recoveryCode: null,
      };

      const response =
        await authTestManager.confirmNewPasswordWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: 'recoveryCode',
            message: expect.any(String),
          },
        ],
      });
    });

    it("It shouldn't confirm new password with invalid password", async () => {
      const code = await userTestManger.getRecoveryPasswordCodeByEmail(
        goodUser.email,
      );

      const body: Object = {
        newPassword: null,
        recoveryCode: code,
      };

      const passwordHashBefore = await userTestManger.getPasswordHashByEmail(
        goodUser.email,
      );

      const response =
        await authTestManager.confirmNewPasswordWithIncorrectData(body);

      const passwordHashAfter = await userTestManger.getPasswordHashByEmail(
        goodUser.email,
      );

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: 'newPassword',
            message: expect.any(String),
          },
        ],
      });
      expect(passwordHashBefore).toEqual(passwordHashAfter);
    });

    it("It shouldn't confirm new password with long password", async () => {
      const code = await userTestManger.getRecoveryPasswordCodeByEmail(
        goodUser.email,
      );

      const body: Object = {
        newPassword: '1234567891011121314151617181920',
        recoveryCode: code,
      };

      const passwordHashBefore = await userTestManger.getPasswordHashByEmail(
        goodUser.email,
      );

      const response =
        await authTestManager.confirmNewPasswordWithIncorrectData(body);

      const passwordHashAfter = await userTestManger.getPasswordHashByEmail(
        goodUser.email,
      );

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: 'newPassword',
            message: expect.any(String),
          },
        ],
      });
      expect(passwordHashBefore).toEqual(passwordHashAfter);
    });

    it("It shouldn't confirm new password with short password", async () => {
      const code = await userTestManger.getRecoveryPasswordCodeByEmail(
        goodUser.email,
      );

      const body: Object = {
        newPassword: '1',
        recoveryCode: code,
      };

      const passwordHashBefore = await userTestManger.getPasswordHashByEmail(
        goodUser.email,
      );

      const response =
        await authTestManager.confirmNewPasswordWithIncorrectData(body);

      const passwordHashAfter = await userTestManger.getPasswordHashByEmail(
        goodUser.email,
      );

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: 'newPassword',
            message: expect.any(String),
          },
        ],
      });
      expect(passwordHashBefore).toEqual(passwordHashAfter);
    });

    it("It shouldn't confirm new password with expired code", async () => {
      const expiredUser = await userTestManger.createExpiredUserInDB();
      const expiredCode = await userTestManger.getRecoveryPasswordCodeByEmail(
        expiredUser.accountData.email,
      );

      const body: Object = {
        newPassword: '1234567',
        recoveryCode: expiredCode,
      };

      const passwordHashBefore = await userTestManger.getPasswordHashByEmail(
        goodUser.email,
      );

      const response =
        await authTestManager.confirmNewPasswordWithIncorrectData(body);

      const passwordHashAfter = await userTestManger.getPasswordHashByEmail(
        goodUser.email,
      );

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [{ field: 'code', message: expect.any(String) }],
      });
      expect(passwordHashBefore).toEqual(passwordHashAfter);
    });

    it("It shouldn't confirm new password with too many requests", async () => {
      const code = await userTestManger.getRecoveryPasswordCodeByEmail(
        goodUser.email,
      );

      const ip = '2.3.5.67.7';

      const body: InputNewPasswordDataType = {
        newPassword: '1234567',
        recoveryCode: code,
      };

      const passwordHashBefore = await userTestManger.getPasswordHashByEmail(
        goodUser.email,
      );

      await authTestManager.confirmSeveralPasswordRecoveryWithIncorrectDataWithTheSameIp(
        { ...body, recoveryCode: '2222' },
        5,
        ip,
      );

      const response =
        await authTestManager.confirmNewPasswordWithTooManyRequests(body, ip);

      const passwordHashAfter = await userTestManger.getPasswordHashByEmail(
        goodUser.email,
      );

      expect(response.status).toEqual(429);
      expect(passwordHashBefore).toEqual(passwordHashAfter);
    });

    it('It should confirm new password', async () => {
      const code = await userTestManger.getRecoveryPasswordCodeByEmail(
        goodUser.email,
      );

      const body: InputNewPasswordDataType = {
        newPassword: '123456789',
        recoveryCode: code,
      };

      const passwordHashBefore = await userTestManger.getPasswordHashByEmail(
        goodUser.email,
      );

      const response = await authTestManager.confirmNewPassword(body);

      const passwordHashAfter = await userTestManger.getPasswordHashByEmail(
        goodUser.email,
      );

      expect(response.status).toEqual(204);
      expect(passwordHashBefore).not.toEqual(passwordHashAfter);
    });
  });

  describe("Get me user's information", () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    const goodUser = {
      login: 'login1',
      password: 'password1',
      email: 'goodemail@email.em',
    };

    it('Register user', async () => {
      const response = await authTestManager.registrationUser(goodUser);
      expect(response.status).toEqual(204);
    });

    it("It shouldn't get me with unauthorized user", async () => {
      const jwt = 'invalid jwt';
      const response = await authTestManager.getMeWithIncorrectData(jwt);

      expect(response.status).toEqual(401);
    });

    it('It should get me', async () => {
      const loginResponse = await authTestManager.login({
        loginOrEmail: goodUser.login,
        password: goodUser.password,
      });
      const response = await authTestManager.getMe(
        loginResponse.body.accessToken,
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        email: goodUser.email,
        login: goodUser.login,
        userId: expect.any(String),
      });
    });
  });
});
