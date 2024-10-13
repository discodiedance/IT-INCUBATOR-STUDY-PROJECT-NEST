import {
  InputPostSortDataType,
  InputCreatePostToBlogDataType,
} from './../../posts/api/models/input';
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
import { InputBlogDataType, InputBlogSortDataType } from './models/input';
import {
  CreatePostDataType,
  PostSortDataType,
} from 'src/features/posts/api/models/post.dto';
import { BlogService } from '../application/blog.service';
import { QueryBlogRepository } from '../infrastrucutre/blog.query-repository';
import { BlogRepository } from '../infrastrucutre/blog.repository';
import { QueryPostRepository } from '../../posts/infrastructure/post.query-repository';

@Controller('blogs')
export class BlogController {
  constructor(
    private readonly BlogService: BlogService,
    private readonly QueryBlogRepository: QueryBlogRepository,
    private readonly BlogRepository: BlogRepository,
    private readonly QueryPostRepository: QueryPostRepository,
  ) {}

  @Get()
  async getBlogs(@Query() query: InputBlogSortDataType, @Res() res) {
    const allBlogs = await this.QueryBlogRepository.getAll(query);
    res.status(HttpStatus.OK).send(allBlogs);
    return;
  }

  @Get(':id')
  async getBlog(@Param('id') id: string, @Res() res) {
    const blog = await this.QueryBlogRepository.getById(id);
    if (!blog) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    }
    res.status(HttpStatus.OK).send(blog);
    return;
  }

  @Get(':blogId/posts')
  async getAllPostsFromBlog(
    @Param('blogId') blogId: string,
    @Query() query: InputPostSortDataType,
    @Res() res,
  ) {
    const blog = await this.QueryBlogRepository.getById(blogId);
    if (!blog) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    }

    const postSortData: PostSortDataType = {
      sortBy: query.sortBy,
      sortDirection: query.sortDirection,
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      blogId: blogId,
    };

    const allPosts = await this.QueryPostRepository.getAll(null, postSortData);
    res.status(HttpStatus.OK).send(allPosts);
    return;
  }

  @Post()
  async createBlog(@Body() inputCreateBlogData: InputBlogDataType, @Res() res) {
    const blog = await this.BlogService.createBlog(inputCreateBlogData);
    res.status(HttpStatus.CREATED).send(blog);
    return;
  }

  @Post(':blogId/posts')
  async createPostToBlog(
    @Param('blogId') blogId: string,
    @Body() inputCreatePostToBlogData: InputCreatePostToBlogDataType,
    @Res() res,
  ) {
    const blog = await this.QueryBlogRepository.getById(blogId);
    if (!blog) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    }
    const createPostToBlogData: CreatePostDataType = {
      title: inputCreatePostToBlogData.title,
      shortDescription: inputCreatePostToBlogData.shortDescription,
      content: inputCreatePostToBlogData.content,
      blogId: blogId,
      blogName: blog.name,
    };
    const createdPost =
      await this.BlogService.createPostToBlog(createPostToBlogData);
    res.status(HttpStatus.CREATED).send(createdPost);
    return;
  }

  @Put(':id')
  async updateBlog(
    @Param('id') id: string,
    @Body() inputUpdateBlogData: InputBlogDataType,
    @Res() res,
  ) {
    const blog = await this.BlogRepository.getById(id);
    if (!blog) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    }
    await this.BlogService.updateBlog(blog, inputUpdateBlogData);
    res.status(HttpStatus.NO_CONTENT).send();
    return;
  }

  @Delete(':id')
  async deleteBlog(@Param('id') id: string, @Res() res) {
    const blog = await this.QueryBlogRepository.getById(id);
    if (!blog) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    }
    await this.BlogRepository.delete(id);
    res.status(HttpStatus.NO_CONTENT).send();
    return;
  }
}
