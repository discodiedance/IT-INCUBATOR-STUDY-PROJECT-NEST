import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreModule } from './core/core.module';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { TestingModule } from './features/tests/testing.module';
import { BlogModule } from './features/bloggers-platform/blogs/blog.module';
import { PostModule } from './features/bloggers-platform/posts/post.module';
import { CommentModule } from './features/bloggers-platform/comments/comment.module';
import { PostLikesModule } from './features/bloggers-platform/likes/posts/api/post-likes.module';
import { CommentLikesModule } from './features/bloggers-platform/likes/comments/api/comment-likes.module';
import { CoreConfig } from './core/core.config';
import { configModule } from './config-dynamic.module';
import { throttlerModule } from './core/guards/throttler/throttler.module';
import { DevicesModule } from './features/user-accounts/security/security-devices.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { UserAccountsConfig } from './features/user-accounts/config/user-accounts.config';

@Module({
  imports: [
    configModule,
    MongooseModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => {
        const uri = coreConfig.mongoURI;
        console.log('DB_URI', uri);

        return {
          uri: uri,
        };
      },
      inject: [CoreConfig],
    }),
    CoreModule,
    throttlerModule,
    UserAccountsModule,
    DevicesModule,
    PassportModule,
    BlogModule,
    PostLikesModule,
    CommentLikesModule,
    PostModule,
    CommentModule,
    TestingModule,
    NotificationsModule,
  ],
})
export class AppModule {
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    return {
      module: AppModule,
      imports: [...(coreConfig.includeTestingModule ? [TestingModule] : [])],
    };
  }
}
