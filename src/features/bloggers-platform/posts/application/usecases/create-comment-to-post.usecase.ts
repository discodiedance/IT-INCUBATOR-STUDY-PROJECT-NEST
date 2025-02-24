import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../../posts/infrastructure/post.repository';
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../../../core/exceptions/domain-exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { UserRepository } from './../../../../user-accounts/users/infrastructure/user.repository';
import { CommentModelType } from '../../../comments/api/models/comment.entities';
import { CreateCommentToPostDataType } from '../../../comments/api/models/dto/comment.dto';
import { InputCreateCommentDataType } from '../../../comments/api/models/dto/input';
import { commentMapper } from '../../../comments/application/mappers/comment.mapper';
import { CommentRepository } from '../../../comments/infrastructure/comment.repository';
import { Comment } from '../../../comments/application/comment.entity';

export class CreateCommentToPostCommand {
  constructor(
    public postId: string,
    public inputCreateCommentData: InputCreateCommentDataType,
    public userId: string,
  ) {}
}

@CommandHandler(CreateCommentToPostCommand)
export class CreateCommentToPostUseCase
  implements ICommandHandler<CreateCommentToPostCommand>
{
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: CommentModelType,
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
    private readonly commentRepository: CommentRepository,
  ) {}

  async execute({
    postId,
    inputCreateCommentData,
    userId,
  }: CreateCommentToPostCommand) {
    const post = await this.postRepository.getById(postId);

    if (!post) {
      throw NotFoundDomainException.create('Post is not found');
    }

    const user = await this.userRepository.getById(userId);

    if (!user) {
      throw BadRequestDomainException.create();
    }

    const createCommentData: CreateCommentToPostDataType = {
      content: inputCreateCommentData.content,
      commentatorInfo: { userId: userId, userLogin: user.accountData.login },
      postId: postId,
    };

    const comment = this.commentModel.createComment(createCommentData);
    const savedComment = await this.commentRepository.save(comment);

    if (!savedComment) {
      throw BadRequestDomainException.create();
    }

    return await commentMapper(comment, null);
  }
}
