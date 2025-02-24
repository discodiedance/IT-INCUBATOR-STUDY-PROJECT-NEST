import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { BlogRepository } from '../../infrastrucutre/blog.repository';

export class DeleteBlogCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private readonly blogRepository: BlogRepository) {}

  async execute({ blogId }: DeleteBlogCommand) {
    const blog = await this.blogRepository.getById(blogId);
    if (!blog) {
      throw NotFoundDomainException.create();
    }
    await this.blogRepository.delete(blogId);
  }
}
