import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLikesModelType,
  CommentLikesDocument,
} from '../api/models/comment-likes.entities';
import { CommentLikes } from '../application/comment-likes.entity';

@Injectable()
export class CommentLikesRepository {
  constructor(
    @InjectModel(CommentLikes.name)
    private CommentLikesModel: CommentLikesModelType,
  ) {}

  async save(model: CommentLikesDocument) {
    return await model.save();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.CommentLikesModel.deleteOne({ id: id });
    return !!result.deletedCount;
  }

  async getLikeDataByParentIdAndCommentId(
    parentId: string | null,
    commentId: string,
  ): Promise<CommentLikesDocument | null> {
    const likeData = await this.CommentLikesModel.findOne({
      parentId: parentId,
      commentId: commentId,
    });
    if (!likeData) {
      return null;
    }
    return likeData;
  }

  async getCommentLikeStatusForUser(
    userId: string | null,
    commentId: string,
  ): Promise<string> {
    const likeData = await this.CommentLikesModel.findOne({
      commentId: commentId,
      parentId: userId,
    });
    if (!likeData) {
      return 'None';
    }
    return likeData.status;
  }

  async getUserLikeStatusForEachComment(
    parentId: string | null,
    commentsIdArray: string[],
  ) {
    const likesWithStatuses = await this.CommentLikesModel.aggregate([
      {
        $match: {
          parentId: parentId,
          commentId: { $in: commentsIdArray },
        },
      },
      {
        $group: {
          _id: '$commentId',
          status: { $first: '$status' },
        },
      },
    ]);

    return likesWithStatuses;
  }
}
