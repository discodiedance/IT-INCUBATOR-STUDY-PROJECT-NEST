import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateUserDataType } from '../api/models/users.dto';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import { UserDocument } from '../api/models/user.enitities';

@Schema({ id: false, versionKey: false })
class UserAccountData {
  login: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

@Schema({ id: false, versionKey: false })
class UserEmailConfirmationData {
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;
}

@Schema({ id: false, versionKey: false })
class UserPasswordRecoveryConfirmationData {
  recoveryCode: string;
  expirationDate: string | null;
}

@Schema()
export class User {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: Object, required: true })
  accountData: UserAccountData;

  @Prop({ type: Object, required: true })
  emailConfirmation: UserEmailConfirmationData;

  @Prop({ type: Object, required: true })
  passwordRecoveryConfirmation: UserPasswordRecoveryConfirmationData;

  static createUser(newUser: CreateUserDataType) {
    const user = new this();

    user.id = new ObjectId().toString();
    user.accountData = {
      email: newUser.email,
      login: newUser.login,
      passwordHash: newUser.passwordHash,
      createdAt: new Date().toISOString(),
    };
    user.emailConfirmation = {
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), {
        hours: 1,
        minutes: 5,
      }).toISOString(),
      isConfirmed: false,
    };
    user.passwordRecoveryConfirmation = {
      recoveryCode: '',
      expirationDate: null,
    };

    return user;
  }
  addRecoveryPasswordCodeToUser(newCode: string) {
    this.passwordRecoveryConfirmation.recoveryCode = newCode;
    this.passwordRecoveryConfirmation.expirationDate = add(new Date(), {
      hours: 1,
      minutes: 5,
    }).toISOString();
  }

  updateNewPassword(newPasswordHash: string) {
    this.accountData.passwordHash = newPasswordHash;
  }

  updateEmailConfirmationCode(code: string) {
    this.emailConfirmation.confirmationCode = code;
  }

  updateEmailConfirmation(user: UserDocument) {
    user.emailConfirmation.isConfirmed = true;
  }

  isUserConfirmationCodeConfirmed() {
    return this.emailConfirmation.isConfirmed === true;
  }

  isUserConfirmationCodeEqual(code: string) {
    return this.emailConfirmation.confirmationCode === code;
  }

  isUserConfirmationCodeExpired() {
    return this.emailConfirmation.expirationDate < new Date().toISOString();
  }
}
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods = {
  addRecoveryPasswordCodeToUser: User.prototype.addRecoveryPasswordCodeToUser,
  updateNewPassword: User.prototype.updateNewPassword,
  updateEmailConfirmationCode: User.prototype.updateEmailConfirmationCode,
  updateEmailConfirmation: User.prototype.updateEmailConfirmation,
  isUserConfirmationCodeConfirmed:
    User.prototype.isUserConfirmationCodeConfirmed,
  isUserConfirmationCodeEqual: User.prototype.isUserConfirmationCodeEqual,
  isUserConfirmationCodeExpired: User.prototype.isUserConfirmationCodeExpired,
};

UserSchema.statics = {
  createUser: User.createUser,
};

UserSchema.loadClass(User);
