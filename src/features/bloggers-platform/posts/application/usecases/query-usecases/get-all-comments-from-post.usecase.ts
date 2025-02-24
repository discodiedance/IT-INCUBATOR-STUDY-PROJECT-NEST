import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundDomainException } from '../../../../../../core/exceptions/domain-exceptions';
import { PostRepository } from '../../../infrastructure/post.repository';
import { QueryCommentRepository } from '../../../../comments/infrastructure/comment.query-repository';
import { GetCommentsQueryParams } from '../../../../comments/api/models/dto/comment.dto';

export class GetAllCommentsFromPostCommand {
  constructor(
    public query: GetCommentsQueryParams,
    public postId: string,
    public userId: string | null,
  ) {}
}

@QueryHandler(GetAllCommentsFromPostCommand)
export class GetAllCommentsFromPostUseCase
  implements IQueryHandler<GetAllCommentsFromPostCommand>
{
  constructor(
    private readonly queryCommentRepository: QueryCommentRepository,
    private readonly postRepository: PostRepository,
  ) {}

  async execute({ query, postId, userId }: GetAllCommentsFromPostCommand) {
    const post = await this.postRepository.getById(postId);

    if (!post) {
      throw NotFoundDomainException.create('Post is not found');
    }

    return await this.queryCommentRepository.getAllCommentsFromPost(
      userId,
      query,
      postId,
    );
  }
}
