import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { CryptoService } from '../../../crypto/crypto.service';
import { InputNewPasswordDataType } from '../../../users/api/models/dto/input';
import { UserRepository } from '../../../users/infrastructure/user.repository';

export class NewPasswordConfirmationUserCommand {
  constructor(public newPasswordData: InputNewPasswordDataType) {}
}

@CommandHandler(NewPasswordConfirmationUserCommand)
export class NewPasswordRecoveryUserUseCase
  implements ICommandHandler<NewPasswordConfirmationUserCommand>
{
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({ newPasswordData }: NewPasswordConfirmationUserCommand) {
    const user =
      await this.userRepository.getByPasswordRecoveryConfirmationCode(
        newPasswordData.recoveryCode,
      );

    if (!user) {
      throw BadRequestDomainException.create();
    }

    if (user.isUserPasswordRecoveryCodeExpired()) {
      throw BadRequestDomainException.create('Code is expired', 'code');
    }
    const newPasswordHash = await this.cryptoService.createPasswordHash(
      newPasswordData.newPassword,
    );
    user.updateNewPassword(newPasswordHash);
    user.markModified('accountData');
    await this.userRepository.save(user);
  }
}
