import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain-exceptions';
import {
  CreateUserAccountDataType,
  CreateUserDataType,
} from '../../api/models/dto/users.dto';
import { User } from '../user.entity';
import { UserModelType } from '../../api/models/user.enitities';
import { CryptoService } from '../../../crypto/crypto.service';
import { UserRepository } from '../../infrastructure/user.repository';
import { InjectModel } from '@nestjs/mongoose';
import { OutputUserType } from '../../api/models/dto/output';

export class CreateUserCommand {
  constructor(public newUserAccountData: CreateUserAccountDataType) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: UserModelType,
    private readonly userRepository: UserRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  async execute({ newUserAccountData }: CreateUserCommand) {
    const userWithTheSameLogin = await this.userRepository.getByLogin(
      newUserAccountData.login,
    );

    if (userWithTheSameLogin) {
      throw BadRequestDomainException.create(
        'User with the same login already exists',
        'login',
      );
    }

    const userWithTheSameEmail = await this.userRepository.getByEmail(
      newUserAccountData.email,
    );

    if (userWithTheSameEmail) {
      throw BadRequestDomainException.create(
        'User with the same email already exists',
        'email',
      );
    }

    const passwordHash = await this.cryptoService.createPasswordHash(
      newUserAccountData.password,
    );

    const newUser: CreateUserDataType = {
      login: newUserAccountData.login,
      email: newUserAccountData.email,
      passwordHash: passwordHash,
    };

    const createdUser = this.userModel.createUser(newUser);
    const savedUser = await this.userRepository.save(createdUser);

    if (!savedUser) {
      throw BadRequestDomainException.create('User is not created');
    }

    return OutputUserType.mapToView(createdUser);
  }
}
