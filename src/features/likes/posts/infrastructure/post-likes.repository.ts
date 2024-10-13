import { NewestLikesType } from './../../../posts/api/models/post.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  PostLikesDocument,
  PostLikesModelType,
} from '../api/models/post-likes.entities';
import { PostLikes } from '../application/post-likes.entity';

@Injectable()
export class PostLikesRepository {
  constructor(
    @InjectModel(PostLikes.name) private PostLikesModel: PostLikesModelType,
  ) {}

  async save(model: PostLikesDocument) {
    return await model.save();
  }

  async getLikeDataByParentIdAndPostId(
    parentId: string,
    postId: string,
  ): Promise<PostLikesDocument | null> {
    const likeData = await this.PostLikesModel.findOne({
      parentId: parentId,
      postId: postId,
    });
    if (!likeData) {
      return null;
    }
    return likeData;
  }

  async getPostLikeStatusForUser(
    parentId: string | null,
    postId: string,
  ): Promise<string> {
    const likeData = await this.PostLikesModel.findOne({
      parentId: parentId,
      postId: postId,
    });
    if (!likeData) {
      return 'None';
    }
    return likeData.status;
  }

  async getUserPostLikeStatus(userId: string | null, postId: string) {
    const likedata = await this.PostLikesModel.findOne({
      parentId: userId,
      postId,
    });
    if (!likedata) {
      return 'None';
    }
    return likedata.status;
  }

  async getUserLikeStatusForEachPost(
    userId: string | null,
    postIdArray: any[],
  ) {
    const likesWithStatuses = await this.PostLikesModel.aggregate([
      {
        $match: {
          parentId: userId,
          postId: { $in: postIdArray },
        },
      },
      {
        $group: {
          _id: '$postId',
          status: { $first: '$status' },
        },
      },
    ]);
    return likesWithStatuses;
  }

  async getThreeLastLikesForEachPost(
    postIdArray: any[],
  ): Promise<NewestLikesType[] | []> {
    const likes = await this.PostLikesModel.find({
      postId: { $in: postIdArray },
    })
      .where('isDeleted')
      .equals(false)
      .where('isFirstReaction')
      .equals(true)
      .sort({ addedAt: -1 })
      .limit(3)
      .then((likes) => {
        return likes.map((like) => ({
          addedAt: like.createdAt,
          userId: like.parentId,
          login: like.parentLogin,
          postId: like.postId,
        }));
      });

    return likes;
  }
  async getThreeLastPostLikes(postId: string): Promise<PostLikes[]> {
    return this.PostLikesModel.find({ postId }).limit(3).sort({ addedAt: -1 });
  }

  async getThreeLastLikesForPost(
    postId: string,
  ): Promise<NewestLikesType[] | []> {
    {
      const likes = await this.PostLikesModel.find({
        postId: postId,
      })
        .where('isDeleted')
        .equals(false)
        .where('isFirstReaction')
        .equals(true)
        .sort({ addedAt: -1 })
        .limit(3)
        .then((likes) => {
          return likes.map((like) => ({
            addedAt: like.createdAt,
            userId: like.parentId,
            login: like.parentLogin,
          }));
        });
      return likes;
    }
  }
}
