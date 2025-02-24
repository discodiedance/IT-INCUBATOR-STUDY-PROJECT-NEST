import { Module } from '@nestjs/common';
import { NotificationsModule } from './features/notifications/notifications.module';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongooseModule } from '@nestjs/mongoose';
import { mongoUri } from './config';
import { CoreModule } from './core/core.module';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { TestingModule } from './features/tests/testing.module';
import { BlogModule } from './features/bloggers-platform/blogs/blog.module';
import { PostModule } from './features/bloggers-platform/posts/post.module';
import { CommentModule } from './features/bloggers-platform/comments/comment.module';
import { PostLikesModule } from './features/bloggers-platform/likes/posts/api/post-likes.module';
import { CommentLikesModule } from './features/bloggers-platform/likes/comments/api/comment-likes.module';

@Module({
  imports: [
    MongooseModule.forRoot(mongoUri as string),
    CoreModule,
    PassportModule,
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
    NotificationsModule,
    UserAccountsModule,
    BlogModule,
    PostLikesModule,
    CommentLikesModule,
    PostModule,
    CommentModule,
    TestingModule,
  ],
})
export class AppModule {}
