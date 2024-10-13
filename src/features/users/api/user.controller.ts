import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';

import {
  InputCreateUserAccountDataType,
  InputUserSortDataUserType,
} from './models/input';
import { UserService } from '../application/user.service';
import { QueryUserRepository } from '../infrastructure/user-query.repository';
import { UserRepository } from './../infrastructure/user.repository';
import { UserSortDataUserType } from './models/users.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly UserService: UserService,
    private readonly QueryUserRepository: QueryUserRepository,
    private readonly UserRepository: UserRepository,
  ) {}

  @Get()
  async getUsers(@Query() query: InputUserSortDataUserType, @Res() res) {
    const sortData: UserSortDataUserType = {
      sortBy: query.sortBy,
      sortDirection: query.sortDirection,
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      searchLoginTerm: query.searchLoginTerm,
      searchEmailTerm: query.searchEmailTerm,
    };
    const allUsers = await this.QueryUserRepository.getAll(sortData);
    res.status(HttpStatus.OK).send(allUsers);
    return;
  }

  @Post()
  async createUser(
    @Body() inputCreateUserData: InputCreateUserAccountDataType,
    @Res() res,
  ) {
    const user = await this.UserService.createUser(inputCreateUserData);
    res.status(HttpStatus.CREATED).send(user);
    return;
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Res() res) {
    const user = await this.QueryUserRepository.getById(id);
    if (!user) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    }
    const result = await this.UserRepository.delete(id);
    if (!result) {
      res.status(HttpStatus.BAD_REQUEST).send();
      return;
    }
    res.status(HttpStatus.NO_CONTENT).send();
    return;
  }
}
