import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () =>
        // userAccountsConfig: UserAccountsConfig

        ({
          transport: {
            host: 'smtp.gmail.com',
            secure: false,
            port: 587,
            auth: {
              user: process.env.SMTP_FROM_EMAIL,
              pass: process.env.GMAIL_COM_PASS,
            },
          },
          defaults: {
            from: 'Jerome V. <fundu1448@gmail.com>',
          },
          // inject: [UserAccountsConfig],
        }),
    }),
  ],

  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
