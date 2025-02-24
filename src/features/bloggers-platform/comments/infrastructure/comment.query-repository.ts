import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentDocument,
  CommentModelType,
} from '../api/models/comment.entities';
import { OutputCommentTypeWithStatus } from '../api/models/dto/output';
import { Comment } from '../application/comment.entity';
import { commentMapper } from '../application/mappers/comment.mapper';
import { CommentLikesRepository } from '../../likes/comments/infrastructure/comment-likes.repository';
import { GetCommentsQueryParams } from '../api/models/dto/comment.dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';

@Injectable()
export class QueryCommentRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private readonly commentLikesRepository: CommentLikesRepository,
  ) {}

  async getById(
    commentId: string,
    status: string | null,
  ): Promise<OutputCommentTypeWithStatus | null> {
    const comment: CommentDocument | null = await this.CommentModel.findOne({
      id: commentId,
    }).lean();

    if (!comment) {
      return null;
    }

    return commentMapper(comment, status);
  }

  async getAllCommentsFromPost(
    userId: string | null,
    query: GetCommentsQueryParams,
    postId: string,
  ): Promise<PaginatedViewDto<OutputCommentTypeWithStatus[]>> {
    const filter: FilterQuery<Comment> = {};

    if (postId) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        postId: { $regex: postId, $options: 'i' },
      });
    }

    const comments = await this.CommentModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize)
      .lean();

    const commentsWithStatuses = await Promise.all(
      comments.map(async (comment) => {
        const status =
          await this.commentLikesRepository.getCommentLikeStatusForUser(
            userId,
            comment.id,
          );

        return commentMapper(comment, status);
      }),
    );

    const totalCount = await this.CommentModel.countDocuments(filter);

    const items = commentsWithStatuses;

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
