import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../users/application/user.service';
import {
  InputCreateUserAccountDataType,
  InputEmailConfirmationDataType,
  InputEmaillResendingDataType,
  InputNewPasswordDataType,
  LoginDataType,
} from '../users/api/models/dto/input';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthQueryRepository } from './auth.query.repository';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ExtractUserIdFromRequest } from '../../core/decorators/param/extract-user-from-request';
import { JwtAuthGuard } from '../../core/guards/bearer/jwt-auth.guard';
import { OutputUserType } from '../users/api/models/dto/output';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly UserService: UserService,
    private readonly AuthService: AuthService,
    private readonly AuthQueryRepository: AuthQueryRepository,
  ) {}

  @ApiBearerAuth()
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@ExtractUserIdFromRequest() userId: string): Promise<OutputUserType> {
    const outputUser = this.AuthQueryRepository.me(userId);
    return outputUser;
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
    @Body() inpuitLoginData: LoginDataType,
  ): Promise<{ accessToken: string }> {
    const userId = await this.AuthService.validateUser(inpuitLoginData);
    const accessToken = this.AuthService.login(userId);

    return { accessToken };
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
    await this.UserService.registerUser(inputUserData);
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
    @Body() email: InputEmaillResendingDataType,
  ) {
    await this.UserService.emailResending(email.email);
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
    await this.UserService.emailConfirmation(confirmationData.code);
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
    await this.UserService.passwordRecovery(passwordRecoveryData.email);
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
      await this.UserService.confirmPasswordRecovery(newPasswordData);
      return;
    }
  }
}
