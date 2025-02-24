import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import {
  NotFoundDomainException,
  BadRequestDomainException,
} from '../../../../../../core/exceptions/domain-exceptions';
import { CommentRepository } from '../../../../comments/infrastructure/comment.repository';
import { CommentLikesModelType } from '../../api/models/comment-likes.entities';
import { CreateCommentLikeDataType } from '../../api/models/dto/comment-likes.dto';
import { CommentLikesRepository } from '../../infrastructure/comment-likes.repository';
import { CommentLikes } from '../comment-likes.entity';

export class CreateCommentLikeOrDislikeCommand {
  constructor(public createCommentLikeData: CreateCommentLikeDataType) {}
}

@CommandHandler(CreateCommentLikeOrDislikeCommand)
export class CreateCommentLikeOrDislikeUsecase
  implements ICommandHandler<CreateCommentLikeOrDislikeCommand>
{
  constructor(
    @InjectModel(CommentLikes.name)
    private readonly commentLikesModel: CommentLikesModelType,
    private readonly commentRepository: CommentRepository,
    private readonly commentLikesRepository: CommentLikesRepository,
  ) {}

  async execute({ createCommentLikeData }: CreateCommentLikeOrDislikeCommand) {
    const comment = await this.commentRepository.getById(
      createCommentLikeData.comment.id,
    );

    if (!comment) {
      throw NotFoundDomainException.create();
    }

    const createdLikeOrDislike = this.commentLikesModel.createLike(
      createCommentLikeData,
    );

    const createdLikeData =
      await this.commentLikesRepository.save(createdLikeOrDislike);

    if (!createdLikeData) {
      throw BadRequestDomainException.create();
    }

    if (createdLikeOrDislike.isLikeDataEqualsLike()) {
      comment.addLikeCounter();
      comment.markModified('likesInfo');

      const updatedLikesCounter = await this.commentRepository.save(comment);

      if (!updatedLikesCounter) {
        throw BadRequestDomainException.create();
      }

      return true;
    }

    if (createdLikeOrDislike.isLikeDataEqualsDislike()) {
      comment.addDislikeCounter();
      comment.markModified('likesInfo');

      const updatedLikesCounter = await this.commentRepository.save(comment);

      if (!updatedLikesCounter) {
        throw BadRequestDomainException.create();
      }

      return true;
    }
  }
}
