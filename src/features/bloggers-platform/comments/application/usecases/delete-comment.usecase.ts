import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestDomainException,
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../../../core/exceptions/domain-exceptions';
import { CommentRepository } from '../../infrastructure/comment.repository';
import { CommentService } from '../comment.service';
import { UserRepository } from './../../../../user-accounts/users/infrastructure/user.repository';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly commentService: CommentService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({ commentId, userId }: DeleteCommentCommand) {
    const comment = await this.commentRepository.getById(commentId);

    if (!comment) {
      throw NotFoundDomainException.create('Comment is not found');
    }

    const user = await this.userRepository.getById(userId);

    if (!user) {
      throw BadRequestDomainException.create();
    }

    const checkedUser = await this.commentService.checkCredentials(
      comment,
      user,
    );

    if (!checkedUser) {
      throw ForbiddenDomainException.create();
    }

    const isDeleted = await this.commentRepository.delete(commentId);

    if (!isDeleted) {
      throw BadRequestDomainException.create();
    }
    return;
  }
}
