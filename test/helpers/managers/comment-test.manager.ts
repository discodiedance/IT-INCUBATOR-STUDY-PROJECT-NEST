import { HttpStatus, INestApplication } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from '../../../src/features/bloggers-platform/comments/application/comment.entity';
import { CommentModelType } from '../../../src/features/bloggers-platform/comments/api/models/comment.entities';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../../../src/settings/glolbal-prefix.setup';
import { InputUpdateCommentDataType } from '../../../src/features/bloggers-platform/comments/api/models/dto/input';
import { InputCreateCommentLikeDataType } from '../../../src/features/bloggers-platform/likes/comments/api/models/dto/comment-likes.dto';

export class CommentTestManager {
  constructor(
    private app: INestApplication,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async updateComment(
    commentId: string,
    updateModel: InputUpdateCommentDataType,
    JWT: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/comments/${commentId}`)
      .set('Authorization', 'Bearer ' + JWT)
      .send(updateModel)
      .expect(statusCode);

    return response;
  }

  async updateCommentWithIncorrectAuth(
    commentId: string,
    updateModel: InputUpdateCommentDataType,
    JWT: string,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/comments/${commentId}`)
      .set('Authorization', 'Bearer ' + JWT)
      .send(updateModel)
      .expect(statusCode);

    return response;
  }

  async updateCommentWithBodyErrors(
    commentId: string,
    updateModel: InputUpdateCommentDataType | Object,
    JWT: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/comments/${commentId}`)
      .set('Authorization', 'Bearer ' + JWT)
      .send(updateModel)
      .expect(statusCode);

    return response;
  }

  async updateCommentWithNotExistingId(
    commentId: string,
    updateModel: InputUpdateCommentDataType,
    JWT: string,
    statusCode: number = HttpStatus.NOT_FOUND,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/comments/${commentId}`)
      .set('Authorization', 'Bearer ' + JWT)
      .send(updateModel)
      .expect(statusCode);

    return response;
  }

  async updateCommentByOtherUser(
    commentId: string,
    updateModel: InputUpdateCommentDataType,
    JWT: string,
    statusCode: number = HttpStatus.FORBIDDEN,
  ) {
    const response = await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/comments/${commentId}`)
      .set('Authorization', 'Bearer ' + JWT)
      .send(updateModel)
      .expect(statusCode);

    return response;
  }

  async putReactionToComment(
    commentId: string,
    createModel: InputCreateCommentLikeDataType,
    JWT: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/comments/${commentId}/like-status`)
      .set('Authorization', 'Bearer ' + JWT)
      .send(createModel)
      .expect(statusCode);

    return response;
  }

  async putReactionToCommentWithIncorrectAuth(
    commmentId: string,
    createModel: InputCreateCommentLikeDataType,
    JWT: string,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/comments/${commmentId}/like-status`)
      .set('Authorization', 'Bearer ' + JWT)
      .send(createModel)
      .expect(statusCode);

    return response;
  }

  async putReactionToCommentWithBodyErros(
    commmentId: string,
    createModel: InputCreateCommentLikeDataType | Object,
    JWT: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/comments/${commmentId}/like-status`)
      .set('Authorization', 'Bearer ' + JWT)
      .send(createModel)
      .expect(statusCode);

    return response;
  }

  async putReactionToCommentWithNotExistingId(
    commmentId: string,
    createModel: InputCreateCommentLikeDataType,
    JWT: string,
    statusCode: number = HttpStatus.NOT_FOUND,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/comments/${commmentId}/like-status`)
      .set('Authorization', 'Bearer ' + JWT)
      .send(createModel)
      .expect(statusCode);

    return response;
  }

  async deleteComment(
    commentId: string,
    JWT: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    const response = await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/comments/${commentId}`)
      .set('Authorization', 'Bearer ' + JWT)
      .expect(statusCode);

    return response;
  }

  async deleteCommentWithIncorrectAuth(
    commentId: string,
    JWT: string,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const response = await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/comments/${commentId}`)
      .set('Authorization', 'Bearer ' + JWT)
      .expect(statusCode);

    return response;
  }

  async deleteCommentWithNotExistingId(
    commentId: string,
    JWT: string,
    statusCode: number = HttpStatus.NOT_FOUND,
  ) {
    const response = await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/comments/${commentId}`)
      .set('Authorization', 'Bearer ' + JWT)
      .expect(statusCode);

    return response;
  }

  async deleteCommentByOtherUser(
    commentId: string,
    JWT: string,
    statusCode: number = HttpStatus.FORBIDDEN,
  ) {
    const response = await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/comments/${commentId}`)
      .set('Authorization', 'Bearer ' + JWT)
      .expect(statusCode);

    return response;
  }

  async getComment(
    commentId: string,
    JWT: string,
    statusCode: number = HttpStatus.OK,
  ) {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/comments/${commentId}`)
      .set('Authorization', 'Bearer ' + JWT)
      .expect(statusCode);

    return response;
  }

  async getCommentWithNotExistingId(
    commentId: string,
    statusCode: number = HttpStatus.NOT_FOUND,
  ) {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/comments/${commentId}`)
      .expect(statusCode);

    return response;
  }
}
