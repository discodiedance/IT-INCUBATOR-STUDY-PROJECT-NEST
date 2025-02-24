import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  NotFoundDomainException,
  ForbiddenDomainException,
  BadRequestDomainException,
} from '../../../../../core/exceptions/domain-exceptions';
import { CommentRepository } from '../../infrastructure/comment.repository';
import { CommentService } from '../comment.service';
import { InputUpdateCommentDataType } from '../../api/models/dto/input';
import { UserRepository } from './../../../../user-accounts/users/infrastructure/user.repository';
import { InjectModel } from '@nestjs/mongoose';
import { CommentModelType } from '../../api/models/comment.entities';
import { Comment } from '../comment.entity';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public updateData: InputUpdateCommentDataType,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: CommentModelType,
    private readonly commentRepository: CommentRepository,
    private readonly commentService: CommentService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({ commentId, updateData, userId }: UpdateCommentCommand) {
    const comment = await this.commentRepository.getById(commentId);

    if (!comment) {
      throw NotFoundDomainException.create();
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

    comment.updateComment(updateData);
    const updatetComment = await this.commentRepository.save(comment);

    if (!updatetComment) {
      throw BadRequestDomainException.create();
    }

    return;
  }
}
