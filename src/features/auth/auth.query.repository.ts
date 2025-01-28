import { Injectable } from '@nestjs/common';
import { NotFoundDomainException } from '../../core/exceptions/domain-exceptions';
import { UserRepository } from '../users/infrastructure/user.repository';
import { OutputUserType } from '../users/api/models/dto/output';

@Injectable()
export class AuthQueryRepository {
  constructor(private UserRepository: UserRepository) {}

  async me(userId: string): Promise<OutputUserType> {
    const user = await this.UserRepository.findOrNotFoundFail(userId);
    if (!user) {
      throw NotFoundDomainException.create();
    }

    const outputUser = OutputUserType.mapToView(user);

    return outputUser;
  }
}
