import { InputCreateCommentDataType } from '../../comments/api/models/dto/input';
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
  InputCreatePostDataType,
  InputUpdatePostDataType,
} from './models/dto/input';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/usecases/create-post.usecase';
import { UpdatePostCommand } from '../application/usecases/update-post.usecase';
import { DeletePostCommand } from '../application/usecases/delete-post.usecase.';
import { ExtractUserIdFromRequest } from '../../../../core/decorators/param/extract-user-from-request';
import { GetAllPostsCommand } from '../application/usecases/query-usecases/get-all-posts.usecase';
import { GetPostCommand } from '../application/usecases/query-usecases/get-post-by-id.usecase';
import { GetAllCommentsFromPostCommand } from '../application/usecases/query-usecases/get-all-comments-from-post.usecase';
import { CreateLikeOrDislikeToPostCommand } from '../../likes/posts/application/usecases/create-like-or-dislike-to-post.usecase';
import { InputCreatePostLikeDataType } from '../../likes/posts/api/models/dto/post-likes.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../core/guards/bearer/jwt-auth.guard';
import { BasicAuthGuard } from '../../../../core/guards/basic/basic-auth.guard';
import { CreateCommentToPostCommand } from '../application/usecases/create-comment-to-post.usecase';
import { JwtOptionalAuthGuard } from '../../../../core/guards/bearer/jwt-optional-auth.guard';
import { OutputPostTypeWithStatus } from './models/dto/output';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from './models/dto/post.dto';
import { GetCommentsQueryParams } from '../../comments/api/models/dto/comment.dto';

@Controller('posts')
export class PostController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  async getAllPosts(
    @Query()
    query: GetPostsQueryParams,
    @Req() req: any,
  ): Promise<PaginatedViewDto<OutputPostTypeWithStatus[]>> {
    return await this.queryBus.execute(new GetAllPostsCommand(query, req.user));
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id')
  async getPost(@Param('id') postId: string, @Req() req: any) {
    return await this.queryBus.execute(new GetPostCommand(postId, req.user));
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':postId/comments')
  async getAllCommentsFromPost(
    @Query() query: GetCommentsQueryParams,
    @Param('postId') postId: string,
    @Req() req: any,
  ) {
    return await this.queryBus.execute(
      new GetAllCommentsFromPostCommand(query, postId, req.user),
    );
  }

  @UseGuards(BasicAuthGuard)
  @ApiBearerAuth('basicAuth')
  @Post()
  async createPost(@Body() inputCreatePostData: InputCreatePostDataType) {
    return await this.commandBus.execute(
      new CreatePostCommand(inputCreatePostData),
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async createLikeOrDislike(
    @Param('postId') postId: string,
    @Body() createLikeData: InputCreatePostLikeDataType,
    @ExtractUserIdFromRequest() userId: any,
  ) {
    return await this.commandBus.execute(
      new CreateLikeOrDislikeToPostCommand(postId, createLikeData, userId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @Post(':postId/comments')
  async createCommentToPost(
    @Param('postId') postId: string,
    @Body() inputeCreateCommentData: InputCreateCommentDataType,
    @ExtractUserIdFromRequest() userId: string,
  ) {
    return await this.commandBus.execute(
      new CreateCommentToPostCommand(postId, inputeCreateCommentData, userId),
    );
  }

  @UseGuards(BasicAuthGuard)
  @ApiBearerAuth('basicAuth')
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') postId: string,
    @Body() inputUpdatePostData: InputUpdatePostDataType,
  ) {
    await this.commandBus.execute(
      new UpdatePostCommand(postId, inputUpdatePostData),
    );
    return;
  }

  @UseGuards(BasicAuthGuard)
  @ApiBearerAuth('basicAuth')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') postId: string) {
    await this.commandBus.execute(new DeletePostCommand(postId));
    return;
  }
}
