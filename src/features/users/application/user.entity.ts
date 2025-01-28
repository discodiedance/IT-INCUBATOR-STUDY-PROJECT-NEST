import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateUserDataType } from '../api/models/dto/users.dto';
import { add } from 'date-fns';
import { ObjectId } from 'mongodb';
import { UserDocument } from '../api/models/user.enitities';
import { v4 } from 'uuid';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
  match: new RegExp(/^[a-zA-Z0-9_-]*$/),
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export const emailConstraints = {
  minLength: 3,
  maxLength: 30,
  match: new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
};

@Schema({ id: false, versionKey: false })
class UserAccountData {
  @Prop({ type: String, required: true, ...loginConstraints })
  login: string;
  @Prop({
    type: String,
    required: true,
    ...emailConstraints,
  })
  email: string;
  @Prop({ type: String, required: true })
  passwordHash: string;
  @Prop({ type: String, required: true })
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

  @Prop({
    type: Object,
    required: true,
  })
  accountData: UserAccountData;

  @Prop({ type: Object, required: true })
  emailConfirmation: UserEmailConfirmationData;

  @Prop({ type: Object, required: true })
  passwordRecoveryConfirmation: UserPasswordRecoveryConfirmationData;

  static createUser(newUser: CreateUserDataType): UserDocument {
    const user = new this();

    user.id = new ObjectId().toString();
    user.accountData = {
      email: newUser.email,
      login: newUser.login,
      passwordHash: newUser.passwordHash,
      createdAt: new Date().toISOString(),
    };
    user.emailConfirmation = {
      confirmationCode: v4(),
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

    return user as UserDocument;
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

  updateEmailConfirmation() {
    this.emailConfirmation.isConfirmed = true;
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

  isUserPasswordRecoveryCodeExpired() {
    return (
      this.passwordRecoveryConfirmation.expirationDate == null ||
      this.passwordRecoveryConfirmation.expirationDate <
        new Date().toISOString()
    );
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
  isUserPasswordRecoveryCodeExpired:
    User.prototype.isUserPasswordRecoveryCodeExpired,
};

UserSchema.statics = {
  createUser: User.createUser,
};

UserSchema.loadClass(User);
