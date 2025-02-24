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
import { JWT_SECRET, REFRESH_SECRET } from '../../config';
import { QueryUserRepository } from './users/infrastructure/user.query.repository';
import { GetAllUsersUseCase } from './users/application/usecases/query-user-usecases.ts/get-all-users-usecase';
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
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    NotificationsModule,
    JwtModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController, AuthController],
  providers: [
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

    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: JWT_SECRET,
          signOptions: { expiresIn: '5m' },
        });
      },
      inject: [],
    },

    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: REFRESH_SECRET,
          signOptions: { expiresIn: '24h' },
        });
      },
      inject: [],
    },
  ],

  exports: [UserRepository, QueryUserRepository],
})
export class UserAccountsModule {}
