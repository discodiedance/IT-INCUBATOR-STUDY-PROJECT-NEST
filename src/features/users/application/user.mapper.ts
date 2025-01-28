import { OutputUserType } from '../api/models/dto/output';
import { UserDocument } from '../api/models/user.enitities';

export const userMapper = (user: UserDocument): OutputUserType => {
  return {
    createdAt: user.accountData.createdAt,
    email: user.accountData.email,
    login: user.accountData.login,
    id: user.id,
  };
};
