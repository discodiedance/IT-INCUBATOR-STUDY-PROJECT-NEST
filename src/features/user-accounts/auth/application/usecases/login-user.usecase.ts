import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../../users/constants/auth-tokens.inject-constants';

export class LoginUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly refreshTokenContext: JwtService,
  ) {}

  async execute({ userId }: LoginUserCommand) {
    const accessToken = this.accessTokenContext.sign({
      id: userId,
    });

    const refreshToken = this.refreshTokenContext.sign({
      id: userId,
      deviceId: 'deviceId',
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
