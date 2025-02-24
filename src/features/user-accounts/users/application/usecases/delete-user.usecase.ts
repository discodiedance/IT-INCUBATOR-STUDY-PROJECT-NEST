import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QueryUserRepository } from '../../infrastructure/user.query.repository';
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../../../core/exceptions/domain-exceptions';
import { UserRepository } from '../../infrastructure/user.repository';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(
    private readonly queryUserRepository: QueryUserRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({ id }: DeleteUserCommand) {
    const foundedUser = await this.queryUserRepository.getById(id);

    if (!foundedUser) {
      throw NotFoundDomainException.create();
    }

    const deletedUser = await this.userRepository.delete(id);

    if (!deletedUser) {
      throw BadRequestDomainException.create(`User wasn't deleted`);
    }
  }
}
