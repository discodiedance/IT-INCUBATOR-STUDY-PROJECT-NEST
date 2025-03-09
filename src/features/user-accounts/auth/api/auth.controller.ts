import { Request, Response } from 'express';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  InputCreateUserAccountDataType,
  InputEmaillResendingDataType,
  InputNewPasswordDataType,
  InputLoginDataType,
  InputEmailConfirmationDataType,
} from '../../users/api/models/dto/input';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { OutputUserType } from '../../users/api/models/dto/output';
import { ExtractUserIdFromRequest } from '../../../../core/decorators/param/extract-user-from-request';
import { JwtAuthGuard } from '../../../../core/guards/bearer/jwt-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { EmailConfirmationUserCommand } from '../application/usecases/email-confirmation-user-usecase';
import { RegistrationEmailResendingUserCommand } from '../application/usecases/email-resending-user.usecase';
import { EmailSendPasswordRecoveryCodeUserCommand } from '../application/usecases/email-send-password-recovery-user.ts';
import { LoginUserCommand } from '../application/usecases/login-user.usecase';
import { NewPasswordConfirmationUserCommand } from '../application/usecases/new-password-confirmation';
import { RegistrationUserCommand } from '../application/usecases/register-user.usecase';
import { AuthService } from '../application/auth.service';
import { GetMeCommand } from '../application/usecases/query-auth-usecases/get-me.usecase';
import { RefreshTokenGuard } from '../../../../core/guards/refresh/refresh-token.guard';
import { UpdateTokensCommand } from '../application/usecases/update-tokens.usecase';
import { LogoutUserCommand } from '../application/usecases/logout-user.usecase';

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly authService: AuthService,
  ) {}

  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @Get('me')
  async me(@ExtractUserIdFromRequest() userId: any): Promise<OutputUserType> {
    return await this.queryBus.execute(new GetMeCommand(userId));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        loginOREmail: { type: 'string', example: 'login123' },
        password: { type: 'string', example: 'superpassword' },
      },
    },
  })
  async login(
    @Body()
    inpuitLoginData: InputLoginDataType,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<{ accessToken: string }> {
    const ip = req.ip as string;
    const title = req.headers['user-agent'] as string;
    const userId = await this.authService.validateUser(inpuitLoginData);
    const tokens = await this.commandBus.execute(
      new LoginUserCommand(userId, ip, title),
    );

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return { accessToken: tokens.accessToken };
  }

  @SkipThrottle()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const tokens = await this.commandBus.execute(
      new UpdateTokensCommand(req.user.userId, req.user.deviceId),
    );
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return { accessToken: tokens.accessToken };
  }

  @SkipThrottle()
  @UseGuards(RefreshTokenGuard)
  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: any) {
    await this.commandBus.execute(
      new LogoutUserCommand(req.user.userId, req.user.deviceId),
    );
    return;
  }

  @Post('registration')
  @HttpCode(204)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        login: { type: 'string', example: 'login123' },
        password: { type: 'string', example: 'superpassword' },
        email: { type: 'string', example: 'email@gmail.com' },
      },
    },
  })
  async registration(@Body() inputUserData: InputCreateUserAccountDataType) {
    await this.commandBus.execute(new RegistrationUserCommand(inputUserData));
    return;
  }

  @Post('registration-email-resending')
  @HttpCode(204)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'email@gmail.com' },
      },
    },
  })
  async registrationEmailResending(
    @Body() emailData: InputEmaillResendingDataType,
  ) {
    await this.commandBus.execute(
      new RegistrationEmailResendingUserCommand(emailData),
    );
    return;
  }

  @Post('registration-confirmation')
  @HttpCode(204)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', example: '123456' },
      },
    },
  })
  async registrationConfirmation(
    @Body() confirmationData: InputEmailConfirmationDataType,
  ) {
    await this.commandBus.execute(
      new EmailConfirmationUserCommand(confirmationData),
    );
    return;
  }

  @Post('password-recovery')
  @HttpCode(204)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'email@gmail.com' },
      },
    },
  })
  async passwordRecovery(
    @Body() passwordRecoveryData: InputEmaillResendingDataType,
  ) {
    await this.commandBus.execute(
      new EmailSendPasswordRecoveryCodeUserCommand(passwordRecoveryData),
    );
    return;
  }

  @Post('new-password')
  @HttpCode(204)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newPassword: { type: 'string', example: 'superpassword' },
        recoveryCode: { type: 'string', example: '123456' },
      },
    },
  })
  async newPassword(@Body() newPasswordData: InputNewPasswordDataType) {
    {
      await this.commandBus.execute(
        new NewPasswordConfirmationUserCommand(newPasswordData),
      );
      return;
    }
  }
}
