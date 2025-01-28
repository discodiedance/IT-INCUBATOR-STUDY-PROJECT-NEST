import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { GMAIL_COM_PASS } from '../../config';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        secure: false,
        port: 587,
        auth: {
          user: 'fundu1448@gmail.com',
          pass: GMAIL_COM_PASS,
        },
      },
      defaults: {
        from: 'Jerome V. <fundu1448@gmail.com>',
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationsModule {}
