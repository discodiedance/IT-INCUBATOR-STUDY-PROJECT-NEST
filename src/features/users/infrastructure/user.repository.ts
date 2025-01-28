import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, UserModelType } from '../api/models/user.enitities';
import { User } from '../application/user.entity';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exceptions';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async save(model: UserDocument) {
    return await model.save();
  }

  async delete(id: string): Promise<boolean> {
    const deleteReuslt = await this.UserModel.deleteOne({ id: id });
    return deleteReuslt.deletedCount === 1;
  }

  async getByEmail(email: string): Promise<UserDocument | null> {
    const user = await this.UserModel.findOne({
      'accountData.email': email,
    });

    if (!user) {
      null;
    }
    return user;
  }

  async getByLogin(login: string): Promise<UserDocument | null> {
    const user = await this.UserModel.findOne({
      'accountData.login': login,
    });

    if (!user) {
      null;
    }
    return user;
  }

  async getByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    const user = await this.UserModel.findOne({
      $or: [
        {
          'accountData.email': {
            $regex: loginOrEmail,
            $options: 'i',
          },
        },
        {
          'accountData.login': {
            $regex: loginOrEmail,
            $options: 'i',
          },
        },
      ],
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async getByConfirmationCode(
    emailConfirmationCode: string,
  ): Promise<UserDocument | null> {
    const user = await this.UserModel.findOne({
      'emailConfirmation.confirmationCode': emailConfirmationCode,
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async getByPasswordRecoveryConfirmationCode(
    recoveryCode: string,
  ): Promise<UserDocument | null> {
    const user = await this.UserModel.findOne({
      'passwordRecoveryConfirmation.recoveryCode': recoveryCode,
    });

    if (!user) {
      null;
    }
    return user;
  }

  async getById(id: string): Promise<UserDocument | null> {
    const user = await this.UserModel.findOne({ id: id });
    if (!user) {
      null;
    }
    return user;
  }

  async findByLogin(login: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ login });
  }

  async findOrNotFoundFail(userId: string): Promise<UserDocument | null> {
    const user = await this.getById(userId);

    if (!user) {
      return null;
    }

    return user;
  }
}
