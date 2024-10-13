import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentDocument,
  CommentModelType,
} from '../api/models/comment.entities';
import { OutputCommentTypeWithStatus } from '../api/models/output';
import { commentMapper } from '../application/comment.mapper';
import { Comment } from '../application/comment.entity';

@Injectable()
export class QueryCommentRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async getById(
    commentId: string,
    status: string | null,
  ): Promise<OutputCommentTypeWithStatus | null> {
    const comment: CommentDocument | null = await this.CommentModel.findOne({
      id: commentId,
    });
    if (!comment) {
      return null;
    }
    return commentMapper(comment, status);
  }
}
