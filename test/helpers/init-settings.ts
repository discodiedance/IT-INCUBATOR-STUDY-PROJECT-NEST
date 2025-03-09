import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { UsersTestManager } from './managers/user-test-manager';
import { EmailServiceMock } from '../mock/email-service.mock';
import { deleteAllData } from './delete-all-data';
import { appSetup } from '../../src/settings/app-setup';
import { NotificationsService } from '../../src/features/notifications/notifications.service';
import { AuthTestManager } from './managers/auth-test-manager';
import { BlogTestManager } from './managers/blog-test-manager';
import { PostTestManager } from './managers/post-test.manager';
import { CommentTestManager } from './managers/comment-test.manager';
import { initAppModule } from '../../src/init-app-module';
import { CoreConfig } from '../../src/core/core.config';
import { DevicesTestManager } from './managers/devices-test-manager';

export const initSettings = async (
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const DynamicAppModule = await initAppModule();

  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [DynamicAppModule],
  })
    .overrideProvider(NotificationsService)
    .useClass(EmailServiceMock);

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();

  const app = testingAppModule.createNestApplication();
  const coreConfig = app.get<CoreConfig>(CoreConfig);
  appSetup(app, coreConfig, DynamicAppModule);

  await app.init();

  const databaseConnection = app.get<Connection>(getConnectionToken());
  const httpServer = app.getHttpServer();
  const userTestManger = new UsersTestManager(app, app.get('UserModel'));
  const authTestManager = new AuthTestManager(app, app.get('UserModel'));
  const blogTestManager = new BlogTestManager(app, app.get('BlogModel'));
  const postTestManager = new PostTestManager(app, app.get('PostModel'));
  const commentTestManager = new CommentTestManager(
    app,
    app.get('CommentModel'),
  );
  const devicesTestManager = new DevicesTestManager(
    app,
    app.get('DeviceModel'),
  );

  await deleteAllData(app);

  return {
    app,
    databaseConnection,
    httpServer,
    userTestManger,
    authTestManager,
    blogTestManager,
    postTestManager,
    commentTestManager,
    devicesTestManager,
  };
};
