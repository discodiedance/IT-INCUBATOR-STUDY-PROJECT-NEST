import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QueryUserRepository } from './../../../infrastructure/user.query.repository';
import { GetUsersQueryParams } from '../../../api/models/dto/users.dto';

export class GetAllUsersCommand {
  constructor(public query: GetUsersQueryParams) {}
}

@QueryHandler(GetAllUsersCommand)
export class GetAllUsersUseCase implements IQueryHandler<GetAllUsersCommand> {
  constructor(private readonly queryUserRepository: QueryUserRepository) {}

  async execute({ query }: GetAllUsersCommand) {
    return await this.queryUserRepository.getAllUsers(query);
  }
}
