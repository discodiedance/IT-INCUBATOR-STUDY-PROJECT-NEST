import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QueryPostRepository } from './infrastructure/post.query-repository';
import { Post, PostSchema } from './application/post.entity';
import { PostController } from './api/post.controller';
import { PostRepository } from './infrastructure/post.repository';
import { Comment, CommentSchema } from '../comments/application/comment.entity';
import { CreatePostUseCase } from './application/usecases/create-post.usecase';
import { UpdatePostUseCase } from './application/usecases/update-post.usecase';
import { DeletePostUseCase } from './application/usecases/delete-post.usecase.';
import { GetAllCommentsFromPostUseCase } from './application/usecases/query-usecases/get-all-comments-from-post.usecase';
import { GetAllPostsUseCase } from './application/usecases/query-usecases/get-all-posts.usecase';
import { GetPostByIdUseCase } from './application/usecases/query-usecases/get-post-by-id.usecase';
import { CreateCommentToPostUseCase } from './application/usecases/create-comment-to-post.usecase';
import { BlogExistsValidator } from '../../../core/decorators/validation/is-blog-exists.validator';
import { UserAccountsModule } from '../../user-accounts/user-accounts.module';
import { BlogModule } from '../blogs/blog.module';
import { CommentLikesModule } from '../likes/comments/api/comment-likes.module';
import { PostLikesModule } from '../likes/posts/api/post-likes.module';
import { CommentModule } from '../comments/comment.module';

@Module({
  imports: [
    forwardRef(() => BlogModule),
    UserAccountsModule,
    CommentLikesModule,
    PostLikesModule,
    forwardRef(() => CommentModule),
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [PostController],
  providers: [
    BlogExistsValidator,
    QueryPostRepository,
    PostRepository,
    CreatePostUseCase,
    CreateCommentToPostUseCase,
    UpdatePostUseCase,
    DeletePostUseCase,
    GetAllCommentsFromPostUseCase,
    GetAllPostsUseCase,
    GetPostByIdUseCase,
  ],

  exports: [PostRepository, QueryPostRepository],
})
export class PostModule {}
