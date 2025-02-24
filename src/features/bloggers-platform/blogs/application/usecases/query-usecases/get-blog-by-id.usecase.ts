import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QueryBlogRepository } from '../../../infrastrucutre/blog.query-repository';
import { NotFoundDomainException } from '../../../../../../core/exceptions/domain-exceptions';

export class GetBlogCommand {
  constructor(public blogId: string) {}
}

@QueryHandler(GetBlogCommand)
export class GetBlogUseCase implements IQueryHandler<GetBlogCommand> {
  constructor(private readonly queryBlogRepository: QueryBlogRepository) {}

  async execute({ blogId }: GetBlogCommand) {
    const blog = await this.queryBlogRepository.getById(blogId);
    if (!blog) {
      throw NotFoundDomainException.create();
    }
    return blog;
  }
}
