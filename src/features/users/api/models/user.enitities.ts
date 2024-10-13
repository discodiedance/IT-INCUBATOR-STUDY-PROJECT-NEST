import { HydratedDocument, Model } from 'mongoose';
import { User } from '../../application/user.entity';
import { CreateUserDataType } from './users.dto';

export type UserModelStaticType = {
  createUser: (newUser: CreateUserDataType) => UserDocument;
};

export type UserMethodsType = {
  updateEmailConfirmation: (user: UserDocument) => void;
  updateEmailConfirmationCode: (code: string) => void;
  addRecoveryPasswordCodeToUser: (newCode: string) => void;
  updateNewPassword: (newPasswordHash: string) => void;
  isUserConfirmationCodeConfirmed: () => boolean;
  isUserConfirmationCodeEqual: (code: string) => boolean;
  isUserConfirmationCodeExpired: () => boolean;
};

export type UserDocument = HydratedDocument<User, UserMethodsType>;

export type UserModelType = Model<UserDocument> & UserModelStaticType;
