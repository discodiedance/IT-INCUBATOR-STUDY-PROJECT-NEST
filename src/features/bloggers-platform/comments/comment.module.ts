import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from '../comments/application/comment.entity';
import { CommentController } from './api/comment.controller';
import { CommentRepository } from './infrastructure/comment.repository';
import { CommentService } from './application/comment.service';
import { DeleteCommentUseCase } from './application/usecases/delete-comment.usecase';
import { GetCommentUseCase } from './application/usecases/query-usecases/get-comment-by-id.usecase';
import { UpdateCommentUseCase } from './application/usecases/update-comment.usecase';
import { QueryCommentRepository } from './infrastructure/comment.query-repository';
import { UserAccountsModule } from '../../user-accounts/user-accounts.module';
import { PostModule } from '../posts/post.module';
import { CommentLikesModule } from '../likes/comments/api/comment-likes.module';

@Module({
  imports: [
    CommentLikesModule,
    UserAccountsModule,
    forwardRef(() => PostModule),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
  ],
  controllers: [CommentController],
  providers: [
    QueryCommentRepository,
    CommentRepository,
    CommentService,
    GetCommentUseCase,
    DeleteCommentUseCase,
    UpdateCommentUseCase,
  ],

  exports: [CommentRepository, QueryCommentRepository],
})
export class CommentModule {}
