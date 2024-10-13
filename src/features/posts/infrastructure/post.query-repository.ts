import { Comment } from './../../comments/application/comment.entity';
import { commentMapper } from './../../comments/application/comment.mapper';
import { CommentSortDataType } from './../../comments/api/models/comment.dto';
import { CommentLikesRepository } from './../../likes/comments/infrastructure/comment-likes.repository';
import { CommentModelType } from './../../comments/api/models/comment.entities';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ExtendedLikesInfoType,
  PostSortDataType,
} from '../api/models/post.dto';
import { PostDocument, PostModelType } from '../api/models/post.entities';
import { postMapper } from '../application/post.mapper';
import { OutputPostType } from '../api/models/output';
import { PostLikesRepository } from './../../likes/posts/infrastructure/post-likes.repository';
import { Post } from '../application/post.entity';

@Injectable()
export class QueryPostRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private readonly PostLikesRepository: PostLikesRepository,
    private readonly CommentLikesRepository: CommentLikesRepository,
  ) {}

  async getById(
    postId: string,
    userId: string | null,
  ): Promise<OutputPostType | null> {
    const post: PostDocument | null = await this.PostModel.findOne({
      id: postId,
    });
    if (!post) {
      return null;
    }

    const userStatus = await this.PostLikesRepository.getPostLikeStatusForUser(
      userId,
      postId,
    );

    const newestLikes =
      await this.PostLikesRepository.getThreeLastLikesForPost(postId);

    const extendedLikesInfo: ExtendedLikesInfoType = {
      likesCount: post.likesInfo.likesCount ?? 0,
      dislikesCount: post.likesInfo.dislikesCount ?? 0,
      myStatus: userStatus,
      newestLikes: newestLikes,
    };

    return postMapper(post, extendedLikesInfo);
  }
  async getAll(userId: string | null, sortData: PostSortDataType) {
    const pageNumber = sortData.pageNumber ?? 1;
    const pageSize = sortData.pageSize ?? 10;
    const sortBy = sortData.sortBy ?? 'createdAt';
    const sortDirection = sortData.sortDirection ?? 'desc';
    const blogId = sortData.blogId ?? null;

    let filter = {};

    if (blogId) {
      filter = {
        blogId: blogId,
      };
    }

    const posts = await this.PostModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((+pageNumber - 1) * +pageSize)
      .limit(+pageSize);

    const totalCount = await this.PostModel.countDocuments(filter);

    const pageCount = Math.ceil(totalCount / +pageSize);

    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const status = await this.PostLikesRepository.getUserPostLikeStatus(
          userId,
          post.id,
        );

        const newestLikes =
          await this.PostLikesRepository.getThreeLastLikesForPost(post.id);

        return postMapper(post, {
          likesCount: post.likesInfo.likesCount ?? 0,
          dislikesCount: post.likesInfo.dislikesCount ?? 0,
          myStatus: status,
          newestLikes,
        });
      }),
    );

    return {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items: postsWithLikes,
    };
  }
  async getAllComments(userId: string | null, sortData: CommentSortDataType) {
    const sortDirection = sortData.sortDirection ?? 'desc';
    const sortBy = sortData.sortBy ?? 'createdAt';
    const pageNumber = sortData.pageNumber ?? 1;
    const pageSize = sortData.pageSize ?? 10;
    const postId = sortData.postId;

    let filter = {};

    if (postId) {
      filter = {
        postId: postId,
      };
    }

    const comments = await this.CommentModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((+pageNumber - 1) * +pageSize)
      .limit(+pageSize);

    const totalCount = await this.CommentModel.countDocuments(filter);

    const pageCount = Math.ceil(totalCount / +pageSize);

    const commentsWithStatuses = await Promise.all(
      comments.map(async (comment) => {
        const status =
          await this.CommentLikesRepository.getCommentLikeStatusForUser(
            userId,
            comment.id,
          );
        return commentMapper(comment, status);
      }),
    );

    return {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items: commentsWithStatuses,
    };
  }
}
