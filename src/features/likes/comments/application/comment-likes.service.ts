import { CommentRepository } from './../../../comments/infrastructure/comment.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CommentLikesModelType } from '../api/models/comment-likes.entities';
import { CommentLikes } from './comment-likes.entity';
import { UpdateCommentLikeData } from '../api/models/comment-likes.dto';
import { CommentLikesRepository } from '../infrastructure/comment-likes.repository';

@Injectable()
export class CommentLikesService {
  constructor(
    @InjectModel(CommentLikes.name)
    private CommentLikesModel: CommentLikesModelType,
    private readonly CommentRepository: CommentRepository,
    private readonly CommentLikesRepository: CommentLikesRepository,
  ) {}

  async createLike(
    updateCommentLikeData: UpdateCommentLikeData,
  ): Promise<boolean> {
    if (updateCommentLikeData.likeStatus === 'None') {
      return true;
    }

    const comment = await this.CommentRepository.getById(
      updateCommentLikeData.comment.id,
    );

    if (!comment) {
      return false;
    }

    const createdLikeOrDislike = this.CommentLikesModel.createLike(
      updateCommentLikeData,
    );

    const createdLikeData =
      await this.CommentLikesRepository.save(createdLikeOrDislike);
    if (!createdLikeData) {
      return false;
    }

    if (createdLikeOrDislike.isLikeDataEqualsLike()) {
      comment.addLikeCounter();
      const updatedLikesCounter = await this.CommentRepository.save(comment);
      if (!updatedLikesCounter) {
        return false;
      }
      return true;
    }

    if (createdLikeOrDislike.isLikeDataEqualsDislike()) {
      comment.addDislikeCounter();
      const updatedLikesCounter = await this.CommentRepository.save(comment);
      if (!updatedLikesCounter) {
        return false;
      }
      return true;
    }
    return false;
  }

  async updateCommentLike(
    updateCommentLikeData: UpdateCommentLikeData,
  ): Promise<boolean> {
    const likeData =
      await this.CommentLikesRepository.getLikeDataByParentIdAndCommentId(
        updateCommentLikeData.parentId,
        updateCommentLikeData.comment.id,
      );

    if (!likeData) {
      const createdLike = await this.createLike(updateCommentLikeData);
      if (!createdLike) {
        return false;
      }
      return true;
    }

    const comment = await this.CommentRepository.getById(
      updateCommentLikeData.comment.id,
    );
    if (!comment) {
      return false;
    }

    if (likeData.isLikeDataEqualsLike()) {
      if (updateCommentLikeData.likeStatus === 'Like') {
        return true;
      }

      if (updateCommentLikeData.likeStatus === 'Dislike') {
        likeData.updateLikeStatus(updateCommentLikeData.likeStatus);
        const updatedToDislike =
          await this.CommentLikesRepository.save(likeData);

        if (!updatedToDislike) {
          return false;
        }

        comment.removeLikeAddDislikeCounter();
        const updatedLikesCounter = await this.CommentRepository.save(comment);
        if (!updatedLikesCounter) {
          return false;
        }
        return true;
      }

      if (updateCommentLikeData.likeStatus === 'None') {
        const deletedLikeOrDislike = await this.CommentLikesRepository.delete(
          likeData.id,
        );
        if (!deletedLikeOrDislike) {
          return false;
        }

        comment.removeLikeCounter();
        const updatedLikesCounter = await this.CommentRepository.save(comment);
        if (!updatedLikesCounter) {
          return false;
        }
        return true;
      }
    }

    if (likeData.isLikeDataEqualsDislike()) {
      if (updateCommentLikeData.likeStatus === 'Dislike') {
        return true;
      }

      if (updateCommentLikeData.likeStatus === 'Like') {
        likeData.updateLikeStatus(updateCommentLikeData.likeStatus);
        const updatedToLike = await this.CommentLikesRepository.save(likeData);
        if (!updatedToLike) {
          return false;
        }
        comment.removeDislikeAddLikeCounter();
        const updatedLikesCounter = await this.CommentRepository.save(comment);
        if (!updatedLikesCounter) {
          return false;
        }
        return true;
      }

      if (updateCommentLikeData.likeStatus === 'None') {
        const deletedDislike = await this.CommentLikesRepository.delete(
          likeData.id,
        );
        if (!deletedDislike) {
          return false;
        }
        comment.removeDislikeCounter();
        const updatedLikesCounter = await this.CommentRepository.save(comment);
        if (!updatedLikesCounter) {
          return false;
        }
        return true;
      }
    }

    if (likeData.isLikeDataEqualsNone()) {
      if (updateCommentLikeData.likeStatus === 'None') {
        return true;
      }

      if (updateCommentLikeData.likeStatus === 'Like') {
        likeData.updateLikeStatus(updateCommentLikeData.likeStatus);
        const updatedToLike = await this.CommentLikesRepository.save(likeData);
        if (!updatedToLike) {
          return false;
        }
        comment.addLikeCounter();
        const updatedLikesCounter = await this.CommentRepository.save(comment);
        if (!updatedLikesCounter) {
          return false;
        }
        return true;
      }

      if (updateCommentLikeData.likeStatus === 'Dislike') {
        likeData.updateLikeStatus(updateCommentLikeData.likeStatus);
        const updatedToDislike =
          await this.CommentLikesRepository.save(likeData);
        if (!updatedToDislike) {
          return false;
        }
        comment.addDislikeCounter();
        const updatedLikesCounter = await this.CommentRepository.save(comment);
        if (!updatedLikesCounter) {
          return false;
        }
        return true;
      }
    }
    return false;
  }
}
