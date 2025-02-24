import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Blog,
  BlogSchema,
} from '../bloggers-platform/blogs/application/blog.entity';
import {
  Comment,
  CommentSchema,
} from '../bloggers-platform/comments/application/comment.entity';
import {
  CommentLikes,
  CommentLikesSchema,
} from '../bloggers-platform/likes/comments/application/comment-likes.entity';
import {
  PostLikes,
  PostLikesSchema,
} from '../bloggers-platform/likes/posts/application/post-likes.entity';
import {
  Post,
  PostSchema,
} from '../bloggers-platform/posts/application/post.entity';
import {
  User,
  UserSchema,
} from '../user-accounts/users/application/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentLikes.name, schema: CommentLikesSchema },
      { name: PostLikes.name, schema: PostLikesSchema },
    ]),
  ],
  controllers: [TestingController],
})
export class TestingModule {}
