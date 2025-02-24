import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentLikesRepository } from '../../../../likes/comments/infrastructure/comment-likes.repository';
import { QueryCommentRepository } from '../../../infrastructure/comment.query-repository';
import { CommentRepository } from '../../../infrastructure/comment.repository';
import { NotFoundDomainException } from '../../../../../../core/exceptions/domain-exceptions';

export class GetCommentByIdCommand {
  constructor(
    public commentId: string,
    public userId: string | null,
  ) {}
}

@QueryHandler(GetCommentByIdCommand)
export class GetCommentUseCase implements IQueryHandler<GetCommentByIdCommand> {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly commentLikesRepository: CommentLikesRepository,
    private readonly queryCommentRepository: QueryCommentRepository,
  ) {}

  async execute({ commentId, userId }: GetCommentByIdCommand) {
    const comment = await this.commentRepository.getById(commentId);
    if (!comment) {
      throw NotFoundDomainException.create();
    }

    const status =
      await this.commentLikesRepository.getCommentLikeStatusForUser(
        userId,
        commentId,
      );

    const commentWithStatus = await this.queryCommentRepository.getById(
      commentId,
      status,
    );
    return commentWithStatus;
  }
}
