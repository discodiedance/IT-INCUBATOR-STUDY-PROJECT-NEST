import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundDomainException } from '../../../../../../core/exceptions/domain-exceptions';
import { GetPostsQueryParams } from '../../../../posts/api/models/dto/post.dto';
import { QueryPostRepository } from '../../../../posts/infrastructure/post.query-repository';
import { BlogRepository } from './../../../infrastrucutre/blog.repository';

export class GetAllPostsFromBlogCommand {
  constructor(
    public query: GetPostsQueryParams,
    public blogId: string,
    public userId: string | null,
  ) {}
}

@QueryHandler(GetAllPostsFromBlogCommand)
export class GetAllPostsFromBlogUseCase
  implements IQueryHandler<GetAllPostsFromBlogCommand>
{
  constructor(
    private readonly queryPostRepository: QueryPostRepository,
    private readonly blogRepository: BlogRepository,
  ) {}

  async execute({ query, blogId, userId }: GetAllPostsFromBlogCommand) {
    const blog = await this.blogRepository.getById(blogId);

    if (!blog) {
      throw NotFoundDomainException.create('Blog is not found');
    }

    return await this.queryPostRepository.getAllPosts(userId, query, blogId);
  }
}
