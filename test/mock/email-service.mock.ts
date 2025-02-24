import { NotificationsService } from '../../src/features/notifications/notifications.service';

export class EmailServiceMock extends NotificationsService {
  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    return;
  }

  async sendPasswordRecoveryCode(email: string, code: string) {
    return;
  }
}
