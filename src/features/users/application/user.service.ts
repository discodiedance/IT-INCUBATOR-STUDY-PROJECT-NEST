import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { UserRepository } from '../infrastructure/user.repository';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.entity';
import {
  CreateUserAccountDataType,
  CreateUserDataType,
} from '../api/models/users.dto';
import { OutputUserType } from '../api/models/output';
import { userMapper } from './user.mapper';
import { UserModelType } from '../api/models/user.enitities';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private readonly UserRepository: UserRepository,
  ) {}

  async _generateHash(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  async createUser(
    newUserAccountData: CreateUserAccountDataType,
  ): Promise<OutputUserType | null> {
    const passwordHash = await this._generateHash(newUserAccountData.password);

    const newUser: CreateUserDataType = {
      login: newUserAccountData.login,
      email: newUserAccountData.email,
      passwordHash: passwordHash,
    };

    const createdUser = this.UserModel.createUser(newUser);
    const savedUser = await this.UserRepository.save(createdUser);

    if (!savedUser) {
      return null;
    }

    return userMapper(createdUser);
  }
}
