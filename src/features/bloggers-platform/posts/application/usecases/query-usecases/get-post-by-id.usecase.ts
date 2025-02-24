import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QueryPostRepository } from '../../../infrastructure/post.query-repository';
import { NotFoundDomainException } from '../../../../../../core/exceptions/domain-exceptions';

export class GetPostCommand {
  constructor(
    public postId: string,
    public userId: string | null,
  ) {}
}

@QueryHandler(GetPostCommand)
export class GetPostByIdUseCase implements IQueryHandler<GetPostCommand> {
  constructor(private readonly queryPostRepository: QueryPostRepository) {}

  async execute({ postId, userId }: GetPostCommand) {
    const post = await this.queryPostRepository.getById(postId, userId);

    if (!post) {
      throw NotFoundDomainException.create();
    }

    return post;
  }
}
