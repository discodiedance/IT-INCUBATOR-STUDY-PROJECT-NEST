import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { PostLikes, PostLikesSchema } from '../application/post-likes.entity';
import { CreateLikeOrDislikeToPostUseCase } from '../application/usecases/create-like-or-dislike-to-post.usecase';
import { CreatePostLikeOrDislikeUseCase } from '../application/usecases/create-post-like-or-dislike.usecase';
import { PostRepository } from '../../../posts/infrastructure/post.repository';
import { Post, PostSchema } from '../../../posts/application/post.entity';
import { PostLikesRepository } from '../infrastructure/post-likes.repository';
import { UserAccountsModule } from '../../../../user-accounts/user-accounts.module';

@Module({
  imports: [
    UserAccountsModule,
    MongooseModule.forFeature([
      { name: PostLikes.name, schema: PostLikesSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  providers: [
    PostRepository,
    PostLikesRepository,
    CreatePostLikeOrDislikeUseCase,
    CreateLikeOrDislikeToPostUseCase,
  ],

  exports: [
    PostLikesRepository,
    CreatePostLikeOrDislikeUseCase,
    CreateLikeOrDislikeToPostUseCase,
  ],
})
export class PostLikesModule {}
