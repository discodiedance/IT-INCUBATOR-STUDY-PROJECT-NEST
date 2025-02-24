import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InputUpdatePostDataType } from '../../api/models/dto/input';
import { NotFoundDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { PostRepository } from '../../infrastructure/post.repository';

export class UpdatePostCommand {
  constructor(
    public postId: string,
    public inputUpdatePostData: InputUpdatePostDataType,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(private readonly postRepository: PostRepository) {}

  async execute({ postId, inputUpdatePostData }: UpdatePostCommand) {
    const post = await this.postRepository.getById(postId);

    if (!post) {
      throw NotFoundDomainException.create('Post is not found');
    }

    post.updatePost(inputUpdatePostData);
    await this.postRepository.save(post);
  }
}
