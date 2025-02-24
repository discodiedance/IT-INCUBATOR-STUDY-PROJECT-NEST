import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostLikeDataType } from '../../api/models/dto/post-likes.dto';
import { PostLikesRepository } from '../../infrastructure/post-likes.repository';
import { PostRepository } from '../../../../posts/infrastructure/post.repository';
import { InjectModel } from '@nestjs/mongoose';
import { PostLikes } from '../post-likes.entity';
import { PostLikesModelType } from '../../api/models/post-likes.entities';
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../../../../core/exceptions/domain-exceptions';

export class CreatePostLikeOrDislikeCommand {
  constructor(public createPostLikeData: CreatePostLikeDataType) {}
}

@CommandHandler(CreatePostLikeOrDislikeCommand)
export class CreatePostLikeOrDislikeUseCase
  implements ICommandHandler<CreatePostLikeOrDislikeCommand>
{
  constructor(
    @InjectModel(PostLikes.name)
    private readonly postLikesModel: PostLikesModelType,
    private readonly postRepository: PostRepository,
    private readonly postLikesRepository: PostLikesRepository,
  ) {}

  async execute({ createPostLikeData }: CreatePostLikeOrDislikeCommand) {
    if (createPostLikeData.likeStatus === 'None') {
      return true;
    }

    const post = await this.postRepository.getById(createPostLikeData.post.id);

    if (!post) {
      throw NotFoundDomainException.create();
    }

    const createdLikeOrDislike =
      this.postLikesModel.createLike(createPostLikeData);

    const createdLikeOrDislikeData =
      await this.postLikesRepository.save(createdLikeOrDislike);

    if (!createdLikeOrDislikeData) {
      throw BadRequestDomainException.create();
    }

    if (createdLikeOrDislike.isLikeDataEqualsLike()) {
      post.addLikeCounter();
      post.markModified('likesInfo');

      const updatedLikesCounter = await this.postRepository.save(post);

      if (!updatedLikesCounter) {
        throw BadRequestDomainException.create();
      }

      return true;
    }

    if (createdLikeOrDislike.isLikeDataEqualsDislike()) {
      post.addDislikeCounter();
      post.markModified('likesInfo');

      const updatedLikesCounter = await this.postRepository.save(post);

      if (!updatedLikesCounter) {
        throw BadRequestDomainException.create();
      }

      return true;
    }
    throw BadRequestDomainException.create();
  }
}
