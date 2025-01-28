import {
  InputEmaillResendingDataType,
  InputNewPasswordDataType,
  LoginDataType,
} from './../src/features/users/api/models/dto/input';
import { JWT_SECRET } from './../src/config';
import { InputCreateUserAccountDataType } from '../src/features/users/api/models/dto/input';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { initSettings } from './helpers/init-settings';
import { UsersTestManager } from './helpers/users-test-manager';
import { deleteAllData } from './helpers/delete-all-data';
import { delay } from './helpers/delay';

describe('Users', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder.overrideProvider(JwtService).useValue(
        new JwtService({
          secret: JWT_SECRET,
          signOptions: { expiresIn: '5m' },
        }),
      ),
    );
    app = result.app;
    userTestManger = result.userTestManger;
  });

  afterAll(async () => {
    await app.close();
  });

  describe.skip('Creating user', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('It should create user', async () => {
      const body: InputCreateUserAccountDataType = {
        login: 'goodlogin',
        password: 'goodpassword',
        email: 'goodemail@email.em',
      };

      const responseBody = await userTestManger.createUser(body);

      expect(responseBody).toEqual({
        id: expect.any(String),
        login: body.login,
        email: body.email,
        createdAt: expect.any(String),
      });
    });

    it("It shouldn't create user with incorrect auth", async () => {
      const body: InputCreateUserAccountDataType = {
        login: 'goodlogin1',
        password: 'goodpassword2',
        email: 'goodemail2@email.em',
      };

      const response = await userTestManger.createUserWithIncorrectAuth(body);
      expect(response.status).toEqual(401);
    });

    it("It shouldn't create user with the same login", async () => {
      const body: InputCreateUserAccountDataType = {
        login: 'goodlogin',
        password: 'goodpassword3',
        email: 'goodlemail@email.em',
      };

      const response = await userTestManger.createUserWithBodyErrors(body);

      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: 'User with the same login already exists',
            field: 'login',
          },
        ],
      });
      expect(response.status).toEqual(400);
    });

    it("It shouldn't create user with the same email", async () => {
      const body: InputCreateUserAccountDataType = {
        login: 'goodlogin4',
        password: 'goodpassword4',
        email: 'goodemail@email.em',
      };

      const response = await userTestManger.createUserWithBodyErrors(body);

      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: 'User with the same email already exists',
            field: 'email',
          },
        ],
      });
      expect(response.status).toEqual(400);
    });

    it("It shouldn't create user with short password", async () => {
      const body: InputCreateUserAccountDataType = {
        login: 'goodlogin5',
        password: '0',
        email: 'goodemail5@email.em',
      };

      const response = await userTestManger.createUserWithBodyErrors(body);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message:
              'password must be longer than or equal to 6 characters; Received value: 0',
            field: 'password',
          },
        ],
      });
      expect(response.status).toEqual(400);
    });

    it("It shouldn't create user with long password", async () => {
      const body: InputCreateUserAccountDataType = {
        login: 'goodlogin6',
        password: 'LongPasswordLongPasswordLongPassword',
        email: 'goodemail6@email.em',
      };

      const response = await userTestManger.createUserWithBodyErrors(body);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message:
              'password must be shorter than or equal to 20 characters; Received value: LongPasswordLongPasswordLongPassword',
            field: 'password',
          },
        ],
      });
      expect(response.status).toEqual(400);
    });

    it("It shouldn't create user with long login", async () => {
      const body: InputCreateUserAccountDataType = {
        login: 'LongLoginLongLoginLongLogin',
        password: 'goodpassword6',
        email: 'goodemail7@email.em',
      };

      const response = await userTestManger.createUserWithBodyErrors(body);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message:
              'login must be shorter than or equal to 10 characters; Received value: LongLoginLongLoginLongLogin',
            field: 'login',
          },
        ],
      });
      expect(response.status).toEqual(400);
    });

    it("It shouldn't create user with short login", async () => {
      const body: InputCreateUserAccountDataType = {
        login: '0',
        password: 'goodpassword7',
        email: 'goodemail8@email.em',
      };

      const response = await userTestManger.createUserWithBodyErrors(body);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message:
              'login must be longer than or equal to 3 characters; Received value: 0',
            field: 'login',
          },
        ],
      });
      expect(response.status).toEqual(400);
    });
  });

  describe.skip('Getting user', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it("It shouldn't get all users with incorrect auth", async () => {
      const response = await userTestManger.getAllUsersWithIncorrectAuth();
      expect(response.status).toEqual(401);
    });

    it('It should get all users', async () => {
      const usersArray = await userTestManger.createSeveralUsers(5);
      const responseBody = await userTestManger.getAllUsers();

      expect(responseBody.totalCount).toBe(5);
      expect(responseBody.items).toHaveLength(5);
      expect(responseBody.pagesCount).toBe(1);
      expect(responseBody.items[0]).toEqual(usersArray[usersArray.length - 1]);
    });
  });

  describe.skip('Deleting user', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('It should delete user', async () => {
      const user = await userTestManger.createUser({
        login: 'goodlogin',
        password: 'goodpassword',
        email: 'goodemail@email.em',
      });

      const response = await userTestManger.deleteUser(user.id);

      const responseAllUsersBody = await userTestManger.getAllUsers();
      expect(responseAllUsersBody.items).toHaveLength(0);
      expect(response.status).toEqual(204);
    });

    it("It shouldn't delete user with incorrect auth", async () => {
      const user = await userTestManger.createUser({
        login: 'goodlogin',
        password: 'goodpassword',
        email: 'goodemail@email.em',
      });

      const response = await userTestManger.deleteUserWithIncorrectAuth(
        user.id,
      );
      expect(response.status).toEqual(401);
    });

    it("It shouldn't delete user with not existing id", async () => {
      const response =
        await userTestManger.deleteUserWithNotExistingId('notExistingId');

      expect(response.status).toEqual(404);
    });
  });

  describe.skip('Login user', () => {
    const goodUser = {
      login: 'goodlogin',
      password: 'goodpassword',
      email: 'goodemail@email.em',
    };
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('Register user', async () => {
      const response = await userTestManger.registrationUser(goodUser);
      expect(response.status).toEqual(204);
    });
    it("It shouldn't login user by login with not existing user", async () => {
      const body: LoginDataType = {
        loginOrEmail: 'notExistingUser',
        password: 'goodpassword',
      };

      const response =
        await userTestManger.loginWithWrongDataOrNotExistingUser(body);

      expect(response.status).toEqual(401);
    });

    it("It shouldn't login user by email with not existing user", async () => {
      const body: LoginDataType = {
        loginOrEmail: 'notExistingUser@email.em',
        password: 'goodpassword',
      };

      const response =
        await userTestManger.loginWithWrongDataOrNotExistingUser(body);

      expect(response.status).toEqual(401);
    });

    it("It shouldn't login user with incorrect password", async () => {
      const body = {
        loginOrEmail: goodUser.login,
        password: null,
      };

      const response = await userTestManger.loginWithIncorrectLoginData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: 'password must be a string; Received value: null',
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

      const response = await userTestManger.loginWithIncorrectLoginData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: 'loginOrEmail must be a string; Received value: null',
            field: 'loginOrEmail',
          },
        ],
      });
    });

    it("It shouldn't login user with wrong login", async () => {
      const body: LoginDataType = {
        loginOrEmail: 'wrongLogin',
        password: goodUser.password,
      };
      const response =
        await userTestManger.loginWithWrongDataOrNotExistingUser(body);

      expect(response.status).toEqual(401);
    });

    it("It shouldn't login user with wrong email", async () => {
      const body: LoginDataType = {
        loginOrEmail: 'wrong@email.em',
        password: goodUser.password,
      };

      const response =
        await userTestManger.loginWithWrongDataOrNotExistingUser(body);

      expect(response.status).toEqual(401);
    });

    it("It shouldn't login user with wrong password", async () => {
      const body: LoginDataType = {
        loginOrEmail: goodUser.login,
        password: 'wrongPassword',
      };

      const response =
        await userTestManger.loginWithWrongDataOrNotExistingUser(body);

      expect(response.status).toEqual(401);
    });

    it('It should login user', async () => {
      const body: LoginDataType = {
        loginOrEmail: goodUser.login,
        password: goodUser.password,
      };
      const response = await userTestManger.login(body);

      expect(response.status).toEqual(200);
      expect(response.body.accessToken).toBeDefined();
    });
  });

  describe.skip('Registration user', () => {
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

    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('It should register user', async () => {
      const body: InputCreateUserAccountDataType = {
        login: uniqueGoodUser.login,
        password: uniqueGoodUser.password,
        email: uniqueGoodUser.email,
      };

      const response = await userTestManger.registrationUser(body);

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
        await userTestManger.registrationUserWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: 'User with the same login already exists',
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
        await userTestManger.registrationUserWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message:
              'login must be shorter than or equal to 10 characters; Received value: LongLoginLongLoginLongLoginLongLogin',
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
        await userTestManger.registrationUserWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message:
              'login must be longer than or equal to 3 characters; Received value: 1',
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
        await userTestManger.registrationUserWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: 'login must be a string; Received value: null',
            field: 'login',
          },
        ],
      });
    });

    it("It shouldn't register user with long password", async () => {
      await delay(10000);
      const body: InputCreateUserAccountDataType = {
        login: fineUser.login,
        password: 'LongPasswordLongPasswordLongPasswordLongPassword',
        email: fineUser.email,
      };

      const response =
        await userTestManger.registrationUserWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message:
              'password must be shorter than or equal to 20 characters; Received value: LongPasswordLongPasswordLongPasswordLongPassword',
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
        await userTestManger.registrationUserWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message:
              'password must be longer than or equal to 6 characters; Received value: 1',
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
        await userTestManger.registrationUserWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: 'password must be a string; Received value: null',
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
        await userTestManger.registrationUserWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: 'User with the same email already exists',
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
        await userTestManger.registrationUserWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message:
              'email must match /^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/ regular expression; Received value: null',
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

      const response =
        await userTestManger.registrationWithTooManyRequests(body);

      expect(response.status).toEqual(429);
    });
  });

  describe.skip('Registration confirmation', () => {
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

    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('Registration confirmed user', async () => {
      await delay(10000);
      const body: InputCreateUserAccountDataType = {
        login: confirmedUser.login,
        password: confirmedUser.password,
        email: confirmedUser.email,
      };

      const response = await userTestManger.registrationUser(body);
      expect(response.status).toEqual(204);
    });

    it('Registration good user', async () => {
      const body: InputCreateUserAccountDataType = {
        login: goodUser.login,
        password: goodUser.password,
        email: goodUser.email,
      };

      const response = await userTestManger.registrationUser(body);
      expect(response.status).toEqual(204);
    });

    it("It shouldn't confrim user's registration with wrong code", async () => {
      const code = 'invalidCode';
      const response =
        await userTestManger.confirmUserRegistrationWithWrongData({
          code,
        });

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: 'code',
            message: 'Code is wrong',
          },
        ],
      });
    });

    it("It shouldn't confrim user's registration with invalid code", async () => {
      const code = null;
      const response =
        await userTestManger.confirmUserRegistrationWithIncorrectData(code);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: 'code',
            message: 'code must be a string; Received value: undefined',
          },
        ],
      });
      expect(response.status).toEqual(400);
    });

    it("It shouldn't confrim user's registration with expired code", async () => {
      const expiredUser = await userTestManger.createExpiredUserInDB();
      const code = expiredUser.emailConfirmation.confirmationCode;

      const response =
        await userTestManger.confirmUserRegistrationWithWrongData({
          code,
        });
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: 'code',
            message: 'Code is expired',
          },
        ],
      });
    });

    it("It should confirm user's registration", async () => {
      const code = await userTestManger.getRegistrationCodeByEmail(
        confirmedUser.email,
      );

      const response = await userTestManger.confirmUserRegistration({ code });

      const user = await userTestManger.getUserByLogin(confirmedUser.login);

      expect(response.status).toEqual(204);
      expect(user!.emailConfirmation.isConfirmed).toEqual(true);
    });

    it("It shouldn't confrim user's registration with already applied code", async () => {
      const code = await userTestManger.getRegistrationCodeByEmail(
        confirmedUser.email,
      );
      const response =
        await userTestManger.confirmUserRegistrationWithWrongData({
          code,
        });

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: 'code',
            message: 'Email is already confirmed',
          },
        ],
      });
    });

    it("It shouldn't confirm user's registration with too many requests", async () => {
      const code = await userTestManger.getRegistrationCodeByEmail(
        goodUser.email,
      );

      const response =
        await userTestManger.confirmUserRegistrationWithTooManyRequests({
          code,
        });

      const user = await userTestManger.getUserByLogin(goodUser.login);
      expect(user!.emailConfirmation.isConfirmed).toEqual(false);
      expect(response.status).toEqual(429);
    });
  });
  describe.skip('Registration email resending code', () => {
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

    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('Registration goodUser user', async () => {
      await delay(10000);
      const body: InputCreateUserAccountDataType = {
        login: goodUser.login,
        password: goodUser.password,
        email: goodUser.email,
      };

      const response = await userTestManger.registrationUser(body);

      expect(response.status).toEqual(204);
    });

    it('Registration confrimedUser user', async () => {
      const body: InputCreateUserAccountDataType = {
        login: confirmedUser.login,
        password: confirmedUser.password,
        email: confirmedUser.email,
      };

      const response = await userTestManger.registrationUser(body);

      expect(response.status).toEqual(204);
    });

    it('It should resend email registration code', async () => {
      const body: InputEmaillResendingDataType = {
        email: goodUser.email,
      };

      const response = await userTestManger.registrationEmailResending(body);
      expect(response.status).toEqual(204);
    });

    it('Confirm user registration', async () => {
      const code = await userTestManger.getRegistrationCodeByEmail(
        confirmedUser.email,
      );

      const response = await userTestManger.confirmUserRegistration({ code });

      const user = await userTestManger.getUserByLogin(confirmedUser.login);
      expect(user!.emailConfirmation.isConfirmed).toEqual(true);
      expect(response.status).toEqual(204);
    });

    it("It shouldn't resend email code user with already confirmed email", async () => {
      const body: InputEmaillResendingDataType = {
        email: confirmedUser.email,
      };

      const response =
        await userTestManger.registrationEmailResendingWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          { field: 'email', message: 'Email is already confirmed' },
        ],
      });
    });

    it("It shouldn't resend email code to not existing registered email", async () => {
      const body: InputEmaillResendingDataType = {
        email: 'notexisting@email.em',
      };

      const response =
        await userTestManger.registrationEmailResendingWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          { field: 'email', message: 'Email is not registered' },
        ],
      });
    });

    it("It shouldn't resend email code to user with invalid email", async () => {
      const body: Object = {
        email: null,
      };

      const response =
        await userTestManger.registrationEmailResendingWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: 'email',
            message: 'email must be a string; Received value: null',
          },
        ],
      });
    });

    it("It shouldn't resend email registration code with too many requests", async () => {
      const body: InputEmaillResendingDataType = {
        email: 'itsme@gmail.com',
      };

      await userTestManger.registrationEmailResendingWithIncorrectData(body);

      const response =
        await userTestManger.registrationEmailResendingWithTooManyRequests(
          body,
        );

      expect(response.status).toEqual(429);
    });
  });

  describe.skip('New password recovery', () => {
    const goodUser = {
      login: 'goodlogin',
      password: 'goodpassword',
      email: 'goodemail@email.em',
    };

    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('Registration goodUser user', async () => {
      await delay(10000);
      const body: InputCreateUserAccountDataType = {
        login: goodUser.login,
        password: goodUser.password,
        email: goodUser.email,
      };

      const response = await userTestManger.registrationUser(body);

      expect(response.status).toEqual(204);
    });

    it("Shouldn't send recovery password to not existing user", async () => {
      const body: InputEmaillResendingDataType = {
        email: 'notexisting@email.em',
      };

      const response =
        await userTestManger.passwordRecoveryWithNotExistingEmail(body);

      expect(response.status).toEqual(204);
    });

    it('It should send recovery password', async () => {
      const body: InputEmaillResendingDataType = {
        email: goodUser.email,
      };

      const codeBefore = await userTestManger.getRecoveryPasswordCodeByEmail(
        goodUser.email,
      );

      const response = await userTestManger.passwordRecovery(body);

      const codeAfter = await userTestManger.getRecoveryPasswordCodeByEmail(
        goodUser.email,
      );

      expect(response.status).toBe(204);
      expect(codeBefore).toEqual('');
      expect(codeAfter).not.toEqual('');
    });

    it("It shouldn't send recovery password to user with invalid email", async () => {
      const body: Object = {
        email: null,
      };

      const response =
        await userTestManger.passwordRecoveryWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: 'email',
            message: 'email must be a string; Received value: null',
          },
        ],
      });
    });

    it("It shouldn't send recovery password to user with too many requests", async () => {
      const body: InputEmaillResendingDataType = {
        email: goodUser.email,
      };

      const response1 = await userTestManger.passwordRecovery(body);
      const response2 = await userTestManger.passwordRecovery(body);
      const response3 =
        await userTestManger.passwordRecoveryWithTooManyRequests(body);

      expect(response1.status).toEqual(204);
      expect(response2.status).toEqual(204);
      expect(response3.status).toEqual(429);
    });
  });
  describe.skip('New password confirm', () => {
    const goodUser = {
      login: 'goodlogin',
      password: 'goodpassword',
      email: 'goodemail@email.em',
    };

    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('Registration goodUser user', async () => {
      await delay(10000);
      const body: InputCreateUserAccountDataType = {
        login: goodUser.login,
        password: goodUser.password,
        email: goodUser.email,
      };

      const response = await userTestManger.registrationUser(body);
      expect(response.status).toEqual(204);
    });

    it('Send password recovery code', async () => {
      const body: InputEmaillResendingDataType = {
        email: goodUser.email,
      };

      const response = await userTestManger.passwordRecovery(body);
      expect(response.status).toEqual(204);
    });

    it("It shouldn't confirm new password with invalid recoveryCode", async () => {
      const body: Object = {
        newPassword: '1234567',
        recoveryCode: null,
      };

      const response =
        await userTestManger.confirmNewPasswordWithIncorrectData(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: 'recoveryCode',
            message: 'recoveryCode must be a string; Received value: null',
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
        await userTestManger.confirmNewPasswordWithIncorrectData(body);

      const passwordHashAfter = await userTestManger.getPasswordHashByEmail(
        goodUser.email,
      );

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: 'newPassword',
            message: 'newPassword must be a string; Received value: null',
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
        await userTestManger.confirmNewPasswordWithIncorrectData(body);

      const passwordHashAfter = await userTestManger.getPasswordHashByEmail(
        goodUser.email,
      );

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: 'newPassword',
            message:
              'newPassword must be shorter than or equal to 20 characters; Received value: 1234567891011121314151617181920',
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
        await userTestManger.confirmNewPasswordWithIncorrectData(body);

      const passwordHashAfter = await userTestManger.getPasswordHashByEmail(
        goodUser.email,
      );

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: 'newPassword',
            message:
              'newPassword must be longer than or equal to 6 characters; Received value: 1',
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
        await userTestManger.confirmNewPasswordWithIncorrectData(body);

      const passwordHashAfter = await userTestManger.getPasswordHashByEmail(
        goodUser.email,
      );

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [{ field: 'code', message: 'Code is expired' }],
      });
      expect(passwordHashBefore).toEqual(passwordHashAfter);
    });

    it("It shouldn't confirm new password with too many requests", async () => {
      const code = await userTestManger.getRecoveryPasswordCodeByEmail(
        goodUser.email,
      );

      const body: InputNewPasswordDataType = {
        newPassword: '1234567',
        recoveryCode: code,
      };

      const passwordHashBefore = await userTestManger.getPasswordHashByEmail(
        goodUser.email,
      );

      const response =
        await userTestManger.confirmNewPasswordWithTooManyRequests(body);

      const passwordHashAfter = await userTestManger.getPasswordHashByEmail(
        goodUser.email,
      );

      expect(response.status).toEqual(429);
      expect(passwordHashBefore).toEqual(passwordHashAfter);
    });

    it('It should confirm new password', async () => {
      await delay(10000);

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

      const response = await userTestManger.confirmNewPassword(body);

      const passwordHashAfter = await userTestManger.getPasswordHashByEmail(
        goodUser.email,
      );

      expect(response.status).toEqual(204);
      expect(passwordHashBefore).not.toEqual(passwordHashAfter);
    });
  });

  describe.skip("Get me user's information", () => {
    const goodUser = {
      login: 'login1',
      password: 'password1',
      email: 'goodemail@email.em',
    };

    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('Register user', async () => {
      const response = await userTestManger.registrationUser(goodUser);
      expect(response.status).toEqual(204);
    });

    it("It shouldn't get me with unauthorized user", async () => {
      const response = await userTestManger.getMeWithIncorrectData();

      expect(response.status).toEqual(401);
    });

    it('It should get me', async () => {
      const loginResponse = await userTestManger.login({
        loginOrEmail: goodUser.login,
        password: goodUser.password,
      });

      const response = await userTestManger.getMe(
        loginResponse.body.accessToken,
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        createdAt: expect.any(String),
        email: goodUser.email,
        login: goodUser.login,
        id: expect.any(String),
      });
    });
  });
});
