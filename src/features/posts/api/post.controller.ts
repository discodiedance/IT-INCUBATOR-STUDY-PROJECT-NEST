import { CommentSortDataType } from './../../comments/api/models/comment.dto';
import { InputCommentSortDataType } from './../../comments/api/models/input';
import { PostRepository } from './../infrastructure/post.repository';
import { QueryPostRepository } from './../infrastructure/post.query-repository';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { CreatePostDataType } from './models/post.dto';

import {
  InputCreatePostDataType,
  InputPostSortDataType,
  InputUpdatePostDataType,
} from './models/input';
import { PostService } from '../application/post.service';
import { QueryBlogRepository } from './../../blogs/infrastrucutre/blog.query-repository';

@Controller('posts')
export class PostController {
  constructor(
    private readonly QueryPostRepository: QueryPostRepository,
    private readonly PostService: PostService,
    private readonly QueryBlogRepository: QueryBlogRepository,
    private readonly PostRepository: PostRepository,
  ) {}

  @Get()
  async getPosts(
    @Query()
    query: InputPostSortDataType,
    @Res() res,
  ) {
    const allPosts = await this.QueryPostRepository.getAll(null, query);
    res.status(HttpStatus.OK).send(allPosts);
  }

  @Get(':id')
  async getPost(@Param('id') id: string, @Res() res) {
    const post = await this.QueryPostRepository.getById(id, null);
    if (!post) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    }
    res.status(HttpStatus.OK).send(post);
    return;
  }

  @Get(':postId/comments')
  async getAllCommentsFromPost(
    @Param('postId') postId: string,
    @Query() query: InputCommentSortDataType,
    @Res() res,
  ) {
    const post = await this.PostRepository.getById(postId);
    if (!post) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    }

    const commentSortData: CommentSortDataType = {
      postId: postId,
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      sortBy: query.sortBy,
      sortDirection: query.sortDirection,
    };

    const allComments = await this.QueryPostRepository.getAllComments(
      null,
      commentSortData,
    );
    res.status(HttpStatus.OK).send(allComments);
    return;
  }

  @Post()
  async createPost(
    @Body() inputCreatePostData: InputCreatePostDataType,
    @Res() res,
  ) {
    const blog = await this.QueryBlogRepository.getById(
      inputCreatePostData.blogId,
    );
    if (!blog) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    }
    const createPostData: CreatePostDataType = {
      title: inputCreatePostData.title,
      shortDescription: inputCreatePostData.shortDescription,
      content: inputCreatePostData.content,
      blogId: inputCreatePostData.blogId,
      blogName: blog.name,
    };
    const createdPost = await this.PostService.createPost(createPostData);
    res.status(HttpStatus.CREATED).send(createdPost);
    return;
  }

  @Put(':id')
  async updatePost(
    @Param('id') id: string,
    @Body() inputUpdatePostData: InputUpdatePostDataType,
    @Res() res,
  ) {
    const post = await this.PostRepository.getById(id);
    if (!post) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    }
    await this.PostService.updatePost(post, inputUpdatePostData);
    res.status(HttpStatus.NO_CONTENT).send();
    return;
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string, @Res() res) {
    const post = await this.PostRepository.getById(id);
    if (!post) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    }
    await this.PostRepository.delete(id);
    res.status(HttpStatus.NO_CONTENT).send();
    return;
  }
}
