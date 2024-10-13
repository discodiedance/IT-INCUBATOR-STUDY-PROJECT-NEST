import { Module, Provider } from '@nestjs/common';
import { UserController } from './features/users/api/user.controller';
import { UserService } from './features/users/application/user.service';
import { UserRepository } from './features/users/infrastructure/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { mongoUri } from './config';
import { BlogController } from './features/blogs/api/blog.controller';
import { BlogService } from './features/blogs/application/blog.service';
import { BlogRepository } from './features/blogs/infrastrucutre/blog.repository';
import { QueryBlogRepository } from './features/blogs/infrastrucutre/blog.query-repository';
import { Blog, BlogSchema } from './features/blogs/application/blog.entity';
import { User, UserSchema } from './features/users/application/user.entity';
import { QueryUserRepository } from './features/users/infrastructure/user-query.repository';
import { QueryPostRepository } from './features/posts/infrastructure/post.query-repository';
import { Post, PostSchema } from './features/posts/application/post.entity';
import {
  Comment,
  CommentSchema,
} from './features/comments/application/comment.entity';
import { PostController } from './features/posts/api/post.controller';
import { CommentController } from './features/comments/api/comment.controller';
import { CommentService } from './features/comments/application/comment.service';
import { CommentRepository } from './features/comments/infrastructure/comment.repository';
import { PostRepository } from './features/posts/infrastructure/post.repository';
import { QueryCommentRepository } from './features/comments/infrastructure/comment.query-repository';
import { PostLikesRepository } from './features/likes/posts/infrastructure/post-likes.repository';
import { CommentLikesRepository } from './features/likes/comments/infrastructure/comment-likes.repository';
import {
  CommentLikes,
  CommentLikesSchema,
} from './features/likes/comments/application/comment-likes.entity';
import {
  PostLikes,
  PostLikesSchema,
} from './features/likes/posts/application/post-likes.entity';
import { TestingController } from './features/tests/test.controller';
import { PostService } from './features/posts/application/post.service';

const userProviders: Provider[] = [
  UserRepository,
  UserService,
  QueryUserRepository,
];

const postProviders: Provider[] = [
  PostRepository,
  PostService,
  QueryPostRepository,
];

const commentProviders: Provider[] = [
  CommentRepository,
  CommentService,
  QueryCommentRepository,
];

const blogProviders: Provider[] = [
  BlogRepository,
  BlogService,
  QueryBlogRepository,
];

const postLikesProviders: Provider[] = [PostLikesRepository];

const commentLikesProviders: Provider[] = [CommentLikesRepository];

const allSchemas = [
  { name: User.name, schema: UserSchema },
  { name: Blog.name, schema: BlogSchema },
  { name: Post.name, schema: PostSchema },
  { name: Comment.name, schema: CommentSchema },
  { name: PostLikes.name, schema: PostLikesSchema },
  { name: CommentLikes.name, schema: CommentLikesSchema },
];

const allControllers = [
  UserController,
  BlogController,
  PostController,
  CommentController,
  TestingController,
];

@Module({
  imports: [
    MongooseModule.forRoot(mongoUri as string),
    MongooseModule.forFeature(allSchemas),
  ],

  providers: [
    ...userProviders,
    ...blogProviders,
    ...postProviders,
    ...commentProviders,
    ...postLikesProviders,
    ...commentLikesProviders,
  ],

  controllers: allControllers,
})
export class AppModule {}
