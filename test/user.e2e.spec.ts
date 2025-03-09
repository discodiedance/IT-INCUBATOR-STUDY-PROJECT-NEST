import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { initSettings } from './helpers/init-settings';
import { UsersTestManager } from './helpers/managers/user-test-manager';
import { deleteAllData } from './helpers/delete-all-data';
import { InputCreateUserAccountDataType } from '../src/features/user-accounts/users/api/models/dto/input';
import { UserAccountsConfig } from '../src/features/user-accounts/config/user-accounts.config';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../src/features/user-accounts/users/constants/auth-tokens.inject-constants';

describe('Users', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;

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
    userTestManger = result.userTestManger;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Create user', () => {
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
            message: expect.any(String),
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
            message: expect.any(String),
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
            message: expect.any(String),
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
            message: expect.any(String),
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
            message: expect.any(String),
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
            message: expect.any(String),
            field: 'login',
          },
        ],
      });
      expect(response.status).toEqual(400);
    });
  });

  describe('Get user', () => {
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
      expect(responseBody.items[0]).toEqual(usersArray[usersArray.length - 5]);
    });
  });

  describe('Delete user', () => {
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
});
