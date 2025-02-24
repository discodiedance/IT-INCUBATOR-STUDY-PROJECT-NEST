import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserModelType } from '../api/models/user.enitities';
import { userMapper } from '../application/mappers/user.mapper';
import { User } from '../application/user.entity';
import { OutputUserType } from '../api/models/dto/output';
import { FilterQuery } from 'mongoose';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';
import { UserRepository } from './user.repository';
import { GetUsersQueryParams } from '../api/models/dto/users.dto';

@Injectable()
export class QueryUserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly UserModel: UserModelType,
    private readonly userRepository: UserRepository,
  ) {}

  async getAllUsers(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<OutputUserType[]>> {
    const filter: FilterQuery<User> = {};

    if (query.searchLoginTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        'accountData.login': { $regex: query.searchLoginTerm, $options: 'i' },
      });
    }

    if (query.searchEmailTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        'accountData.email': { $regex: query.searchEmailTerm, $options: 'i' },
      });
    }

    const users = await this.UserModel.find(filter)
      .sort({ ['accountData' + query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize)
      .lean();

    const totalCount = await this.UserModel.countDocuments(filter);

    const items = users.map(OutputUserType.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getMe(userId: string): Promise<OutputUserType> {
    const user = await this.userRepository.findOrNotFoundFail(userId);

    if (!user) {
      throw NotFoundDomainException.create();
    }

    return OutputUserType.mapToView(user);
  }

  async getById(id: string): Promise<OutputUserType | null> {
    const user = await this.UserModel.findOne({ id: id }).lean();

    if (!user) {
      return null;
    }

    return userMapper(user);
  }

  async getByLogin(login: string): Promise<OutputUserType | null> {
    const user = await this.UserModel.findOne({
      'accountData.login': login,
    }).lean();

    if (!user) {
      return null;
    }

    return userMapper(user);
  }

  async getByEmail(email: string): Promise<OutputUserType | null> {
    const user = await this.UserModel.findOne({
      'accountData.email': email,
    }).lean();

    if (!user) {
      return null;
    }

    return userMapper(user);
  }
}
