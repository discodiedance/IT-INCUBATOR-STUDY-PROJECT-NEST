import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QueryBlogRepository } from '../../../infrastrucutre/blog.query-repository';
import { GetBlogsQueryParams } from '../../../api/models/dto/blogs.dto';

export class GetAllBlogsCommand {
  constructor(public query: GetBlogsQueryParams) {}
}

@QueryHandler(GetAllBlogsCommand)
export class GetAllBlogsUseCase implements IQueryHandler<GetAllBlogsCommand> {
  constructor(private readonly queryBlogRepository: QueryBlogRepository) {}

  async execute({ query }: GetAllBlogsCommand) {
    return await this.queryBlogRepository.getAllBlogs(query);
  }
}
