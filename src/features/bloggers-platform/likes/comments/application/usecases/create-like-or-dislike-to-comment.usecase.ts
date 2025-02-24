import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  NotFoundDomainException,
  BadRequestDomainException,
} from '../../../../../../core/exceptions/domain-exceptions';
import { CommentRepository } from '../../../../comments/infrastructure/comment.repository';
import {
  InputCreateCommentLikeDataType,
  CreateCommentLikeDataType,
} from '../../api/models/dto/comment-likes.dto';
import { CommentLikesRepository } from '../../infrastructure/comment-likes.repository';
import { CreateCommentLikeOrDislikeCommand } from './create-comment-like-or-dislike.usecase';

export class CreateLikeOrDislikeToCommentCommand {
  constructor(
    public commentId: string,
    public createLikeData: InputCreateCommentLikeDataType,
    public userId: string,
  ) {}
}

@CommandHandler(CreateLikeOrDislikeToCommentCommand)
export class CreateLikeOrDislikeToCommentUseCase
  implements ICommandHandler<CreateLikeOrDislikeToCommentCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly commentLikesRepository: CommentLikesRepository,
    private readonly commentRepository: CommentRepository,
  ) {}

  async execute({
    commentId,
    createLikeData,
    userId,
  }: CreateLikeOrDislikeToCommentCommand) {
    const comment = await this.commentRepository.getById(commentId);

    if (!comment) {
      throw NotFoundDomainException.create();
    }

    const createCommentLikeData: CreateCommentLikeDataType = {
      comment,
      likeStatus: createLikeData.likeStatus,
      parentId: userId,
    };

    const likeData =
      await this.commentLikesRepository.getLikeDataByParentIdAndCommentId(
        userId,
        comment.id,
      );

    if (!likeData) {
      const createdLike = await this.commandBus.execute(
        new CreateCommentLikeOrDislikeCommand(createCommentLikeData),
      );

      if (!createdLike) {
        throw BadRequestDomainException.create();
      }

      return;
    }

    if (likeData.isLikeDataEqualsLike()) {
      if (createCommentLikeData.likeStatus === 'Dislike') {
        likeData.updateLikeStatus(createCommentLikeData.likeStatus);

        const updatedToDislike =
          await this.commentLikesRepository.save(likeData);

        if (!updatedToDislike) {
          throw BadRequestDomainException.create();
        }

        comment.removeLikeAddDislikeCounter();
        comment.markModified('likesInfo');

        const updatedLikesCounter = await this.commentRepository.save(comment);

        if (!updatedLikesCounter) {
          throw BadRequestDomainException.create();
        }

        return;
      }

      if (createCommentLikeData.likeStatus === 'None') {
        const deletedLikeOrDislike = await this.commentLikesRepository.delete(
          likeData.id,
        );

        if (!deletedLikeOrDislike) {
          throw BadRequestDomainException.create();
        }

        comment.removeLikeCounter();
        comment.markModified('likesInfo');

        const updatedLikesCounter = await this.commentRepository.save(comment);

        if (!updatedLikesCounter) {
          throw BadRequestDomainException.create();
        }

        return;
      }
    }

    if (likeData.isLikeDataEqualsDislike()) {
      if (createCommentLikeData.likeStatus === 'Like') {
        likeData.updateLikeStatus(createCommentLikeData.likeStatus);
        const updatedToLike = await this.commentLikesRepository.save(likeData);

        if (!updatedToLike) {
          throw BadRequestDomainException.create();
        }

        comment.removeDislikeAddLikeCounter();
        comment.markModified('likesInfo');

        const updatedLikesCounter = await this.commentRepository.save(comment);

        if (!updatedLikesCounter) {
          throw BadRequestDomainException.create();
        }

        return;
      }

      if (createCommentLikeData.likeStatus === 'None') {
        const deletedDislike = await this.commentLikesRepository.delete(
          likeData.id,
        );

        if (!deletedDislike) {
          throw BadRequestDomainException.create();
        }

        comment.removeDislikeCounter();
        comment.markModified('likesInfo');

        const updatedLikesCounter = await this.commentRepository.save(comment);

        if (!updatedLikesCounter) {
          throw BadRequestDomainException.create();
        }
        return;
      }
    }

    if (likeData.isLikeDataEqualsNone()) {
      if (createCommentLikeData.likeStatus === 'Like') {
        likeData.updateLikeStatus(createCommentLikeData.likeStatus);
        const updatedToLike = await this.commentLikesRepository.save(likeData);

        if (!updatedToLike) {
          throw BadRequestDomainException.create();
        }

        comment.addLikeCounter();
        comment.markModified('likesInfo');

        const updatedLikesCounter = await this.commentRepository.save(comment);

        if (!updatedLikesCounter) {
          throw BadRequestDomainException.create();
        }

        return;
      }

      if (createCommentLikeData.likeStatus === 'Dislike') {
        likeData.updateLikeStatus(createCommentLikeData.likeStatus);
        const updatedToDislike =
          await this.commentLikesRepository.save(likeData);

        if (!updatedToDislike) {
          throw BadRequestDomainException.create();
        }

        comment.addDislikeCounter();
        comment.markModified('likesInfo');

        const updatedLikesCounter = await this.commentRepository.save(comment);

        if (!updatedLikesCounter) {
          throw BadRequestDomainException.create();
        }

        return;
      }
    }
  }
}
