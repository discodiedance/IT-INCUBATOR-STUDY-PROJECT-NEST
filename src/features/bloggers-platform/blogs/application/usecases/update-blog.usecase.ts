import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogRepository } from '../../infrastrucutre/blog.repository';
import {
  NotFoundDomainException,
  BadRequestDomainException,
} from '../../../../../core/exceptions/domain-exceptions';
import { InputUpdateBlogDataType } from '../../api/models/dto/input';

export class UpdateBlogCommand {
  constructor(
    public blogId: string,
    public updateData: InputUpdateBlogDataType,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private readonly blogRepository: BlogRepository) {}

  async execute({ blogId, updateData }: UpdateBlogCommand) {
    const blog = await this.blogRepository.getById(blogId);
    if (!blog) {
      throw NotFoundDomainException.create();
    }
    blog.updateBlog(updateData);
    const updatedBlog = await this.blogRepository.save(blog);
    if (!updatedBlog) {
      throw BadRequestDomainException.create();
    }
  }
}
