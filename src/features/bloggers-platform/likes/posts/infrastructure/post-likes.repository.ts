import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  PostLikesDocument,
  PostLikesModelType,
} from '../api/models/post-likes.entities';
import { PostLikes } from '../application/post-likes.entity';
import { NewestLikesType } from '../api/models/dto/post-likes.dto';

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

  async getUserPostLikeStatus(
    userId: string | null,
    postId: string,
  ): Promise<'Like' | 'Dislike' | 'None'> {
    const likedata = await this.PostLikesModel.findOne({
      parentId: userId,
      postId,
    }).lean();

    if (!likedata) {
      return 'None';
    }

    return likedata.status as 'Like' | 'Dislike';
  }

  async getThreeLastLikesForPost(
    postId: string,
  ): Promise<NewestLikesType[] | []> {
    {
      const likes = await this.PostLikesModel.find({
        postId: postId,
      })

        .where('isFirstReaction')
        .equals(true)
        .where('isDeleted')
        .equals(false)
        .where('status')
        .equals('Like')
        .sort({ createdAt: 'desc' })
        .limit(3)
        .lean()
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
