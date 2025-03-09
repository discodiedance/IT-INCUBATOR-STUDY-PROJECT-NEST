import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty } from 'class-validator';
import { configValidationUtility } from '../../../settings/config-valdation.utility';

@Injectable()
export class UserAccountsConfig {
  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_EXPIRE_IN, examples: 1h, 5m, 2d',
  })
  accessTokenExpireIn: string = this.configService.get(
    'ACCESS_TOKEN_EXPIRE_IN',
  );

  @IsNotEmpty({
    message: 'Set Env variable REFRESH_TOKEN_EXPIRE_IN, examples: 1h, 5m, 2d',
  })
  refreshTokenExpireIn: string = this.configService.get(
    'REFRESH_TOKEN_EXPIRE_IN',
  );

  @IsNotEmpty({
    message: 'Set Env variable REFRESH_TOKEN_SECRET, dangerous for security!',
  })
  refreshTokenSecret: string = this.configService.get('REFRESH_TOKEN_SECRET');

  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_SECRET, dangerous for security!',
  })
  accessTokenSecret: string = this.configService.get('ACCESS_TOKEN_SECRET');

  @IsNotEmpty({
    message: 'Set Env variable GMAIL_COM_PASS, dangerous for security!',
  })
  gmailComPass: string = this.configService.get('GMAIL_COM_PASS');

  @IsNotEmpty({
    message: 'Set Env variable SMTP_FROM, examples: "John Doe <john@doe.com>"',
  })
  smtpFromEmail: string = this.configService.get('SMTP_FROM_EMAIL');

  constructor(private configService: ConfigService<any, true>) {
    configValidationUtility.validateConfig(this);
  }
}
