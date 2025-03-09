import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { User, UserSchema } from './users/application/user.entity';
import { UserController } from './users/api/user.controller';
import { AuthController } from './auth/api/auth.controller';
import { UserRepository } from './users/infrastructure/user.repository';
import { DeleteUserUseCase } from './users/application/usecases/delete-user.usecase';
import { CreateUserUseCase } from './users/application/usecases/create-user.usecase';
import { CryptoService } from './crypto/crypto.service';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './users/constants/auth-tokens.inject-constants';
import { QueryUserRepository } from './users/infrastructure/user.query.repository';
import { JwtStrategy } from '../../core/guards/bearer/jwt.strategy';
import { LocalStrategy } from '../../core/guards/local/local.strategy';
import { EmailConfirmationUserUseCase } from './auth/application/usecases/email-confirmation-user-usecase';
import { EmailResendingUserUseCase } from './auth/application/usecases/email-resending-user.usecase';
import { EmailSendPasswordRecoveryUserUseCase } from './auth/application/usecases/email-send-password-recovery-user.ts';
import { LoginUserUseCase } from './auth/application/usecases/login-user.usecase';
import { NewPasswordRecoveryUserUseCase } from './auth/application/usecases/new-password-confirmation';
import { RegisterUserUseCase } from './auth/application/usecases/register-user.usecase';
import { AuthService } from './auth/application/auth.service';
import { GetMeUseCase } from './auth/application/usecases/query-auth-usecases/get-me.usecase';
import { UserAccountsConfig } from './config/user-accounts.config';
import { throttlerModule } from '../../core/guards/throttler/throttler.module';
import { GetAllUsersUseCase } from './users/application/usecases/query-user-usecases/get-all-users-usecase';
import { DevicesModule } from './security/security-devices.module';
import {
  Device,
  DeviceSchema,
} from './security/application/security-device.entity';
import { UpdateTokensUseCase } from './auth/application/usecases/update-tokens.usecase';
import { LogoutUserUseCase } from './auth/application/usecases/logout-user.usecase';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    throttlerModule,
    NotificationsModule,
    JwtModule,
    DevicesModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
  ],
  controllers: [UserController, AuthController],
  providers: [
    UserAccountsConfig,
    AuthService,
    QueryUserRepository,
    UserRepository,
    LocalStrategy,
    CryptoService,
    JwtStrategy,
    GetMeUseCase,
    GetAllUsersUseCase,
    CreateUserUseCase,
    DeleteUserUseCase,
    LoginUserUseCase,
    EmailConfirmationUserUseCase,
    EmailResendingUserUseCase,
    EmailSendPasswordRecoveryUserUseCase,
    NewPasswordRecoveryUserUseCase,
    RegisterUserUseCase,
    UpdateTokensUseCase,
    LogoutUserUseCase,

    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountConfig: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: userAccountConfig.accessTokenSecret,
          signOptions: { expiresIn: userAccountConfig.accessTokenExpireIn },
        });
      },
      inject: [UserAccountsConfig],
    },

    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountConfig: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: userAccountConfig.refreshTokenSecret,
          signOptions: { expiresIn: userAccountConfig.refreshTokenExpireIn },
        });
      },
      inject: [UserAccountsConfig],
    },
  ],

  exports: [UserRepository, QueryUserRepository, UserAccountsConfig],
})
export class UserAccountsModule {}
