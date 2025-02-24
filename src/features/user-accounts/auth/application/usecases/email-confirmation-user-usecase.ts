import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { InputEmailConfirmationDataType } from '../../../users/api/models/dto/input';
import { UserRepository } from '../../../users/infrastructure/user.repository';

export class EmailConfirmationUserCommand {
  constructor(public confirmationData: InputEmailConfirmationDataType) {}
}

@CommandHandler(EmailConfirmationUserCommand)
export class EmailConfirmationUserUseCase
  implements ICommandHandler<EmailConfirmationUserCommand>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ confirmationData }: EmailConfirmationUserCommand) {
    const user = await this.userRepository.getByConfirmationCode(
      confirmationData.code,
    );

    if (!user) {
      throw BadRequestDomainException.create('Code is wrong', 'code');
    }

    if (user.isUserConfirmationCodeConfirmed()) {
      throw BadRequestDomainException.create(
        'Email is already confirmed',
        'code',
      );
    }

    if (user.isUserConfirmationCodeExpired()) {
      throw BadRequestDomainException.create('Code is expired', 'code');
    }

    if (!user.isUserConfirmationCodeEqual(confirmationData.code)) {
      throw BadRequestDomainException.create('Code is wrong', 'code');
    }

    user.updateEmailConfirmation();
    user.markModified('emailConfirmation');
    await this.userRepository.save(user);
  }
}
