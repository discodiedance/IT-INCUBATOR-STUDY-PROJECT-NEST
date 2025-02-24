import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  InputCreateBlogDataType,
  InputUpdateBlogDataType,
} from '../../../src/features/bloggers-platform/blogs/api/models/dto/input';
import { GLOBAL_PREFIX } from '../../../src/settings/glolbal-prefix.setup';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../../../src/features/bloggers-platform/blogs/application/blog.entity';
import { BlogModelType } from '../../../src/features/bloggers-platform/blogs/api/models/blogs.entities';
import { InputCreatePostToBlogDataType } from '../../../src/features/bloggers-platform/posts/api/models/dto/input';
import { PostSortDataType } from '../../../src/features/bloggers-platform/posts/api/models/dto/post.dto';
import { BlogSortDataType } from '../../../src/features/bloggers-platform/blogs/api/models/dto/blogs.dto';

export class BlogTestManager {
  constructor(
    private app: INestApplication,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
  ) {}

  async createBlog(
    createModel: InputCreateBlogDataType,
    statusCode: number = HttpStatus.CREATED,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/blogs`)
      .send(createModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response;
  }

  async createBlogWithIncorrectAuth(
    createModel: InputCreateBlogDataType,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/blogs`)
      .send(createModel)
      .auth('badAdmin', 'badPassword')
      .expect(statusCode);

    return response;
  }

  async createBlogWithBodyErrors(
    createModel: InputCreateBlogDataType | Object,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/blogs`)
      .send(createModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response;
  }

  async getAllBlogs(
    query?: BlogSortDataType,
    statusCode: number = HttpStatus.OK,
  ) {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/blogs`)
      .query(query ?? {})
      .expect(statusCode);

    return response;
  }

  async getBlogById(blogId: string, statusCode: number = HttpStatus.OK) {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/blogs/${blogId}`)
      .expect(statusCode);

    return response;
  }

  async getBlogWithNotFoundId(
    blogId: string,
    statusCode: number = HttpStatus.NOT_FOUND,
  ) {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/blogs/${blogId}`)
      .expect(statusCode);

    return response;
  }

  async updateBlog(
    blogId: string,
    updateModel: InputUpdateBlogDataType,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/blogs/${blogId}`)
      .send(updateModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response;
  }

  async updateBlogWithBodyErrors(
    blogId: string,
    updateModel: InputUpdateBlogDataType | Object,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/blogs/${blogId}`)
      .send(updateModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response;
  }

  async updateBlogWithIncorrectAuth(
    blogId: string,
    updateModel: InputUpdateBlogDataType,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/blogs/${blogId}`)
      .send(updateModel)
      .auth('badAdmin', 'badPassword')
      .expect(statusCode);

    return response;
  }

  async updateBlogWithNotFoundId(
    blogId: string,
    updateModel: InputUpdateBlogDataType,
    statusCode: number = HttpStatus.NOT_FOUND,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/blogs/${blogId}`)
      .send(updateModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response;
  }

  async deleteBlog(blogId: string, statusCode: number = HttpStatus.NO_CONTENT) {
    const response = await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/blogs/${blogId}`)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response;
  }

  async deleteBlogWithIncorrectAuth(
    blogId: string,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const response = await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/blogs/${blogId}`)
      .auth('badAdmin', 'badPassword')
      .expect(statusCode);

    return response;
  }

  async deleteBlogWithNotFoundId(
    blogId: string,
    statusCode: number = HttpStatus.NOT_FOUND,
  ) {
    const response = await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/blogs/${blogId}`)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response;
  }

  async createPostToBlog(
    blogId: string,
    createModel: InputCreatePostToBlogDataType,
    statusCode: number = HttpStatus.CREATED,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/blogs/${blogId}/posts`)
      .send(createModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response;
  }

  async createPostToBlogWithIncorrectAuth(
    blogId: string,
    createModel: InputCreatePostToBlogDataType,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/blogs/${blogId}/posts`)
      .send(createModel)
      .auth('badAdmin', 'badPassword')
      .expect(statusCode);

    return response;
  }

  async createPostToBlogWithBodyErrors(
    blogId: string,
    createModel: InputCreatePostToBlogDataType | Object,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/blogs/${blogId}/posts`)
      .send(createModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response;
  }

  async createPostToBlogWithNotFoundBlogId(
    blogId: string,
    createModel: InputCreatePostToBlogDataType,
    statusCode: number = HttpStatus.NOT_FOUND,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/blogs/${blogId}/posts`)
      .send(createModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response;
  }

  async getAllPostsFromBlog(
    query: PostSortDataType,
    statusCode: number = HttpStatus.OK,
  ) {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/blogs/${query.blogId}/posts`)
      .query(query)
      .expect(statusCode);

    return response;
  }

  async getAllPostsFromBlogWithNotFoundBlogId(
    query: PostSortDataType,
    statusCode: number = HttpStatus.NOT_FOUND,
  ) {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/blogs/${query.blogId}/posts`)
      .query(query)
      .expect(statusCode);

    return response;
  }
}
