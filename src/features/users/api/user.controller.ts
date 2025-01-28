import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  GetUsersQueryParams,
  InputCreateUserAccountDataType,
} from './models/dto/input';
import { UserService } from '../application/user.service';
import { QueryUserRepository } from '../infrastructure/user.query.repository';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { OutputUserType } from './models/dto/output';
import { ApiBasicAuth, ApiParam } from '@nestjs/swagger';
import { BasicAuthGuard } from '../../../core/guards/basic/basic-auth.guard';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('users')
@UseGuards(BasicAuthGuard)
@ApiBasicAuth('basicAuth')
export class UserController {
  constructor(
    private readonly UserService: UserService,
    private readonly QueryUserRepository: QueryUserRepository,
  ) {}

  @Get()
  @ApiParam({
    name: 'sortBy',
    type: 'string',
    example: 'createdAt',
    description: "Default value: 'createdAt'",
    required: false,
  })
  @ApiParam({
    name: 'sortDirection',
    type: 'string',
    example: 'desc',
    required: false,
  })
  @ApiParam({
    name: 'pageNumber',
    type: 'integer($int32)',
    example: 1,
    description: 'pageNumber is number of portions that should be returned',
    required: false,
  })
  @ApiParam({
    name: 'pageSize',
    type: 'integer($int32)',
    example: '10',
    description: 'pageSize is portions size that should be returned',
    required: false,
  })
  @ApiParam({
    name: 'searchLoginTerm',
    type: 'string',
    example: 'searchLoginTerm',
    description:
      'Search term for user Login: Login should contains this term in any position <br>' +
      'Default value: null',
    required: false,
  })
  @ApiParam({
    name: 'searchEmailTerm',
    type: 'string',
    example: 'searchEmailTerm',
    description:
      'Search term for user Email: Email should contains this term in any position <br>' +
      'Default value: null',
    required: false,
  })
  async getUsers(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<OutputUserType[]>> {
    const allUsers = await this.QueryUserRepository.getAll(query);
    return allUsers;
  }

  @Post()
  @HttpCode(201)
  async createUser(
    @Body() inputCreateUserData: InputCreateUserAccountDataType,
  ): Promise<OutputUserType | null> {
    const user = await this.UserService.createUser(inputCreateUserData);
    const mappedUser = OutputUserType.mapToView(user);
    return mappedUser;
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id') id: string) {
    return await this.UserService.deleteUser(id);
  }
}
