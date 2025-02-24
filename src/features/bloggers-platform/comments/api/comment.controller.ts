import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetCommentByIdCommand } from '../application/usecases/query-usecases/get-comment-by-id.usecase';
import { InputUpdateCommentDataType } from './models/dto/input';
import { DeleteCommentCommand } from '../application/usecases/delete-comment.usecase';
import { ExtractUserIdFromRequest } from '../../../../core/decorators/param/extract-user-from-request';
import { UpdateCommentCommand } from '../application/usecases/update-comment.usecase';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../core/guards/bearer/jwt-auth.guard';
import { InputCreateCommentLikeDataType } from '../../likes/comments/api/models/dto/comment-likes.dto';
import { CreateLikeOrDislikeToCommentCommand } from '../../likes/comments/application/usecases/create-like-or-dislike-to-comment.usecase';
import { JwtOptionalAuthGuard } from '../../../../core/guards/bearer/jwt-optional-auth.guard';

@Controller('comments')
export class CommentController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id')
  async getComment(@Param('id') commentId: string, @Req() req: any) {
    return await this.queryBus.execute(
      new GetCommentByIdCommand(commentId, req.user),
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() updateData: InputUpdateCommentDataType,
    @ExtractUserIdFromRequest() userId: string,
  ) {
    await this.commandBus.execute(
      new UpdateCommentCommand(commentId, updateData, userId),
    );
    return;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async createLikeOrDislike(
    @Param('commentId') commentId: string,
    @Body() createLikeData: InputCreateCommentLikeDataType,
    @ExtractUserIdFromRequest() userId: string,
  ) {
    await this.commandBus.execute(
      new CreateLikeOrDislikeToCommentCommand(
        commentId,
        createLikeData,
        userId,
      ),
    );
    return;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('commentId') commentId: string,
    @ExtractUserIdFromRequest() userId: string,
  ) {
    await this.commandBus.execute(new DeleteCommentCommand(commentId, userId));
    return;
  }
}
