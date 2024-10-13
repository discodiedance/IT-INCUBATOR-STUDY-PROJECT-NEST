import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserSortDataUserType } from '../api/models/users.dto';
import { UserModelType } from '../api/models/user.enitities';
import { userMapper } from '../application/user.mapper';
import { User } from '../application/user.entity';
import { OutputUserType } from '../api/models/output';

@Injectable()
export class QueryUserRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async getAll(sortData: UserSortDataUserType) {
    const sortBy = sortData.sortBy ?? 'createdAt';
    const sortDirection = sortData.sortDirection ?? 'desc';
    const pageNumber = sortData.pageNumber ?? 1;
    const pageSize = sortData.pageSize ?? 10;
    const searchEmailTerm = sortData.searchEmailTerm ?? null;
    const searchLoginTerm = sortData.searchLoginTerm ?? null;

    let filterLogin = {};
    let filterEmail = {};

    if (searchEmailTerm) {
      filterEmail = {
        'accountData.email': {
          $regex: searchEmailTerm,
          $options: 'i',
        },
      };
    }

    if (searchLoginTerm) {
      filterLogin = {
        'accountData.login': {
          $regex: searchLoginTerm,
          $options: 'i',
        },
      };
    }

    const filter = {
      $or: [filterEmail, filterLogin],
    };

    const users = await this.UserModel.find(filter)
      .sort({ [`accountData.${sortBy}`]: sortDirection })
      .skip((+pageNumber - 1) * +pageSize)
      .limit(+pageSize);

    const totalCount = await this.UserModel.countDocuments(filter);
    const pageCount = Math.ceil(totalCount / +pageSize);

    return {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items: users.map(userMapper),
    };
  }

  async getById(id: string): Promise<OutputUserType | null> {
    const user = await this.UserModel.findOne({ id: id });
    if (!user) {
      return null;
    }
    return userMapper(user);
  }

  async getByLogin(login: string): Promise<OutputUserType | null> {
    const user = await this.UserModel.findOne({
      'accountData.login': login,
    });
    if (!user) {
      return null;
    }
    return userMapper(user);
  }

  async getByEmail(email: string): Promise<OutputUserType | null> {
    const user = await this.UserModel.findOne({
      'accountData.email': email,
    });
    if (!user) {
      return null;
    }
    return userMapper(user);
  }
}
