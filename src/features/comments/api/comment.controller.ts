import { CommentLikesRepository } from './../../likes/comments/infrastructure/comment-likes.repository';
import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { CommentRepository } from '../infrastructure/comment.repository';
import { QueryCommentRepository } from '../infrastructure/comment.query-repository';

@Controller('comments')
export class CommentController {
  constructor(
    private readonly CommentRepository: CommentRepository,
    private readonly CommentLikesRepository: CommentLikesRepository,
    private readonly QueryCommentRepository: QueryCommentRepository,
  ) {}

  @Get(':id')
  async getComment(@Param('id') id: string, @Res() res) {
    const comment = await this.CommentRepository.getById(id);
    if (!comment) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    }
    const commentId = comment.id;
    const status =
      await this.CommentLikesRepository.getCommentLikeStatusForUser(
        null,
        commentId,
      );
    const commentWithStatus = await this.QueryCommentRepository.getById(
      commentId,
      status,
    );
    res.status(HttpStatus.OK).send(commentWithStatus);
    return;
  }
}
