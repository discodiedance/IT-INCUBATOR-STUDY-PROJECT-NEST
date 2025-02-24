import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QueryUserRepository } from '../../../../users/infrastructure/user.query.repository';

export class GetMeCommand {
  constructor(public userId: string) {}
}

@QueryHandler(GetMeCommand)
export class GetMeUseCase implements IQueryHandler<GetMeCommand> {
  constructor(private readonly queryUserRepository: QueryUserRepository) {}

  async execute({ userId }: GetMeCommand) {
    return await this.queryUserRepository.getMe(userId);
  }
}
