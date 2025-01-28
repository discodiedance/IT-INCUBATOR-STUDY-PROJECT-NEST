import { QueryUserRepository } from '../infrastructure/user.query.repository';
import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { UserRepository } from '../infrastructure/user.repository';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.entity';
import {
  CreateUserAccountDataType,
  CreateUserDataType,
} from '../api/models/dto/users.dto';

import { UserDocument, UserModelType } from '../api/models/user.enitities';
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../core//exceptions/domain-exceptions';
import { CryptoService } from '../../crypto/crypto.service';
import { EmailService } from '../../notifications/email.service';
import { InputNewPasswordDataType } from '../api/models/dto/input';
import { v4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private readonly UserRepository: UserRepository,
    private readonly QueryUserRepository: QueryUserRepository,
    private readonly CryptoService: CryptoService,
    private readonly EmailService: EmailService,
  ) {}

  async _generateHash(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  async createUser(
    newUserAccountData: CreateUserAccountDataType,
  ): Promise<UserDocument> {
    const userWithTheSameLogin = await this.UserRepository.getByLogin(
      newUserAccountData.login,
    );

    if (userWithTheSameLogin) {
      throw BadRequestDomainException.create(
        'User with the same login already exists',
        'login',
      );
    }

    const userWithTheSameEmail = await this.UserRepository.getByEmail(
      newUserAccountData.email,
    );

    if (userWithTheSameEmail) {
      throw BadRequestDomainException.create(
        'User with the same email already exists',
        'email',
      );
    }

    const passwordHash = await this.CryptoService.createPasswordHash(
      newUserAccountData.password,
    );

    const newUser: CreateUserDataType = {
      login: newUserAccountData.login,
      email: newUserAccountData.email,
      passwordHash: passwordHash,
    };

    const createdUser = this.UserModel.createUser(newUser);
    const savedUser = await this.UserRepository.save(createdUser);

    if (!savedUser) {
      throw BadRequestDomainException.create('User is not created');
    }

    return createdUser;
  }

  async deleteUser(id: string) {
    const foundedUser = await this.QueryUserRepository.getById(id);
    if (!foundedUser) {
      throw NotFoundDomainException.create();
    }
    const deletedUser = await this.UserRepository.delete(id);
    if (!deletedUser) {
      throw BadRequestDomainException.create(`User wasn't deleted`);
    }
  }

  async registerUser(newUserAccountData: CreateUserAccountDataType) {
    const user = await this.createUser(newUserAccountData);
    this.EmailService.sendConfirmationEmail(
      user.accountData.email,
      user.emailConfirmation.confirmationCode,
    );
  }

  async emailResending(email: string) {
    const user = await this.UserRepository.getByEmail(email);

    if (!user) {
      throw BadRequestDomainException.create(
        'Email is not registered',
        'email',
      );
    }

    if (user.isUserConfirmationCodeConfirmed()) {
      throw BadRequestDomainException.create(
        'Email is already confirmed',
        'email',
      );
    }

    const newCode = v4();
    user.updateEmailConfirmationCode(newCode);
    user.markModified('emailConfirmation');
    await this.UserRepository.save(user);

    await this.EmailService.sendConfirmationEmail(
      user.accountData.email,
      newCode,
    );
  }

  async emailConfirmation(code: string) {
    const user = await this.UserRepository.getByConfirmationCode(code);

    if (!user) {
      throw BadRequestDomainException.create('Code is wrong', 'code');
    }

    if (user.isUserConfirmationCodeConfirmed()) {
      throw BadRequestDomainException.create(
        'Email is already confirmed',
        'code',
      );
    }

    if (user.isUserConfirmationCodeExpired()) {
      throw BadRequestDomainException.create('Code is expired', 'code');
    }

    if (!user.isUserConfirmationCodeEqual(code)) {
      throw BadRequestDomainException.create('Code is wrong', 'code');
    }

    user.updateEmailConfirmation();
    user.markModified('emailConfirmation');
    await this.UserRepository.save(user);
  }

  async passwordRecovery(email: string) {
    const user = await this.UserRepository.getByEmail(email);
    if (!user) {
      return true;
    }
    const passwordRecoveryCode = v4();
    user.addRecoveryPasswordCodeToUser(passwordRecoveryCode);
    user.markModified('passwordRecoveryConfirmation');
    await this.UserRepository.save(user);
    this.EmailService.sendPasswordRecoveryCode(
      user.accountData.email,
      passwordRecoveryCode,
    );
  }

  async confirmPasswordRecovery(confirmPasswordData: InputNewPasswordDataType) {
    const user =
      await this.UserRepository.getByPasswordRecoveryConfirmationCode(
        confirmPasswordData.recoveryCode,
      );

    if (!user) {
      throw BadRequestDomainException.create();
    }

    if (user.isUserPasswordRecoveryCodeExpired()) {
      throw BadRequestDomainException.create('Code is expired', 'code');
    }
    const newPasswordHash = await this.CryptoService.createPasswordHash(
      confirmPasswordData.newPassword,
    );
    user.updateNewPassword(newPasswordHash);
    user.markModified('accountData');
    await this.UserRepository.save(user);
  }
}
