import { InputCreatePostToBlogDataType } from '../../posts/api/models/dto/input';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  InputCreateBlogDataType,
  InputUpdateBlogDataType,
} from './models/dto/input';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/usecases/create-blog.usecase';
import { UpdateBlogCommand } from '../application/usecases/update-blog.usecase';
import { DeleteBlogCommand } from '../application/usecases/delete-blog.usecase';
import { CreatePostToBlogCommand } from '../application/usecases/create-post-to-blog.usecase';
import { GetAllBlogsCommand } from '../application/usecases/query-usecases/get-all-blogs.usecase';
import { GetBlogCommand } from '../application/usecases/query-usecases/get-blog-by-id.usecase';
import { GetAllPostsFromBlogCommand } from '../application/usecases/query-usecases/get-all-posts-from-blog.usecase';
import { ApiBasicAuth } from '@nestjs/swagger';
import { BasicAuthGuard } from '../../../../core/guards/basic/basic-auth.guard';
import { JwtOptionalAuthGuard } from '../../../../core/guards/bearer/jwt-optional-auth.guard';
import { OutputBlogType } from './models/dto/output';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetBlogsQueryParams } from './models/dto/blogs.dto';
import { GetPostsQueryParams } from '../../posts/api/models/dto/post.dto';

@Controller('blogs')
export class BlogController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':id')
  async getBlog(@Param('id') blogId: string) {
    return await this.queryBus.execute(new GetBlogCommand(blogId));
  }

  @Get()
  async getBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<OutputBlogType[]>> {
    return await this.queryBus.execute(new GetAllBlogsCommand(query));
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':blogId/posts')
  async getAllPostsFromBlog(
    @Query() query: GetPostsQueryParams,
    @Param('blogId') blogId: string,
    @Req() req: any,
  ) {
    return await this.queryBus.execute(
      new GetAllPostsFromBlogCommand(query, blogId, req.user),
    );
  }

  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth('basicAuth')
  @Post()
  async createBlog(@Body() inputCreateBlogData: InputCreateBlogDataType) {
    return await this.commandBus.execute(
      new CreateBlogCommand(inputCreateBlogData),
    );
  }

  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth('basicAuth')
  @Post(':blogId/posts')
  async createPostToBlog(
    @Param('blogId') blogId: string,
    @Body() inputCreatePostToBlogData: InputCreatePostToBlogDataType,
  ) {
    return await this.commandBus.execute(
      new CreatePostToBlogCommand(blogId, inputCreatePostToBlogData),
    );
  }

  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth('basicAuth')
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') blogId: string,
    @Body() inputUpdateBlogData: InputUpdateBlogDataType,
  ) {
    await this.commandBus.execute(
      new UpdateBlogCommand(blogId, inputUpdateBlogData),
    );
    return;
  }

  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth('basicAuth')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') blogId: string) {
    await this.commandBus.execute(new DeleteBlogCommand(blogId));
    return;
  }
}
