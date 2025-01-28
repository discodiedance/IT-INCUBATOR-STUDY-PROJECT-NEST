import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmationEmail(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: `Registration confirmation`,
      html: `<h1>Thank for your registration</h1>
    <p>To finish registration please follow the link below:
        <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
    </p>`,
    });
  }

  async sendPasswordRecoveryCode(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: `Password recovery`,
      html: `<h1>Password recovery</h1>
    <p>To finish password recovery please follow the link below:
        <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
    </p>`,
    });
  }
}
