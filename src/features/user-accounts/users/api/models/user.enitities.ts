import { HydratedDocument, Model } from 'mongoose';
import { User } from '../../application/user.entity';
import { CreateUserDataType } from './dto/users.dto';

export type UserModelStaticType = {
  createUser: (newUser: CreateUserDataType) => UserDocument;
};

export type UserMethodsType = {
  updateEmailConfirmation: () => void;
  updateEmailConfirmationCode: (code: string) => void;
  addRecoveryPasswordCodeToUser: (newCode: string) => void;
  updateNewPassword: (newPasswordHash: string) => void;
  isUserConfirmationCodeConfirmed: () => boolean;
  isUserConfirmationCodeEqual: (code: string) => boolean;
  isUserConfirmationCodeExpired: () => boolean;
  isUserPasswordRecoveryCodeExpired: () => boolean;
};

export type UserDocument = HydratedDocument<User, UserMethodsType>;

export type UserModelType = Model<UserDocument> & UserModelStaticType;
