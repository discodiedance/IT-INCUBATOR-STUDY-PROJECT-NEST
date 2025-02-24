import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  InputCreateUserAccountDataType,
  InputEmaillResendingDataType,
  InputEmailConfirmationDataType,
  InputNewPasswordDataType,
  InputLoginDataType,
} from '../../../src/features/user-accounts/users/api/models/dto/input';
import { OutputUserType } from '../../../src/features/user-accounts/users/api/models/dto/output';
import { GLOBAL_PREFIX } from '../../../src/settings/glolbal-prefix.setup';
import { UsersTestManager } from './user-test-manager';

export class AuthTestManager {
  constructor(
    private app: INestApplication,
    private readonly usersTestManager: UsersTestManager,
  ) {}

  async login(
    loginData: InputLoginDataType,
    statusCode: number = HttpStatus.OK,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/login`)
      .send(loginData)
      .expect(statusCode);

    return response;
  }

  async loginWithWrongDataOrNotExistingUser(
    loginModeL: InputLoginDataType,
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

  async createAndLoginSeveralUsers(
    count: number,
  ): Promise<{ accessToken: string }[]> {
    const users = await this.usersTestManager.createSeveralUsers(count);

    const loginPromises = users.map((user: OutputUserType) =>
      this.login({ loginOrEmail: user.login, password: '123456789' }).then(
        (response) => ({ accessToken: response.body.accessToken }),
      ),
    );

    return await Promise.all(loginPromises);
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
