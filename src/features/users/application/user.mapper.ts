import { OutputUserType } from '../api/models/output';
import { UserDocument } from '../api/models/user.enitities';

export const userMapper = (user: UserDocument): OutputUserType => {
  return {
    id: user.id,
    login: user.accountData.login,
    email: user.accountData.email,
    createdAt: user.accountData.createdAt,
  };
};
