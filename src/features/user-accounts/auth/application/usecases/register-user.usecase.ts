import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { NotificationsService } from '../../../../notifications/notifications.service';
import { CreateUserAccountDataType } from '../../../users/api/models/dto/users.dto';
import { CreateUserCommand } from '../../../users/application/usecases/create-user.usecase';
import { UserRepository } from '../../../users/infrastructure/user.repository';

export class RegistrationUserCommand {
  constructor(public newUserAccountData: CreateUserAccountDataType) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegistrationUserCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly notificationsService: NotificationsService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({ newUserAccountData }: RegistrationUserCommand) {
    const createdUser = await this.commandBus.execute(
      new CreateUserCommand(newUserAccountData),
    );

    if (!createdUser) {
      throw BadRequestDomainException.create();
    }

    const user = await this.userRepository.getByLogin(createdUser.login);

    if (!user) {
      throw BadRequestDomainException.create();
    }

    this.notificationsService.sendConfirmationEmail(
      user.accountData.email,
      user.emailConfirmation.confirmationCode,
    );
  }
}
