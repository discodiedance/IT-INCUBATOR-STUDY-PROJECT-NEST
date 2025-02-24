import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 } from 'uuid';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { NotificationsService } from '../../../../notifications/notifications.service';
import { InputEmaillResendingDataType } from '../../../users/api/models/dto/input';
import { UserRepository } from '../../../users/infrastructure/user.repository';

export class RegistrationEmailResendingUserCommand {
  constructor(public emailData: InputEmaillResendingDataType) {}
}

@CommandHandler(RegistrationEmailResendingUserCommand)
export class EmailResendingUserUseCase
  implements ICommandHandler<RegistrationEmailResendingUserCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute({ emailData }: RegistrationEmailResendingUserCommand) {
    const user = await this.userRepository.getByEmail(emailData.email);

    if (!user) {
      throw BadRequestDomainException.create(
        'Email is not registered',
        'email',
      );
    }

    if (user.isUserConfirmationCodeConfirmed()) {
      throw BadRequestDomainException.create(
        'Email is already confirmed',
        'email',
      );
    }

    const newCode = v4();
    user.updateEmailConfirmationCode(newCode);
    user.markModified('emailConfirmation');
    await this.userRepository.save(user);

    this.notificationsService.sendConfirmationEmail(
      user.accountData.email,
      newCode,
    );
  }
}
