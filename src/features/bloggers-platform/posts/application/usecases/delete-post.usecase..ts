import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { PostRepository } from '../../infrastructure/post.repository';

export class DeletePostCommand {
  constructor(public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private readonly postRepository: PostRepository) {}

  async execute({ postId }: DeletePostCommand) {
    const post = await this.postRepository.getById(postId);

    if (!post) {
      throw NotFoundDomainException.create('Post is not found');
    }

    await this.postRepository.delete(postId);
  }
}
