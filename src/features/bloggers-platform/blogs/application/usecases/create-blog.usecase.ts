import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { OutputBlogType } from '../../api/models/dto/output';
import { BlogModelType } from '../../api/models/blogs.entities';
import { Blog } from '../blog.entity';
import { blogMapper } from '../mappers/blog.mapper';
import { BlogRepository } from '../../infrastrucutre/blog.repository';
import { CreateBlogDataType } from '../../api/models/dto/blogs.dto';

export class CreateBlogCommand {
  constructor(public inputCreateBlogData: CreateBlogDataType) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase
  implements ICommandHandler<CreateBlogCommand, OutputBlogType>
{
  constructor(
    @InjectModel(Blog.name) private blogModel: BlogModelType,
    private readonly blogRepository: BlogRepository,
  ) {}

  async execute({
    inputCreateBlogData,
  }: CreateBlogCommand): Promise<OutputBlogType> {
    const createdBlog = this.blogModel.createBlog(inputCreateBlogData);
    await this.blogRepository.save(createdBlog);
    return blogMapper(createdBlog);
  }
}
