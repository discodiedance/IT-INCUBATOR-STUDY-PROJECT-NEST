import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostLikesRepository } from '../../infrastructure/post-likes.repository';
import { PostRepository } from '../../../../posts/infrastructure/post.repository';
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../../../../core/exceptions/domain-exceptions';
import {
  CreatePostLikeDataType,
  InputCreatePostLikeDataType,
} from '../../api/models/dto/post-likes.dto';
import { CreatePostLikeOrDislikeCommand } from './create-post-like-or-dislike.usecase';
import { UserRepository } from './../../../../../user-accounts/users/infrastructure/user.repository';

export class CreateLikeOrDislikeToPostCommand {
  constructor(
    public postId: string,
    public createLikeData: InputCreatePostLikeDataType,
    public userId: string,
  ) {}
}

@CommandHandler(CreateLikeOrDislikeToPostCommand)
export class CreateLikeOrDislikeToPostUseCase
  implements ICommandHandler<CreateLikeOrDislikeToPostCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly postRepository: PostRepository,
    private readonly postLikesRepository: PostLikesRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({ postId, createLikeData, userId }) {
    const post = await this.postRepository.getById(postId);

    if (!post) {
      throw NotFoundDomainException.create('Post is not found');
    }

    const user = await this.userRepository.getById(userId);

    if (!user) {
      throw BadRequestDomainException.create();
    }

    const createPostLikeData: CreatePostLikeDataType = {
      post,
      likeStatus: createLikeData.likeStatus,
      parentId: userId,
      parentLogin: user.accountData.login,
    };

    const likeData =
      await this.postLikesRepository.getLikeDataByParentIdAndPostId(
        createPostLikeData.parentId,
        createPostLikeData.post.id,
      );

    if (!likeData) {
      const createdLike = await this.commandBus.execute(
        new CreatePostLikeOrDislikeCommand(createPostLikeData),
      );

      if (!createdLike) {
        throw BadRequestDomainException.create();
      }

      return true;
    }

    if (likeData.isLikeDataEqualsLike()) {
      if (createLikeData.likeStatus === 'Dislike') {
        likeData.updateLikeStatus(createLikeData.likeStatus);
        const updatedToDislike = await this.postLikesRepository.save(likeData);

        if (!updatedToDislike) {
          throw BadRequestDomainException.create();
        }

        likeData.updateFirstReaction();
        const updatedToLike = await this.postLikesRepository.save(likeData);

        if (!updatedToLike) {
          throw BadRequestDomainException.create();
        }

        post.removeLikeAddDislikeCounter();
        post.markModified('likesInfo');
        const updatedLikesCounter = await this.postRepository.save(post);

        if (!updatedLikesCounter) {
          throw BadRequestDomainException.create();
        }
      }

      if (createLikeData.likeStatus === 'None') {
        likeData.updateToDeletedLikeOrDislike();

        const updatedToDeletedLikeOrDislike =
          await this.postLikesRepository.save(likeData);

        if (!updatedToDeletedLikeOrDislike) {
          throw BadRequestDomainException.create();
        }

        likeData.updateFirstReaction();

        const updatedFristReaction =
          await this.postLikesRepository.save(likeData);

        if (!updatedFristReaction) {
          throw BadRequestDomainException.create();
        }

        post.removeLikeCounter();
        post.markModified('likesInfo');
        const updatedLikesCounter = await this.postRepository.save(post);

        if (!updatedLikesCounter) {
          throw BadRequestDomainException.create();
        }
      }
    }

    if (likeData.isLikeDataEqualsDislike()) {
      if (createLikeData.likeStatus === 'Like') {
        likeData.updateLikeStatus(createLikeData.likeStatus);

        const updatedToLike = await this.postLikesRepository.save(likeData);

        if (!updatedToLike) {
          throw BadRequestDomainException.create();
        }

        likeData.updateFirstReaction();

        const updatedFristReaction =
          await this.postLikesRepository.save(likeData);

        if (!updatedFristReaction) {
          throw BadRequestDomainException.create();
        }

        post.removeDislikeAddLikeCounter();
        post.markModified('likesInfo');

        const updatedLikesCounter = await this.postRepository.save(post);

        if (!updatedLikesCounter) {
          throw BadRequestDomainException.create();
        }
      }

      if (createLikeData.likeStatus === 'None') {
        likeData.updateToDeletedLikeOrDislike();

        const updatedToDeletedLikeOrDislike =
          await this.postLikesRepository.save(likeData);

        if (!updatedToDeletedLikeOrDislike) {
          throw BadRequestDomainException.create();
        }

        likeData.updateFirstReaction();

        const updatedFristReaction =
          await this.postLikesRepository.save(likeData);

        if (!updatedFristReaction) {
          throw BadRequestDomainException.create();
        }

        post.removeDislikeCounter();
        post.markModified('likesInfo');

        const updatedLikesCounter = await this.postRepository.save(post);

        if (!updatedLikesCounter) {
          throw BadRequestDomainException.create();
        }
      }
    }

    if (likeData.isLikeDataEqualsNone()) {
      if (createLikeData.likeStatus === 'Like') {
        likeData.returnFromDeleted(createLikeData.likeStatus);
        const updatedToLike = await this.postLikesRepository.save(likeData);

        if (!updatedToLike) {
          throw BadRequestDomainException.create();
        }

        post.addLikeCounter();
        post.markModified('likesInfo');

        const updatedLikesCounter = await this.postRepository.save(post);

        if (!updatedLikesCounter) {
          throw BadRequestDomainException.create();
        }
      }

      if (createLikeData.likeStatus === 'Dislike') {
        likeData.returnFromDeleted(createLikeData.likeStatus);
        const updatedToDislike = await this.postLikesRepository.save(likeData);

        if (!updatedToDislike) {
          throw BadRequestDomainException.create();
        }

        post.addDislikeCounter();
        post.markModified('likesInfo');

        const updatedLikesCounter = await this.postRepository.save(post);

        if (!updatedLikesCounter) {
          throw BadRequestDomainException.create();
        }
      }
    }
  }
}
