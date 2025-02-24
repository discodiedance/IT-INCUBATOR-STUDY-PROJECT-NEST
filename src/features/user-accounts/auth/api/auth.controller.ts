import { Response } from 'express';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
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
import { ThrottlerGuard } from '@nestjs/throttler';
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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly AuthService: AuthService,
  ) {}

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
    @Body() inpuitLoginData: InputLoginDataType,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const userId = await this.AuthService.validateUser(inpuitLoginData);
    const tokens = await this.commandBus.execute(new LoginUserCommand(userId));

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return { accessToken: tokens.accessToken };
  }

  @UseGuards(ThrottlerGuard)
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

  @UseGuards(ThrottlerGuard)
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

  @UseGuards(ThrottlerGuard)
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

  @UseGuards(ThrottlerGuard)
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

  @UseGuards(ThrottlerGuard)
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
