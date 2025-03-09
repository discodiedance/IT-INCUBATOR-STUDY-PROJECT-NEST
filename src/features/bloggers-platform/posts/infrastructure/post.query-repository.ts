import { Comment } from './../../comments/application/comment.entity';
import { CommentModelType } from './../../comments/api/models/comment.entities';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { GetPostsQueryParams } from '../api/models/dto/post.dto';
import { PostDocument, PostModelType } from '../api/models/post.entities';
import { postMapper } from '../application/mappers/post.mapper';
import { PostLikesRepository } from './../../likes/posts/infrastructure/post-likes.repository';
import { Post } from '../application/post.entity';
import {
  OutputPostType,
  OutputPostTypeWithStatus,
} from '../api/models/dto/output';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';
import { ExtendedLikesInfoType } from '../../likes/posts/api/models/dto/post-likes.dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';

@Injectable()
export class QueryPostRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private readonly PostLikesRepository: PostLikesRepository,
  ) {}

  async getById(
    postId: string,
    userId: string | null,
  ): Promise<OutputPostType | null> {
    const post: PostDocument | null = await this.PostModel.findOne({
      id: postId,
    }).lean();

    if (!post) {
      throw NotFoundDomainException.create('Post is not found');
    }

    const userStatus = await this.PostLikesRepository.getUserPostLikeStatus(
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
  async getAllPosts(
    userId: string | null,
    query: GetPostsQueryParams,
    blogId?: string,
  ): Promise<PaginatedViewDto<OutputPostTypeWithStatus[]>> {
    const filter: FilterQuery<Post> = {};

    if (blogId) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        blogId: { $regex: blogId, $options: 'i' },
      });
    }

    const posts = await this.PostModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection ?? 'desc' })
      .skip(query.calculateSkip())
      .limit(query.pageSize ?? 10)
      .lean();

    const totalCount = await this.PostModel.countDocuments(filter);

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

    const items = postsWithLikes;

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber ?? 1,
      size: query.pageSize ?? 10,
    });
  }
}
