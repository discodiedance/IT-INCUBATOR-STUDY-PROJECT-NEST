import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { BlogRepository } from '../../infrastrucutre/blog.repository';
import { CreatePostDataType } from '../../../posts/api/models/dto/post.dto';
import { InputCreatePostToBlogDataType } from '../../../posts/api/models/dto/input';
import { CreatePostCommand } from '../../../posts/application/usecases/create-post.usecase';

export class CreatePostToBlogCommand {
  constructor(
    public blogId: string,
    public inputCreatePostToBlogData: InputCreatePostToBlogDataType,
  ) {}
}

@CommandHandler(CreatePostToBlogCommand)
export class CreatePostToBlogUseCase
  implements ICommandHandler<CreatePostToBlogCommand>
{
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute({
    blogId,
    inputCreatePostToBlogData,
  }: CreatePostToBlogCommand) {
    const blog = await this.blogRepository.getById(blogId);
    if (!blog) {
      throw NotFoundDomainException.create('Blog is not found');
    }

    const createPostToBlogData: CreatePostDataType = {
      title: inputCreatePostToBlogData.title,
      shortDescription: inputCreatePostToBlogData.shortDescription,
      content: inputCreatePostToBlogData.content,
      blogId: blogId,
      blogName: blog.name,
    };

    return await this.commandBus.execute(
      new CreatePostCommand(createPostToBlogData),
    );
  }
}
