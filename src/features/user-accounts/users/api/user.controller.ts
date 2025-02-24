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
} from '@nestjs/common';

import { InputCreateUserAccountDataType } from './models/dto/input';
import { OutputUserType } from './models/dto/output';
import { ApiBasicAuth, ApiParam } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { BasicAuthGuard } from '../../../../core/guards/basic/basic-auth.guard';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CreateUserCommand } from '../application/usecases/create-user.usecase';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { DeleteUserCommand } from '../application/usecases/delete-user.usecase';
import { GetAllUsersCommand } from '../application/usecases/query-user-usecases.ts/get-all-users-usecase';
import { GetUsersQueryParams } from './models/dto/users.dto';

@SkipThrottle()
@Controller('users')
@UseGuards(BasicAuthGuard)
@ApiBasicAuth('basicAuth')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
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
    return await this.queryBus.execute(new GetAllUsersCommand(query));
  }

  @Post()
  @HttpCode(201)
  async createUser(
    @Body() inputCreateUserData: InputCreateUserAccountDataType,
  ) {
    return await this.commandBus.execute(
      new CreateUserCommand(inputCreateUserData),
    );
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id') id: string) {
    return await this.commandBus.execute(new DeleteUserCommand(id));
  }
}
