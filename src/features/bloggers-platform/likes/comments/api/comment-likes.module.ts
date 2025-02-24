import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import {
  CommentLikes,
  CommentLikesSchema,
} from '../application/comment-likes.entity';
import { CommentLikesRepository } from '../infrastructure/comment-likes.repository';
import { CreateCommentLikeOrDislikeUsecase } from '../application/usecases/create-comment-like-or-dislike.usecase';
import { CreateLikeOrDislikeToCommentUseCase } from '../application/usecases/create-like-or-dislike-to-comment.usecase';
import { CommentRepository } from '../../../comments/infrastructure/comment.repository';
import {
  Comment,
  CommentSchema,
} from '../../../comments/application/comment.entity';
import { CommentModule } from '../../../comments/comment.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CommentLikes.name, schema: CommentLikesSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  providers: [
    CommentRepository,
    CommentLikesRepository,
    CreateLikeOrDislikeToCommentUseCase,
    CreateCommentLikeOrDislikeUsecase,
  ],

  exports: [
    CommentLikesRepository,
    CreateLikeOrDislikeToCommentUseCase,
    CreateCommentLikeOrDislikeUsecase,
  ],
})
export class CommentLikesModule {}
