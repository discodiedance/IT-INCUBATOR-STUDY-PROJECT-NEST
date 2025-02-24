import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 } from 'uuid';
import { NotificationsService } from '../../../../notifications/notifications.service';
import { InputEmaillResendingDataType } from '../../../users/api/models/dto/input';
import { UserRepository } from '../../../users/infrastructure/user.repository';

export class EmailSendPasswordRecoveryCodeUserCommand {
  constructor(public passwordRecoveryData: InputEmaillResendingDataType) {}
}

@CommandHandler(EmailSendPasswordRecoveryCodeUserCommand)
export class EmailSendPasswordRecoveryUserUseCase
  implements ICommandHandler<EmailSendPasswordRecoveryCodeUserCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute({
    passwordRecoveryData,
  }: EmailSendPasswordRecoveryCodeUserCommand) {
    const user = await this.userRepository.getByEmail(
      passwordRecoveryData.email,
    );
    if (!user) {
      return true;
    }
    const passwordRecoveryCode = v4();
    user.addRecoveryPasswordCodeToUser(passwordRecoveryCode);
    user.markModified('passwordRecoveryConfirmation');
    await this.userRepository.save(user);
    this.notificationsService.sendPasswordRecoveryCode(
      user.accountData.email,
      passwordRecoveryCode,
    );
  }
}
