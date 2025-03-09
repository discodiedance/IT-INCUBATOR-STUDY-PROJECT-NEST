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
import { v4 } from 'uuid';

export class AuthTestManager {
  constructor(
    private app: INestApplication,
    private readonly usersTestManager: UsersTestManager,
  ) {}

  async login(
    loginData: InputLoginDataType,
    title?: string,
    statusCode: number = HttpStatus.OK,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/login`)
      .send(loginData)
      .set('user-agent', title ?? 'Test')
      .set('X-Forwarded-For', v4())
      .expect(statusCode);

    return response;
  }

  async loginWithTooManyRequests(
    loginData: InputLoginDataType,
    ip: string,
    statusCode: number = HttpStatus.TOO_MANY_REQUESTS,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/login`)
      .set('user-agent', 'Test')
      .set('X-Forwarded-For', ip)
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
      .set('user-agent', 'forWrongDataTest')
      .set('X-Forwarded-For', v4())
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
      .set('user-agent', 'loginIncorrectDataTitle')
      .set('X-Forwarded-For', v4())
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

  async registrationUserWithIncorrectData(
    inputRegistrationData: Object,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration`)
      .set('user-agent', 'TestRegister')
      .set('X-Forwarded-For', v4())
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
      .set('user-agent', 'TestRegister')
      .set('X-Forwarded-For', v4())
      .send(inputRegistrationData)
      .expect(statusCode);

    return response;
  }

  async registrationWithTooManyRequests(
    inputRegistrationData: InputCreateUserAccountDataType,
    setIp: string,
    statusCode: number = HttpStatus.TOO_MANY_REQUESTS,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration`)
      .set('user-agent', 'TestRegister')
      .set('X-Forwarded-For', setIp)
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
      .set('X-Forwarded-For', v4())
      .expect(statusCode);

    return response;
  }

  async registrationEmailResending(
    inputRegistrationData: InputEmaillResendingDataType,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration-email-resending`)
      .set('X-Forwarded-For', v4())
      .send(inputRegistrationData)
      .expect(statusCode);

    return response;
  }

  async registrationEmailResendingWithTooManyRequests(
    inputRegistrationData: InputEmaillResendingDataType,
    setIp: string,
    statusCode: number = HttpStatus.TOO_MANY_REQUESTS,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration-email-resending`)
      .set('user-agent', 'TestResend')
      .set('X-Forwarded-For', setIp)
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
      .set('X-Forwarded-For', v4())
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
      .set('X-Forwarded-For', v4())
      .send(confirmationCode)
      .expect(statusCode);

    return response;
  }

  async confirmUserRegistrationWithTooManyRequests(
    confirmationData: InputEmailConfirmationDataType,
    setIp: string,
    statusCode: number = HttpStatus.TOO_MANY_REQUESTS,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration-confirmation`)
      .send(confirmationData)
      .set('user-agent', 'TestConfirm')
      .set('X-Forwarded-For', setIp)
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
      .set('X-Forwarded-For', v4())
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
    setIp: string,
    statusCode: number = HttpStatus.TOO_MANY_REQUESTS,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/password-recovery`)
      .set('user-agent', 'TestPasswordRecovery')
      .set('X-Forwarded-For', setIp)
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
      .set('X-Forwarded-For', v4())
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
      .set('X-Forwarded-For', v4())
      .send(inputConfirmNewPasswordData)
      .expect(statusCode);

    return response;
  }

  async confirmNewPasswordWithTooManyRequests(
    inputConfirmNewPasswordData: InputNewPasswordDataType,
    setIp: string,
    statusCode: number = HttpStatus.TOO_MANY_REQUESTS,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/new-password`)
      .set('user-agent', 'TestConfirmPasswordRecovery')
      .set('X-Forwarded-For', setIp)
      .send(inputConfirmNewPasswordData)
      .expect(statusCode);

    return response;
  }

  async getMeWithIncorrectData(
    JWT: string,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/auth/me`)
      .set('Authorization', 'Bearer' + JWT)
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

  async refreshTokens(
    refreshToken: string,
    statusCode: number = HttpStatus.OK,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/refresh-token`)
      .set('Cookie', refreshToken)
      .expect(statusCode);

    return response;
  }

  async refreshTokensWithIncorrectAuth(
    refreshToken: string,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/refresh-token`)
      .set('Cookie', refreshToken)
      .expect(statusCode);

    return response;
  }

  async logoutWithIncorrectRefreshToken(
    refreshToken: string,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/logout`)
      .set('Cookie', refreshToken)
      .expect(statusCode);

    return response;
  }

  async logout(
    refreshToken: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/logout`)
      .set('Cookie', refreshToken)
      .expect(statusCode);

    return response;
  }

  async loginUserSeveralTimesWithTheSameIp(
    loginData: InputLoginDataType,
    count: number,
    ip: string,
    statusCode: number = HttpStatus.OK,
  ) {
    for (let i = 0; i < count; i++) {
      await request(this.app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/login`)
        .set('user-agent', 'Test')
        .set('X-Forwarded-For', ip)
        .send(loginData)
        .expect(statusCode);
    }
  }

  async registerSeveralUsersWithTheSameIp(
    inputRegistrationData: InputCreateUserAccountDataType,
    count: number,
    ip: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    for (let i = 0; i < count; i++) {
      const uniqueBody: InputCreateUserAccountDataType = {
        ...inputRegistrationData,
        email: `${i + 1}_${inputRegistrationData.email}`,
        login: `${i + 1}_${inputRegistrationData.login}`,
      };

      await request(this.app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/registration`)
        .set('user-agent', 'TestRegister')
        .set('X-Forwarded-For', ip)
        .send(uniqueBody)
        .expect(statusCode);
    }
  }

  async confirmSeveralUsersRegistrationWithWrongDataWithTheSameIp(
    confirmationCode: string,
    count: number,
    ip: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    for (let i = 0; i < count; i++) {
      await request(this.app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/registration-confirmation`)
        .set('user-agent', 'TestConfirm')
        .set('X-Forwarded-For', ip)
        .send({ confirmationCode })
        .expect(statusCode);
    }
  }

  async resendRegistrationEmailWithIncorrectDataWithTheSameIp(
    inputResendEmailData: InputEmaillResendingDataType,
    count: number,
    ip: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    for (let i = 0; i < count; i++) {
      await request(this.app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/registration-email-resending`)
        .set('user-agent', 'TestResend')
        .set('X-Forwarded-For', ip)
        .send(inputResendEmailData)
        .expect(statusCode);
    }
  }

  async sendSeveralPasswordRecoveryEmailWithTheSameIp(
    inputPasswordRecoveryData: InputEmaillResendingDataType,
    count: number,
    ip: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    for (let i = 0; i < count; i++) {
      await request(this.app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/password-recovery`)
        .set('user-agent', 'TestPasswordRecovery')
        .set('X-Forwarded-For', ip)
        .send(inputPasswordRecoveryData)
        .expect(statusCode);
    }
  }

  async confirmSeveralPasswordRecoveryWithIncorrectDataWithTheSameIp(
    inputConfirmNewPasswordData: Object,
    count: number,
    ip: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    for (let i = 0; i < count; i++) {
      await request(this.app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/new-password`)
        .set('user-agent', 'TestConfirmPasswordRecovery')
        .set('X-Forwarded-For', ip)
        .send(inputConfirmNewPasswordData)
        .expect(statusCode);
    }
  }
}
