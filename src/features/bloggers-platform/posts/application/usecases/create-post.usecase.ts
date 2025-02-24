import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InputCreatePostDataType } from '../../api/models/dto/input';
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../../../core/exceptions/domain-exceptions';
import { CreatePostDataType } from '../../api/models/dto/post.dto';
import { Post } from '../post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PostModelType } from '../../api/models/post.entities';
import { BlogRepository } from '../../../blogs/infrastrucutre/blog.repository';
import { PostRepository } from '../../infrastructure/post.repository';
import { QueryPostRepository } from './../../infrastructure/post.query-repository';

export class CreatePostCommand {
  constructor(public inputCreatePostData: InputCreatePostDataType) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    @InjectModel(Post.name)
    private postModel: PostModelType,
    private readonly postRepository: PostRepository,
    private readonly blogRepository: BlogRepository,
    private readonly queryPostRepository: QueryPostRepository,
  ) {}

  async execute({ inputCreatePostData }: CreatePostCommand) {
    const blog = await this.blogRepository.getById(inputCreatePostData.blogId);

    if (!blog) {
      throw NotFoundDomainException.create('Blog is not found');
    }

    const createPostData: CreatePostDataType = {
      title: inputCreatePostData.title,
      shortDescription: inputCreatePostData.shortDescription,
      content: inputCreatePostData.content,
      blogId: inputCreatePostData.blogId,
      blogName: blog.name,
    };

    const createdPost = this.postModel.createPost(createPostData);
    const savedPost = await this.postRepository.save(createdPost);

    if (!savedPost) {
      throw BadRequestDomainException.create();
    }

    const outPutPost = await this.queryPostRepository.getById(
      savedPost.id,
      null,
    );

    return outPutPost;
  }
}
