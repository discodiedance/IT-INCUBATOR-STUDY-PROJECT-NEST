import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QueryPostRepository } from '../../../infrastructure/post.query-repository';
import { GetPostsQueryParams } from '../../../api/models/dto/post.dto';

export class GetAllPostsCommand {
  constructor(
    public query: GetPostsQueryParams,
    public userId: string | null,
  ) {}
}

@QueryHandler(GetAllPostsCommand)
export class GetAllPostsUseCase implements IQueryHandler<GetAllPostsCommand> {
  constructor(private readonly queryPostRepository: QueryPostRepository) {}

  async execute({ query, userId }: GetAllPostsCommand) {
    return await this.queryPostRepository.getAllPosts(userId, query);
  }
}
