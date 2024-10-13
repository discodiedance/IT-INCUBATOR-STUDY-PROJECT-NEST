import { OutputUserType } from './../../users/api/models/output';
import { Injectable } from '@nestjs/common';
import { UpdateCommentDataType } from '../api/models/comment.dto';
import { CommentDocument } from '../api/models/comment.entities';
import { CommentRepository } from '../infrastructure/comment.repository';

@Injectable()
export class CommentService {
  constructor(private readonly CommentRepository: CommentRepository) {}

  async updateComment(
    comment: CommentDocument,
    content: UpdateCommentDataType,
  ): Promise<boolean> {
    comment.updateComment(content);
    const updatetComment = await this.CommentRepository.save(comment);
    if (!updatetComment) {
      return false;
    }
    return true;
  }

  async checkCredentials(
    comment: CommentDocument,
    user: OutputUserType,
  ): Promise<boolean | null> {
    if (!comment.isCommentatorIdAndLoginEqual(user)) {
      return null;
    }
    return true;
  }
}
