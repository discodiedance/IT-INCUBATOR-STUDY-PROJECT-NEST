import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { NotFoundDomainException } from '../../exceptions/domain-exceptions';

export const ExtractUserIdFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw NotFoundDomainException.create('There is no user in request');
    }

    return user.userId;
  },
);
