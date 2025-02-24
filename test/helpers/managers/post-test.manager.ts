import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  InputCreatePostDataType,
  InputUpdatePostDataType,
} from '../../../src/features/bloggers-platform/posts/api/models/dto/input';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../../../src/settings/glolbal-prefix.setup';
import { InputCreatePostLikeDataType } from '../../../src/features/bloggers-platform/likes/posts/api/models/dto/post-likes.dto';
import { PostModelType } from '../../../src/features/bloggers-platform/posts/api/models/post.entities';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../../../src/features/bloggers-platform/posts/application/post.entity';
import { InputCreateCommentDataType } from '../../../src/features/bloggers-platform/comments/api/models/dto/input';
import { PostSortDataType } from '../../../src/features/bloggers-platform/posts/api/models/dto/post.dto';
import { CommentSortDataType } from '../../../src/features/bloggers-platform/comments/api/models/dto/comment.dto';

export class PostTestManager {
  constructor(
    private app: INestApplication,
    @InjectModel(Post.name) private PostModel: PostModelType,
  ) {}

  async createPost(
    createModel: InputCreatePostDataType,
    statusCode: number = HttpStatus.CREATED,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/posts`)
      .send(createModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response;
  }

  async createPostWithIncorrectAuth(
    createModel: InputCreatePostDataType,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/posts`)
      .send(createModel)
      .auth('badAdmin', 'badPassword')
      .expect(statusCode);

    return response;
  }

  async createPostWithBodyErrors(
    createModel: InputCreatePostDataType | Object,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/posts`)
      .send(createModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response;
  }

  async getAllPosts(
    query: PostSortDataType,
    statusCode: number = HttpStatus.OK,
  ) {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/posts`)
      .query(query)
      .expect(statusCode);

    return response;
  }

  async getPostById(
    postId: string,
    JWT: string,
    statusCode: number = HttpStatus.OK,
  ) {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/posts/${postId}`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(statusCode);

    return response;
  }

  async getPostWithNotExistingId(
    postId: string,
    statusCode: number = HttpStatus.NOT_FOUND,
  ) {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/posts/${postId}`)
      .expect(statusCode);

    return response;
  }

  async updatePost(
    postId: string,
    updateModel: InputUpdatePostDataType,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/posts/${postId}`)
      .send(updateModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response;
  }

  async updatePostWithBodyErrors(
    postId: string,
    updateModel: InputUpdatePostDataType | Object,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/posts/${postId}`)
      .send(updateModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response;
  }

  async updatePostWithIncorrectAuth(
    postId: string,
    updateModel: InputUpdatePostDataType,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/posts/${postId}`)
      .send(updateModel)
      .auth('badAdmin', 'badPassword')
      .expect(statusCode);

    return response;
  }

  async updatePostWithNotExistingPostId(
    postId: string,
    updateModel: InputUpdatePostDataType,
    statusCode: number = HttpStatus.NOT_FOUND,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/posts/${postId}`)
      .send(updateModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response;
  }

  async deletePost(postId: string, statusCode: number = HttpStatus.NO_CONTENT) {
    const response = await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/posts/${postId}`)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response;
  }

  async deletePostWithIncorrectAuth(
    postId: string,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const response = await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/posts/${postId}`)
      .auth('badAdmin', 'badPassword')
      .expect(statusCode);

    return response;
  }

  async deletePostWithNotExistingId(
    postId: string,
    statusCode: number = HttpStatus.NOT_FOUND,
  ) {
    const response = await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/posts/${postId}`)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response;
  }

  async putReactionToPost(
    postId: string,
    putLikeModel: InputCreatePostLikeDataType,
    JWT: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/posts/${postId}/like-status`)
      .set('Authorization', 'Bearer ' + JWT)
      .send(putLikeModel)
      .expect(statusCode);

    return response;
  }

  async putReactionToPostWithIncorrectAuth(
    postId: string,
    putLikeModel: InputCreatePostLikeDataType,
    userId: string,
    JWT: string,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/posts/${postId}/like-status`)
      .set('Authorization', 'Bearer ' + JWT)
      .send({ putLikeModel, userId })
      .expect(statusCode);

    return response;
  }

  async putReactionToPostWithNotExistingPostId(
    postId: string,
    putLikeModel: InputCreatePostLikeDataType,
    JWT: string,
    statusCode: number = HttpStatus.NOT_FOUND,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/posts/${postId}/like-status`)
      .set('Authorization', 'Bearer ' + JWT)
      .send(putLikeModel)
      .expect(statusCode);

    return response;
  }

  async putReactionToPostWithBodyErrors(
    postId: string,
    putLikeModel: Object,
    JWT: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/posts/${postId}/like-status`)
      .set('Authorization', 'Bearer ' + JWT)
      .send(putLikeModel)
      .expect(statusCode);

    return response;
  }

  async createCommentToPost(
    postId: string,
    createCommentModel: InputCreateCommentDataType,
    JWT: string,
    statusCode: number = HttpStatus.CREATED,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/posts/${postId}/comments`)
      .set('Authorization', 'Bearer ' + JWT)
      .send(createCommentModel)
      .expect(statusCode);

    return response;
  }

  async createCommentToPostWithIncorrectAuth(
    postId: string,
    createCommentModel: InputCreateCommentDataType,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/posts/${postId}/comments`)
      .set('Authorization', 'Bearer ' + 'shit')
      .send(createCommentModel)
      .expect(statusCode);

    return response;
  }

  async createCommentToPostWithNotExistingPostId(
    postId: string,
    createCommentModel: InputCreateCommentDataType,
    JWT: string,
    statusCode: number = HttpStatus.NOT_FOUND,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/posts/${postId}/comments`)
      .set('Authorization', 'Bearer ' + JWT)
      .send(createCommentModel)
      .expect(statusCode);

    return response;
  }

  async createCommentToPostWithBodyErrors(
    postId: string,
    createCommentModel: Object,
    JWT: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/posts/${postId}/comments`)
      .set('Authorization', 'Bearer ' + JWT)
      .send(createCommentModel)
      .expect(statusCode);

    return response;
  }

  async getAllCommentsFromPost(
    query: CommentSortDataType,
    statusCode: number = HttpStatus.OK,
  ) {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/posts/${query.postId}/comments`)
      .query(query)
      .expect(statusCode);

    return response;
  }

  async getAllCommentsFromPostWithNotExistingPostId(
    query: CommentSortDataType,
    statusCode: number = HttpStatus.NOT_FOUND,
  ) {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/posts/${query.postId}/comments`)
      .query(query)
      .expect(statusCode);

    return response;
  }
}
