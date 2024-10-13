import { PostRepository } from './../../../posts/infrastructure/post.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostLikeData } from '../api/models/post-likes.dto';
import { PostLikesModelType } from '../api/models/post-likes.entities';
import { PostLikes } from './post-likes.entity';

import { PostLikesRepository } from '../infrastructure/post-likes.repository';

@Injectable()
export class PostLikesService {
  constructor(
    @InjectModel(PostLikes.name)
    private PostLikesModel: PostLikesModelType,
    private readonly PostRepository: PostRepository,
    private readonly PostLikesRepository: PostLikesRepository,
  ) {}

  async createLike(updatePostLikeData: CreatePostLikeData): Promise<boolean> {
    if (updatePostLikeData.likeStatus === 'None') {
      return true;
    }

    const post = await this.PostRepository.getById(updatePostLikeData.post.id);

    if (!post) {
      return false;
    }

    const createdLikeOrDislike =
      this.PostLikesModel.createLike(updatePostLikeData);

    const createdLikeOrDislikeData =
      await this.PostLikesRepository.save(createdLikeOrDislike);
    if (!createdLikeOrDislikeData) {
      return false;
    }

    if (createdLikeOrDislike.isLikeDataEqualsLike()) {
      post.addLikeCounter();
      const updatedLikesCounter = await this.PostRepository.save(post);

      if (!updatedLikesCounter) {
        return false;
      }
      return true;
    }

    if (createdLikeOrDislike.isLikeDataEqualsDislike()) {
      post.addDislikeCounter();
      const updatedLikesCounter = await this.PostRepository.save(post);
      if (!updatedLikesCounter) {
        return false;
      }
      return true;
    }
    return false;
  }

  async updatePostLike(
    updatePostLikeData: CreatePostLikeData,
  ): Promise<boolean> {
    const likeData =
      await this.PostLikesRepository.getLikeDataByParentIdAndPostId(
        updatePostLikeData.parentId,
        updatePostLikeData.post.id,
      );

    if (!likeData) {
      const createdLike = await this.createLike(updatePostLikeData);
      if (!createdLike) {
        return false;
      }
      return true;
    }
    const post = await this.PostRepository.getById(updatePostLikeData.post.id);

    if (!post) {
      return false;
    }

    if (likeData.isLikeDataEqualsLike()) {
      if (updatePostLikeData.likeStatus === 'Like') {
        return true;
      }

      if (updatePostLikeData.likeStatus === 'Dislike') {
        likeData.updateLikeStatus(updatePostLikeData.likeStatus);
        likeData.updateFirstReaction();
        const updatedToDislike = await this.PostLikesRepository.save(likeData);

        if (!updatedToDislike) {
          return false;
        }

        post.removeLikeAddDislikeCounter();
        const updatedLikesCounter = await this.PostRepository.save(post);
        if (!updatedLikesCounter) {
          return false;
        }
        return true;
      }

      if (updatePostLikeData.likeStatus === 'None') {
        likeData.updateToDeletedLikeOrDislike();
        likeData.updateFirstReaction();
        const updatedToDeletedLikeOrDislike =
          await this.PostLikesRepository.save(likeData);

        if (!updatedToDeletedLikeOrDislike) {
          return false;
        }

        post.removeLikeCounter();
        const updatedLikesCounter = await this.PostRepository.save(post);
        if (!updatedLikesCounter) {
          return false;
        }
        return true;
      }
    }

    if (likeData.isLikeDataEqualsDislike()) {
      if (updatePostLikeData.likeStatus === 'Dislike') {
        return true;
      }

      if (updatePostLikeData.likeStatus === 'Like') {
        likeData.updateLikeStatus(updatePostLikeData.likeStatus);
        likeData.updateFirstReaction();
        const updatedToLike = await this.PostLikesRepository.save(likeData);
        if (!updatedToLike) {
          return false;
        }
        post.removeDislikeAddLikeCounter();
        const updatedLikesCounter = await this.PostRepository.save(post);
        if (!updatedLikesCounter) {
          return false;
        }
        return true;
      }

      if (updatePostLikeData.likeStatus === 'None') {
        likeData.updateToDeletedLikeOrDislike();
        likeData.updateFirstReaction();
        const updatedToDeletedLikeOrDislike =
          await this.PostLikesRepository.save(likeData);

        if (!updatedToDeletedLikeOrDislike) {
          return false;
        }

        post.removeDislikeCounter();
        const updatedLikesCounter = await this.PostRepository.save(post);
        if (!updatedLikesCounter) {
          return false;
        }
        return true;
      }
    }

    if (likeData.isLikeDataEqualsNone()) {
      if (updatePostLikeData.likeStatus === 'None') {
        return true;
      }

      if (updatePostLikeData.likeStatus === 'Like') {
        likeData.returnFromDeleted(updatePostLikeData.likeStatus);
        const updatedToLike = await this.PostLikesRepository.save(likeData);
        if (!updatedToLike) {
          return false;
        }
        post.addLikeCounter();
        const updatedLikesCounter = await this.PostRepository.save(post);
        if (!updatedLikesCounter) {
          return false;
        }
        return true;
      }

      if (updatePostLikeData.likeStatus === 'Dislike') {
        likeData.returnFromDeleted(updatePostLikeData.likeStatus);
        const updatedToDislike = await this.PostLikesRepository.save(likeData);
        if (!updatedToDislike) {
          return false;
        }
        post.addDislikeCounter();
        const updatedLikesCounter = await this.PostRepository.save(post);
        if (!updatedLikesCounter) {
          return false;
        }
        return true;
      }
    }
    return false;
  }
}
