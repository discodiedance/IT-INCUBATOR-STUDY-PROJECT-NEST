import { User } from './../../src/features/users/application/user.entity';
import { UserModelType } from './../../src/features/users/api/models/user.enitities';
import {
  InputEmailConfirmationDataType,
  InputEmaillResendingDataType,
  InputNewPasswordDataType,
  LoginDataType,
} from './../../src/features/users/api/models/dto/input';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { InputCreateUserAccountDataType } from 'src/features/users/api/models/dto/input';
import { OutputUserType } from '../../src/features/users/api/models/dto/output';
import { GLOBAL_PREFIX } from '../../src/settings/glolbal-prefix.setup';
import request from 'supertest';
import { delay } from './delay';
import { InjectModel } from '@nestjs/mongoose';

export class UsersTestManager {
  constructor(
    private app: INestApplication,
    @InjectModel(User.name) private UserModel: UserModelType,
  ) {}

  async getRegistrationCodeByEmail(email: string) {
    const user = await this.UserModel.findOne({ 'accountData.email': email });
    return user!.emailConfirmation.confirmationCode;
  }

  async getUserByLogin(login: string) {
    const user = await this.UserModel.findOne({ 'accountData.login': login });

    return user;
  }

  async getPasswordHashByEmail(email: string) {
    const user = await this.UserModel.findOne({ 'accountData.email': email });
    return user!.accountData.passwordHash;
  }

  async getRecoveryPasswordCodeByEmail(email: string) {
    const user = await this.UserModel.findOne({ 'accountData.email': email });
    return user!.passwordRecoveryConfirmation.recoveryCode;
  }

  async createExpiredUserInDB() {
    const user = await this.UserModel.create({
      id: '123123',
      accountData: {
        email: 'expired@mail.ru',
        login: 'expire',
        passwordHash: '2o4ihj32o4ih23oi',
        createdAt: new Date(0).toISOString(),
      },
      emailConfirmation: {
        confirmationCode: '123123',
        expirationDate: new Date(0).toISOString(),
        isConfirmed: false,
      },
      passwordRecoveryConfirmation: {
        recoveryCode: '',
        expirationDate: null,
      },
    });
    return user;
  }

  //help methods

  async createUser(
    createModel: InputCreateUserAccountDataType,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<OutputUserType> {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/users`)
      .send(createModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response.body;
  }

  async createUserWithIncorrectAuth(
    createModel: InputCreateUserAccountDataType,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/users`)
      .send(createModel)
      .auth('admin', 'wrongPassword')
      .expect(statusCode);

    return response;
  }

  async createUserWithBodyErrors(
    createModel: InputCreateUserAccountDataType,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/users`)
      .send(createModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response;
  }

  async login(loginData: LoginDataType, statusCode: number = HttpStatus.OK) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/login`)
      .send(loginData)
      .expect(statusCode);

    return response;
  }

  async loginWithWrongDataOrNotExistingUser(
    loginModeL: LoginDataType,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/login`)
      .send(loginModeL)
      .expect(statusCode);

    return response;
  }

  async loginWithIncorrectLoginData(
    loginModel: Object,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/login`)
      .send(loginModel)
      .expect(statusCode);

    return response;
  }

  async me(
    accessToken: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<OutputUserType> {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/auth/me`)
      .auth(accessToken, { type: 'bearer' })
      .expect(statusCode);

    return response.body;
  }

  async createSeveralUsers(count: number): Promise<OutputUserType[]> {
    let usersArray: OutputUserType[] = [];

    for (let i = 0; i < count; ++i) {
      await delay(50);
      const responseBody = await this.createUser({
        login: `test` + i,
        email: `test${i}@gmail.com`,
        password: '123456789',
      });
      usersArray.push(responseBody);
    }

    return usersArray;
  }

  async createAndLoginSeveralUsers(
    count: number,
  ): Promise<{ accessToken: string }[]> {
    const users = await this.createSeveralUsers(count);

    const loginPromises = users.map((user: OutputUserType) =>
      this.login({ loginOrEmail: user.login, password: '123456789' }).then(
        (response) => ({ accessToken: response.body.accessToken }),
      ),
    );

    return await Promise.all(loginPromises);
  }

  async getAllUsers(statusCode: number = HttpStatus.OK) {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/users`)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response.body;
  }

  async getAllUsersWithIncorrectAuth(
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/users`)
      .auth('admin', 'wrongPassword')
      .expect(statusCode);

    return response;
  }

  async deleteUser(id: string, statusCode: number = HttpStatus.NO_CONTENT) {
    const response = await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/users/${id}`)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response;
  }

  async deleteUserWithIncorrectAuth(
    id: string,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const response = await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/users/${id}`)
      .auth('admin', 'wrongPassword')
      .expect(statusCode);

    return response;
  }

  async deleteUserWithNotExistingId(
    id: string,
    statusCode: number = HttpStatus.NOT_FOUND,
  ) {
    const response = await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/users/${id}`)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response;
  }

  async registrationUserWithIncorrectData(
    inputRegistrationData: Object,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration`)
      .send(inputRegistrationData)
      .expect(statusCode);

    return response;
  }

  async registrationUser(
    inputRegistrationData: InputCreateUserAccountDataType,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration`)
      .send(inputRegistrationData)
      .expect(statusCode);

    return response;
  }

  async registrationWithTooManyRequests(
    inputRegistrationData: InputCreateUserAccountDataType,
    statusCode: number = HttpStatus.TOO_MANY_REQUESTS,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration`)
      .send(inputRegistrationData)
      .expect(statusCode);

    return response;
  }

  async registrationEmailResendingWithIncorrectData(
    inputRegistrationData: Object,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration-email-resending`)
      .send(inputRegistrationData)
      .expect(statusCode);

    return response;
  }

  async registrationEmailResending(
    inputRegistrationData: InputEmaillResendingDataType,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration-email-resending`)
      .send(inputRegistrationData)
      .expect(statusCode);

    return response;
  }

  async registrationEmailResendingWithTooManyRequests(
    inputRegistrationData: InputEmaillResendingDataType,
    statusCode: number = HttpStatus.TOO_MANY_REQUESTS,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration-email-resending`)
      .send(inputRegistrationData)
      .expect(statusCode);

    return response;
  }

  async confirmUserRegistration(
    confirmationData: InputEmailConfirmationDataType,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration-confirmation`)
      .send(confirmationData)
      .expect(statusCode);

    return response;
  }

  async confirmUserRegistrationWithIncorrectData(
    confirmationCode: string | null,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration-confirmation`)
      .send({ confirmationCode })
      .expect(statusCode);

    return response;
  }

  async confirmUserRegistrationWithWrongData(
    confirmationCode: InputEmailConfirmationDataType,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration-confirmation`)
      .send(confirmationCode)
      .expect(statusCode);

    return response;
  }

  async confirmUserRegistrationWithTooManyRequests(
    confirmationData: InputEmailConfirmationDataType,
    statusCode: number = HttpStatus.TOO_MANY_REQUESTS,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration-confirmation`)
      .send(confirmationData)
      .expect(statusCode);

    return response;
  }

  async passwordRecoveryWithIncorrectData(
    inputPasswordRecoveryData: Object,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/password-recovery`)
      .send(inputPasswordRecoveryData)
      .expect(statusCode);

    return response;
  }

  async passwordRecovery(
    inputPasswordRecoveryData: InputEmaillResendingDataType,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/password-recovery`)
      .send(inputPasswordRecoveryData)
      .expect(statusCode);

    return response;
  }

  async passwordRecoveryWithNotExistingEmail(
    inputPasswordRecoveryData: InputEmaillResendingDataType,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/password-recovery`)
      .send(inputPasswordRecoveryData)
      .expect(statusCode);

    return response;
  }

  async passwordRecoveryWithTooManyRequests(
    inputPasswordRecoveryData: InputEmaillResendingDataType,
    statusCode: number = HttpStatus.TOO_MANY_REQUESTS,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/password-recovery`)
      .send(inputPasswordRecoveryData)
      .expect(statusCode);

    return response;
  }

  async confirmNewPassword(
    inputConfirmNewPasswordData: InputNewPasswordDataType,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/new-password`)
      .send(inputConfirmNewPasswordData)
      .expect(statusCode);

    return response;
  }

  async confirmNewPasswordWithIncorrectData(
    inputConfirmNewPasswordData: Object,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/new-password`)
      .send(inputConfirmNewPasswordData)
      .expect(statusCode);

    return response;
  }

  async confirmNewPasswordWithTooManyRequests(
    inputConfirmNewPasswordData: InputNewPasswordDataType,
    statusCode: number = HttpStatus.TOO_MANY_REQUESTS,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/new-password`)
      .send(inputConfirmNewPasswordData)
      .expect(statusCode);

    return response;
  }

  async getMeWithIncorrectData(statusCode: number = HttpStatus.UNAUTHORIZED) {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/auth/me`)
      .set('Authorization', 'Bearer invalid_token')
      .expect(statusCode);

    return response;
  }

  async getMe(JWT: string, statusCode: number = HttpStatus.OK) {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/auth/me`)
      .set('Authorization', 'Bearer ' + JWT)
      .expect(statusCode);

    return response;
  }
}
