import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OutputBlogType } from '../api/models/output';
import { BlogDocument, BlogModelType } from '../api/models/blogs.entities';
import { blogMapper } from './blog.mapper';
import {
  CreateBlogDataType,
  UpdateBlogDataType,
} from '../api/models/blogs.dto';
import { Blog } from './blog.entity';
import { OutputPostTypeWithStatus } from '../../posts/api/models/output';
import { BlogRepository } from '../infrastrucutre/blog.repository';
import { PostService } from '../../posts/application/post.service';
import { CreatePostDataType } from '../../posts/api/models/post.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    private readonly BlogRepository: BlogRepository,
    private readonly PostService: PostService,
  ) {}

  async createBlog(newBlog: CreateBlogDataType): Promise<OutputBlogType> {
    const createdBlog = this.BlogModel.createBlog(newBlog);
    await this.BlogRepository.save(createdBlog);
    return blogMapper(createdBlog);
  }

  async createPostToBlog(
    createPostToBlogData: CreatePostDataType,
  ): Promise<OutputPostTypeWithStatus> {
    const post = await this.PostService.createPost(createPostToBlogData);
    return post;
  }

  async updateBlog(
    blog: BlogDocument,
    updateData: UpdateBlogDataType,
  ): Promise<boolean> {
    blog.updateBlog(updateData);
    const updatedBlog = await this.BlogRepository.save(blog);
    if (!updatedBlog) {
      return false;
    }
    return true;
  }
}
